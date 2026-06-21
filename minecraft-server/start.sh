#!/usr/bin/env bash
#
# Start the Minecraft server (Linux / macOS).
#
# Memory can be overridden, e.g.:  MEM=4G ./start.sh
# Jar name can be overridden, e.g.: JAR=server.jar ./start.sh
#
set -euo pipefail
cd "$(dirname "$0")"

JAR="${JAR:-server.jar}"
MEM="${MEM:-2G}"

if [ ! -f "$JAR" ]; then
  echo "Error: '$JAR' not found. Run ./download_server.sh first." >&2
  exit 1
fi

# Aikar's flags: a widely used, well-tested G1GC tuning for Minecraft servers.
# Note: -Xms and -Xmx are intentionally set to the same value.
exec java \
  -Xms"$MEM" -Xmx"$MEM" \
  -XX:+UseG1GC \
  -XX:+ParallelRefProcEnabled \
  -XX:MaxGCPauseMillis=200 \
  -XX:+UnlockExperimentalVMOptions \
  -XX:+DisableExplicitGC \
  -XX:+AlwaysPreTouch \
  -XX:G1NewSizePercent=30 \
  -XX:G1MaxNewSizePercent=40 \
  -XX:G1HeapRegionSize=8M \
  -XX:G1ReservePercent=20 \
  -XX:G1HeapWastePercent=5 \
  -XX:G1MixedGCCountTarget=4 \
  -XX:InitiatingHeapOccupancyPercent=15 \
  -XX:G1MixedGCLiveThresholdPercent=90 \
  -XX:G1RSetUpdatingPauseTimePercent=5 \
  -XX:SurvivorRatio=32 \
  -XX:+PerfDisableSharedMem \
  -XX:MaxTenuringThreshold=1 \
  -jar "$JAR" nogui
