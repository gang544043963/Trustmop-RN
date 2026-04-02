/**
 * Environment configuration.
 *
 * Switch APP_ENV to change data source:
 *   'mock' — AsyncStorage seed data (no backend needed)
 *   'dev'  — development backend server
 *   'prod' — production backend server
 */

export type AppEnv = 'mock' | 'dev' | 'prod';

export const APP_ENV: AppEnv = 'mock';

const API_URLS: Record<AppEnv, string> = {
  mock: '',
  dev:  'https://dev-api.trustmop.com',
  prod: 'https://api.trustmop.com',
};

export const API_BASE = API_URLS[APP_ENV];
