#!/usr/bin/env bash
#
# Launch the Paper server with a console pipe so commands can be sent to it.
# Used by the systemd unit, but also works standalone (Ctrl-C stops cleanly).
#
# Env overrides:  JAVA_BIN=/path/to/java  JAR=paper.jar  MEM=768M
#
set -euo pipefail
cd "$(dirname "$0")"

JAVA_BIN="${JAVA_BIN:-java}"
JAR="${JAR:-paper.jar}"
MEM="${MEM:-768M}"
FIFO="console.in"

[ -f "$JAR" ] || { echo "Error: '$JAR' not found — run ./download_paper.sh first." >&2; exit 1; }

# (Re)create the console pipe and hold it open (fd 3, read-write) so the
# server's stdin never receives EOF. 'mc-cmd.sh' writes commands into it.
rm -f "$FIFO"
mkfifo "$FIFO"
exec 3<> "$FIFO"

# Lightweight G1GC flags suited to a small heap (<~1.5 GB). Note Xms == Xmx.
exec "$JAVA_BIN" \
  -Xms"$MEM" -Xmx"$MEM" \
  -XX:+UseG1GC \
  -XX:+ParallelRefProcEnabled \
  -XX:MaxGCPauseMillis=200 \
  -XX:+AlwaysPreTouch \
  -XX:+DisableExplicitGC \
  -XX:+PerfDisableSharedMem \
  -jar "$JAR" nogui < "$FIFO"
