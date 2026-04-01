# CI/CD Secrets Setup

The GitHub Actions workflow requires the following secrets to be configured in your repository settings.

## How to Add Secrets

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** for each secret below

## Required Secrets

| Secret | Description | Where to Get It |
|--------|-------------|-----------------|
| `CLOUDFLARE_API_TOKEN` | API token for Cloudflare CLI | [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) → Create token with "Edit Cloudflare Workers" and "Cloudflare Pages Edit" permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | [Cloudflare Dashboard](https://dash.cloudflare.com/) → Right sidebar → Account ID (copy from URL or settings) |
| `TURSO_DATABASE_URL` | Turso libSQL database URL | Run `turso db show taco-bell-orders --url` |
| `TURSO_AUTH_TOKEN` | Turso database auth token | Run `turso db tokens create taco-bell-orders` |

## Cloudflare API Token Permissions

When creating the `CLOUDFLARE_API_TOKEN`, use the **Edit Cloudflare Workers** template and ensure these permissions are included:

- **Account** → Cloudflare Pages → Edit
- **Account** → Workers Scripts → Edit
- **Account** → Workers KV Storage → Edit
- **User** → User Details → Read

## Verifying Setup

After adding secrets, push a commit to `main` or open a PR to trigger the workflow. Check the **Actions** tab in your repository to monitor deployment status.
