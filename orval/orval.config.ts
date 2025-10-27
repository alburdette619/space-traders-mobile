import path from 'path';

// import * as orvalUtils from './utils';

import type { Config, OptionsExport } from 'orval';

// const { addOrvalInputFilters, monorepoRoot, specsPath } = orvalUtils;

const orvalConfig: Config = {
  spaceTraders: {
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
