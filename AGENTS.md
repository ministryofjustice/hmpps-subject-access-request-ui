# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project overview

`hmpps-subject-access-request-ui` is the Node.js/TypeScript (Express + Nunjucks) UI for the HMPPS
Subject Access Requests service. It is built from the
[hmpps-template-typescript](https://github.com/ministryofjustice/hmpps-template-typescript) template and
follows standard MoJ HMPPS conventions. It works alongside:
- [hmpps-subject-access-request-api](https://github.com/ministryofjustice/hmpps-subject-access-request-api)
- [hmpps-subject-access-request-worker](https://github.com/ministryofjustice/hmpps-subject-access-request-worker)

Technical design docs: `docs/technical-design.md`. Confluence overview is linked from `README.md`.

## Tech stack

- Node.js `^24`, npm `^11` (see `.nvmrc` / `engines` in `package.json`)
- TypeScript, Express, Nunjucks (`.njk`) views, GOV.UK Frontend / MoJ Frontend components
- Sass for stylesheets (`assets/scss`)
- Jest for unit tests, Playwright for integration tests
- ESLint (`@ministryofjustice/eslint-config-hmpps`) and Prettier for linting/formatting
- Docker Compose for running the app with its dependencies (hmpps-auth, redis, manage-users-api)

## Repository layout

- `server/` — application source (controllers, routes, services, middleware, data, views, utils)
- `server/views/` — Nunjucks templates (`pages`, `components`, `partials`)
- `assets/` — frontend assets (scss, images, js)
- `integration_tests/` — Playwright integration tests
- `helm_deploy/` — Helm chart for Kubernetes deployment
- `docs/` — technical design documentation
- `dist/` — compiled build output (generated, do not edit directly)

## Setup and running locally

- Install dependencies: `npm install` (use Node `^24` / npm `^11`, matching `.nvmrc`)
- Run full stack via Docker: `docker compose pull && docker compose up`
- Run app only (deps via compose, app via nodemon): `docker compose up --scale=app=0` then `npm run start:dev`
- Integration test stack: `docker compose -f docker-compose-test.yml up`, then `npm run start-feature`
  (or `npm run start-feature:dev`)

## Common commands

- Build: `npm run build`
- Lint: `npm run lint` (auto-fix: `npm run lint-fix`)
- Type check: `npm run typecheck`
- Unit tests: `npm run test` (CI mode: `npm run test:ci`)
- Integration tests: `npm run int-test` (first run `npm run int-test-init:ci`; UI mode: `npm run int-test-ui`)
- Security audit: `npm run security_audit`

Always run the smallest relevant command(s) above after making changes — e.g. `npm run lint`,
`npm run typecheck`, and `npm run test` for server-side TypeScript changes.

## Code style

- Formatting is enforced by Prettier (`.prettierrc`): no semicolons, single quotes, trailing commas,
  120 char print width, arrow functions without parens for single args.
- Linting is enforced by ESLint using the shared HMPPS config (`eslint.config.mjs`); fix warnings rather
  than suppressing them, and keep `--max-warnings 0` passing.
- Prefer existing patterns in `server/` (e.g. controller/service/route separation) over introducing new
  architectural styles.
- Husky git hooks run checks on commit — do not bypass them.

## Testing expectations

- Unit tests live alongside source files and match `*.test.ts`/`*.cy.ts` (see `testMatch` in `package.json`);
  they run via Jest with `ts-jest`.
- Add or update unit tests for behavioural changes in `server/`.
- Integration tests (Playwright) live in `integration_tests/` and exercise the running app end-to-end.
- Do not consider a change complete until the relevant lint, typecheck, and test commands pass locally.

## Notes for agents

- Do not commit secrets, credentials, or `.env` files.
- Do not edit generated/build output under `dist/`.
- When changing dependencies, update `package.json`/`package-lock.json` together and re-run `npm install`.
- See `README.md` for further operational context and `CHANGELOG.md` for release history.
