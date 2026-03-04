# Usage: .\scripts\set-registry.ps1 -Owner <REPO_OWNER>
# Example: .\scripts\set-registry.ps1 -Owner DaemonBehr
# Replaces REPO_OWNER in infra/overlays/default/kustomization.yaml so deploy pulls from ghcr.io/<Owner>/...
param(
    [Parameter(Mandatory=$true)]
    [string]$Owner
)
$root = Split-Path -Parent $PSScriptRoot
$k = Join-Path $root "infra\overlays\default\kustomization.yaml"
if (-not (Test-Path $k)) { Write-Error "Not found: $k"; exit 1 }
(Get-Content $k -Raw) -replace 'REPO_OWNER', $Owner | Set-Content $k -NoNewline
Write-Host "Set overlay images to ghcr.io/$Owner/nxclaw-api and nxclaw-portal"
