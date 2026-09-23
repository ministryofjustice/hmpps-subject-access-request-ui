# hmpps-subject-access-request-ui
[![Ministry of Justice Repository Compliance Badge](https://github-community.service.justice.gov.uk/repository-standards/api/hmpps-subject-access-request-ui/badge?style=flat)](https://github-community.service.justice.gov.uk/repository-standards/hmpps-subject-access-request-ui)
[![Docker Repository on ghcr](https://img.shields.io/badge/ghcr.io-repository-2496ED.svg?logo=docker)](https://ghcr.io/ministryofjustice/hmpps-subject-access-request-ui)
[![Pipeline [test -> build -> deploy]](https://github.com/ministryofjustice/hmpps-subject-access-request-ui/actions/workflows/pipeline.yml/badge.svg?branch=main)](https://github.com/ministryofjustice/hmpps-subject-access-request-ui/actions/workflows/pipeline.yml)

UI for Subject Access Requests. The other components of this service are the [hmpps-subject-access-request-api](https://github.com/ministryofjustice/hmpps-subject-access-request-api) and the [hmpps-subject-access-request-worker](https://github.com/ministryofjustice/hmpps-subject-access-request-worker). The Confluence documentation for the service can be found [here](https://dsdmoj.atlassian.net/wiki/spaces/SARS/pages/4771479564/Overview).

## Documentation

[Technical Design](docs/technical-design.md)

## Running the app
The easiest way to run the app is to use docker compose to create the service and all dependencies. 

`docker compose pull`

`docker compose up`

### Dependencies

The base template requires:
* hmpps-auth - for authentication
* redis - session store and token caching
* manage-users-api - for user management

### Running the app for development

To start the main services excluding the example typescript template app: 

`docker compose up --scale=app=0`

Install dependencies using `npm install`, ensuring you are using `node v22.x` and `npm v11.x`

> [!NOTE]
>  Using `nvm` (or [fnm](https://github.com/Schniz/fnm)), run `nvm  install --latest-npm` within the repository folder to use the > correct version of node, and the latest version of npm. This matches the `engines` config in `package.json` and the CircleCI build config.

And then, to build the assets and start the app with nodemon:

`npm run start:dev`

### Run linter

`npm run lint`

### Run tests

`npm run test`

### Running integration tests

For local running, start a test db, redis, and wiremock instance by:

`docker compose -f docker-compose-test.yml up`

Then run the server in test mode by:

`npm run start-feature` (or `npm run start-feature:dev` to run with nodemon)

After first install ensure playwright is initialised:

`npm run int-test-init:ci`

And then either, run tests in headless mode with:

`npm run int-test`

Or run tests with the UI:

`npm run int-test-ui`

## Changelog

A changelog for the service is available [here](./CHANGELOG.md)

## Dependency Checks

The template project has implemented some scheduled checks to ensure that key dependencies are kept up to date.
If these are not desired in the cloned project, remove references to `check_outdated` job from `.circleci/config.yml`

