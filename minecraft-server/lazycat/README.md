# 在懒猫微服上开 Minecraft 服务器

懒猫微服(如 LC-02:i5-1155G7 + 16GB 内存)跑 MC **绰绰有余**,比 1GB VPS 强太多。系统 LZCOS 基于 Debian,**支持 Docker / SSH / root**,所以直接用 Docker 部署最省心。

适用你的两个场景:**① 在家同一网络玩(零配置)** + **② 国内朋友各自在家远程联机(用国内内网穿透)**。

---

## 一、把服务器跑起来(两种场景都先做这步)

懒猫是 Docker 底座,用本目录的 `docker-compose.yml`(已选 **Paper + 4G 内存 + Aikar 优化参数**)。

**方式 1:SSH 上去跑(推荐)**

1. 在懒猫**设置里开启 SSH**(LZCOS 支持 SSH + root)。
2. SSH 登录后,把本 `lazycat/` 目录拷上去(`git clone` 仓库 或 `scp`),然后:
   ```bash
   cd lazycat
   docker compose up -d          # 后台启动
   docker compose logs -f        # 看日志,首次启动会下载 Paper 并生成世界
   ```

**方式 2:转成懒猫应用**

懒猫支持用 `docker2lzc` / `lzc-dtl` 把 `docker-compose.yml` 转成懒猫应用包(`.lpk`)再安装。详见[懒猫开发者手册](https://developer.lazycat.cloud/)。适合想在懒猫桌面里管理的人。

### 常用管理(itzg 镜像自带 rcon-cli)

```bash
docker exec minecraft rcon-cli op 你的游戏名     # 把自己设成管理员
docker exec minecraft rcon-cli say 大家好         # 发广播
docker exec minecraft rcon-cli stop               # 停服(或 docker compose stop)
docker compose pull && docker compose up -d        # 升级镜像/版本
```

调参数:改 `docker-compose.yml` 里的 `MEMORY`(人多可到 `6G`)、`MAX_PLAYERS`、`VIEW_DISTANCE`、`VERSION` 后 `docker compose up -d` 重建。

---

## 二、在家联机(场景 ①,零配置)

1. 查懒猫的**内网 IP**(懒猫设置 / 路由器后台,通常类似 `192.168.x.x`)。
2. 朋友和你在同一 WiFi/路由器下,游戏里 **Java 版 → 多人游戏 → 添加服务器**,地址填:
   ```
   懒猫的内网IP            (端口默认 25565)
   ```
   完事,**零穿透、零延迟**。客户端怎么装见 [`../../docs/PLAY_MINECRAFT.md`](../../docs/PLAY_MINECRAFT.md)。

---

## 三、国内朋友远程联机(场景 ②,用国内内网穿透)

家庭宽带一般没公网 IP,所以用**国内**穿透服务把懒猫的 25565 暴露到公网。**选国内节点,延迟低**(别绕道你的美国 VPS)。

推荐 [**OpenFrp**](https://www.openfrp.net/)(免费、20+ 国内节点、支持 TCP、专门能开 MC);备选 SakuraFrp、花生壳等。

**步骤(以 OpenFrp 为例):**

1. 注册登录 → 实名(国内穿透按规定需要)。
2. 控制台 **新建隧道**:
   - 类型:**TCP**
   - 本地地址:`127.0.0.1`,本地端口:`25565`
   - 选一个**国内节点**(离你和朋友近的)
   - 远程端口:面板会分配一个(或自选),**朋友连的就是它**
3. 在懒猫上**运行 frpc 客户端**,两种方式:
   - **省事**:用 OpenFrp/SakuraFrp 官网的一键客户端(SSH 上去按官网说明跑)。
   - **Docker 通用**:把面板给的参数填进本目录 [`frpc.toml`](frpc.toml),然后:
     ```bash
     docker compose -f docker-compose.frpc.yml up -d
     docker logs -f frpc        # 看是否连上节点
     ```
4. 朋友在游戏里连:
   ```
   节点地址:远程端口        例如 cn-foshan-xxx.openfrp.net:12345
   ```

> ⚠️ 一些穿透服务有自定义鉴权字段,通用 `frpc.toml` 不一定完全对得上 —— 这时直接用它们**官方客户端/官方生成的配置**最稳。`frpc.toml` 适合服务支持标准 frp 配置、或你自建 frps 的情况。

---

## 四、注意事项

- **版本一致**:客户端版本要和服务器一致(启动器里选);锁版本就把 compose 里 `VERSION` 写死。
- **online-mode**:保持 `TRUE`(只允许正版账号);朋友也得是正版 Java 版。
- **备份**:存档在 `./data/world`。备份前先 `docker exec minecraft rcon-cli save-all`,再打包:
  ```bash
  tar czf mc-backup-$(date +%F).tar.gz data/world data/world_nether data/world_the_end
  ```
  也可加 `itzg/mc-backup` 边车容器做自动备份。
- **懒猫长期在线**:别让它休眠,否则服务器会断。

## 文件清单

| 文件 | 作用 |
| --- | --- |
| `docker-compose.yml` | Minecraft(Paper)主服务,场景①②都用 |
| `docker-compose.frpc.yml` | 可选,内网穿透客户端(仅远程联机需要) |
| `frpc.toml` | frp 客户端配置模板(填面板参数) |

> 想换成"用美国 VPS 做 frp 中转"(玩家在海外时),看仓库 [`../vps/`](../vps/) 或跟我说,我给你补 frps 配置。
