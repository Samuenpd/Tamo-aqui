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
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
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

    async function init() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.warn("Sessão inválida, limpando:", error.message);
          await clearStaleSession();
          return;
        }

        if (!mounted) return;

        setSession(data.session);
        setUser(data.session?.user ?? null);

        if (data.session?.user) {
          await fetchProfile(data.session.user.id);
        } else {
          setProfile(null);
        }
      } catch (err) {
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
        await clearStaleSession();
        if (mounted) setLoading(false);
        return;
      }

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }

      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [fetchProfile, clearStaleSession]);

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

  const signIn: AuthContextType["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  // Logout explícito: encerra a sessão no servidor e também remove a sessão local.
  const signOut: AuthContextType["signOut"] = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });

      if (error) {
        console.error("Erro ao sair da conta:", error.message);
      }
    } finally {
      // Mesmo que o servidor retorne erro, não deixamos a UI continuar autenticada.
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch {
        // Ignora: o estado abaixo garante a saída visual.
      }

      setSession(null);
      setUser(null);
      setProfile(null);
      setNeedsConfirmation(false);
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