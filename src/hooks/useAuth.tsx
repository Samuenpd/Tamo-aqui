import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type Role = "cidadao" | "prefeitura";

interface Profile {
  id: string;
  role: Role;
  username: string;
  full_name?: string;
  district?: string;
  avatar_url?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  needsConfirmation: boolean;
  signUp: (email: string, password: string, extra: { role: Role; username: string; full_name?: string; district?: string }) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Erro ao buscar profile:", error.message);
      setProfile(null);
      return;
    }
    setProfile(data as Profile);
  }, []);

  // Limpa qualquer token de sessão inválido salvo no localStorage.
  // Isso é o que evita o loading infinito quando o refresh token expirou
  // ou foi revogado (AuthApiError: Invalid Refresh Token).
  const clearStaleSession = useCallback(async () => {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // Mesmo se o signOut falhar (ex: já não há sessão no servidor),
      // ainda assim garantimos que o estado local fique limpo.
    }
    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          // Cobre especificamente "Invalid Refresh Token: Refresh Token Not Found"
          // e qualquer outro erro de recuperação de sessão.
          console.warn("Sessão inválida, limpando:", error.message);
          await clearStaleSession();
          return;
        }

        if (!mounted) return;

        setSession(data.session);
        setUser(data.session?.user ?? null);

        if (data.session?.user) {
          await fetchProfile(data.session.user.id);
        }
      } catch (err) {
        // Rede fora do ar, resposta malformada, etc — nunca deixamos
        // isso travar o app em loading eterno.
        console.error("Falha ao inicializar sessão:", err);
        await clearStaleSession();
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      if (event === "TOKEN_REFRESHED" && !newSession) {
        // Refresh falhou (token revogado/expirado) — limpa e segue.
        await clearStaleSession();
        setLoading(false);
        return;
      }

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [fetchProfile, clearStaleSession]);

  const signUp: AuthContextType["signUp"] = async (email, password, extra) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: extra.role,
          username: extra.username,
          full_name: extra.full_name,
          district: extra.district,
        },
      },
    });

    if (error) return { error: error.message };

    // Se a confirmação de e-mail estiver ativa no projeto, não haverá
    // session ainda — sinalizamos isso pra UI mostrar a tela de "confirme seu e-mail".
    if (data.user && !data.session) {
      setNeedsConfirmation(true);
    }

    return { error: null };
  };

  const signIn: AuthContextType["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, user, profile, loading, needsConfirmation, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}