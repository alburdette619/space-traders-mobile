import { ApiResponse, create } from 'apisauce';
import axios, {
  AxiosError,
  AxiosRequestConfig,
  isAxiosError,
  isCancel,
} from 'axios';
import { has, isObject } from 'lodash';

import { SpaceTradersErrorResponse } from '../types/spaceTraders';

// By default, use the Supabase base URL.
export const client = create({
  baseURL: process.env.EXPO_PUBLIC_SUPABASE_BASE_URL,
});

export const clientInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
) => {
  // Lint warning due to a type having the same name, `CancelToken`.
  // eslint-disable-next-line
  const source = axios.CancelToken.source();

  try {
    let response = await client.any<T>({
      ...config,
      ...options,
      cancelToken: source.token,
    });

    const data = response.data;

    if (response.ok) {
      return data;
    } else if (response.problem && data && has(data, 'error')) {
      const error = data.error as SpaceTradersErrorResponse['error'];
      throw new AxiosError<SpaceTradersErrorResponse>(
        error.message,
        error.code.toString(),
      );
    } else {
      throw new AxiosError<SpaceTradersErrorResponse>(
        'An unknown error occurred',
      );
    }
  } catch (error: unknown) {
    if (isCancel(error)) {
      return;
    }

    throw error;
  }
};

export type ErrorType<_Error = unknown> = AxiosError<SpaceTradersErrorResponse>;
