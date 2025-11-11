import { getItemAsync } from 'expo-secure-store';
import { useEffect, useState } from 'react';

import { agentKey } from '../constants/storageKeys';

export const useHasAgent = () => {
  const [hasAgent, setHasAgent] = useState<boolean>(false);

  useEffect(() => {
    const checkAgent = async () => {
      const agentValue = await getItemAsync(agentKey);
      setHasAgent(agentValue !== null);
    };

    checkAgent();
  }, []);

  return hasAgent;
};
