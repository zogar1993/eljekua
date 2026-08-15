module.exports = {
  testEnvironment: "jest-environment-jsdom",
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/src/**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    "^core/(.+)$": "<rootDir>/src/core/$1",
    "^data/(.+)$": "<rootDir>/src/data/$1",
    "^stdlib/(.+)$": "<rootDir>/src/stdlib/$1",
    "^tests/(.+)$": "<rootDir>/src/tests/$1",
  },
  setupFilesAfterEnv: ['jest-extended/all'],
  transformIgnorePatterns: ['/node_modules/'],
};