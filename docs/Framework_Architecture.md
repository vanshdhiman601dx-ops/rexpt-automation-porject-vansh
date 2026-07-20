# Framework Architecture

## Layers

- `tests`: Playwright specs grouped by product area.
- `pages`: Page object models and page-level actions.
- `locators`: Centralized selectors.
- `helpers`: Reusable business-flow helpers.
- `fixtures`: Shared Playwright fixtures.
- `validations`: Domain-specific assertions.
- `utils`: Browser, file, logging, retry, API, and data utilities.
- `test-data`: Environment-neutral input data.
- `config`: Environment configuration.
