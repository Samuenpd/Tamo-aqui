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
  banner_url?: string;
  bio?: string;
  points: number;
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
  bio?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  needsConfirmation: boolean;
  signUp: (params: SignUpParams) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (params: UpdateProfileParams) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  updateAvatar: (file: File) => Promise<{ error: string | null }>;
  updateBanner: (file: File) => Promise<{ error: string | null }>;
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

  const clearStaleSession = useCallback(async () => {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // A sessão local é limpa abaixo mesmo se o servidor já não a reconhecer.
    }
    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    let mounted = true;
    let initialized = false;

    // Garante que o app nunca fique preso no loading por uma sessão/cache
    // quebrado ou por uma chamada do Supabase que não responde.
    const finishLoading = () => {
      if (mounted) setLoading(false);
    };

    const clearLocalAuthStorage = () => {
      try {
        // O Supabase normalmente usa sb-<project-ref>-auth-token.
        // Removemos apenas chaves relacionadas ao Auth, sem tocar nos dados
        // da aplicação.
        const keysToRemove: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (
            key &&
            (key.startsWith("sb-") && key.includes("-auth-token"))
          ) {
            keysToRemove.push(key);
          }
        }

        keysToRemove.forEach((key) => localStorage.removeItem(key));
      } catch (err) {
        console.warn("Não foi possível limpar o cache local do Auth:", err);
      }
    };

    const resetAuthState = () => {
      if (!mounted) return;

      setSession(null);
      setUser(null);
      setProfile(null);
      setNeedsConfirmation(false);
      setLoading(false);
    };

    const runWithTimeout = async <T,>(promise: Promise<T>, timeoutMs = 10000): Promise<T> => {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      try {
        return await Promise.race([
          promise,
          new Promise<T>((_, reject) => {
            timeoutId = setTimeout(
              () => reject(new Error("AUTH_TIMEOUT")),
              timeoutMs
            );
          }),
        ]);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    async function init() {
      try {
        const result = await runWithTimeout(
          supabase.auth.getSession(),
          10000
        );

        if (!mounted) return;

        if (result.error) {
          console.warn("Sessão inválida:", result.error.message);

          clearLocalAuthStorage();

          try {
            await supabase.auth.signOut({ scope: "local" });
          } catch {
            // O storage já foi limpo manualmente.
          }

          resetAuthState();
          initialized = true;
          return;
        }

        const currentSession = result.data.session;

        // "Lembrar de mim" controla se uma sessão persistida deve ser
        // reutilizada depois que o navegador for fechado.
        const rememberMe = localStorage.getItem("tamoaqui-remember-me") !== "false";

        if (currentSession && !rememberMe) {
          try {
            await supabase.auth.signOut({ scope: "local" });
          } catch {
            // O estado local abaixo já garante que o usuário fique deslogado.
          }

          clearLocalAuthStorage();
          resetAuthState();
          initialized = true;
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          try {
            await runWithTimeout(
              fetchProfile(currentSession.user.id),
              10000
            );
          } catch (err) {
            console.warn("Não foi possível carregar o profile:", err);

            // Se o profile não puder ser carregado, não deixamos a aplicação
            // presa no loading.
            setProfile(null);
          }
        } else {
          setProfile(null);
        }

        initialized = true;
      } catch (err) {
        console.warn("Falha ao recuperar sessão:", err);

        // Timeout ou refresh token quebrado:
        // limpa o cache e começa como usuário deslogado.
        clearLocalAuthStorage();

        try {
          await supabase.auth.signOut({ scope: "local" });
        } catch {
          // Ignorado de propósito.
        }

        resetAuthState();
        initialized = true;
      } finally {
        finishLoading();
      }
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        // Durante a inicialização, getSession() é a fonte principal.
        // Evitamos concorrência entre getSession e o listener.
        if (!initialized && event === "INITIAL_SESSION") {
          return;
        }

        if (event === "SIGNED_OUT" || !newSession) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setSession(newSession);
        setUser(newSession.user);

        try {
          await runWithTimeout(
            fetchProfile(newSession.user.id),
            10000
          );
        } catch (err) {
          console.warn("Erro ao atualizar profile após evento Auth:", err);
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp: AuthContextType["signUp"] = async ({
    email,
    password,
    username,
    fullName,
    district,
    role,
  }) => {
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

    const stillNeedsConfirmation = !!(data.user && !data.session);
    if (stillNeedsConfirmation) setNeedsConfirmation(true);

    return { error: null, needsConfirmation: stillNeedsConfirmation };
  };

  const signIn: AuthContextType["signIn"] = async (email, password, rememberMe = true) => {
    localStorage.setItem("tamoaqui-remember-me", String(rememberMe));

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return { error: error.message };
    return { error: null };
  };

  // Logout explícito: encerra a sessão no servidor e também remove a sessão local.
  const signOut: AuthContextType["signOut"] = async () => {
    // Primeiro limpamos a UI para o usuário sair imediatamente.
    setSession(null);
    setUser(null);
    setProfile(null);
    setNeedsConfirmation(false);

    try {
      await Promise.race([
        supabase.auth.signOut({ scope: "global" }),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]);
    } catch (err) {
      console.warn("Erro ao sair da conta:", err);
    } finally {
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch {
        // Ignorado: fazemos a limpeza local abaixo.
      }

      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith("sb-") && key.includes("-auth-token")) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // Ignorado.
      }
    }
  };

  const updateProfile: AuthContextType["updateProfile"] = async ({
    fullName,
    username,
    district,
    bio,
  }) => {
    if (!user) return { error: "Usuário não autenticado." };

    const cleanBio = (bio ?? "").trim().slice(0, 180);

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        username: username.trim(),
        district: district?.trim() || null,
        bio: cleanBio,
      })
      .eq("id", user.id)
      .select("*")
      .single();

    if (error) return { error: error.message };

    setProfile(data as Profile);
    return { error: null };
  };

  const updatePassword: AuthContextType["updatePassword"] = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return { error: null };
  };

  const uploadProfileImage = async (
    file: File,
    kind: "avatar" | "banner"
  ): Promise<{ error: string | null }> => {
    if (!user) return { error: "Usuário não autenticado." };

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const bucket = "profile-images";
    const path = `${user.id}/${kind}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) return { error: uploadError.message };

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
    const column = kind === "avatar" ? "avatar_url" : "banner_url";

    const { data, error: updateError } = await supabase
      .from("profiles")
      .update({ [column]: publicUrl })
      .eq("id", user.id)
      .select("*")
      .single();

    if (updateError) return { error: updateError.message };

    setProfile(data as Profile);
    return { error: null };
  };

  const updateAvatar: AuthContextType["updateAvatar"] = async (file) =>
    uploadProfileImage(file, "avatar");

  const updateBanner: AuthContextType["updateBanner"] = async (file) =>
    uploadProfileImage(file, "banner");

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        needsConfirmation,
        signUp,
        signIn,
        signOut,
        updateProfile,
        updatePassword,
        updateAvatar,
        updateBanner,
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