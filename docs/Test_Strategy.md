# Test Strategy

## Test Types

- Positive authentication flows
- Negative authentication flows
- UI validation checks
- Smoke coverage for major modules
- Regression coverage for stable journeys

## Execution

- Local: `npm test`
- Headed debug: `npm run test:headed`
- CI: GitHub Actions workflow in `.github/workflows/playwright.yml`
