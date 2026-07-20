export class NavigationHelper {
  constructor(page) {
    this.page = page;
  }

  async goTo(path) {
    await this.page.goto(path);
  }
}
