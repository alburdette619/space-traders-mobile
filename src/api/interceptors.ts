import { AxiosHeaders } from 'axios';
import { getItemAsync } from 'expo-secure-store';

import { agentKey } from '../constants/storageKeys';
import { client } from './client';

client.interceptors.request.use(async (config) => {
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
