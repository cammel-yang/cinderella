#!/usr/bin/env bash
#
# One-shot deployer for a Paper Minecraft server on a Linux VPS.
# Run as root on a fresh Ubuntu/Debian or RHEL-family box (x86_64 or arm64):
#
#     sudo bash bootstrap.sh
#
# It will: install Java 21, create a 'minecraft' user, download Paper, write a
# swap file, install + enable systemd services (server + daily backup), and open
# the firewall. Re-running is safe (idempotent-ish).
#
# Tunables (env vars):
#   MEM=768M          heap given to the server (defaults sized for ~1 GB RAM)
#   MC_VERSION=latest Minecraft version (e.g. 1.21.4)
#   PORT=25565        server port
#   SWAP_GB=2         swap file size (0 to skip)
#   MC_USER=minecraft / MC_HOME=/opt/minecraft
#
set -euo pipefail
cd "$(dirname "$0")"
SRC="$(pwd)"

[ "$(id -u)" -eq 0 ] || { echo "Please run as root:  sudo bash bootstrap.sh" >&2; exit 1; }

MC_USER="${MC_USER:-minecraft}"
MC_HOME="${MC_HOME:-/opt/minecraft}"
MEM="${MEM:-768M}"
MC_VERSION="${MC_VERSION:-latest}"
PORT="${PORT:-25565}"
SWAP_GB="${SWAP_GB:-2}"
JAVA_DIR="/opt/temurin-21"

log() { printf '\n\033[1;32m>> %s\033[0m\n' "$*"; }

# --- 1. base packages ---------------------------------------------------------
log "Installing base packages (curl, jq, tar) ..."
FW=""
if command -v apt-get >/dev/null 2>&1; then
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y curl jq tar ca-certificates
  command -v ufw >/dev/null 2>&1 && FW="ufw"
elif command -v dnf >/dev/null 2>&1; then
  dnf install -y curl jq tar ca-certificates
  FW="firewalld"
elif command -v yum >/dev/null 2>&1; then
  yum install -y curl jq tar ca-certificates
  FW="firewalld"
else
  echo "Unsupported distro (need apt, dnf, or yum)." >&2; exit 1
fi

# --- 2. Java 21 (portable Temurin build, distro-independent) -------------------
if [ ! -x "$JAVA_DIR/bin/java" ]; then
  log "Installing Temurin Java 21 ..."
  case "$(uname -m)" in
    x86_64|amd64)  AARCH=x64 ;;
    aarch64|arm64) AARCH=aarch64 ;;
    *) echo "Unsupported CPU arch: $(uname -m)" >&2; exit 1 ;;
  esac
  url="https://api.adoptium.net/v3/binary/latest/21/ga/linux/${AARCH}/jre/hotspot/normal/eclipse?project=jdk"
  tmp="$(mktemp -d)"
  curl -fsSL "$url" -o "$tmp/jre.tar.gz"
  mkdir -p "$JAVA_DIR"
  tar xzf "$tmp/jre.tar.gz" -C "$JAVA_DIR" --strip-components=1
  rm -rf "$tmp"
fi
"$JAVA_DIR/bin/java" -version

# --- 3. user + files ----------------------------------------------------------
log "Creating user '$MC_USER' and $MC_HOME ..."
if ! id -u "$MC_USER" >/dev/null 2>&1; then
  nologin="$(command -v nologin || echo /usr/sbin/nologin)"
  useradd -r -m -d "$MC_HOME" -s "$nologin" "$MC_USER"
fi
mkdir -p "$MC_HOME"

install -m 0755 "$SRC/download_paper.sh" "$SRC/start.sh" "$SRC/mc-cmd.sh" "$SRC/backup.sh" "$MC_HOME"/
[ -f "$MC_HOME/server.properties" ] || install -m 0644 "$SRC/server.properties" "$MC_HOME"/
[ -f "$MC_HOME/eula.txt" ]          || install -m 0644 "$SRC/eula.txt" "$MC_HOME"/
sed -i "s/^server-port=.*/server-port=$PORT/" "$MC_HOME/server.properties"

