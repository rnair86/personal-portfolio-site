# Build, push, and deploy the site, then log the release.
#
# Version = major number in package.json (2.0.0 -> image tag "2", git tag "v2").
# Bump it first:  npm version major --no-git-tag-version   (then commit)
#
# Usage:  .\scripts\release.ps1 "one-line change summary"
#         .\scripts\release.ps1 -DryRun     # print the steps, run nothing

param(
  [Parameter(Position = 0)][string]$Summary = "",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

$image = "docker.io/rnair86/portfolio"
$app = "nair-portfolio"
$rg = "rg-nair-portfolio"

$major = ((Get-Content package.json -Raw | ConvertFrom-Json).version -split "\.")[0]
$tag = $major
$gitTag = "v$major"
$sha = (git rev-parse --short HEAD).Trim()

if (git status --porcelain) { throw "Working tree is not clean. Commit or stash first." }
if (git tag --list $gitTag) { throw "Git tag $gitTag already exists. Bump the version in package.json." }
if (-not $DryRun -and -not $Summary) { throw "Pass a one-line summary: .\scripts\release.ps1 'what changed'" }

$steps = @(
  "npm run lint",
  "npm run build",
  "docker build -t ${image}:$tag -t ${image}:$tag-$sha .",
  "docker push ${image}:$tag",
  "docker push ${image}:$tag-$sha",
  "az containerapp update --name $app --resource-group $rg --image ${image}:$tag",
  "git tag -a $gitTag -m `"Release ${major}: $Summary`"",
  "append row to RELEASES.md"
)

if ($DryRun) {
  Write-Host "Release $gitTag at $sha (dry run):"
  $steps | ForEach-Object { Write-Host "  $_" }
  return
}

npm run lint; if ($LASTEXITCODE) { throw "lint failed" }
npm run build; if ($LASTEXITCODE) { throw "build failed" }
docker build -t "${image}:$tag" -t "${image}:$tag-$sha" .; if ($LASTEXITCODE) { throw "docker build failed" }
docker push "${image}:$tag"; if ($LASTEXITCODE) { throw "docker push failed" }
docker push "${image}:$tag-$sha"; if ($LASTEXITCODE) { throw "docker push failed" }

$digest = ((docker inspect --format "{{index .RepoDigests 0}}" "${image}:$tag") -split "@")[1]

az containerapp update --name $app --resource-group $rg --image "${image}:$tag" | Out-Null
if ($LASTEXITCODE) { throw "az containerapp update failed" }
$revision = az containerapp show -n $app -g $rg --query "properties.latestRevisionName" -o tsv

git tag -a $gitTag -m "Release ${major}: $Summary"

$date = Get-Date -Format "yyyy-MM-dd"
Add-Content RELEASES.md "| $major | $date | ``$sha`` | ``$digest`` | ``$revision`` | $Summary |"

Write-Host "Released $gitTag ($sha). Check https://portfolio.rnair.dev/api/health, then commit RELEASES.md."
