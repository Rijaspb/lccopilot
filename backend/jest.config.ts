import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^(.*)\\.(css|less|scss)$': '<rootDir>/src/tests/styleMock.ts',
  },
  verbose: true,
};

export default config;


