# Deployment

How this site is built, published, and hosted, and how to ship an update.

The site runs as a Docker container on **Azure Container Apps** (Consumption plan). The image is stored on **Docker Hub**. The custom domain is managed in **Cloudflare** DNS, and Azure issues a free TLS certificate for it.

| Item | Value |
| --- | --- |
| Live site | https://portfolio.rnair.dev |
| Azure default URL | https://nair-portfolio.braverock-11a07c1e.eastus2.azurecontainerapps.io |
| Docker Hub image | `docker.io/rnair86/portfolio` |
| Resource group | `rg-nair-portfolio` |
| Container Apps environment | `nair-portfolio-env` |
| Container app | `nair-portfolio` |
| Region | `eastus2` |
| Container port | `3000` |

All commands are PowerShell, run from the project root (`D:\Udemy\Ai Coding\Site`).

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/), running
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli), signed in:

  ```powershell
  az login
  az account set --subscription "<subscription name or id>"
  ```

- A Docker Hub account and an access token (Docker Hub → Account Settings → Security → New Access Token). Use the token wherever a password is asked for.
- `OPENROUTER_API_KEY` in the local `.env` file. `.env` is gitignored and excluded from the image by `.dockerignore`.

## How the app is packaged

These project files make the app deployable as a container:

| File | Purpose |
| --- | --- |
| `next.config.ts` | `output: "standalone"` so `next build` emits a small self-contained server in `.next/standalone` |
| `Dockerfile` | Three stages: install dependencies, build, then a slim runtime image that runs `node server.js` on port 3000 as the non-root `node` user |
| `.dockerignore` | Keeps `node_modules`, `.next`, `.env*`, resumes/PDFs, and docs out of the build context |
| `src/app/api/health/route.ts` | `GET /api/health` returns `{"ok":true}` without calling OpenRouter |
| `src/app/api/chat/route.ts` | Reads `OPENROUTER_API_KEY` at request time and aborts the OpenRouter call after 30 seconds |

The OpenRouter key is never baked into the image. It is supplied to the running container as an Azure secret.

## First-time deployment

### 1. Test the image locally

```powershell
docker build -t portfolio:local .
docker run -d --name portfolio-local --env-file .env -p 3000:3000 portfolio:local
```

Open http://localhost:3000 and http://localhost:3000/api/health. Then stop it:

```powershell
docker rm -f portfolio-local
```

### 2. Push the image to Docker Hub

```powershell
docker login
docker tag portfolio:local docker.io/rnair86/portfolio:1
docker push docker.io/rnair86/portfolio:1
```

Image names must be lowercase. On Docker Hub, the `portfolio` repository is set to **Public**. The image contains no secrets.

### 3. Register the Container Apps provider (once per subscription)

```powershell
az provider register -n Microsoft.App --wait
```

Without this, Container Apps commands fail with `not registered for the Microsoft.App resource provider`.

### 4. Create the container app

Put the Docker Hub token in a variable so it is not typed into the command or saved in shell history, and confirm it is set:

```powershell
$env:DOCKERHUB_TOKEN = "<docker hub access token>"
if ([string]::IsNullOrEmpty($env:DOCKERHUB_TOKEN)) { "token is empty" } else { "token is set" }
```

Then create the resource group, environment, and app:

```powershell
az containerapp up `
  --name nair-portfolio `
  --resource-group rg-nair-portfolio `
  --location eastus2 `
  --environment nair-portfolio-env `
  --image docker.io/rnair86/portfolio:1 `
  --registry-server docker.io `
  --registry-username rnair86 `
  --registry-password $env:DOCKERHUB_TOKEN `
  --ingress external `
  --target-port 3000
```

Azure pulls from Docker Hub with the stored token, which avoids Docker Hub's anonymous pull limits.

### 5. Add the OpenRouter key as a secret

```powershell
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*OPENROUTER_API_KEY=(.*)$') {
    $env:OPENROUTER_API_KEY = $matches[1].Trim()
  }
}

az containerapp secret set `
  --name nair-portfolio `
  --resource-group rg-nair-portfolio `
  --secrets "openrouter-api-key=$env:OPENROUTER_API_KEY"

