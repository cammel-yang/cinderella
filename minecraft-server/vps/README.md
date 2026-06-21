# 在 VPS 上部署 Paper 服务器(为 1 GB 小内存优化)

针对你的机器(**1 GB 内存 / 20 GB 硬盘 / 双核**)做了优化:用 **Paper**(比原版省资源)、自动建 **2 GB swap**、精简 GC 参数、较小视距。用 **systemd** 管理(开机自启 + 崩溃自动重启),外加**每日自动备份**。

> ⚠️ 1 GB 内存是 MC 的下限,适合 **2–4 人**小服。想更流畅,建议升到 2 GB 内存。

## 一键部署

SSH 登录你的 VPS(用 root 或能 sudo 的账号),然后:

```bash
# 1) 把这个文件夹弄到 VPS 上(任选其一)
#    a. 直接 clone 仓库:
git clone <你的仓库地址> cinderella
cd cinderella/minecraft-server/vps
#    b. 或用 scp 从本地上传 vps/ 目录后 cd 进去

# 2) 跑部署脚本(会装 Java、建用户、下载 Paper、建 swap、配 systemd 和防火墙)
sudo bash bootstrap.sh
```

跑完后服务器就以 systemd 服务在后台运行了,并已设置开机自启。脚本最后会打印**连接地址**和常用命令。

### 想改参数?

```bash
sudo MEM=1G MC_VERSION=1.21.4 PORT=25565 bash bootstrap.sh
```

可用变量:`MEM`(给服务器的内存,默认 768M)、`MC_VERSION`(默认最新)、`PORT`(默认 25565)、`SWAP_GB`(默认 2,设 0 跳过)、`MC_USER` / `MC_HOME`。

## 日常管理

| 操作 | 命令 |
| --- | --- |
| 查看状态 | `systemctl status minecraft` |
| 实时日志 | `journalctl -u minecraft -f`(或 `tail -f /opt/minecraft/logs/latest.log`) |
| 重启 | `sudo systemctl restart minecraft` |
| 停止 | `sudo systemctl stop minecraft`(会先存档再退出) |
| 发控制台命令 | `sudo /opt/minecraft/mc-cmd.sh "say 大家好"` |
| **把自己设为管理员** | `sudo /opt/minecraft/mc-cmd.sh "op 你的游戏名"` |
| 立即备份一次 | `sudo systemctl start minecraft-backup` |

> 控制台没有交互式窗口:**用 `mc-cmd.sh` 发命令、用 `journalctl`/日志看输出**。这样 systemd 能可靠地跟踪进程、崩溃自动拉起。

## 连接服务器

游戏里(**Java 版** → 多人游戏 → 添加服务器),地址填:

```
你的VPS公网IP            # 端口是默认 25565 时
你的VPS公网IP:端口        # 改过端口时
```

客户端版本要和服务器一致(在启动器版本下拉里选)。客户端怎么装见 [`../../docs/PLAY_MINECRAFT.md`](../../docs/PLAY_MINECRAFT.md)。

### ⚠️ 连不上?八成是云防火墙

脚本已经开了**系统防火墙**(ufw/firewalld),但**很多云厂商还有一层"安全组 / 云防火墙"在控制台里**,必须也放行 **TCP 25565**:

- 阿里云 / 腾讯云:控制台 → 安全组 → 添加入站规则,放行 TCP 25565
- AWS:EC2 → Security Groups → Inbound rules → 加 TCP 25565
- DigitalOcean / Vultr / Linode:Networking / Firewall 里放行

排查顺序:服务在跑吗(`systemctl status minecraft`)→ 系统防火墙 → **云安全组** → 客户端与服务端版本是否一致。

> 你的 VPS 在美国,国内玩家延迟会偏高,这是物理距离决定的,属正常现象。

## 升级 / 换版本

```bash
sudo systemctl stop minecraft
sudo -u minecraft env JAR=paper.jar /opt/minecraft/download_paper.sh 1.21.4   # 或不带版本号取最新
sudo systemctl start minecraft
```

> 大版本升级前**务必先备份**(`sudo systemctl start minecraft-backup`),世界存档一般不能降级回退。

## 备份

- 自动:每天 04:00,保留最近 7 份,存在 `/opt/minecraft/backups/`。
- 手动:`sudo systemctl start minecraft-backup`
- 改保留份数:编辑 `/etc/systemd/system/minecraft-backup.service`,在 `ExecStart` 前加 `Environment=KEEP=14`。
- 20 GB 硬盘有限,留意 `backups/` 占用;重要存档建议定期 `scp` 下载到本地。

## 文件清单

| 文件 | 作用 |
| --- | --- |
| `bootstrap.sh` | 一键部署(装 Java、建用户、下 Paper、swap、systemd、防火墙) |
| `download_paper.sh` | 从 PaperMC 官方下载最新稳定版 |
| `start.sh` | 启动脚本(带控制台管道 + 小内存 GC 参数) |
| `mc-cmd.sh` | 向运行中的服务器发控制台命令 |
| `backup.sh` | 备份世界(带保留份数轮换) |
| `server.properties` / `eula.txt` | 小内存优化的默认配置 / EULA(已同意) |
| `minecraft.service` 等 | systemd 单元的参考副本(bootstrap 会自动安装) |

## 不想用脚本?手动几步

```bash
sudo useradd -r -m -d /opt/minecraft -s /usr/sbin/nologin minecraft
# 装 Java 21(发行版包或 Temurin 均可),把本目录脚本放到 /opt/minecraft
sudo -u minecraft /opt/minecraft/download_paper.sh         # 下载 Paper
# 把 minecraft.service 拷到 /etc/systemd/system/ 并按需改路径/内存
sudo systemctl daemon-reload && sudo systemctl enable --now minecraft
```
