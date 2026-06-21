#!/usr/bin/env bash
#
# Send a command to the running server console.
#   sudo ./mc-cmd.sh op Steve
#   sudo ./mc-cmd.sh "say hello everyone"
#   sudo ./mc-cmd.sh stop
#
# Watch the output with:  journalctl -u minecraft -f   (or tail -f logs/latest.log)
#
set -euo pipefail
cd "$(dirname "$0")"

FIFO="console.in"
[ -p "$FIFO" ] || { echo "Server doesn't appear to be running (no '$FIFO' pipe)." >&2; exit 1; }
[ "$#" -gt 0 ] || { echo "Usage: $0 <minecraft command>" >&2; exit 1; }

printf '%s\n' "$*" > "$FIFO"
