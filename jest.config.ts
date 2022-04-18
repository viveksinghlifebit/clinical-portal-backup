/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

const setupRequiredProcessEnv = (): void => {
  process.env.JWT_SECRET = 'test';
};

setupRequiredProcessEnv();

export default {
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/**/*.{test,d}.ts', '!<rootDir>/src/**/testSetup.ts'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/src/services/mongoose/',
    '/src/api/middlewares/auth.ts',
    '/src/api/middlewares/team.ts',
    '/src/api/routes/index.ts',
    '/src/index.ts',
    '/src/testUtils/'
  ],
  coverageProvider: 'v8',
  coverageReporters: ['text', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75
    }
  },
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  moduleNameMapper: {
    'src/(.*)': '<rootDir>/src/$1',
    '@schemas': '<rootDir>/src/services/schemas/index.ts',
    '@core/(.*)': '<rootDir>/src/core/$1'
  },
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts)$': 'ts-jest'
  }
};
