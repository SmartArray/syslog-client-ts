module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/unit/**/*.test.[jt]s'],
  testPathIgnorePatterns: ['/node_modules/', './test/integration/'],

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
