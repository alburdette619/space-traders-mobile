import axios, { AxiosError, AxiosRequestConfig, isCancel } from 'axios';
import { getItemAsync } from 'expo-secure-store';
import { agentKey } from '../constants/storageKeys';
import { SpaceTradersErrorResponse } from '../types/spacetraders';

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
});

export const clientInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
) => {
  // Lint warning due to type having the same name, `CancelToken`.
  // eslint-disable-next-line
  const source = axios.CancelToken.source();

  // Get agent key from secure storage and use it if available. Most traffic,
  // should use the agent key for requests.
  const agentKeyValue = await getItemAsync(agentKey);
  const bearer = `Bearer ${agentKeyValue || process.env.EXPO_PUBLIC_SUPABASE_ANON}`;

  config.headers = config.headers || {};
  config.headers.Authorization = bearer;

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

export type ErrorType<SpaceTradersErrorResponse> =
  AxiosError<SpaceTradersErrorResponse>;
