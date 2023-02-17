/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest/setup.ts'],
  moduleFileExtensions: ['vue', 'js', 'ts', 'tsx', 'json'],
  testEnvironment: 'jsdom',
  testRegex: '(/src/.*\\.(test|spec))\\.(ts|tsx|js)$',
  transform: {
    '^.+\\.vue$': 'vue3-jest',
    '^.+\\js$': 'babel-jest',
    '.(ts|tsx)': 'ts-jest',
  },
  transformIgnorePatterns: ['node_modules'],
}
