export class BrowserManager {
  static async newContext(browser, options = {}) {
    return browser.newContext(options);
  }
}
