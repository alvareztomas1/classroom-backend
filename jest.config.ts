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
      '^@cloud/(.*)$': '<rootDir>/module/cloud/$1',
      '^@config/(.*)$': '<rootDir>/config/$1',
      '^@common/(.*)$': '<rootDir>/common/$1',
      '^@data/(.*)$': '<rootDir>/../data/$1',
      '^@app/(.*)$': '<rootDir>/module/app/$1',
      '^@iam/(.*)$': '<rootDir>/module/iam/$1',
      '^@course/(.*)$': '<rootDir>/module/course/$1',
      '^@category/(.*)$': '<rootDir>/module/category/$1',
      '^@section/(.*)$': '<rootDir>/module/section/$1',
      '^@lesson/(.*)$': '<rootDir>/module/lesson/$1',
      '^@payment-method/(.*)$': '<rootDir>/module/payment-method/$1',
      '^@purchase/(.*)$': '<rootDir>/module/purchase/$1',
      '^@module/(.*)$': '<rootDir>/module/$1',
      '^@test/(.*)$': '<rootDir>/test/$1',
      '^@root/(.*)$': '<rootDir>/../$1',
    },
  };
};
