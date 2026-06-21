#!/usr/bin/env bash
#
# Download the official Minecraft: Java Edition *server* jar straight from Mojang.
#
# Usage:
#   ./download_server.sh             # latest stable release
#   ./download_server.sh 1.21.4      # a specific version
#
# Requires: curl, jq
#
set -euo pipefail

VERSION="${1:-latest}"
MANIFEST_URL="https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"
OUT="server.jar"

need() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Error: '$1' is required but not installed." >&2
    exit 1
  }
}
need curl
need jq

echo ">> Fetching version manifest ..."
manifest="$(curl -fsSL "$MANIFEST_URL")"

if [ "$VERSION" = "latest" ]; then
  VERSION="$(jq -r '.latest.release' <<<"$manifest")"
  echo ">> Latest stable release is $VERSION"
fi

version_url="$(jq -r --arg v "$VERSION" '.versions[] | select(.id==$v) | .url' <<<"$manifest")"
if [ -z "$version_url" ] || [ "$version_url" = "null" ]; then
  echo "Error: version '$VERSION' was not found in the manifest." >&2
  echo "       Browse available ids with: curl -s $MANIFEST_URL | jq -r '.versions[].id'" >&2
  exit 1
fi

echo ">> Reading metadata for $VERSION ..."
meta="$(curl -fsSL "$version_url")"
server_url="$(jq -r '.downloads.server.url // empty' <<<"$meta")"
server_sha1="$(jq -r '.downloads.server.sha1 // empty' <<<"$meta")"

if [ -z "$server_url" ]; then
  echo "Error: no server download is published for $VERSION." >&2
  echo "       (Very old versions ship no dedicated server jar.)" >&2
  exit 1
fi

echo ">> Downloading $OUT for $VERSION ..."
curl -fSL --progress-bar "$server_url" -o "$OUT"

if [ -n "$server_sha1" ]; then
  echo ">> Verifying checksum ..."
  if command -v sha1sum >/dev/null 2>&1; then
    actual="$(sha1sum "$OUT" | awk '{print $1}')"
  else
    actual="$(shasum "$OUT" | awk '{print $1}')"
  fi
  if [ "$actual" != "$server_sha1" ]; then
    echo "Error: checksum mismatch (expected $server_sha1, got $actual)." >&2
    rm -f "$OUT"
    exit 1
  fi
  echo ">> Checksum OK."
fi

echo
echo ">> Done. Saved $OUT (Minecraft $VERSION)."
echo ">> Next: ./start.sh   (first run will create the world)"
