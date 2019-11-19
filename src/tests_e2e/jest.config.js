module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/*.e2e.ts'],
  setupFilesAfterEnv: [
    // NOT setupFiles
    './jest/defaultTimeout.js',
  ],
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
}
