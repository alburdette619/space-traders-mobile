import { has } from 'lodash';

import { SpaceTradersErrorResponse } from '../types/spaceTraders';

export const isSpaceTradersErrorResponse = (
  obj: any,
): obj is SpaceTradersErrorResponse => {
  return (
    has(obj, 'error') && has(obj.error, 'message') && has(obj.error, 'code')
  );
};
