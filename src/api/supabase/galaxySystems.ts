import { useQuery } from '@tanstack/react-query';

import { type Database } from '@/src/types/database.types';

import { supabase } from './supabaseClient';

export type GalaxySystem = Pick<
  Database['galaxy']['Tables']['systems']['Row'],
  'symbol' | 'x' | 'y'
>;

const SystemsPageConcurrency = 3;
const SystemsPageSize = 1000;

const getGalaxySystems = async (signal: AbortSignal) => {
  const {
    count,
    data: firstPage,
    error: firstPageError,
  } = await supabase
    .schema('galaxy')
    .from('systems')
    .select('symbol, x, y', { count: 'exact' })
    .order('symbol')
    .range(0, SystemsPageSize - 1)
    .abortSignal(signal);

  if (firstPageError) throw firstPageError;

  const total = count ?? firstPage.length;
  const remainingPageStarts = Array.from(
    { length: Math.max(Math.ceil(total / SystemsPageSize) - 1, 0) },
    (_, index) => (index + 1) * SystemsPageSize,
  );

  const remainingPages: GalaxySystem[][] = [];

  for (
    let startIndex = 0;
    startIndex < remainingPageStarts.length;
    startIndex += SystemsPageConcurrency
  ) {
    const pageStarts = remainingPageStarts.slice(
      startIndex,
      startIndex + SystemsPageConcurrency,
    );
    const pages = await Promise.all(
      pageStarts.map(async (start) => {
        const { data, error } = await supabase
          .schema('galaxy')
          .from('systems')
          .select('symbol, x, y')
          .order('symbol')
          .range(start, start + SystemsPageSize - 1)
          .abortSignal(signal);

        if (error) throw error;
        return data;
      }),
    );

    remainingPages.push(...pages);
  }

  return [firstPage, ...remainingPages].flat();
};

export const useGetGalaxySystems = (galaxyVersion?: string) =>
  useQuery<GalaxySystem[]>({
    enabled: !!galaxyVersion,
    gcTime: 30 * 60_000,
    placeholderData: (previous) => previous,
    queryFn: ({ signal }) => getGalaxySystems(signal),
    queryKey: ['galaxy', 'systems', galaxyVersion],
    staleTime: Infinity,
  });
