import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltam variáveis de ambiente. Crie um arquivo .env na raiz do projeto com:\n" +
    "VITE_SUPABASE_URL=...\nVITE_SUPABASE_ANON_KEY=..."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
