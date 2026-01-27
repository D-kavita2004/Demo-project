export default {
  testEnvironment: "node",
  coverageProvider: "v8",
  // Test files
  testMatch: ["**/Src/Tests/**/*.test.js"],

  // Enable coverage
  collectCoverage: true,

  collectCoverageFrom: [
    "Src/Controllers/**/*.js",
    "Src/Middlewares/**/*.js",
  ],

  coverageDirectory: "coverage",

  coverageReporters: [
    "text",
  ],

  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

// jest.config.js
// export default {
//   testEnvironment: "node",
//   coverageProvider: "v8",
//   setupFiles: [], // optional, e.g., for dotenv
// };