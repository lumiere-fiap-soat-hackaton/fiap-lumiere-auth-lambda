const config = {
  rootDir: '.',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts', 'json'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/package/"],
  transform: { '^.+\\.ts?$': ['ts-jest', { tsconfig: './tsconfig.json' }] },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

export default config;