# --- 4. download Paper --------------------------------------------------------
log "Downloading Paper ($MC_VERSION) ..."
sudo -u "$MC_USER" env JAR=paper.jar bash "$MC_HOME/download_paper.sh" "$MC_VERSION"
chown -R "$MC_USER":"$MC_USER" "$MC_HOME"

# --- 5. swap (helps a small-RAM box avoid the OOM killer) ----------------------
if [ "$SWAP_GB" -gt 0 ] && ! swapon --show 2>/dev/null | grep -q .; then
  log "Creating ${SWAP_GB}G swap file ..."
  fallocate -l "${SWAP_GB}G" /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count="$((SWAP_GB * 1024))"
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# --- 6. systemd services ------------------------------------------------------
log "Installing + enabling systemd services ..."
cat > /etc/systemd/system/minecraft.service <<EOF
[Unit]
Description=Minecraft Paper Server
After=network-online.target
Wants=network-online.target

[Service]
User=$MC_USER
WorkingDirectory=$MC_HOME
Environment=JAVA_BIN=$JAVA_DIR/bin/java
Environment=JAR=paper.jar
Environment=MEM=$MEM
ExecStart=$MC_HOME/start.sh
ExecStop=$MC_HOME/mc-cmd.sh stop
TimeoutStopSec=120
Restart=on-failure
RestartSec=10
SuccessExitStatus=0 143

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/minecraft-backup.service <<EOF
[Unit]
Description=Backup Minecraft world

[Service]
Type=oneshot
User=$MC_USER
WorkingDirectory=$MC_HOME
ExecStart=$MC_HOME/backup.sh
EOF

cat > /etc/systemd/system/minecraft-backup.timer <<EOF
[Unit]
Description=Daily Minecraft world backup

[Timer]
OnCalendar=*-*-* 04:00:00
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now minecraft.service
systemctl enable --now minecraft-backup.timer

# --- 7. firewall --------------------------------------------------------------
log "Opening firewall for port $PORT ..."
if [ "$FW" = "ufw" ]; then
  ufw allow OpenSSH >/dev/null 2>&1 || ufw allow 22/tcp >/dev/null 2>&1 || true
  ufw allow "${PORT}/tcp" >/dev/null 2>&1 || true
  ufw --force enable >/dev/null 2>&1 || true
elif [ "$FW" = "firewalld" ] && command -v firewall-cmd >/dev/null 2>&1; then
  systemctl enable --now firewalld >/dev/null 2>&1 || true
  firewall-cmd --permanent --add-service=ssh >/dev/null 2>&1 || true
  firewall-cmd --permanent --add-port="${PORT}/tcp" >/dev/null 2>&1 || true
  firewall-cmd --reload >/dev/null 2>&1 || true
fi

# --- done ---------------------------------------------------------------------
ip="$(curl -fsS --max-time 5 https://api.ipify.org 2>/dev/null || echo YOUR_VPS_IP)"
addr="$ip"; [ "$PORT" != "25565" ] && addr="$ip:$PORT"

log "Done! The server is starting up (first launch generates the world)."
cat <<EOF

  Manage it:
    Status   : systemctl status minecraft
    Logs     : journalctl -u minecraft -f      (or: tail -f $MC_HOME/logs/latest.log)
    Restart  : systemctl restart minecraft
    Stop     : systemctl stop minecraft
    Console  : sudo $MC_HOME/mc-cmd.sh "say hi"
    Make admin: sudo $MC_HOME/mc-cmd.sh "op YOUR_MINECRAFT_NAME"

  Connect (Minecraft Java Edition -> Multiplayer -> Add Server):
    $addr

  IMPORTANT: if you can't connect, also open TCP $PORT in your VPS provider's
  cloud firewall / security group (that's separate from the OS firewall).

  Backups: daily 04:00 -> $MC_HOME/backups   (run now: sudo systemctl start minecraft-backup)

EOF
