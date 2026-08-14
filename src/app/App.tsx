import { useState, useRef, useEffect } from "react";
import {
  Home, Search, PlusSquare, Bell, User, Heart, MessageCircle, Share2,
  Bookmark, MapPin, X, ChevronDown, AlertTriangle, Lightbulb, Trash2,
  Droplets, Construction, TreeDeciduous, Navigation, Camera, CheckCircle,
  Clock, TrendingUp, Send, Grid, List, Settings, LogOut, Sun, Moon,
  Star, Filter, ChevronRight, Award, Building2, Users, ArrowRight,
  BarChart3, ClipboardList, ChevronUp, Eye, EyeOff, Edit3, RefreshCw,
  Lock, AtSign, AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase Configuration ───────────────────────────────────────────────────

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  district: string;
  role: "cidadao" | "prefeitura";
  created_at: string;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  created_at: string;
  likes: number;
  liked: boolean;
  user: {
    username: string;
    avatar_url?: string;
  };
}

interface Post {
  id: string;
  user_id: string;
  user: {
    username: string;
    avatar_url?: string;
    district: string;
  };
  location: string;
  image_url: string;
  caption: string;
  problem_type: ProblemId;
  likes_count: number;
  comments: Comment[];
  created_at: string;
  status: PostStatus;
  liked: boolean;
  saved: boolean;
}

type ProblemId  = "buraco" | "iluminacao" | "lixo" | "alagamento" | "calcada" | "arvore" | "sinalizacao";
type PostStatus = "aberto" | "em_analise" | "resolvido";
type TabId      = "feed" | "buscar" | "notif" | "perfil";
type Role       = "cidadao" | "prefeitura";

// ─── Constants ────────────────────────────────────────────────────────────────

const PROBLEM_TYPES = [
  { id: "buraco",     label: "Buraco na Via",       icon: Construction, color: "#ef4444", bg: "bg-red-950/60"    },
  { id: "iluminacao", label: "Iluminação Pública",   icon: Lightbulb,    color: "#facc15", bg: "bg-yellow-950/60" },
  { id: "lixo",       label: "Lixo / Entulho",       icon: Trash2,       color: "#22c55e", bg: "bg-green-950/60"  },
  { id: "alagamento", label: "Alagamento",            icon: Droplets,     color: "#3b82f6", bg: "bg-blue-950/60"   },
  { id: "calcada",    label: "Calçada Danificada",    icon: AlertTriangle,color: "#f97316", bg: "bg-orange-950/60" },
  { id: "arvore",     label: "Árvore / Vegetação",    icon: TreeDeciduous,color: "#84cc16", bg: "bg-lime-950/60"   },
  { id: "sinalizacao",label: "Sinalização",           icon: Navigation,   color: "#a78bfa", bg: "bg-violet-950/60" },
];

const STATUS_META: Record<PostStatus, { label: string; color: string; bg: string; dot: string; next: PostStatus | null; nextLabel: string }> = {
  aberto:     { label: "Aberto",      color: "text-red-400",    bg: "bg-red-950/60",    dot: "bg-red-400",    next: "em_analise", nextLabel: "Iniciar Análise"   },
  em_analise: { label: "Em Análise",  color: "text-yellow-400", bg: "bg-yellow-950/60", dot: "bg-yellow-400", next: "resolvido",  nextLabel: "Marcar Resolvido"  },
  resolvido:  { label: "Resolvido",   color: "text-green-400",  bg: "bg-green-950/60",  dot: "bg-green-400",  next: null,         nextLabel: ""                  },
};

