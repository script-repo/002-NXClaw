#!/usr/bin/env bash
# Usage: ./scripts/set-registry.sh <REPO_OWNER>
# Example: ./scripts/set-registry.sh DaemonBehr
# Replaces REPO_OWNER in infra/overlays/default/kustomization.yaml so deploy pulls from ghcr.io/<REPO_OWNER>/...
set -e
OWNER="${1:?Usage: $0 <REPO_OWNER>}"
DIR="$(cd "$(dirname "$0")/.." && pwd)"
K="$DIR/infra/overlays/default/kustomization.yaml"
if [[ -f "$K" ]]; then
  sed -i.bak "s/REPO_OWNER/$OWNER/g" "$K" && rm -f "${K}.bak"
  echo "Set overlay images to ghcr.io/$OWNER/nxclaw-api and nxclaw-portal"
else
  echo "Not found: $K" >&2
  exit 1
fi
