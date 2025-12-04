import { AxiosHeaders, isAxiosError } from 'axios';
import { deleteItemAsync, getItemAsync } from 'expo-secure-store';

import { accountErrorCodes } from '../constants/errorCodes';
import { agentKey } from '../constants/storageKeys';
import { isSpaceTradersErrorResponse } from '../utils/typeCheckers';
import { client } from './client';

client.axiosInstance.interceptors.request.use(async (config) => {
  // Get agent key from secure storage and use it if available. Most traffic,
  // should use the agent key for requests.
  const agentKeyValue = await getItemAsync(agentKey);
  const bearer = `Bearer ${agentKeyValue || process.env.EXPO_PUBLIC_SUPABASE_ANON}`;

  if (bearer) {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }
    config.headers.set('Authorization', bearer);
  }

  // If we have an agent key, use the main API base URL.
  if (agentKeyValue) {
    config.baseURL = process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  return config;
});

client.axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Agent is unauthorized, likely due to server reset invalidating the key.
    console.log(isAxiosError(error), error.status);
    if (isAxiosError(error) && error.status === 401) {
      const spaceTradersError = isSpaceTradersErrorResponse(
        error.response?.data,
      )
        ? error.response?.data
        : null;

      if (
        spaceTradersError &&
        spaceTradersError.error.code ===
          accountErrorCodes.tokenFailedToParseError
      ) {
        // The agent is from before the server reset, we should clear the stored key.
        await deleteItemAsync(agentKey);
      }
    }
  },
);
