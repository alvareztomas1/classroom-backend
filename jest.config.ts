import type { Config } from 'jest';

// eslint-disable-next-line @typescript-eslint/require-await
export default async (): Promise<Config> => {
  return {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.(spec|test)\\.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: [
      '<rootDir>/common/**/*.{ts,js}',
      '<rootDir>/module/**/*.{ts,js}',
    ],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/../src/$1',
      '^@root/(.*)$': '<rootDir>/../$1',
      '^@data/(.*)$': '<rootDir>/../data/$1',
      '^@common/(.*)$': '<rootDir>/common/$1',
      '^@config/(.*)$': '<rootDir>/config/$1',
      '^@module/(.*)$': '<rootDir>/module/$1',
      '^@test/(.*)$': '<rootDir>/test/$1',
    },
  };
};
