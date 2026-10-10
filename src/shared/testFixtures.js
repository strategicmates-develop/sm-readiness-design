// Shared helper for the tests (not imported by app code).
export function httpError(status, data = {}) {
  return Object.assign(new Error(`HTTP ${status}`), { response: { status, data } });
}