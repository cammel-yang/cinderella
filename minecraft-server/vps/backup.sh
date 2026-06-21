#!/usr/bin/env bash
#
# Back up the world(s) into ./backups, keeping the most recent $KEEP archives.
# Safe to run while the server is up: it flushes to disk first via the console.
#
#   ./backup.sh
#   KEEP=14 ./backup.sh
#
set -euo pipefail
cd "$(dirname "$0")"

BACKUP_DIR="${BACKUP_DIR:-backups}"
KEEP="${KEEP:-7}"
WORLDS=(world world_nether world_the_end)

mkdir -p "$BACKUP_DIR"
ts="$(date +%Y%m%d-%H%M%S)"
out="$BACKUP_DIR/world-$ts.tar.gz"

running=false
[ -p console.in ] && running=true

# Ask the server to stop writing and flush, so the archive is consistent.
if $running; then
  ./mc-cmd.sh "save-off"       || true
  ./mc-cmd.sh "save-all flush" || true
  sleep 5
fi

existing=()
for w in "${WORLDS[@]}"; do [ -e "$w" ] && existing+=("$w"); done

if [ "${#existing[@]}" -gt 0 ]; then
  tar czf "$out" "${existing[@]}"
  echo ">> Backup written: $out ($(du -h "$out" | cut -f1))"
else
  echo ">> No world directories found yet — nothing to back up." >&2
fi

# Re-enable saving.
$running && { ./mc-cmd.sh "save-on" || true; }

# Retention: delete all but the newest $KEEP archives.
ls -1t "$BACKUP_DIR"/world-*.tar.gz 2>/dev/null | tail -n +"$((KEEP + 1))" | xargs -r rm -f
