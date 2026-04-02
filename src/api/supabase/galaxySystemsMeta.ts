import { useQuery } from '@tanstack/react-query';
import { first } from 'lodash';

import { supabase } from './supabaseClient';

export const useGetSystemsMeta = () =>
  useQuery({
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('galaxy')
        .from('systems_meta')
        .select('*')
        .eq('id', true);

      if (error) throw error;

      return first(data);
    },
    queryKey: ['galaxy', 'systems_meta'],
  });
