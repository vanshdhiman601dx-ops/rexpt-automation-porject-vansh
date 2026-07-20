export class ValidationHelper {
  static isNonEmptyText(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }
}