const STORIES = [
  { id: 1, user: "Zona Norte", img: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=80&h=80&fit=crop&auto=format", active: true  },
  { id: 2, user: "Zona Sul",   img: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=80&h=80&fit=crop&auto=format", active: true  },
  { id: 3, user: "Centro",     img: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=80&h=80&fit=crop&auto=format", active: false },
  { id: 4, user: "Zona Leste", img: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=80&h=80&fit=crop&auto=format", active: true  },
  { id: 5, user: "Zona Oeste", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=80&h=80&fit=crop&auto=format", active: false },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

function ProblemBadge({ typeId }: { typeId: ProblemId }) {
  const t = PROBLEM_TYPES.find((x) => x.id === typeId)!;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${t.bg}`} style={{ color: t.color }}>
      <t.icon size={11} />{t.label}
    </span>
  );
}

function StatusBadge({ status }: { status: PostStatus }) {
  const s = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
    </span>
  );
}

async function uploadImage(file: File, bucket: string, path: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return urlData.publicUrl;
  } catch (err) {
    console.error("Upload error:", err);
    return null;
  }
}

// ─── Welcome Screen ───────────────────────────────────────────────────────────

function WelcomeScreen({ onChoose, dark, onToggleDark }: { onChoose: (r: Role) => void; dark: boolean; onToggleDark: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #f97316, transparent)" }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #ea580c, transparent)" }} />
      </div>
      <div className="absolute top-4 right-4">
        <button onClick={onToggleDark} className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors">
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12">
        <div className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-2xl" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
          <Building2 size={36} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-foreground leading-tight">TamoAqui</h1>
        <p className="text-base text-muted-foreground mt-2 font-semibold">Prefeitura de São Paulo</p>
        <p className="text-sm text-muted-foreground mt-1">Reporte problemas. Acompanhe soluções.</p>
      </motion.div>

      <div className="w-full max-w-sm flex flex-col gap-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center mb-1">Como deseja entrar?</p>

        <motion.button
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          onClick={() => onChoose("cidadao")}
          className="group w-full flex items-center gap-5 p-5 rounded-2xl border-2 border-border bg-card hover:border-primary transition-all text-left"
        >
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-105" style={{ backgroundColor: "#f97316" }}>
            <Users size={26} style={{ color: "#0f0f0f" }} />
          </div>
          <div className="flex-1">
            <p className="text-base font-black text-foreground">Sou Cidadão</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">Reporte problemas urbanos, acompanhe ocorrências e interaja com a comunidade.</p>
          </div>
          <ArrowRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
          onClick={() => onChoose("prefeitura")}
          className="group w-full flex items-center gap-5 p-5 rounded-2xl border-2 border-border bg-card hover:border-primary transition-all text-left"
        >
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-105" style={{ background: "linear-gradient(135deg, #1a1207, #3a2010)", border: "2px solid #f97316" }}>
            <Building2 size={26} style={{ color: "#f97316" }} />
          </div>
          <div className="flex-1">
            <p className="text-base font-black text-foreground">Sou da Prefeitura</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">Gerencie ocorrências, atualize status e monitore indicadores da cidade.</p>
          </div>
          <ArrowRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
        </motion.button>
      </div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-xs text-muted-foreground mt-10 text-center">
        Versão 2.5.0 · Secretaria de Serviços Urbanos
      </motion.p>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ role, onLogin, onBack, onSignUp, dark, onToggleDark }: {
  role: Role; onLogin: () => void; onBack: () => void; onSignUp: () => void; dark: boolean; onToggleDark: () => void;
}) {
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [forgotSent,  setForgotSent]  = useState(false);

  const isPrefeitura = role === "prefeitura";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: authError, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("E-mail ou senha incorretos.");
        setLoading(false);
        return;
      }

      if (data.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileData?.role !== role) {
          await supabase.auth.signOut();
          setError("Este conta não é do tipo " + (isPrefeitura ? "Prefeitura" : "Cidadão") + ".");
          setLoading(false);
          return;
        }

        onLogin();
      }
    } catch (err) {
      setError("Erro ao entrar. Tente novamente.");
      setLoading(false);
    }
  };

  const handleForgot = (e: React.MouseEvent) => {
    e.preventDefault();
    setForgotSent(true);
    setTimeout(() => setForgotSent(false), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #f97316, transparent)" }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #ea580c, transparent)" }} />
      </div>
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight size={16} className="rotate-180" />Voltar
        </button>
        <button onClick={onToggleDark} className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors">
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl"
            style={isPrefeitura
              ? { background: "linear-gradient(135deg, #1a0a00, #3a1a00)", border: "2px solid #f97316" }
              : { background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
            {isPrefeitura ? <Building2 size={28} style={{ color: "#f97316" }} /> : <Users size={28} className="text-white" />}
          </div>
          <h1 className="text-2xl font-black text-foreground">{isPrefeitura ? "Acesso Restrito" : "Bem-vindo!"}</h1>
          <p className="text-sm text-muted-foreground mt-1">{isPrefeitura ? "Painel da Prefeitura de São Paulo" : "Entre na sua conta de cidadão"}</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">E-mail</label>
            <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${email ? "border-primary" : "border-border"}`}>
              <AtSign size={16} className="text-muted-foreground shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="seu@email.com"
                autoComplete="email"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Senha</label>
            <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${password ? "border-primary" : "border-border"}`}>
              <Lock size={16} className="text-muted-foreground shrink-0" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                autoComplete="current-password"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button type="button" onClick={() => setShowPass((v) => !v)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/10 border border-destructive/20">
                <AlertCircle size={14} className="text-destructive shrink-0" />
                <p className="text-xs font-semibold text-destructive">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end -mt-1">
            <button type="button" onClick={handleForgot} className="text-xs font-bold text-primary hover:opacity-75 transition-opacity underline underline-offset-2">
              Esqueci minha senha
            </button>
          </div>

          <AnimatePresence>
            {forgotSent && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-950/50 border border-green-800/40">
                <CheckCircle size={14} className="text-green-400 shrink-0" />
                <p className="text-xs font-semibold text-green-400">Link de recuperação enviado para o e-mail cadastrado.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff" }}
          >
            {loading ? <><RefreshCw size={16} className="animate-spin" />Entrando…</> : "Entrar"}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Ao entrar, você concorda com os{" "}
          <button type="button" className="text-primary font-bold underline underline-offset-2">Termos de Uso</button>{" "}
          da Prefeitura de São Paulo.
        </p>

        {role === "cidadao" && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            Não tem conta?{" "}
            <button type="button" onClick={onSignUp} className="text-primary font-black hover:opacity-75 transition-opacity">
              Criar conta grátis
            </button>
          </p>
        )}
      </motion.div>
    </div>
  );
}

// ─── Sign Up Screen ───────────────────────────────────────────────────────────

function SignUpScreen({ role, onSuccess, onBack, dark, onToggleDark }: {
  role: Role; onSuccess: () => void; onBack: () => void; dark: boolean; onToggleDark: () => void;
}) {
  const [step,      setStep]      = useState<1 | 2>(1);
  const [email,     setEmail]     = useState("");
  const [name,      setName]      = useState("");
  const [username,  setUsername]  = useState("");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [district,  setDistrict]  = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  const DISTRICTS = ["Bela Vista","Centro","Consolação","Jardins","Ibirapuera","República","Vila Madalena","Pinheiros","Santana","Mooca","Lapa","Ipiranga","Santo André","Guarulhos","Osasco"];

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!name.trim())                            e.name     = "Nome obrigatório.";
    if (!email.includes("@"))                    e.email    = "E-mail inválido.";
    if (username.length < 3)                     e.username = "Mínimo 3 caracteres.";
    if (!/^[a-z0-9_]+$/.test(username))         e.username = "Apenas letras minúsculas, números e _.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (password.length < 8)       e.password = "Mínimo 8 caracteres.";
    if (password !== confirm)      e.confirm  = "As senhas não coincidem.";
    if (!district)                 e.district = "Selecione seu bairro/região.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);

    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setErrors({ submit: signUpError.message });
        setLoading(false);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          username,
          full_name: name,
          district,
          role,
          bio: null,
          avatar_url: null,
          banner_url: null,
        });

        if (profileError) {
          setErrors({ submit: "Erro ao criar perfil." });
          setLoading(false);
          return;
        }

        onSuccess();
      }
    } catch (err) {
      setErrors({ submit: "Erro ao criar conta." });
      setLoading(false);
    }
  };

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password) ? 3 : 2;
  const strengthLabel = ["", "Fraca", "Média", "Forte"];
  const strengthColor = ["", "#ef4444", "#facc15", "#22c55e"];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #f97316, transparent)" }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #ea580c, transparent)" }} />
      </div>

      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight size={16} className="rotate-180" />Voltar
        </button>
        <button onClick={onToggleDark} className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors">
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
            <Users size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-foreground">Criar Conta</h1>
          <p className="text-sm text-muted-foreground mt-1">Junte-se à comunidade CidadeConnect</p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all"
                style={{ backgroundColor: step >= s ? "#f97316" : "var(--muted)", color: step >= s ? "#0f0f0f" : "var(--muted-foreground)" }}>
                {step > s ? <CheckCircle size={14} /> : s}
              </div>
              <span className="text-xs font-bold" style={{ color: step >= s ? "#f97316" : "var(--muted-foreground)" }}>
                {s === 1 ? "Seus dados" : "Segurança"}
              </span>
              {s < 2 && <div className="flex-1 h-px mx-1" style={{ backgroundColor: step > s ? "#f97316" : "var(--border)" }} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} onSubmit={handleNext} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Nome Completo</label>
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${errors.name ? "border-destructive" : name ? "border-primary" : "border-border"}`}>
                  <User size={16} className="text-muted-foreground shrink-0" />
                  <input type="text" value={name} onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }} placeholder="João da Silva" className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
                </div>
                {errors.name && <p className="text-xs text-destructive mt-1 font-semibold">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">E-mail</label>
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${errors.email ? "border-destructive" : email ? "border-primary" : "border-border"}`}>
                  <AtSign size={16} className="text-muted-foreground shrink-0" />
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }} placeholder="joao@email.com" autoComplete="email" className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
                </div>
                {errors.email && <p className="text-xs text-destructive mt-1 font-semibold">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Nome de Usuário</label>
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${errors.username ? "border-destructive" : username ? "border-primary" : "border-border"}`}>
                  <span className="text-muted-foreground text-sm font-bold shrink-0">@</span>
                  <input type="text" value={username} onChange={(e) => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")); setErrors((p) => ({ ...p, username: "" })); }} placeholder="joao_silva" autoComplete="username" className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
                  {username.length >= 3 && !errors.username && <CheckCircle size={14} className="text-green-400 shrink-0" />}
                </div>
                {errors.username ? <p className="text-xs text-destructive mt-1 font-semibold">{errors.username}</p>
                  : <p className="text-xs text-muted-foreground mt-1">Apenas letras minúsculas, números e _</p>}
              </div>

              <button type="submit" className="w-full py-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 mt-2" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff" }}>
                Continuar <ArrowRight size={16} />
              </button>
            </motion.form>
          ) : (
            <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Senha</label>
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${errors.password ? "border-destructive" : password ? "border-primary" : "border-border"}`}>
                  <Lock size={16} className="text-muted-foreground shrink-0" />
                  <input type={showPass ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }} placeholder="Mínimo 8 caracteres" autoComplete="new-password" className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
                  <button type="button" onClick={() => setShowPass((v) => !v)} className="text-muted-foreground hover:text-foreground shrink-0">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                {password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3].map((i) => <div key={i} className="h-1.5 flex-1 rounded-full transition-all" style={{ backgroundColor: strength >= i ? strengthColor[strength] : "var(--muted)" }} />)}
                    </div>
                    <span className="text-xs font-bold" style={{ color: strengthColor[strength] }}>{strengthLabel[strength]}</span>
                  </div>
                )}
                {errors.password && <p className="text-xs text-destructive mt-1 font-semibold">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Confirmar Senha</label>
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${errors.confirm ? "border-destructive" : confirm && confirm === password ? "border-green-500" : confirm ? "border-destructive" : "border-border"}`}>
                  <Lock size={16} className="text-muted-foreground shrink-0" />
                  <input type={showPass ? "text" : "password"} value={confirm} onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: "" })); }} placeholder="Repita a senha" autoComplete="new-password" className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
                  {confirm && confirm === password && <CheckCircle size={14} className="text-green-400 shrink-0" />}
                </div>
                {errors.confirm && <p className="text-xs text-destructive mt-1 font-semibold">{errors.confirm}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Seu Bairro / Região</label>
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${errors.district ? "border-destructive" : district ? "border-primary" : "border-border"}`}>
                  <MapPin size={16} className="text-muted-foreground shrink-0" />
                  <select value={district} onChange={(e) => { setDistrict(e.target.value); setErrors((p) => ({ ...p, district: "" })); }} className="flex-1 bg-transparent text-sm text-foreground outline-none appearance-none cursor-pointer">
                    <option value="" className="bg-card">Selecione seu bairro…</option>
                    {DISTRICTS.map((d) => <option key={d} value={d} className="bg-card">{d}</option>)}
                  </select>
                  <ChevronDown size={16} className="text-muted-foreground shrink-0 pointer-events-none" />
                </div>
                {errors.district && <p className="text-xs text-destructive mt-1 font-semibold">{errors.district}</p>}
              </div>

              {errors.submit && <p className="text-xs text-destructive font-semibold">{errors.submit}</p>}

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl text-sm font-bold bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  Voltar
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-50 transition-all" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff" }}>
                  {loading ? <><RefreshCw size={16} className="animate-spin" />Criando…</> : "Criar Conta"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Já tem conta?{" "}
          <button type="button" onClick={onBack} className="text-primary font-black hover:opacity-75 transition-opacity underline underline-offset-2">
            Entrar
          </button>
        </p>
      </motion.div>
    </div>
  );
}

// ─── Avatar com Supabase ──────────────────────────────────────────────────────

function ProfileAvatar({
  url,
  size = 80,
  editable = false,
  onChangeFile,
  isLoading = false,
}: {
  url?: string | null;
  size?: number;
  editable?: boolean;
  onChangeFile?: (file: File) => void;
  isLoading?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="relative rounded-full overflow-hidden border-4 shrink-0 group"
      style={{ width: size, height: size, borderColor: "#f97316" }}
    >
      {url ? (
        <img src={url} alt="Foto de perfil" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#d4d4d4" }}>
          <User size={size * 0.62} strokeWidth={1.5} style={{ color: "#f5f5f5" }} />
        </div>
      )}

      {editable && (
        <>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={isLoading}
            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
          >
            {isLoading ? <RefreshCw size={size * 0.28} className="text-white animate-spin" /> : <Camera size={size * 0.28} className="text-white" />}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={isLoading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && onChangeFile) onChangeFile(f);
            }}
          />
        </>
      )}
    </div>
  );
}

function ProfileBanner({
  url,
  editable = false,
  onChangeFile,
  isLoading = false,
}: {
  url?: string | null;
  editable?: boolean;
  onChangeFile?: (file: File) => void;
  isLoading?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative h-28 rounded-2xl overflow-hidden mb-0 group">
      {url ? (
        <img src={url} alt="Capa do perfil" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }} />
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent, rgba(15,15,15,0.8))" }} />

      {editable && (
        <>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={isLoading}
            className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
          >
            {isLoading ? <RefreshCw size={13} className="animate-spin" /> : <Camera size={13} />}
            {!isLoading && "Alterar capa"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={isLoading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && onChangeFile) onChangeFile(f);
            }}
          />
        </>
      )}
    </div>
  );
}

// ─── Placeholder para Cidadão e Prefeitura App ────────────────────────────────

function CidadaoApp({ posts, dark, onToggleDark, onLogout, setPosts }: { posts: Post[]; dark: boolean; onToggleDark: () => void; onLogout: () => void; setPosts: React.Dispatch<React.SetStateAction<Post[]>> }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h2 className="text-2xl font-black mb-2">App Cidadão</h2>
        <p className="text-muted-foreground mb-6">Integração com Supabase em desenvolvimento</p>
        <button onClick={onLogout} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold">
          Voltar
        </button>
      </div>
    </div>
  );
}

function PrefeituraDashboard({ posts, dark, onToggleDark, onLogout, onUpdateStatus }: { posts: Post[]; dark: boolean; onToggleDark: () => void; onLogout: () => void; onUpdateStatus: (id: string, status: PostStatus, obs: string) => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h2 className="text-2xl font-black mb-2">Dashboard Prefeitura</h2>
        <p className="text-muted-foreground mb-6">Integração com Supabase em desenvolvimento</p>
        <button onClick={onLogout} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold">
          Voltar
        </button>
      </div>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

type Screen = "welcome" | "login" | "signup" | "app";

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [role,   setRole]   = useState<Role>("cidadao");
  const [dark,   setDark]   = useState(true);
  const [posts,  setPosts]  = useState<Post[]>([]);
  const [user,   setUser]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authUser.id)
          .single();

        if (profileData) {
          setUser(authUser);
          setRole(profileData.role);
          setScreen("app");
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toggleDark   = () => setDark((d) => !d);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setScreen("welcome");
  };

  const handleChooseRole = (r: Role) => { setRole(r); setScreen("login"); };
  const handleLogin      = ()        => { setScreen("app"); };
  const handleSignUp     = ()        => setScreen("signup");
  const handleSignUpDone = ()        => setScreen("app");

  const updateStatus = (id: string, status: PostStatus, obs: string) => {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Nunito', sans-serif" }}>{children}</div>
  );

  if (screen === "welcome") return shell(
    <WelcomeScreen onChoose={handleChooseRole} dark={dark} onToggleDark={toggleDark} />
  );

  if (screen === "login") return shell(
    <LoginScreen role={role} onLogin={handleLogin} onBack={() => setScreen("welcome")} onSignUp={handleSignUp} dark={dark} onToggleDark={toggleDark} />
  );

  if (screen === "signup") return shell(
    <SignUpScreen role={role} onSuccess={handleSignUpDone} onBack={() => setScreen("login")} dark={dark} onToggleDark={toggleDark} />
  );

  if (role === "prefeitura") return (
    <PrefeituraDashboard posts={posts} dark={dark} onToggleDark={toggleDark} onLogout={handleLogout} onUpdateStatus={updateStatus} />
  );

  return (
    <CidadaoApp posts={posts} dark={dark} onToggleDark={toggleDark} onLogout={handleLogout} setPosts={setPosts} />
  );
}