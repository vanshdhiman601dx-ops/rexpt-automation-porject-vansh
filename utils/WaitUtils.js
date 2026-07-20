export class WaitUtils {
  static async waitForVisible(page, selector) {
    await page.locator(selector).waitFor({ state: 'visible' });
  }
}
