export class Screenshot {
  static async capture(page, path) {
    await page.screenshot({ path, fullPage: true });
  }
}
