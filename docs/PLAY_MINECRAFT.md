# 在自己的电脑上安装并玩 Minecraft

> 我（Claude）运行在一个云端的临时容器里，**无法**直接装软件到你自己的电脑上。下面是你在自己机器上操作的步骤。

## 0. 先决条件：拥有正版

Minecraft 是 [Mojang / 微软](https://www.minecraft.net/) 的付费游戏，需要一个**微软账号**并购买。购买地址：
- https://www.minecraft.net/en-us/store/minecraft-deluxe-collection （或各地区商店页）

### 两个版本，别买错

| | **Java 版** | **基岩版 (Bedrock)** |
| --- | --- | --- |
| 平台 | Windows / macOS / Linux | Windows 10/11、手机、主机、平板 |
| 联机 | 与本仓库 `minecraft-server/` 搭的服务器**兼容** | **不兼容**该服务器 |
| Mod | 生态最丰富 | 主要是市场内容 |

> 想连本仓库搭的服务器，请装 **Java 版**。在 PC 上买「Minecraft: Java & Bedrock Edition」可同时拿到两个版本。

## 1. 安装官方启动器

下载 **Minecraft Launcher**：https://www.minecraft.net/en-us/download

- **Windows**：下载 `.exe` / 从微软商店安装 → 运行 → 用微软账号登录。
- **macOS**：下载 `.dmg` → 拖进「应用程序」→ 打开登录。
- **Linux**：
  - Debian/Ubuntu：下载官网的 `.deb` 后
    ```bash
    sudo apt install ./Minecraft.deb
    ```
  - 通用：下载 `Minecraft.tar.gz` 解压后运行里面的 `minecraft-launcher`。
  - 也可用 Flatpak：`flatpak install flathub com.mojang.Minecraft`（社区打包）。

## 2. 安装 Java 版游戏

1. 打开启动器，登录微软账号。
2. 顶部切到 **Minecraft: Java Edition** 标签页。
3. 直接点 **Play**——启动器会自动下载所选游戏版本和它需要的 Java 运行时，**你不用单独装 Java**。
4. 等进度条走完，进入游戏主菜单即安装完成。

## 3. 连接到你的服务器（可选）

如果你已经按 [`../minecraft-server/README.md`](../minecraft-server/README.md) 把服务器跑起来了：

1. 主菜单 → **Multiplayer / 多人游戏**。
2. **Add Server / 添加服务器**。
3. 地址填：
   - 同一台电脑：`localhost`
   - 同局域网：服务器机器的局域网 IP（如 `192.168.1.20`）
   - 公网：公网 IP/域名（需在路由器转发 TCP **25565**）
4. 保存 → 双击该服务器进入。

> ⚠️ 客户端版本要和服务器版本**一致**。在启动器里点 Play 左边的版本下拉框，选择与服务器相同的版本即可。

## 常见问题

- **必须买吗？** 是的，正版需购买。试玩（Demo）功能有限，且无法联机正版服务器。
- **连不上服务器？** 依次检查：服务器是否在运行、客户端与服务端版本是否一致、IP/端口对不对、防火墙/路由器端口转发、`online-mode` 设置。
- **想要中文界面？** 进游戏后 Options → Language 选「简体中文」。
