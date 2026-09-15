# APPGRADE: GitHub and Vercel deployment

The storefront and `/admin` are compatible with Vercel. Price workbooks are
parsed in memory and pending import reports are stored in PostgreSQL, so no
persistent filesystem is required.

## PostgreSQL

Create a managed PostgreSQL database that accepts connections from Vercel.
Before the first deployment, run the idempotent schema migration from a trusted
machine:

```powershell
$env:DATABASE_URL = '<production PostgreSQL connection string>'
npm.cmd run db:migrate
```

Run it again after any revision that changes `migrate()` in `lib/server/db.ts`.

## Vercel environment variables

Set the following for Production in Project Settings:

```text
DATABASE_URL
APP_ORIGIN
NEXT_PUBLIC_SITE_URL
ADMIN_USER
ADMIN_PASSWORD
TELEGRAM_ORDERS_BOT_TOKEN
TELEGRAM_ORDERS_CHAT_ID
SITE_DOMAIN
SELLER_NAME
SELLER_INN
SELLER_ADDRESS
SELLER_PRIVACY_EMAIL
NEXT_PUBLIC_SIBAY_ADDRESS
NEXT_PUBLIC_SIBAY_PHONE
NEXT_PUBLIC_SIBAY_SCHEDULE
```

`APP_ORIGIN`, `NEXT_PUBLIC_SITE_URL`, and `SITE_DOMAIN` must use the final HTTPS
site origin without a path or trailing slash. `ADMIN_PASSWORD` must have at
least 20 characters. Never commit secret values or the local `.env` file.

Preview deployments need preview-specific `APP_ORIGIN` and
`NEXT_PUBLIC_SITE_URL` values. A production origin intentionally does not
authorize mutations from another domain.

## Deploy and verify

Connect the GitHub repository to Vercel and select the repository root. Vercel
detects Next.js automatically. Admin price uploads accept `.xlsx` files up to
4 MB. After deployment, check `/api/health`, then `/admin`, and perform a test
import before announcing the deployment.

Vercel hosts the web application, not the two long-running Telegram polling
workers. Run `npm run bot:prices` and `npm run bot:orders` against the same
production database on an always-on Docker VM or worker host. That host needs
the two bot tokens, `TELEGRAM_PRICE_ADMIN_IDS`, and `TELEGRAM_ORDERS_CHAT_ID`.

Before every release run:

```powershell
npm.cmd run lint
npm.cmd test
npx.cmd tsc --noEmit
npm.cmd run build
git diff --check
```
