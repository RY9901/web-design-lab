# Backfill a missed build night.
#
# The cloud routine fires Mon/Wed/Fri at 05:00 Asia/Singapore. If a run was skipped
# or failed, this does the same work locally using the prompt in docs/ROUTINE.md.
#
#   .\scripts\backfill.ps1
#
# Requires the Claude Code CLI on PATH and this repo as the working directory.

$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

$promptFile = Join-Path $repo "docs\ROUTINE.md"
if (-not (Test-Path $promptFile)) {
    Write-Error "docs/ROUTINE.md not found - cannot run the routine prompt."
}

if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    Write-Error "The 'claude' CLI is not on PATH. Install Claude Code or run the routine from the web app."
}

$prompt = Get-Content $promptFile -Raw

Write-Host "Running the design-lab routine locally against $repo" -ForegroundColor Cyan
Write-Host "This consumes the same Claude budget as the cloud routine." -ForegroundColor DarkYellow

claude -p $prompt

Write-Host ""
Write-Host "Routine finished. Review the diff before pushing:" -ForegroundColor Cyan
Write-Host "  git status"
Write-Host "  git diff"
