module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/integration/**/*.test.[jt]s'],
  testTimeout: 30000,

  globalSetup: './test/integration/jest.integration.setup.ts',
  globalTeardown: './test/integration/jest.integration.teardown.js',

  testPathIgnorePatterns: ['/node_modules/', './test/unit/'],

  transform: {
    '^.+\\.tsx?$': ['ts-jest', {}],
    '^.+.tsx?$': ['ts-jest', {}],
  },

  moduleFileExtensions: [
    'js',
    'json',
    'node',
    'ts',
  ],

  moduleNameMapper: {
    '^(\\.\\.?/.*)\\.js$': '$1',
  }  
};