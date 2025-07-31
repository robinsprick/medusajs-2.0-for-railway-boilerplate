# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo containing:
- **Backend**: MedusaJS 2.0 e-commerce backend with admin dashboard
- **Storefront**: Next.js 14 storefront application

Built on the Railway-optimized Medusa 2.0 boilerplate (v2.8.4) with pre-configured integrations for MinIO storage, Resend email, Stripe payments, and MeiliSearch.

## Development Commands

### Backend (medusajs)
```bash
cd backend/

# Development
pnpm dev          # Runs backend on localhost:9000, admin on localhost:9000/app
npm run dev       # Alternative using npm

# Initialize/seed database
pnpm ib           # Initialize backend (migrations + seed)
npm run ib        # Alternative using npm

# Build & Production
pnpm build        # Build backend + run postBuild script
pnpm start        # Initialize backend and start production server

# Email templates development
pnpm email:dev    # Preview email templates on localhost:3002
```

### Storefront (Next.js)
```bash
cd storefront/

# Development
pnpm dev          # Start development server on localhost:3000
npm run dev       # Alternative using npm

# Build & Production
pnpm build        # Build production bundle
pnpm start        # Start production server

# Testing
pnpm test-e2e     # Run Playwright E2E tests

# Code Quality
pnpm lint         # Run Next.js ESLint checks
```

## Architecture & Configuration

### Backend Structure
- `/backend/src/api/` - API routes for admin and store
- `/backend/src/modules/` - Custom modules:
  - `email-notifications/` - Resend email integration with React Email templates
  - `minio-file/` - MinIO cloud storage for media files
- `/backend/src/subscribers/` - Event subscribers (e.g., order-placed, invite-created)
- `/backend/src/workflows/` - Custom workflows
- `/backend/src/scripts/` - Build and seed scripts
- `/backend/medusa-config.js` - Core Medusa configuration

### Storefront Structure
- `/storefront/src/app/` - Next.js App Router pages
- `/storefront/src/modules/` - Feature modules (cart, checkout, products, etc.)
- `/storefront/src/lib/` - Data fetching and utilities
- `/storefront/src/lib/config.ts` - Environment configuration
- Uses TypeScript path aliases: `@lib/*`, `@modules/*`, `@pages/*`

### Key Integrations
1. **MinIO Storage**: Automatically creates 'medusa-media' bucket for file storage
2. **Resend Email**: Email notifications with React Email templates
3. **Stripe Payments**: Payment processing (requires API key + webhook secret)
4. **MeiliSearch**: Product search functionality
5. **Redis**: Required for event bus and workflow engine (falls back to simulated)

### Environment Variables
Backend requires:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection (optional)
- `MINIO_*` - MinIO configuration (optional)
- `RESEND_*` or `SENDGRID_*` - Email service credentials (optional)
- `STRIPE_*` - Stripe payment credentials (optional)
- `MEILISEARCH_*` - Search service configuration (optional)

Storefront requires:
- `NEXT_PUBLIC_MEDUSA_BACKEND_URL` - Backend API URL
- `NEXT_PUBLIC_BASE_URL` - Storefront base URL
- Additional public env vars for integrations

### Testing
- E2E tests using Playwright in `/storefront/e2e/`
- Test fixtures for pages and components
- Authentication-based test separation
- Database seeding/cleanup for tests

### Build Configuration
- Backend uses SWC for TypeScript compilation
- Storefront uses Next.js with Tailwind CSS
- Custom build scripts handle post-build tasks
- Railway-optimized deployment configuration


## Your role
Your role is to write code. You do NOT have access to the running app, so you cannot test the code. You MUST rely on me, the user, to test the code.

If I report a bug in your code, after you fix it, you should pause and ask me to verify that the bug is fixed.

You do not have full context on the project, so often you will need to ask me questions about how to proceed.

Don't be shy to ask questions -- I'm here to help you!

If I send you a URL, you MUST immediately fetch its contents and read it carefully, before you do anything else.


## Testing
always run "npm run build" after we implemented a new feature or code into our app so that it's save to deploy it to Vercel



## Workflow
We use GitHub issues to track work we need to do, and PRs to review code. Whenever you create an issue or a PR, tag it with "by-claude". Use the gh bash command to interact with GitHub.

To start working on a feature, you should:

1. Setup
Read the relevant GitHub issue (or create one if needed)
Checkout main and pull the latest changes
Create a new branch like project-name/feature-name. NEVER commit to main. NEVER push to origin/main.

2. Development
Commit often as you write code, so that we can revert if needed.
When you have a draft of what you're working on, ask me to test it in the app to confirm that it works as you expect. Do this early and often.

3. Review
When the work is done, verify that the diff looks good with git diff main
While you should attempt to write code that adheres to our coding style, don't worry about manually linting or formatting your changes. There are Husky pre-commit Git hooks that will do this for you.
Push the branch to GitHub
Open a PR.
The PR title should not include the issue number
The PR description should start with the issue number and a brief description of the changes.
Next, you should write a test plan. I (not you) will execute the test plan before merging the PR. If I can't check off any of the items, I will let you know. Make sure the test plan covers both new functionality and any EXISTING functionality that might be impacted by your changes
4. Fixing issues
To reconcile different branches, always rebase or cherry-pick. Do not merge.
Sometimes, after you've been working on one feature, I will ask you to start work on an unrelated feature. If I do, you should probably repeat this process from the beginning (checkout main, pull changes, create a new branch). When in doubt, just ask.


## Changelog

Write or update the changelog.md File everytime we make changes to the app and do versioning of the app

## Documentation Updates - WICHTIG!!

**IMMER nach Änderungen durchführen:**
1. Update `docs/PROGRESS.md` mit neuen Features und behobenen Issues
2. Update `docs/CHANGELOG.md` mit allen Änderungen
3. Update `package.json` Version (semantic versioning)
4. Run `npm run build` to verify everything works


**Vergiss niemals die Dokumentation zu aktualisieren!**