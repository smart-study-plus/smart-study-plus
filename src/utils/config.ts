export const getSupabaseConfig = () => {
  if (typeof window === 'undefined') {
    return {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    };
  }

  return {
    supabaseUrl:
      window.process?.env?.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      '',
    supabaseAnonKey:
      window.process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      '',
  };
};
