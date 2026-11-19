# Jocoin

JOCOIN — MASTER BUILD INSTRUCTIONS

Build a premium, mobile-first cryptocurrency mining and rewards ecosystem named JoCoin.

Ticker: JOC

BRAND IDENTITY

Premium black and metallic gold visual identity.

Original JOC coin logo.

Sophisticated animations and transitions.

Professional cryptocurrency dashboard.

Arabic and English language support.

Fully responsive mobile-first PWA.

MAIN PAGES

Landing page.

User registration and authentication.

Mining dashboard.

Hourly reward claim interface.

JoCoin internal wallet.

Transaction history.

Referral program.

Airdrop center.

Withdrawal requests.

Leaderboard.

User profile and settings.

Admin dashboard.

MINING SYSTEM

Create a configurable reward engine.

Display mining session status.

Show countdown timer.

Allow one claim per configured interval.

Prevent duplicate claims.

Validate all claims on the server.

Maintain an immutable reward ledger.

Clearly label rewards as simulated/internal until blockchain distribution is activated.

Do not claim that the platform performs physical or blockchain mining.

DATABASE

Use Supabase for:

Authentication.

User profiles.

Wallet balances.

Reward ledger.

Mining sessions.

Referral relationships.

Withdrawal requests.

Admin settings.

Create appropriate database migrations, indexes, constraints and Row Level Security policies.

Never trust client-side balance calculations.

SECURITY

Server-side reward calculations.

Atomic balance updates.

Idempotent claim processing.

Rate limiting.

Admin role authorization.

Audit logs.

No exposed secret keys.

No direct user editing of balances.

BLOCKCHAIN ROADMAP

Prepare an integration architecture for a future JOC token smart contract.

Do not deploy a token or promise exchange value at this stage.

ADMIN

Allow authorized administrators to:

Manage users.

Configure reward intervals and rates.

Review withdrawal requests.

Manage referral settings.

View platform statistics.

Suspend fraudulent accounts.

Inspect audit logs.

IMPORTANT

Build a functional application, not a static mockup.

Use reusable components, a clean architecture, accessible navigation and production-quality error handling.

Start with the complete responsive UI and database architecture. Do not activate real financial transactions until the blockchain and compliance stages are completed.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://jocoin.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/80601342-073d-54e8-8f99-c76756e01795).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
