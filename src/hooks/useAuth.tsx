import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type Role = "cidadao" | "prefeitura";

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  role: Role;
  district: string | null;
  avatar_url: string | null;
  points: number;
}

interface SignUpParams {
  email: string;
  password: string;
  username: string;
  fullName: string;
  district: string;
  role: Role;
}

interface AuthResult {
  error: string | null;
  needsConfirmation?: boolean;
}

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (params: SignUpParams) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateAvatar: (file: File) => Promise<{ error: string | null; url?: string }>;
  updateProfile: (updates: { fullName: string; username: string; district: string }) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (!error) setProfile(data as Profile);
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session) await loadProfile(data.session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) await loadProfile(newSession.user.id);
      else setProfile(null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn: AuthContextValue["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? traduzErro(error.message) : null };
  };

  const signUp: AuthContextValue["signUp"] = async ({ email, password, username, fullName, district, role }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: traduzErro(error.message) };
    if (!data.user) return { error: "Não foi possível criar o usuário." };

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      username,
      full_name: fullName,
      district,
      role,
    });
    if (profileError) {
      if (profileError.message.includes("duplicate") || profileError.code === "23505") {
        return { error: "Esse nome de usuário já está em uso." };
      }
      return { error: profileError.message };
    }

    // Se "Confirm email" estiver ligado no projeto Supabase, não há sessão ainda.
    if (!data.session) {
      return { error: null, needsConfirmation: true };
    }

    setSession(data.session);
    await loadProfile(data.user.id);
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  };

  const updateAvatar: AuthContextValue["updateAvatar"] = async (file) => {
    if (!session || !profile) return { error: "Você precisa estar logado." };

    const ext = file.name.split(".").pop() || "jpg";
    // Reaproveita o bucket "post-images" (já público e liberado pra upload autenticado),
    // só organiza em uma subpasta "avatars/{userId}/...".
    const path = `avatars/${profile.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (uploadError) return { error: uploadError.message };

    const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(path);
    const newUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: newUrl })
      .eq("id", profile.id);
    if (updateError) return { error: updateError.message };

    setProfile((p) => (p ? { ...p, avatar_url: newUrl } : p));
    return { error: null, url: newUrl };
  };

  const updateProfile: AuthContextValue["updateProfile"] = async ({ fullName, username, district }) => {
    if (!profile) return { error: "Você precisa estar logado." };

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, username, district })
      .eq("id", profile.id);

    if (error) {
      if (error.message.includes("duplicate") || error.code === "23505") {
        return { error: "Esse nome de usuário já está em uso." };
      }
      return { error: error.message };
    }

    setProfile((p) => (p ? { ...p, full_name: fullName, username, district } : p));
    return { error: null };
  };

  const updatePassword: AuthContextValue["updatePassword"] = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error ? traduzErro(error.message) : null };
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signUp, signOut, updateAvatar, updateProfile, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa ser usado dentro de <AuthProvider>");
  return ctx;
}

function traduzErro(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (msg.includes("User already registered")) return "Já existe uma conta com esse e-mail.";
  if (msg.includes("Password should be at least")) return "A senha precisa ter no mínimo 6 caracteres.";
  return msg;
}