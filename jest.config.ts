import type {Config} from '@jest/types';
// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  transform: {
  "^.+\\.tsx?$": "ts-jest",
  },
  setupFiles: [
    "fake-indexeddb/auto",
    "./setupJest.js"
  ]
};
export default config;