import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type Role = "cidadao" | "prefeitura";

export interface Profile {
  id: string;
  role: Role;
  username: string;
  full_name: string;
  district?: string;
  avatar_url?: string;
  points: number; // certifique-se de que a coluna "points" existe em public.profiles (default 0)
}

interface SignUpParams {
  email: string;
  password: string;
  username: string;
  fullName?: string;
  district?: string;
  role: Role;
}

interface UpdateProfileParams {
  fullName: string;
  username: string;
  district?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  needsConfirmation: boolean;
  signUp: (params: SignUpParams) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (params: UpdateProfileParams) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  updateAvatar: (file: File) => Promise<{ error: string | null }>;
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
      // Se cair aqui com "no rows" (PGRST116), o profile não existe na tabela
      // (trigger de criação ausente/falhou) ou a policy de SELECT do RLS
      // está bloqueando o próprio usuário de ler sua linha.
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

  // ── Cadastro ──────────────────────────────────────────────────────────────
  // Recebe um único objeto de parâmetros — precisa bater com a chamada
  // feita em SignUpScreen (App.tsx): signUp({ email, password, username, ... }).
  const signUp: AuthContextType["signUp"] = async ({ email, password, username, fullName, district, role }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          username,
          full_name: fullName,
          district,
        },
      },
    });

    if (error) return { error: error.message };

    // Se a confirmação de e-mail estiver ativa no projeto, não haverá
    // session ainda — sinalizamos isso pra UI mostrar a tela de "confirme seu e-mail".
    const stillNeedsConfirmation = !!(data.user && !data.session);
    if (stillNeedsConfirmation) setNeedsConfirmation(true);

    return { error: null, needsConfirmation: stillNeedsConfirmation };
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

  // ── Atualização de perfil (nome, usuário, bairro) ───────────────────────────
  const updateProfile: AuthContextType["updateProfile"] = async ({ fullName, username, district }) => {
    if (!user) return { error: "Usuário não autenticado." };

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, username, district })
      .eq("id", user.id);

    if (error) return { error: error.message };

    setProfile((prev) => (prev ? { ...prev, full_name: fullName, username, district } : prev));
    return { error: null };
  };

  // ── Troca de senha ───────────────────────────────────────────────────────
  const updatePassword: AuthContextType["updatePassword"] = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return { error: null };
  };

  // ── Upload de avatar ─────────────────────────────────────────────────────
  // Assume um bucket de Storage chamado "avatars" com policy de upload/leitura
  // liberada para o próprio usuário autenticado (auth.uid() = pasta do path).
  const updateAvatar: AuthContextType["updateAvatar"] = async (file) => {
    if (!user) return { error: "Usuário não autenticado." };

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) return { error: uploadError.message };

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
    // cache-busting pra imagem atualizar na hora, sem precisar dar hard refresh
    const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id);

    if (updateError) return { error: updateError.message };

    setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : prev));
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        session, user, profile, loading, needsConfirmation,
        signUp, signIn, signOut, updateProfile, updatePassword, updateAvatar,
      }}
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