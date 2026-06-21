#!/usr/bin/env bash
#
# Download the latest *stable* Paper build for a Minecraft version.
#
#   ./download_paper.sh            # latest stable Minecraft version
#   ./download_paper.sh 1.21.4     # a specific version
#
# Output file can be overridden with JAR=name.jar
# Requires: curl, jq
#
set -euo pipefail
cd "$(dirname "$0")"

API="https://api.papermc.io/v2/projects/paper"
OUT="${JAR:-paper.jar}"
VERSION="${1:-latest}"

need() { command -v "$1" >/dev/null 2>&1 || { echo "Error: '$1' is required." >&2; exit 1; }; }
need curl
need jq

if [ "$VERSION" = "latest" ]; then
  VERSION="$(curl -fsSL "$API" | jq -r '.versions[-1]')"
fi
echo ">> Paper for Minecraft $VERSION"

builds_json="$(curl -fsSL "$API/versions/$VERSION/builds")"

# Prefer a stable ("default" channel) build; fall back to the newest build.
build="$(jq -r '[.builds[] | select(.channel=="default")] | last | .build // empty' <<<"$builds_json")"
if [ -z "$build" ]; then
  build="$(jq -r '.builds[-1].build' <<<"$builds_json")"
fi

name="$(jq -r --argjson b "$build" \
  '.builds[] | select(.build==$b) | .downloads.application.name' <<<"$builds_json")"
url="$API/versions/$VERSION/builds/$build/downloads/$name"

echo ">> Downloading build #$build ($name) ..."
curl -fSL --progress-bar "$url" -o "$OUT"
echo ">> Saved $OUT (Paper $VERSION, build $build)."
