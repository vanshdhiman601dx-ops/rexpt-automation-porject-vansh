# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: more-button-flow.spec.js >> More Button Standalone Flow >> logs in with OTP and verifies Test Agent plus Call Settings
- Location: more-button-flow\tests\more-button-flow.spec.js:18:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/fast-agent-details?/
Received string:  "https://rexptin.vercel.app/signup?email=vanshdhiman601.dx%2B01%40gmail.com"
Timeout: 90000ms

Call log:
  - Expect "toHaveURL" with timeout 90000ms
    178 × unexpected value "https://rexptin.vercel.app/signup?email=vanshdhiman601.dx%2B01%40gmail.com"

```

```yaml
- img "Mask"
- heading "Log In to your Account" [level=1]
- paragraph: If it doesn't exist, we'll create one for you completely free!
- paragraph:
  - text: Email has been sent to
  - strong: vanshdhiman601.dx+01@gmail.com
- paragraph: Enter the code sent to your email
- textbox: "9"
- textbox: "0"
- textbox: "3"
- textbox: "4"
- textbox: "6"
- textbox: "7"
- paragraph: Please check your spam folder if you don't find it in your main inbox.
- button "03:28" [disabled]
- img "button-bg"
- paragraph: Continue
- separator
- text: Or continue with
- separator
- iframe
- paragraph:
  - text: By providing your email address & creating an account, you agree to the Rexptin
  - link "Terms & Conditions":
    - /url: https://www.rexpt.in/Terms-Condition
  - text: and
  - link "Privacy Policy":
    - /url: https://www.rexpt.in/Privacy-Policy
- img "failed"
- paragraph: Invalid OTP
- button "Close"
- region "Notifications Alt+T"
```

# Test source

```ts
  171 | 
  172 |     for (let index = 0; index < count; index += 1) {
  173 |       const candidate = candidates.nth(index);
  174 |       const visible = await candidate.isVisible({ timeout: timeouts.quickAction }).catch(() => false);
  175 | 
  176 |       if (visible) {
  177 |         await this.clickWithoutNavigationWait(candidate);
  178 |         return;
  179 |       }
  180 |     }
  181 | 
  182 |     const textCandidate = this.page.locator(moreButtonLocators.auth.sendOtpText).first();
  183 |     if (await textCandidate.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
  184 |       const clickable = textCandidate.locator(
  185 |         'xpath=ancestor::*[contains(@class, "btnTheme") or self::button or @role="button" or contains(@class, "BtnDiv")][1]'
  186 |       );
  187 | 
  188 |       if (await clickable.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
  189 |         await this.clickWithoutNavigationWait(clickable);
  190 |         return;
  191 |       }
  192 | 
  193 |       await this.clickWithoutNavigationWait(textCandidate);
  194 |       return;
  195 |     }
  196 | 
  197 |     const clicked = await this.page.evaluate(() => {
  198 |       const elements = Array.from(document.querySelectorAll('button, [role="button"], div, p, span'));
  199 |       const target = elements.find((element) => {
  200 |         const text = element.textContent || '';
  201 |         const rect = element.getBoundingClientRect();
  202 |         const style = window.getComputedStyle(element);
  203 | 
  204 |         return (
  205 |           /Send\s+One\s+Time\s+Password/i.test(text) &&
  206 |           rect.width > 0 &&
  207 |           rect.height > 0 &&
  208 |           style.visibility !== 'hidden' &&
  209 |           style.display !== 'none' &&
  210 |           style.pointerEvents !== 'none'
  211 |         );
  212 |       });
  213 | 
  214 |       if (!target) return false;
  215 | 
  216 |       const clickable =
  217 |         target.closest('[class*="btnTheme"], button, [role="button"], [class*="BtnDiv"]') || target;
  218 |       clickable.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  219 |       clickable.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
  220 |       clickable.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  221 |       clickable.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  222 |       return true;
  223 |     });
  224 | 
  225 |     expect(clicked, 'More Button Send One Time Password CTA should be clickable.').toBeTruthy();
  226 |   }
  227 | 
  228 |   async verifyOtpScreen(email) {
  229 |     await expect(this.page.locator(moreButtonLocators.auth.otpScreenText).first()).toBeVisible({
  230 |       timeout: timeouts.pageLoad,
  231 |     });
  232 |     await expect(this.page.locator(moreButtonLocators.auth.otpEmailSentText).first()).toBeVisible();
  233 |     await expect(this.page.getByText(email, { exact: true })).toBeVisible();
  234 |     await expect(this.otpInput(0)).toBeVisible();
  235 |   }
  236 | 
  237 |   async closePopupIfVisible() {
  238 |     const closeButton = this.page.locator(moreButtonLocators.auth.popupCloseButton).first();
  239 |     if (await closeButton.isVisible({ timeout: timeouts.shortAction }).catch(() => false)) {
  240 |       await closeButton.click({ force: true });
  241 |       await this.page.locator(moreButtonLocators.auth.popup).first().waitFor({
  242 |         state: 'hidden',
  243 |         timeout: timeouts.shortAction,
  244 |       }).catch(() => {});
  245 |     }
  246 |   }
  247 | 
  248 |   async clearOtpFields() {
  249 |     for (let index = 5; index >= 0; index -= 1) {
  250 |       await this.otpInput(index).fill('');
  251 |     }
  252 |   }
  253 | 
  254 |   async enterFixedOtp(otp = '903467') {
  255 |     await this.clearOtpFields();
  256 | 
  257 |     for (let index = 0; index < otp.length && index < 6; index += 1) {
  258 |       await this.otpInput(index).fill(otp[index]);
  259 |     }
  260 |   }
  261 | 
  262 |   async continueWithOtp() {
  263 |     await this.continueButton().click({ force: true });
  264 |   }
  265 | 
  266 |   async hasAuthToken() {
  267 |     return this.page.evaluate(() => Boolean(localStorage.getItem('token') || sessionStorage.getItem('token')));
  268 |   }
  269 | 
  270 |   async verifyAuthenticatedFastAgentDetails() {
> 271 |     await expect(this.page).toHaveURL(/\/fast-agent-details?/, { timeout: timeouts.authRedirect });
      |                             ^ Error: expect(page).toHaveURL(expected) failed
  272 |     await expect(this.page.locator(moreButtonLocators.auth.authenticatedSignal).first()).toBeVisible({
  273 |       timeout: timeouts.pageLoad,
  274 |     });
  275 |     await expect.poll(async () => this.hasAuthToken(), { timeout: timeouts.authRedirect }).toBe(true);
  276 |   }
  277 | 
  278 |   async saveSession(storageStatePath) {
  279 |     await this.page.context().storageState({ path: storageStatePath });
  280 |   }
  281 | }
  282 | 
```