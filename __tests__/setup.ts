// Mock AsyncStorage with an in-memory store
const store: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) => Promise.resolve(store[key] ?? null)),
  setItem: jest.fn((key: string, value: string) => {
    store[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    delete store[key];
    return Promise.resolve();
  }),
  mergeItem: jest.fn((key: string, value: string) => {
    const existing = store[key] ? JSON.parse(store[key]) : {};
    store[key] = JSON.stringify({ ...existing, ...JSON.parse(value) });
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    Object.keys(store).forEach((k) => delete store[k]);
    return Promise.resolve();
  }),
}));

// Increase timeout for property-based tests (many async calls per run)
jest.setTimeout(60000);

// Clear store before each test
beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  jest.clearAllMocks();
});
