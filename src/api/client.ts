import axios, { AxiosError, AxiosRequestConfig, isCancel } from 'axios';

import { SpaceTradersErrorResponse } from '../types/spaceTraders';

// By default, use the Supabase base URL.
export const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_SUPABASE_BASE_URL,
});

export const clientInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
) => {
  // Lint warning due to type having the same name, `CancelToken`.
  // eslint-disable-next-line
  const source = axios.CancelToken.source();

  try {
    let response = await client<T>({
      ...config,
      ...options,
      cancelToken: source.token,
    });

    return response.data;
  } catch (error: unknown) {
    // TODO: We need an error interceptor that can handle token refreshes, etc.
    // Weekly server resets mean 401s are common, so we should handle them better.
    if (isCancel(error)) {
      return;
    }

    throw error;
  }
};

export type ErrorType<_Error = unknown> = AxiosError<SpaceTradersErrorResponse>;