az containerapp update `
  --name nair-portfolio `
  --resource-group rg-nair-portfolio `
  --set-env-vars "OPENROUTER_API_KEY=secretref:openrouter-api-key"
```

`secretref:` passes the secret value into the container as the `OPENROUTER_API_KEY` environment variable. The update creates a new revision that has the key.

### 6. Set scaling for low cost

```powershell
az containerapp update `
  --name nair-portfolio `
  --resource-group rg-nair-portfolio `
  --min-replicas 0 `
  --max-replicas 1 `
  --cpu 0.5 `
  --memory 1.0Gi
```

With a minimum of 0 replicas, the app scales to zero when idle and compute stays inside Azure's free monthly allowance for a low-traffic site. The first visit after an idle period takes a few seconds while a replica starts.

### 7. Point the HTTP health probe at `/api/health` (optional)

Container Apps adds default TCP probes on port 3000, which are enough. To use the health route instead, add a probe in the Azure portal: container app → **Containers** → **Edit and deploy** → **Health probes**, with path `/api/health` and port `3000`.

## Custom domain: portfolio.rnair.dev

### 1. Get the app hostname and verification ID

```powershell
az containerapp show -n nair-portfolio -g rg-nair-portfolio `
  --query "{fqdn:properties.configuration.ingress.fqdn, verificationId:properties.customDomainVerificationId}" -o json
```

### 2. Add DNS records in Cloudflare

In the Cloudflare dashboard, open the `rnair.dev` zone → **DNS** → **Records** and add:

| Type | Name | Target | Proxy status |
| --- | --- | --- | --- |
| CNAME | `portfolio` | `nair-portfolio.braverock-11a07c1e.eastus2.azurecontainerapps.io` | **DNS only** (grey cloud) |
| TXT | `asuid.portfolio` | the `verificationId` from step 1 | DNS only |

The CNAME **must** be DNS only. With the Cloudflare proxy on (orange cloud), the name resolves to Cloudflare addresses, and Azure cannot issue or renew the certificate. Keep it DNS only permanently.

`rnair.dev` has no CAA records, so no CAA record is needed. If one is ever added on `@`, also add `0 issue "digicert.com"` or certificate renewal will fail.

To confirm the records are public:

```powershell
Invoke-RestMethod "https://dns.google/resolve?name=portfolio.rnair.dev&type=CNAME" | ConvertTo-Json -Depth 4
Invoke-RestMethod "https://dns.google/resolve?name=asuid.portfolio.rnair.dev&type=TXT" | ConvertTo-Json -Depth 4
```

The CNAME answer should be the `azurecontainerapps.io` hostname, not Cloudflare IP addresses.

### 3. Add the hostname, then bind a managed certificate

The hostname has to be added to the app before Azure will issue a certificate. Otherwise `bind` fails with `RequireCustomHostnameInEnvironment`.

```powershell
az containerapp hostname add `
  -n nair-portfolio `
  -g rg-nair-portfolio `
  --hostname portfolio.rnair.dev

az containerapp hostname bind `
  --hostname portfolio.rnair.dev `
  -g rg-nair-portfolio `
  -n nair-portfolio `
  --environment nair-portfolio-env `
  --validation-method CNAME
```

Issuing the certificate takes about 5 to 20 minutes. When `bindingType` shows `SniEnabled`, https://portfolio.rnair.dev is live. Azure renews the certificate automatically as long as the DNS records stay in place.

## Pushing an update

The version is the major number in `package.json`, and it is the Docker tag. Releases are logged in `RELEASES.md`. To ship an update, commit your changes, bump the version, then run the release script, which lints, builds, pushes the image, deploys it, tags git, and logs the row:

```powershell
npm version major --no-git-tag-version
git commit -am "Bump version"
.\scriptselease.ps1 "one-line change summary"
```

Use `.\scriptselease.ps1 -DryRun` to preview the steps. The manual steps below are what the script automates. Use a new image tag for every release; reusing a tag such as `latest` can leave the old image running.

### 1. Check the change locally

```powershell
npm run lint
npm run build
```

### 2. Build and push the new image

Use the version from `package.json`:

```powershell
$tag = "<next version>"
docker build -t docker.io/rnair86/portfolio:$tag .
docker push docker.io/rnair86/portfolio:$tag
```

Optional local check before pushing:

```powershell
docker run --rm --env-file .env -p 3000:3000 docker.io/rnair86/portfolio:$tag
```

### 3. Deploy the new image

```powershell
az containerapp update `
  --name nair-portfolio `
  --resource-group rg-nair-portfolio `
  --image docker.io/rnair86/portfolio:$tag
```

