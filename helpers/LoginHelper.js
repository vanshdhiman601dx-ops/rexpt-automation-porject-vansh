import { LoginPage } from '../pages/authentication/LoginPage.js';

export class LoginHelper {
  constructor(page) {
    this.loginPage = new LoginPage(page);
  }

  async loginAs(user) {
    await this.loginPage.goto();
    await this.loginPage.login(user.email, user.password);
  }
}
