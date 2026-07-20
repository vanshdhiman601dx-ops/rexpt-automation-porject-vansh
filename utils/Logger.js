export class Logger {
  static info(message) {
    console.log(`[INFO] ${message}`);
  }

  static step(message) {
    console.log(`[STEP] ${message}`);
  }

  static pass(message) {
    console.log(`[PASS] ${message}`);
  }

  static fail(message) {
    console.error(`[FAIL] ${message}`);
  }

  static recovery(message) {
    console.log(`[RECOVERY] ${message}`);
  }

  static critical(message) {
    console.error(`[CRITICAL] ${message}`);
  }

  static error(message) {
    console.error(`[ERROR] ${message}`);
  }
}
