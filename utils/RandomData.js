export function randomEmail(prefix = 'rexpt-user') {
  return `${prefix}-${Date.now()}@example.com`;
}
