# Rexpt Automation Script

Playwright automation framework for Rexpt application testing.

## Setup

```bash
npm install
npx playwright install
```

## Run Tests

```bash
npm test
```

## Environment

Set `TEST_ENV` to one of:

- `dev`
- `qa`
- `stage`
- `prod`

Example:

```bash
TEST_ENV=qa npm test
```
