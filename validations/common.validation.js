import { expect } from '@playwright/test';

export async function expectPageUrl(page, pattern) {
  await expect(page).toHaveURL(pattern);
}
