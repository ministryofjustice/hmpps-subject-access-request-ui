# hmpps-subject-access-request-ui
[![repo standards badge](https://img.shields.io/badge/dynamic/json?color=blue&style=flat&logo=github&label=MoJ%20Compliant&query=%24.result&url=https%3A%2F%2Foperations-engineering-reports.cloud-platform.service.justice.gov.uk%2Fapi%2Fv1%2Fcompliant_public_repositories%2Fhmpps-subject-access-request-ui)](https://operations-engineering-reports.cloud-platform.service.justice.gov.uk/public-github-repositories.html#hmpps-subject-access-request-ui "Link to report")
[![CircleCI](https://circleci.com/gh/ministryofjustice/hmpps-subject-access-request-ui/tree/main.svg?style=svg)](https://circleci.com/gh/ministryofjustice/hmpps-subject-access-request-ui)

This project was created via the template github repo used for new Typescript based projects.

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

And for SAR functionality, we also require:
* hmpps-service-catalogue - DPS service catalogue for API endpoints

### Running the app for development

To start the main services excluding the example typescript template app: 

`docker compose up --scale=app=0`

Install dependencies using `npm install`, ensuring you are using `node v18.x` and `npm v9.x`

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

And then either, run tests in headless mode with:

`npm run int-test`
 
Or run tests with the cypress UI:

`npm run int-test-ui`

## Change log

A changelog for the service is available [here](./CHANGELOG.md)

## Dependency Checks

The template project has implemented some scheduled checks to ensure that key dependencies are kept up to date.
If these are not desired in the cloned project, remove references to `check_outdated` job from `.circleci/config.yml`
