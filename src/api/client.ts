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

    // response = responseInterceptor(response);

    return response.data;
  } catch (error: unknown) {
    if (isCancel(error)) {
      return;
    }

    throw error;
    // if (isAxiosError(error)) {
    //   errorInterceptor(clientV2)({
    //     ...error,
    //     config: {
    //       ...error.config,
    //       isRetry: false,
    //     } as ExtendedAxiosErrorConfig,
    //   });
    // }
  }
};

export type ErrorType<_Error = unknown> = AxiosError<SpaceTradersErrorResponse>;