The app is in single-revision mode. Azure starts the new revision and moves traffic to it once it is healthy. The OpenRouter secret, scaling settings, Docker Hub credentials, and custom domain all carry over.

### 4. Verify

```powershell
Invoke-RestMethod https://portfolio.rnair.dev/api/health

az containerapp revision list -n nair-portfolio -g rg-nair-portfolio `
  --query "[].{name:name, active:properties.active, image:properties.template.containers[0].image, health:properties.healthState, created:properties.createdTime}" -o table
```

The newest revision should be active, healthy, and running the new tag.

### Rolling back

Point the app back at the previous tag:

```powershell
az containerapp update `
  --name nair-portfolio `
  --resource-group rg-nair-portfolio `
  --image docker.io/rnair86/portfolio:1
```

## Changing secrets

**Rotate the OpenRouter key:** update `.env`, re-run the `secret set` command from step 5, then restart the active revision so it reads the new value:

```powershell
$rev = az containerapp show -n nair-portfolio -g rg-nair-portfolio --query "properties.latestRevisionName" -o tsv
az containerapp revision restart -n nair-portfolio -g rg-nair-portfolio --revision $rev
```

**Rotate the Docker Hub token:** create a new token on Docker Hub, delete the old one, then:

```powershell
$env:DOCKERHUB_TOKEN = "<new docker hub access token>"

az containerapp registry set `
  --name nair-portfolio `
  --resource-group rg-nair-portfolio `
  --server docker.io `
  --username rnair86 `
  --password $env:DOCKERHUB_TOKEN
```

## Useful commands

```powershell
# Live container logs
az containerapp logs show -n nair-portfolio -g rg-nair-portfolio --follow

# Current image, scaling, and URL
az containerapp show -n nair-portfolio -g rg-nair-portfolio `
  --query "{image:properties.template.containers[0].image, min:properties.template.scale.minReplicas, max:properties.template.scale.maxReplicas, fqdn:properties.configuration.ingress.fqdn}" -o json

# Custom domains and certificate binding
az containerapp hostname list -n nair-portfolio -g rg-nair-portfolio -o table
```

## Troubleshooting

| Error | Cause | Fix |
| --- | --- | --- |
| `not registered for the Microsoft.App resource provider` | Subscription has never used Container Apps | `az provider register -n Microsoft.App --wait` |
| `The containerapp '...' does not exist` | Ran `registry set` or `update` before the app was created | Create it first with `az containerapp up` |
| `unrecognized arguments: external` | `$env:DOCKERHUB_TOKEN` was empty, so `--registry-password` consumed `--ingress` | Set the token in the same terminal window and confirm it is set |
| `AKSCapacityHeavyUsage` | The region has no capacity for new environments | Delete the failed environment, then retry in another region (`eastus2`, `centralus`) |
| `RequireCustomHostnameInEnvironment` | Ran `hostname bind` before `hostname add` | Run `az containerapp hostname add` first |
| Certificate never issues | The Cloudflare CNAME is proxied | Set the `portfolio` CNAME to **DNS only** |
| Chat says it is not configured | `OPENROUTER_API_KEY` secret missing from the revision | Re-run step 5 |

## Cost notes

- **Container Apps (Consumption):** scales to zero; a low-traffic site normally stays within the free monthly allowance (180,000 vCPU-seconds, 360,000 GiB-seconds, 2 million requests).
- **Log Analytics workspace:** created with the environment. Keep retention short to avoid ingestion charges.
- **Docker Hub:** free for a public repository.
- **OpenRouter:** the cost that can grow. `/api/chat` has no rate limit yet, so keep a spending limit set in the OpenRouter dashboard.

Never commit `.env`, API keys, or Docker Hub tokens.
