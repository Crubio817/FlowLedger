// Central app config & future API endpoints.
export const API_BASE = '/api/v1'; // TODO: replace when backend ready
export const FEATURE_FLAGS = {
  amberAccent: true,
};
// Disable random failures during vitest runs for determinism (support both Vitest and browser)
const isTestEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITEST) ||
  (typeof process !== 'undefined' && (process as any).env?.VITEST);
export const RANDOM_FAILURE_RATE = isTestEnv ? 0 : 0.1; // 10% simulated failure otherwise
