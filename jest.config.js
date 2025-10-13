const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "jest-environment-jsdom",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^scripts/(.+)$": "<rootDir>/src/scripts/$1",
    "^tests/(.+)$": "<rootDir>/src/tests/$1",
  },
  setupFilesAfterEnv: ['jest-extended/all'],
};