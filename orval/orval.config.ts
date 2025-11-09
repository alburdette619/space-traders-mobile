import type { Config } from 'orval';

const orvalConfig: Config = {
  spaceTraders: {
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
    input: {
      target: './SpaceTraders.json',
    },
    output: {
      client: 'react-query',
      docs: false,
      httpClient: 'axios',
      indexFiles: false,
      mock: {
        generateEachHttpStatus: true,
        indexMockFiles: true,
        type: 'msw',
        useExamples: true,
      },
      mode: 'tags-split',
      override: {
        mutator: {
          name: 'clientInstance',
          path: '../src/api/client.ts',
        },
        query: {
          useQuery: true,
        },
      },
      propertySortOrder: 'Alphabetical',
      schemas: '../src/api/models',
      target: '../src/api/models/space-traders-api.ts',
      urlEncodeParameters: true,
    },
  },
};

export default orvalConfig;
