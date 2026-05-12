import { useQuery } from '@tanstack/react-query';

import { type Database } from '@/src/types/database.types';

import { supabase } from './supabaseClient';

type GetSystemsInViewArgs = {
  queryArgs: SystemsInViewArgs;
  signal: AbortSignal;
};

type SystemsInViewArgs =
  Database['galaxy']['Functions']['systems_in_view']['Args'];
type SystemsInViewReturn =
  Database['galaxy']['Functions']['systems_in_view']['Returns'];

const getSystemsInView = async ({
  queryArgs,
  signal,
}: GetSystemsInViewArgs): Promise<SystemsInViewReturn> => {
  const { data, error } = await supabase
    .schema('galaxy')
    .rpc('systems_in_view', queryArgs)
    .abortSignal(signal);

  if (error) throw error;
  return data;
};

export const useGetSystemsInView = ({
  padding = 0,
  queryArgs,
}: {
  padding?: number;
  queryArgs: SystemsInViewArgs;
}) => {
  const paddedQueryArgs = {
    max_x: Math.ceil(queryArgs.max_x + padding),
    max_y: Math.ceil(queryArgs.max_y + padding),
    min_x: Math.floor(queryArgs.min_x - padding),
    min_y: Math.floor(queryArgs.min_y - padding),
  };

  return useQuery<SystemsInViewReturn>({
    enabled: Object.values(queryArgs).some((value) => value !== 0),
    gcTime: 30 * 60_000,
    placeholderData: (prev) => prev,
    queryFn: ({ signal }) =>
      getSystemsInView({ queryArgs: paddedQueryArgs, signal }),
    queryKey: ['galaxy', 'systems_in_view', ...Object.values(paddedQueryArgs)],
    staleTime: 60_000, // “don’t refetch for 60s”
  });
};
