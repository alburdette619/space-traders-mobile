import { createClient } from '@supabase/supabase-js';

import { Database } from '@/src/types/database.types';

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_BASE_URL || '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON || '',
);
