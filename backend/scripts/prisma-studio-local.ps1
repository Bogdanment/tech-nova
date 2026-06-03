$ErrorActionPreference = "Stop"

$backendDir = Resolve-Path (Join-Path $PSScriptRoot "..")
$envPath = Join-Path $backendDir ".env"

if (-not (Test-Path $envPath)) {
  throw "backend/.env was not found."
}

$databaseUrlLine = Get-Content $envPath | Where-Object { $_ -match "^\s*DATABASE_URL\s*=" } | Select-Object -First 1
if (-not $databaseUrlLine) {
  throw "DATABASE_URL is missing in backend/.env."
}

$databaseUrl = ($databaseUrlLine -replace "^\s*DATABASE_URL\s*=\s*", "").Trim().Trim('"').Trim("'")
$builder = [System.UriBuilder]::new($databaseUrl)
$builder.Host = "localhost"
$builder.Port = 15432

$env:DATABASE_URL = $builder.Uri.AbsoluteUri
Set-Location $backendDir
npx prisma studio --hostname 127.0.0.1 --port 5555
