# Minecraft 服务器（Java 版）

一套开箱即用的 Minecraft: Java Edition 服务器配置和脚本。把这个文件夹放到一台**长期运行**的机器上（你的电脑 / 一台 VPS / 家里的小主机）即可。

> ⚠️ 这套文件本身**不包含**游戏本体。`download_server.sh` 会从 Mojang 官方下载服务端 `server.jar`。

## 环境要求

- **Java 21**（Minecraft 1.20.5 及以上版本要求）。检查：`java -version`
  - 没有的话：[Adoptium Temurin 21](https://adoptium.net/) 或系统包管理器安装。
- 内存：至少 2 GB 给服务器（默认配置就是 2G，可调）。
- 一台会一直开着的机器——临时容器（比如本会话所在的云容器）会被回收，**不适合**跑服务器。

---

## 方式 A：原版手动运行（推荐先用这个理解原理）

```bash
cd minecraft-server

# 1) 下载官方服务端（默认最新正式版；也可指定版本，如 1.21.4）
./download_server.sh
#   ./download_server.sh 1.21.4

# 2) 启动（首次启动会生成世界，可能要等十几秒到一分钟）
./start.sh
#   想多给点内存：  MEM=4G ./start.sh
```

Windows 用户：先按上面的链接装好 Java 21，手动把 `server.jar` 放进本目录（或在 WSL/Git-Bash 里跑 `download_server.sh`），然后**双击 `start.bat`**。

- `eula.txt` 已经预设为 `eula=true`，表示**接受 [Mojang EULA](https://aka.ms/MinecraftEULA)**。如不同意，把它改回 `false`。
- 配置在 `server.properties`，常用项见下方。

## 方式 B：Docker（最省事）

需要装好 Docker。它会自动帮你下载匹配的 Minecraft 和 Java：

```bash
cd minecraft-server
docker compose up -d        # 后台启动
docker compose logs -f      # 看日志
docker attach minecraft     # 进服务器控制台（Ctrl-p Ctrl-q 退出但不停服）
docker compose down         # 停服
```

世界数据保存在 `./data/`。

---

## 连接到服务器

1. 打开 Minecraft **Java 版**客户端（怎么装见 [`../docs/PLAY_MINECRAFT.md`](../docs/PLAY_MINECRAFT.md)）。
2. 多人游戏 → 添加服务器 → 地址填：
   - 同一台电脑：`localhost`
   - 同一局域网：服务器机器的局域网 IP（如 `192.168.1.20`）
   - 公网：你的公网 IP / 域名，并且要在路由器上把 **TCP 25565** 端口转发到服务器机器。

> 想和朋友联机又不想折腾端口转发：可以用官方 **Realms** 订阅，或 Tailscale/ZeroTier 这类虚拟局域网把大家拉到同一个网段。

## 常用配置（`server.properties`）

| 配置项 | 说明 |
| --- | --- |
| `motd` | 服务器列表里显示的名字 |
| `gamemode` | `survival` / `creative` / `adventure` |
| `difficulty` | `peaceful` / `easy` / `normal` / `hard` |
| `max-players` | 最大同时在线人数 |
| `online-mode` | 建议保持 `true`，只允许正版账号；改 `false` 有安全和盗版风险 |
| `white-list` | `true` 时只有白名单玩家能进 |
| `level-seed` | 世界种子，留空则随机 |
| `view-distance` | 视距（区块），越大越吃内存/CPU |

改完配置后**重启服务器**生效。

## 管理员命令（在控制台输入，不带斜杠）

```
op <玩家名>            # 给某玩家管理员权限
stop                   # 安全关闭服务器（务必用它，别直接 kill）
whitelist add <玩家>   # 加白名单
ban <玩家>             # 封禁
say <消息>             # 全服广播
```

## 备份

世界就是 `world/`（Docker 模式下是 `data/world/`）。备份前最好先 `stop`：

```bash
tar czf backup-$(date +%F).tar.gz world world_nether world_the_end
```

## 文件清单

| 文件 | 作用 |
| --- | --- |
| `download_server.sh` | 从 Mojang 官方下载并校验 `server.jar` |
| `start.sh` | Linux/macOS 启动脚本（含优化过的 JVM 参数） |
| `start.bat` | Windows 启动脚本 |
| `server.properties` | 服务器配置（已给好默认值） |
| `eula.txt` | EULA 同意标记（已设为 true） |
| `docker-compose.yml` | Docker 一键部署 |
| `.gitignore` | 忽略世界数据、日志、jar 等运行产物 |
