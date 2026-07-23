import type { Config } from 'jest';

const config: Config = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-reanimated|react-native-gesture-handler)/)',
  ],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/lib/', '/example/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/index.ts',
    '!src/types.ts',
  ],
  moduleNameMapper: {
    '^react-native-draggable-kit$': '<rootDir>/src/index',
  },
};

export default config;
