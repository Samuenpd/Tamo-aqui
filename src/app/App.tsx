import { useState, useRef, useEffect } from "react";
import {
  Home, Search, PlusSquare, Bell, User, Heart, MessageCircle, Share2,
  Bookmark, MapPin, X, ChevronDown, AlertTriangle, Lightbulb, Trash2,
  Droplets, Construction, TreeDeciduous, Navigation, Camera, CheckCircle,
  Clock, TrendingUp, Send, Grid, List, Settings, LogOut, Sun, Moon,
  Star, Filter, ChevronRight, Award, Building2, Users, ArrowRight,
  BarChart3, ClipboardList, ChevronUp, Eye, EyeOff, Edit3, RefreshCw,
  Lock, AtSign,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

type ProblemId  = typeof PROBLEM_TYPES[number]["id"];
type PostStatus = "aberto" | "em_analise" | "resolvido";
type TabId      = "feed" | "buscar" | "notif" | "perfil";
type Role       = "cidadao" | "prefeitura";

const STATUS_META: Record<PostStatus, { label: string; color: string; bg: string; dot: string; next: PostStatus | null; nextLabel: string }> = {
  aberto:     { label: "Aberto",      color: "text-red-400",    bg: "bg-red-950/60",    dot: "bg-red-400",    next: "em_analise", nextLabel: "Iniciar Análise"   },
  em_analise: { label: "Em Análise",  color: "text-yellow-400", bg: "bg-yellow-950/60", dot: "bg-yellow-400", next: "resolvido",  nextLabel: "Marcar Resolvido"  },
  resolvido:  { label: "Resolvido",   color: "text-green-400",  bg: "bg-green-950/60",  dot: "bg-green-400",  next: null,         nextLabel: ""                  },
};

// ─── Shared data ──────────────────────────────────────────────────────────────

interface Comment {
  id: number; user: string; avatar: string; text: string; time: string; likes: number; liked: boolean;
}

interface Post {
  id: number; user: string; avatar: string; location: string; image: string; caption: string;
  problemType: ProblemId; likes: number; comments: Comment[]; time: string; status: PostStatus;
  liked: boolean; saved: boolean; district: string;
}

const INITIAL_POSTS: Post[] = [
  { id: 1, user: "carlos_silva",   avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&auto=format", location: "Av. Paulista, 1578",   image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&auto=format", caption: "Buraco enorme na calçada há mais de 2 semanas. Já vi 3 pessoas tropeçarem aqui. Precisa de atenção urgente! 🚨", problemType: "buraco",     likes: 47,  comments: [{ id: 1, user: "prefeitura_sp", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=64&h=64&fit=crop&auto=format", text: "Obrigado pelo reporte! Nossa equipe foi notificada.", time: "1h", likes: 8, liked: false }], time: "2h", status: "em_analise", liked: false, saved: false, district: "Bela Vista" },
  { id: 2, user: "ana_rodrigues",  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&auto=format", location: "Rua das Flores, 234",  image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=600&fit=crop&auto=format", caption: "Poste apagado faz 10 dias nessa rua. À noite fica muito perigoso! 💡",                                                    problemType: "iluminacao", likes: 89,  comments: [{ id: 2, user: "zelador_norte", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&auto=format", text: "Confirmo, está apagado há pelo menos 12 dias.", time: "4h", likes: 12, liked: false }], time: "5h", status: "aberto",     liked: true,  saved: false, district: "Consolação" },
  { id: 3, user: "marcos_oliveira",avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&auto=format", location: "Praça da República",   image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=600&fit=crop&auto=format", caption: "Acúmulo de lixo no canteiro central. O caminhão não vem há 4 dias. Situação insalubre! ♻️",                            problemType: "lixo",       likes: 134, comments: [{ id: 3, user: "lucia_ferreira", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=64&h=64&fit=crop&auto=format", text: "Que bom que resolveram!", time: "3h", likes: 15, liked: true }], time: "1d", status: "resolvido",   liked: false, saved: true,  district: "República"  },
  { id: 4, user: "patricia_mendes",avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&auto=format", location: "Viaduto do Chá",       image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=600&fit=crop&auto=format", caption: "Ponto de alagamento recorrente toda vez que chove. Galeria pluvial entupida! 🌧️",                                       problemType: "alagamento", likes: 201, comments: [{ id: 4, user: "engenheiro_obras", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&auto=format", text: "Equipe de drenagem já foi acionada. Previsão: 3 dias úteis.", time: "22h", likes: 20, liked: false }], time: "2d", status: "em_analise", liked: false, saved: false, district: "Centro"     },
  { id: 5, user: "roberto_nunes",  avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=64&h=64&fit=crop&auto=format", location: "Rua Augusta, 890",     image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&h=600&fit=crop&auto=format", caption: "Calçada completamente destruída. Idosos e cadeirantes não conseguem passar! ♿",                                        problemType: "calcada",    likes: 63,  comments: [], time: "3d", status: "aberto",     liked: false, saved: false, district: "Jardins"    },
  { id: 6, user: "fernanda_lima",  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&auto=format", location: "Parque Ibirapuera",   image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=600&h=600&fit=crop&auto=format", caption: "Árvore caída bloqueando a ciclovia há 2 dias. Ciclistas passando na pista! 🚴",                                          problemType: "arvore",     likes: 28,  comments: [], time: "2d", status: "aberto",     liked: false, saved: false, district: "Ibirapuera"  },
];

const STORIES = [
  { id: 1, user: "Zona Norte", img: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=80&h=80&fit=crop&auto=format", active: true  },
  { id: 2, user: "Zona Sul",   img: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=80&h=80&fit=crop&auto=format", active: true  },
  { id: 3, user: "Centro",     img: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=80&h=80&fit=crop&auto=format", active: false },
  { id: 4, user: "Zona Leste", img: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=80&h=80&fit=crop&auto=format", active: true  },
  { id: 5, user: "Zona Oeste", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=80&h=80&fit=crop&auto=format", active: false },
];

const INITIAL_NOTIFS = [
  { id: 1, type: "like"   as const, user: "maria_costa",   avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&auto=format", message: "curtiu sua ocorrência sobre Buraco na Via.",               time: "5min", read: false, postImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop&auto=format" },
  { id: 2, type: "status" as const, user: "Prefeitura SP", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=64&h=64&fit=crop&auto=format", message: "atualizou o status da sua ocorrência para Em Análise.",     time: "1h",   read: false, postImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop&auto=format" },
  { id: 3, type: "comment"as const, user: "joao_santos",   avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&auto=format", message: 'comentou em sua ocorrência: "Já vi uma criança tropeçar!"', time: "2h",   read: false, postImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop&auto=format" },
  { id: 4, type: "status" as const, user: "Prefeitura SP", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=64&h=64&fit=crop&auto=format", message: "marcou a ocorrência de Lixo/Entulho como Resolvido! ✅",    time: "1d",   read: true,  postImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=80&h=80&fit=crop&auto=format" },
  { id: 5, type: "like"   as const, user: "patricia_lima", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&auto=format", message: "e outras 12 pessoas curtiram sua ocorrência.",             time: "2d",   read: true,  postImage: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=80&h=80&fit=crop&auto=format" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Welcome Screen ───────────────────────────────────────────────────────────

function WelcomeScreen({ onChoose, dark, onToggleDark }: { onChoose: (r: Role) => void; dark: boolean; onToggleDark: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* bg decoration */}
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

        {/* Cidadão */}
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

        {/* Prefeitura */}
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
        Versão 2.4.1 · Secretaria de Serviços Urbanos
      </motion.p>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

const MOCK_CREDENTIALS: Record<Role, { user: string; pass: string }> = {
  cidadao:    { user: "joao_cidadao",  pass: "cidadao123" },
  prefeitura: { user: "prefeitura_sp", pass: "admin2025"  },
};

function LoginScreen({ role, onLogin, onBack, onSignUp, dark, onToggleDark }: {
  role: Role; onLogin: () => void; onBack: () => void; onSignUp: () => void; dark: boolean; onToggleDark: () => void;
}) {
  const [username,    setUsername]    = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [forgotSent,  setForgotSent]  = useState(false);

  const isPrefeitura = role === "prefeitura";
  const hint = MOCK_CREDENTIALS[role];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (username === hint.user && password === hint.pass) {
        onLogin();
      } else {
        setError("Usuário ou senha incorretos. Verifique e tente novamente.");
        setLoading(false);
      }
    }, 800);
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

        {/* Credentials hint */}
        <div className="mb-5 px-4 py-3 rounded-xl border border-border bg-muted/40 text-xs text-muted-foreground">
          <span className="font-bold text-foreground">Credenciais de teste: </span>
          usuário <code className="font-bold text-primary">{hint.user}</code> · senha <code className="font-bold text-primary">{hint.pass}</code>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {isPrefeitura ? "Matrícula / Usuário" : "Nome de Usuário"}
            </label>
            <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${username ? "border-primary" : "border-border"}`}>
              <AtSign size={16} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                placeholder={isPrefeitura ? "prefeitura_sp" : "joao_cidadao"}
                autoComplete="username"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          {/* Password */}
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

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs font-semibold text-destructive px-1">
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Forgot password */}
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
            disabled={loading || !username || !password}
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

        {/* Sign up link — only for citizens */}
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

function SignUpScreen({ onSuccess, onBack, dark, onToggleDark }: {
  onSuccess: () => void; onBack: () => void; dark: boolean; onToggleDark: () => void;
}) {
  const [step,      setStep]      = useState<1 | 2>(1);
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
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

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess(); }, 1000);
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
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
            <Users size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-foreground">Criar Conta</h1>
          <p className="text-sm text-muted-foreground mt-1">Junte-se à comunidade TamoAqui</p>
        </div>

        {/* Step indicator */}
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
              {/* Full name */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Nome Completo</label>
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${errors.name ? "border-destructive" : name ? "border-primary" : "border-border"}`}>
                  <User size={16} className="text-muted-foreground shrink-0" />
                  <input type="text" value={name} onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }} placeholder="João da Silva" className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
                </div>
                {errors.name && <p className="text-xs text-destructive mt-1 font-semibold">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">E-mail</label>
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${errors.email ? "border-destructive" : email ? "border-primary" : "border-border"}`}>
                  <AtSign size={16} className="text-muted-foreground shrink-0" />
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }} placeholder="joao@email.com" autoComplete="email" className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
                </div>
                {errors.email && <p className="text-xs text-destructive mt-1 font-semibold">{errors.email}</p>}
              </div>

              {/* Username */}
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
              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Senha</label>
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${errors.password ? "border-destructive" : password ? "border-primary" : "border-border"}`}>
                  <Lock size={16} className="text-muted-foreground shrink-0" />
                  <input type={showPass ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }} placeholder="Mínimo 8 caracteres" autoComplete="new-password" className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
                  <button type="button" onClick={() => setShowPass((v) => !v)} className="text-muted-foreground hover:text-foreground shrink-0">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                {/* Strength bar */}
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

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Confirmar Senha</label>
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${errors.confirm ? "border-destructive" : confirm && confirm === password ? "border-green-500" : confirm ? "border-destructive" : "border-border"}`}>
                  <Lock size={16} className="text-muted-foreground shrink-0" />
                  <input type={showPass ? "text" : "password"} value={confirm} onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: "" })); }} placeholder="Repita a senha" autoComplete="new-password" className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
                  {confirm && confirm === password && <CheckCircle size={14} className="text-green-400 shrink-0" />}
                </div>
                {errors.confirm && <p className="text-xs text-destructive mt-1 font-semibold">{errors.confirm}</p>}
              </div>

              {/* District */}
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

// ─── Comment Sheet ────────────────────────────────────────────────────────────

function CommentSheet({ post, onClose, onAddComment }: { post: Post; onClose: () => void; onAddComment: (postId: number, text: string) => void }) {
  const [text, setText] = useState("");
  const [local, setLocal] = useState<Comment[]>(post.comments);

  const submit = () => {
    if (!text.trim()) return;
    const c: Comment = { id: Date.now(), user: "voce_mesmo", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&auto=format", text: text.trim(), time: "agora", likes: 0, liked: false };
    setLocal((p) => [...p, c]);
    onAddComment(post.id, text.trim());
    setText("");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 28 }} className="bg-card border border-border rounded-t-2xl md:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()} style={{ fontFamily: "'Nunito', sans-serif" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2"><MessageCircle size={16} className="text-primary" /><h2 className="text-sm font-bold text-foreground">Comentários</h2><span className="text-xs font-bold text-muted-foreground">({local.length})</span></div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <div className="px-5 py-3 border-b border-border flex items-center gap-3 shrink-0">
          <img src={post.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
          <div className="flex-1 min-w-0"><p className="text-xs font-bold text-foreground truncate">@{post.user}</p><p className="text-xs text-muted-foreground truncate">{post.caption.slice(0, 60)}…</p></div>
          <ProblemBadge typeId={post.problemType} />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-3 space-y-4">
          {local.length === 0 && <div className="text-center py-10 text-muted-foreground"><MessageCircle size={32} className="mx-auto mb-2 opacity-30" /><p className="text-sm font-semibold">Seja o primeiro a comentar</p></div>}
          {local.map((c) => (
            <div key={c.id} className="flex gap-3">
              <img src={c.avatar} alt={c.user} className="w-8 h-8 rounded-full object-cover shrink-0" />
              <div className="flex-1">
                <div className="bg-muted rounded-xl px-3 py-2"><p className="text-xs font-bold text-foreground mb-0.5">@{c.user}</p><p className="text-sm text-foreground leading-relaxed">{c.text}</p></div>
                <div className="flex items-center gap-3 mt-1.5 px-1"><span className="text-xs text-muted-foreground">{c.time}</span><span className="text-xs text-muted-foreground">{c.likes} curtidas</span></div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center gap-3 shrink-0">
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&auto=format" alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
          <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-4 py-2">
            <input type="text" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Adicione um comentário..." className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
            <button onClick={submit} disabled={!text.trim()} className="text-primary disabled:opacity-30"><Send size={16} /></button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, onToggleLike, onToggleSave, onOpenComments }: { post: Post; onToggleLike: (id: number) => void; onToggleSave: (id: number) => void; onOpenComments: (p: Post) => void }) {
  const prob = PROBLEM_TYPES.find((t) => t.id === post.problemType)!;
  return (
    <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden" style={{ outline: `2px solid ${prob.color}`, outlineOffset: "2px" }}>
            <img src={post.avatar} alt={post.user} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-none mb-0.5">@{post.user}</p>
            <div className="flex items-center gap-1 text-muted-foreground"><MapPin size={10} /><span className="text-xs">{post.location}</span></div>
          </div>
        </div>
        <StatusBadge status={post.status} />
      </div>
      <div className="mx-4 mb-3 px-3 py-2 rounded-xl flex items-center gap-2" style={{ backgroundColor: `${prob.color}15`, borderLeft: `3px solid ${prob.color}` }}>
        <prob.icon size={14} style={{ color: prob.color }} />
        <span className="text-xs font-bold" style={{ color: prob.color }}>Tipo de Problema:</span>
        <span className="text-xs font-semibold text-foreground">{prob.label}</span>
      </div>
      <div className="relative mx-4 rounded-xl overflow-hidden bg-muted aspect-square">
        <img src={post.image} alt="Problema" className="w-full h-full object-cover" />
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button onClick={() => onToggleLike(post.id)} className="flex items-center gap-1.5">
            <Heart size={22} className={post.liked ? "fill-primary text-primary" : "text-muted-foreground"} />
            <span className="text-sm font-semibold text-muted-foreground">{post.liked ? post.likes + 1 : post.likes}</span>
          </button>
          <button onClick={() => onOpenComments(post)} className="flex items-center gap-1.5">
            <MessageCircle size={22} className="text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground">{post.comments.length}</span>
          </button>
          <button><Share2 size={22} className="text-muted-foreground" /></button>
        </div>
        <button onClick={() => onToggleSave(post.id)}>
          <Bookmark size={22} className={post.saved ? "fill-primary text-primary" : "text-muted-foreground"} />
        </button>
      </div>
      <div className="px-4 pb-4">
        <p className="text-sm text-foreground leading-relaxed"><span className="font-bold mr-1">@{post.user}</span>{post.caption}</p>
        <button onClick={() => onOpenComments(post)} className="text-xs text-muted-foreground mt-1 hover:text-primary transition-colors">Ver todos os {post.comments.length} comentários</button>
        <p className="text-xs text-muted-foreground mt-1">{post.time} atrás</p>
      </div>
    </motion.article>
  );
}

// ─── Create Post Modal ────────────────────────────────────────────────────────

function CreatePostModal({ onClose, onPost }: { onClose: () => void; onPost: (p: Post) => void }) {
  const [step, setStep]       = useState<"upload" | "details">("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [problemType, setProblemType] = useState<ProblemId | null>(null);
  const [dropOpen, setDropOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const sel = PROBLEM_TYPES.find((t) => t.id === problemType);

  const submit = () => {
    if (!problemType || !caption) return;
    onPost({ id: Date.now(), user: "voce_mesmo", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&auto=format", location: location || "Localização não informada", image: preview || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&auto=format", caption, problemType, likes: 0, comments: [], time: "agora", status: "aberto", liked: false, saved: false, district: "Não informado" });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-bold text-foreground">Nova Ocorrência</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>
        {step === "upload" ? (
          <div className="p-6 flex flex-col items-center gap-4">
            <div onClick={() => fileRef.current?.click()} className="w-full aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary transition-colors bg-muted/40">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"><Camera size={24} className="text-primary" /></div>
              <p className="text-sm font-semibold text-foreground">Toque para adicionar foto</p>
              <p className="text-xs text-muted-foreground">JPG, PNG ou HEIC</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setPreview(URL.createObjectURL(f)); setStep("details"); } }} />
            <button onClick={() => { setPreview("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&auto=format"); setStep("details"); }} className="text-xs text-muted-foreground hover:text-primary underline">Usar foto de exemplo</button>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
            {preview && <div className="relative w-full h-48 rounded-xl overflow-hidden bg-muted"><img src={preview} alt="" className="w-full h-full object-cover" /><button onClick={() => { setPreview(null); setStep("upload"); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center"><X size={14} className="text-white" /></button></div>}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Tipo de Problema *</label>
              <div className="relative">
                <button onClick={() => setDropOpen((v) => !v)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-input-background text-sm font-semibold text-foreground">
                  {sel ? <span className="flex items-center gap-2"><sel.icon size={16} style={{ color: sel.color }} />{sel.label}</span> : <span className="text-muted-foreground">Selecione o tipo...</span>}
                  <ChevronDown size={16} className={`text-muted-foreground transition-transform ${dropOpen ? "rotate-180" : ""}`} />
                </button>
                {dropOpen && <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-xl overflow-hidden shadow-xl">{PROBLEM_TYPES.map((t) => <button key={t.id} onClick={() => { setProblemType(t.id as ProblemId); setDropOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted text-sm font-semibold text-foreground text-left"><t.icon size={16} style={{ color: t.color }} />{t.label}</button>)}</div>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Localização</label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-input-background"><MapPin size={15} className="text-primary shrink-0" /><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: Rua Barão de Itapetininga, 45" className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" /></div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Descrição *</label>
              <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} placeholder="Descreva o problema encontrado..." className="w-full px-4 py-3 rounded-xl border border-border bg-input-background text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none" />
            </div>
            <button onClick={submit} disabled={!problemType || !caption} className="w-full py-3.5 rounded-xl text-sm font-bold disabled:opacity-40" style={{ backgroundColor: "#f97316", color: "#0f0f0f" }}>Publicar Ocorrência</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Explore Tab ──────────────────────────────────────────────────────────────

function ExploreTab({ posts, onOpenComments }: { posts: Post[]; onOpenComments: (p: Post) => void }) {
  const [query, setQuery] = useState("");
  const [fs, setFs] = useState<PostStatus | "todos">("todos");
  const [fp, setFp] = useState<ProblemId | "todos">("todos");

  const filtered = posts.filter((p) => {
    const ms = fs === "todos" || p.status === fs;
    const mp = fp === "todos" || p.problemType === fp;
    const mq = !query || [p.caption, p.location, p.user].some((s) => s.toLowerCase().includes(query.toLowerCase()));
    return ms && mp && mq;
  });

  const showResults = !!(query || fs !== "todos" || fp !== "todos");

  const GRID = [
    { id: 10, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&auto=format", likes: 47, comments: 3,  problemType: "buraco" },
    { id: 11, image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=300&h=300&fit=crop&auto=format", likes: 89, comments: 2,  problemType: "iluminacao" },
    { id: 12, image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&h=300&fit=crop&auto=format", likes: 134,comments: 1,  problemType: "lixo" },
    { id: 13, image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300&h=300&fit=crop&auto=format", likes: 201,comments: 1,  problemType: "alagamento" },
    { id: 14, image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=300&h=300&fit=crop&auto=format", likes: 63, comments: 0,  problemType: "calcada" },
    { id: 15, image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=300&h=300&fit=crop&auto=format", likes: 28, comments: 0,  problemType: "arvore" },
    { id: 16, image: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=300&h=300&fit=crop&auto=format", likes: 55, comments: 0,  problemType: "sinalizacao" },
    { id: 17, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&auto=format", likes: 92, comments: 0,  problemType: "buraco" },
    { id: 18, image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=300&h=300&fit=crop&auto=format", likes: 14, comments: 0,  problemType: "iluminacao" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-2xl">
        <Search size={16} className="text-muted-foreground shrink-0" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por local, usuário ou descrição..." className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
        {query && <button onClick={() => setQuery("")}><X size={14} className="text-muted-foreground" /></button>}
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Filter size={11} />Status</p>
          <div className="flex flex-wrap gap-2">
            {(["todos", "aberto", "em_analise", "resolvido"] as const).map((s) => <button key={s} onClick={() => setFs(s)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${fs === s ? "" : "bg-muted text-muted-foreground"}`} style={fs === s ? { backgroundColor: "#f97316", color: "#0f0f0f" } : {}}>{s === "todos" ? "Todos" : STATUS_META[s].label}</button>)}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Filter size={11} />Tipo</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFp("todos")} className={`px-3 py-1.5 rounded-full text-xs font-bold ${fp === "todos" ? "" : "bg-muted text-muted-foreground"}`} style={fp === "todos" ? { backgroundColor: "#f97316", color: "#0f0f0f" } : {}}>Todos</button>
            {PROBLEM_TYPES.map((t) => <button key={t.id} onClick={() => setFp(t.id as ProblemId)} className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${fp === t.id ? "" : "bg-muted text-muted-foreground"}`} style={fp === t.id ? { backgroundColor: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40` } : {}}><t.icon size={11} />{t.label}</button>)}
          </div>
        </div>
      </div>
      {!showResults && (
        <div className="grid grid-cols-3 gap-1.5">
          {GRID.map((ep) => { const pr = PROBLEM_TYPES.find((t) => t.id === ep.problemType)!; return (
            <div key={ep.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer">
              <img src={ep.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-3 text-white text-xs font-bold"><span className="flex items-center gap-1"><Heart size={12} />{ep.likes}</span><span className="flex items-center gap-1"><MessageCircle size={12} />{ep.comments}</span></div>
              </div>
              <div className="absolute bottom-1.5 left-1.5"><span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${pr.color}cc` }}><pr.icon size={10} style={{ color: "#fff" }} /></span></div>
            </div>
          ); })}
        </div>
      )}
      {showResults && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-semibold">{filtered.length} ocorrência{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}</p>
          {filtered.length === 0 ? <div className="text-center py-10 text-muted-foreground"><Search size={32} className="mx-auto mb-2 opacity-30" /><p className="text-sm font-semibold">Nenhuma ocorrência encontrada</p></div>
          : filtered.map((p) => (
            <div key={p.id} className="flex items-center gap-3 bg-muted/40 rounded-xl p-3">
              <img src={p.image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground">@{p.user}</p>
                <p className="text-xs text-muted-foreground truncate">{p.caption.slice(0, 50)}…</p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap"><ProblemBadge typeId={p.problemType} /><StatusBadge status={p.status} /></div>
              </div>
              <button onClick={() => onOpenComments(p)} className="text-muted-foreground hover:text-primary shrink-0"><ChevronRight size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotifTab({ notifs, onMarkAll }: { notifs: typeof INITIAL_NOTIFS; onMarkAll: () => void }) {
  const unread = notifs.filter((n) => !n.read).length;
  const icon = (t: string) => t === "like" ? <Heart size={14} className="text-red-400" /> : t === "comment" ? <MessageCircle size={14} className="text-blue-400" /> : t === "status" ? <CheckCircle size={14} className="text-green-400" /> : <Bell size={14} className="text-primary" />;
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><h2 className="text-base font-black text-foreground">Notificações</h2>{unread > 0 && <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: "#f97316", color: "#0f0f0f" }}>{unread}</span>}</div>
        {unread > 0 && <button onClick={onMarkAll} className="text-xs font-bold text-primary">Marcar tudo como lido</button>}
      </div>
      <div className="space-y-1">
        {notifs.map((n) => (
          <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl ${n.read ? "" : "bg-primary/5 border border-primary/10"}`}>
            <div className="relative shrink-0"><img src={n.avatar} alt={n.user} className="w-10 h-10 rounded-full object-cover" /><span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-card flex items-center justify-center border border-border">{icon(n.type)}</span></div>
            <div className="flex-1 min-w-0"><p className="text-sm text-foreground leading-snug"><span className="font-bold">@{n.user}</span>{" "}{n.message}</p><p className="text-xs text-muted-foreground mt-0.5">{n.time} atrás</p></div>
            {n.postImage && <img src={n.postImage} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
            {!n.read && <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: "#f97316" }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Avatar com fallback estilo Instagram ──────────────────────────────────

function ProfileAvatar({
  url,
  size = 80,
  editable = false,
  onChangeFile,
}: {
  url?: string | null;
  size?: number;
  editable?: boolean;
  onChangeFile?: (file: File) => void;
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
        // Fallback estilo Instagram: círculo cinza com silhueta de pessoa
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#d4d4d4" }}>
          <User size={size * 0.62} strokeWidth={1.5} style={{ color: "#f5f5f5" }} />
        </div>
      )}

      {editable && (
        <>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Alterar foto de perfil"
          >
            <Camera size={size * 0.28} className="text-white" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
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

// ─── Banner clicável ────────────────────────────────────────────────────────

function ProfileBanner({
  url,
  editable = false,
  onChangeFile,
}: {
  url?: string | null;
  editable?: boolean;
  onChangeFile?: (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative h-28 rounded-2xl overflow-hidden mb-0 group">
      {url ? (
        <img src={url} alt="Capa do perfil" className="w-full h-full object-cover" />
      ) : (
        // Fallback quando não há capa definida: gradiente na cor da marca
        <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }} />
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent, rgba(15,15,15,0.8))" }} />

      {editable && (
        <>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera size={13} />
            Alterar capa
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
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

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({
  posts,
  onLogout,
  avatarUrl,
  bannerUrl,
  onChangeAvatar,
  onChangeBanner,
}: {
  posts: Post[];
  onLogout: () => void;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  onChangeAvatar?: (file: File) => void;
  onChangeBanner?: (file: File) => void;
}) {
  const [pTab, setPTab] = useState<"posts" | "saved">("posts");
  const [view, setView] = useState<"grid" | "list">("grid");
  const myPosts   = posts.slice(0, 6);
  const saved     = posts.filter((p) => p.saved);
  const display   = pTab === "saved" ? saved : myPosts;
  const resolved  = myPosts.filter((p) => p.status === "resolvido").length;
  const totalLikes= myPosts.reduce((a, p) => a + p.likes, 0);

  return (
    <div>
      <ProfileBanner url={bannerUrl} editable onChangeFile={onChangeBanner} />
      <div className="flex items-end gap-4 -mt-10 mb-4 px-1">
        <ProfileAvatar url={avatarUrl} size={80} editable onChangeFile={onChangeAvatar} />
        <div className="flex-1 pb-1"><h2 className="text-base font-black text-foreground leading-none">João Cidadão</h2><p className="text-xs text-muted-foreground mt-0.5">@joao_cidadao · São Paulo, SP</p></div>
        <button className="p-2 rounded-xl bg-muted text-muted-foreground pb-2"><Settings size={16} /></button>
      </div>
      <p className="text-sm text-foreground leading-relaxed mb-4 px-1">Cidadão engajado, reportando problemas urbanos para construir uma cidade melhor. 🏙️</p>
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[{ label: "Reportes", value: myPosts.length, icon: AlertTriangle, color: "#f97316" }, { label: "Resolvidos", value: resolved, icon: CheckCircle, color: "#22c55e" }, { label: "Curtidas", value: totalLikes, icon: Heart, color: "#ef4444" }, { label: "Pontos", value: 2480, icon: Award, color: "#a78bfa" }].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-muted rounded-xl p-2.5 flex flex-col items-center gap-1"><Icon size={14} style={{ color }} /><p className="text-base font-black text-foreground leading-none">{value}</p><p className="text-xs text-muted-foreground font-semibold text-center">{label}</p></div>
        ))}
      </div>
      <div className="flex items-center gap-1 mb-4 bg-muted rounded-xl p-1">
        {(["posts", "saved"] as const).map((t) => <button key={t} onClick={() => setPTab(t)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${pTab === t ? "" : "text-muted-foreground"}`} style={pTab === t ? { backgroundColor: "#f97316", color: "#0f0f0f" } : {}}>{t === "posts" ? "Meus Reportes" : "Salvos"}</button>)}
        <div className="flex gap-1 ml-1">
          <button onClick={() => setView("grid")} className={`p-1.5 rounded-lg ${view === "grid" ? "text-primary" : "text-muted-foreground"}`}><Grid size={14} /></button>
          <button onClick={() => setView("list")} className={`p-1.5 rounded-lg ${view === "list" ? "text-primary" : "text-muted-foreground"}`}><List size={14} /></button>
        </div>
      </div>
      {display.length === 0 ? <div className="text-center py-10 text-muted-foreground"><Bookmark size={32} className="mx-auto mb-2 opacity-30" /><p className="text-sm font-semibold">Nenhuma ocorrência salva</p></div>
      : view === "grid" ? (
        <div className="grid grid-cols-3 gap-1.5">
          {display.map((p) => { const pr = PROBLEM_TYPES.find((t) => t.id === p.problemType)!; return (
            <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer">
              <img src={p.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"><div className="flex gap-3 text-white text-xs font-bold"><span className="flex items-center gap-1"><Heart size={12} />{p.likes}</span></div></div>
              <div className="absolute bottom-1.5 left-1.5"><span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${pr.color}cc` }}><pr.icon size={10} style={{ color: "#fff" }} /></span></div>
            </div>
          ); })}
        </div>
      ) : (
        <div className="space-y-3">
          {display.map((p) => (
            <div key={p.id} className="flex items-center gap-3 bg-muted/40 rounded-xl p-3">
              <img src={p.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0"><p className="text-xs text-muted-foreground">{p.location}</p><p className="text-sm text-foreground font-semibold truncate">{p.caption.slice(0, 55)}…</p><div className="flex items-center gap-1.5 mt-1 flex-wrap"><ProblemBadge typeId={p.problemType} /><StatusBadge status={p.status} /></div></div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-8 pt-4 border-t border-border"><button onClick={onLogout} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-destructive transition-colors"><LogOut size={16} />Sair da conta</button></div>
    </div>
  );
}

// ─── Prefeitura – Status Modal ────────────────────────────────────────────────

function StatusModal({ post, onClose, onUpdate }: { post: Post; onClose: () => void; onUpdate: (id: number, status: PostStatus, obs: string) => void }) {
  const [next, setNext]     = useState<PostStatus>(post.status);
  const [obs, setObs]       = useState("");
  const [saving, setSaving] = useState(false);

  const confirm = () => {
    setSaving(true);
    setTimeout(() => { onUpdate(post.id, next, obs); onClose(); }, 600);
  };

  const prob = PROBLEM_TYPES.find((t) => t.id === post.problemType)!;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2"><Edit3 size={16} className="text-primary" /><h2 className="text-sm font-bold text-foreground">Atualizar Status</h2></div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>

        {/* Post preview */}
        <div className="p-5 border-b border-border flex items-start gap-4">
          <img src={post.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1"><prob.icon size={14} style={{ color: prob.color }} /><span className="text-xs font-bold" style={{ color: prob.color }}>{prob.label}</span></div>
            <p className="text-sm font-bold text-foreground leading-snug truncate">@{post.user}</p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin size={10} />{post.location}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.caption}</p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Status picker */}
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Novo Status</p>
            <div className="space-y-2">
              {(["aberto", "em_analise", "resolvido"] as PostStatus[]).map((s) => {
                const m = STATUS_META[s];
                const active = next === s;
                return (
                  <button key={s} onClick={() => setNext(s)} className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${active ? "border-primary" : "border-border hover:border-border/60"}`} style={active ? { backgroundColor: `${s === "aberto" ? "#ef4444" : s === "em_analise" ? "#facc15" : "#22c55e"}12` } : {}}>
                    <div className={`w-3 h-3 rounded-full ${m.dot}`} />
                    <span className={`text-sm font-bold ${active ? m.color : "text-muted-foreground"}`}>{m.label}</span>
                    {post.status === s && <span className="ml-auto text-xs text-muted-foreground font-semibold">Atual</span>}
                    {active && post.status !== s && <CheckCircle size={14} className="ml-auto text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Observation */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Observação da Equipe</label>
            <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={3} placeholder="Ex: Equipe enviada ao local. Previsão de reparo: 3 dias úteis." className="w-full px-4 py-3 rounded-xl border border-border bg-input-background text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none" />
          </div>

          {/* Confirm */}
          <button onClick={confirm} disabled={saving || next === post.status} className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition-all" style={{ backgroundColor: "#f97316", color: "#0f0f0f" }}>
            {saving ? <><RefreshCw size={16} className="animate-spin" />Salvando…</> : <><CheckCircle size={16} />Confirmar Atualização</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Prefeitura Dashboard ─────────────────────────────────────────────────────

function PrefeituraDashboard({ posts, dark, onToggleDark, onLogout, onUpdateStatus }: { posts: Post[]; dark: boolean; onToggleDark: () => void; onLogout: () => void; onUpdateStatus: (id: number, status: PostStatus, obs: string) => void }) {
  const [pTab, setPTab]   = useState<"ocorrencias" | "mapa" | "relatorios">("ocorrencias");
  const [fs, setFs]       = useState<PostStatus | "todos">("todos");
  const [fp, setFp]       = useState<ProblemId | "todos">("todos");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Post | null>(null);

  const filtered = posts.filter((p) => {
    const ms = fs === "todos" || p.status === fs;
    const mp = fp === "todos" || p.problemType === fp;
    const mq = !query || [p.caption, p.location, p.user, p.district].some((s) => s.toLowerCase().includes(query.toLowerCase()));
    return ms && mp && mq;
  });

  const stats = {
    aberto:     posts.filter((p) => p.status === "aberto").length,
    em_analise: posts.filter((p) => p.status === "em_analise").length,
    resolvido:  posts.filter((p) => p.status === "resolvido").length,
    total:      posts.length,
  };

  const byType = PROBLEM_TYPES.map((t) => ({ ...t, count: posts.filter((p) => p.problemType === t.id).length })).sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Top bar */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm" style={{ backgroundColor: "var(--card)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
            <Building2 size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-foreground leading-none">Painel da Prefeitura</p>
            <p className="text-xs" style={{ color: "#f97316" }}>TamoAqui · Secretaria de Serviços Urbanos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggleDark} className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors">{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
          <button onClick={onLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"><LogOut size={14} />Sair</button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-border py-6 px-3 hidden md:flex flex-col gap-1" style={{ backgroundColor: "var(--sidebar)" }}>
          {[
            { id: "ocorrencias" as const, label: "Ocorrências", icon: ClipboardList },
            { id: "relatorios"  as const, label: "Relatórios",  icon: BarChart3 },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setPTab(id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${pTab === id ? "" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`} style={pTab === id ? { backgroundColor: "#f97316", color: "#0f0f0f" } : {}}>
              <Icon size={17} />{label}
            </button>
          ))}
          <div className="mt-auto pt-4 border-t border-border">
            <div className="flex items-center gap-2.5 px-3 py-2">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0"><img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=64&h=64&fit=crop&auto=format" alt="" className="w-full h-full object-cover" /></div>
              <div><p className="text-xs font-bold text-foreground leading-none">Ana Servidora</p><p className="text-xs text-muted-foreground">Gestora</p></div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-6">
          {pTab === "ocorrencias" && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* KPI cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Total", value: stats.total,      color: "#f97316", icon: ClipboardList, filter: "todos"       },
                  { label: "Abertos", value: stats.aberto,   color: "#ef4444", icon: AlertTriangle, filter: "aberto"      },
                  { label: "Em Análise", value: stats.em_analise, color: "#facc15", icon: Clock, filter: "em_analise" },
                  { label: "Resolvidos", value: stats.resolvido,  color: "#22c55e", icon: CheckCircle, filter: "resolvido" },
                ].map(({ label, value, color, icon: Icon, filter }) => (
                  <button key={label} onClick={() => setFs(filter as PostStatus | "todos")} className={`flex flex-col gap-2 p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${fs === filter ? "border-primary" : "border-border"}`} style={{ backgroundColor: `${color}10` }}>
                    <div className="flex items-center justify-between"><Icon size={18} style={{ color }} />{fs === filter && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}</div>
                    <p className="text-2xl font-black text-foreground">{value}</p>
                    <p className="text-xs font-bold text-muted-foreground">{label}</p>
                  </button>
                ))}
              </div>

              {/* Search + filters */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-xl">
                  <Search size={15} className="text-muted-foreground shrink-0" />
                  <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por bairro, usuário, descrição…" className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
                  {query && <button onClick={() => setQuery("")}><X size={13} className="text-muted-foreground" /></button>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setFp("todos")} className={`px-3 py-1.5 rounded-full text-xs font-bold ${fp === "todos" ? "" : "bg-muted text-muted-foreground"}`} style={fp === "todos" ? { backgroundColor: "#f97316", color: "#0f0f0f" } : {}}>Todos os tipos</button>
                  {PROBLEM_TYPES.map((t) => <button key={t.id} onClick={() => setFp(t.id as ProblemId)} className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${fp === t.id ? "" : "bg-muted text-muted-foreground"}`} style={fp === t.id ? { backgroundColor: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40` } : {}}><t.icon size={11} />{t.label}</button>)}
                </div>
              </div>

              {/* Occurrences table */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{filtered.length} ocorrência{filtered.length !== 1 ? "s" : ""}</p>
                {filtered.map((post) => {
                  const prob = PROBLEM_TYPES.find((t) => t.id === post.problemType)!;
                  const sm   = STATUS_META[post.status];
                  return (
                    <motion.div key={post.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4">
                      {/* Image + info */}
                      <img src={post.image} alt="" className="w-full md:w-20 h-32 md:h-16 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ProblemBadge typeId={post.problemType} />
                          <StatusBadge status={post.status} />
                          <span className="text-xs text-muted-foreground">{post.time} atrás · {post.district}</span>
                        </div>
                        <p className="text-sm font-bold text-foreground flex items-center gap-1.5"><MapPin size={11} className="text-muted-foreground" />{post.location}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{post.caption}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Heart size={11} />{post.likes}</span>
                          <span className="flex items-center gap-1"><MessageCircle size={11} />{post.comments.length}</span>
                          <span className="flex items-center gap-1"><User size={11} />@{post.user}</span>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex flex-row md:flex-col gap-2 shrink-0">
                        <button onClick={() => setEditing(post)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all" style={{ backgroundColor: "#f97316", color: "#0f0f0f" }}>
                          <Edit3 size={13} />Atualizar Status
                        </button>
                        {sm.next && (
                          <button onClick={() => onUpdateStatus(post.id, sm.next!, "")} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/60 transition-all ${sm.color}`}>
                            <ChevronUp size={13} />{sm.nextLabel}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground"><ClipboardList size={40} className="mx-auto mb-3 opacity-20" /><p className="font-semibold">Nenhuma ocorrência encontrada</p></div>
                )}
              </div>
            </div>
          )}

          {pTab === "relatorios" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-xl font-black text-foreground">Relatórios e Indicadores</h2>

              {/* Resolution rate */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Taxa de Resolução</p>
                  <div className="relative w-28 h-28 mx-auto">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--muted)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray={`${(stats.resolvido / stats.total) * 100} 100`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-2xl font-black text-foreground">{stats.total ? Math.round((stats.resolvido / stats.total) * 100) : 0}%</p>
                      <p className="text-xs text-muted-foreground">resolvido</p>
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">{stats.resolvido} de {stats.total} ocorrências</p>
                </div>

                <div className="md:col-span-2 bg-card border border-border rounded-2xl p-5">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Ocorrências por Tipo</p>
                  <div className="space-y-3">
                    {byType.map((t) => (
                      <div key={t.id} className="flex items-center gap-3">
                        <t.icon size={14} style={{ color: t.color }} className="shrink-0" />
                        <span className="text-xs font-semibold text-foreground w-36 shrink-0 truncate">{t.label}</span>
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${stats.total ? (t.count / stats.total) * 100 : 0}%`, backgroundColor: t.color }} />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground w-6 text-right">{t.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status breakdown */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Distribuição por Status</p>
                <div className="flex gap-2 h-24 items-end">
                  {[
                    { label: "Abertos",     val: stats.aberto,     color: "#ef4444" },
                    { label: "Em Análise",  val: stats.em_analise, color: "#facc15" },
                    { label: "Resolvidos",  val: stats.resolvido,  color: "#22c55e" },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-black text-foreground">{val}</span>
                      <div className="w-full rounded-t-lg transition-all" style={{ height: `${stats.total ? (val / stats.total) * 100 : 10}%`, minHeight: "8px", backgroundColor: color }} />
                      <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Districts */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Por Bairro / Região</p>
                <div className="space-y-2">
                  {Array.from(new Set(posts.map((p) => p.district))).map((d) => {
                    const count = posts.filter((p) => p.district === d).length;
                    const resolved = posts.filter((p) => p.district === d && p.status === "resolvido").length;
                    return (
                      <div key={d} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="text-sm font-semibold text-foreground">{d}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{count} report{count !== 1 ? "es" : "e"}</span>
                          <span className="text-xs font-bold text-green-400">{resolved} resolvido{resolved !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {editing && <StatusModal post={editing} onClose={() => setEditing(null)} onUpdate={onUpdateStatus} />}
      </AnimatePresence>
      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}

// ─── Cidadão App ──────────────────────────────────────────────────────────────

function CidadaoApp({ posts, dark, onToggleDark, onLogout, setPosts }: { posts: Post[]; dark: boolean; onToggleDark: () => void; onLogout: () => void; setPosts: React.Dispatch<React.SetStateAction<Post[]>> }) {
  const [activeTab,   setActiveTab]   = useState<TabId>("feed");
  const [showModal,   setShowModal]   = useState(false);
  const [filterType,  setFilterType]  = useState<ProblemId | "todos">("todos");
  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const [notifs,      setNotifs]      = useState(INITIAL_NOTIFS);
  const [avatarUrl,   setAvatarUrl]   = useState<string | null>(null);
  const [bannerUrl,   setBannerUrl]   = useState<string | null>(null);

  // Preview local só pra visual — troque por upload real pro Supabase
  // Storage e persistência em profiles.avatar_url / profiles.banner_url.
  const changeAvatar = (file: File) => setAvatarUrl(URL.createObjectURL(file));
  const changeBanner = (file: File) => setBannerUrl(URL.createObjectURL(file));

  const toggleLike = (id: number) => setPosts((p) => p.map((x) => x.id === id ? { ...x, liked: !x.liked } : x));
  const toggleSave = (id: number) => setPosts((p) => p.map((x) => x.id === id ? { ...x, saved: !x.saved } : x));
  const addPost    = (post: Post) => setPosts((p) => [post, ...p]);
  const addComment = (postId: number, text: string) => setPosts((p) => p.map((x) => x.id === postId ? { ...x, comments: [...x.comments, { id: Date.now(), user: "voce_mesmo", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&auto=format", text, time: "agora", likes: 0, liked: false }] } : x));
  const markAllRead = () => setNotifs((n) => n.map((x) => ({ ...x, read: true })));

  const filtered = filterType === "todos" ? posts : posts.filter((p) => p.problemType === filterType);
  const unread   = notifs.filter((n) => !n.read).length;
  const stats    = { aberto: posts.filter((p) => p.status === "aberto").length, em_analise: posts.filter((p) => p.status === "em_analise").length, resolvido: posts.filter((p) => p.status === "resolvido").length };
  const currentPost = commentPost ? posts.find((p) => p.id === commentPost.id) || commentPost : null;

  const NAV = [
    { id: "feed"   as TabId, label: "Início",         icon: Home },
    { id: "buscar" as TabId, label: "Explorar",        icon: Search },
    { id: "notif"  as TabId, label: "Notificações",    icon: Bell,  badge: unread },
    { id: "perfil" as TabId, label: "Perfil",          icon: User },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Desktop */}
      <div className="hidden md:flex h-screen overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-64 shrink-0 border-r border-border flex flex-col py-6 px-4 gap-1" style={{ backgroundColor: "var(--sidebar)" }}>
          <div className="px-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#f97316" }}><span className="text-sm font-black" style={{ color: "#0f0f0f" }}>P</span></div>
              <div><p className="text-sm font-black text-foreground leading-none">Prefeitura</p><p className="text-xs font-semibold" style={{ color: "#f97316" }}>TamoAqui</p></div>
            </div>
          </div>
          {NAV.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === id ? "" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`} style={activeTab === id ? { backgroundColor: "#f97316", color: "#0f0f0f" } : {}}>
              <Icon size={18} />{label}
              {badge ? <span className="ml-auto text-xs font-black px-1.5 py-0.5 rounded-full" style={{ backgroundColor: activeTab === id ? "#0f0f0f" : "#f97316", color: activeTab === id ? "#f97316" : "#0f0f0f" }}>{badge}</span> : null}
            </button>
          ))}
          <button onClick={() => setShowModal(true)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold mt-2" style={{ backgroundColor: "#f97316", color: "#0f0f0f" }}><PlusSquare size={18} />Nova Ocorrência</button>
          <button onClick={onToggleDark} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all">{dark ? <Sun size={18} /> : <Moon size={18} />}{dark ? "Modo Claro" : "Modo Escuro"}</button>
          <div className="mt-auto border-t border-border pt-4 mx-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">Resumo Geral</p>
            <div className="space-y-2 px-2">
              {[{ label: "Abertos", dot: "bg-red-400", val: stats.aberto }, { label: "Em Análise", dot: "bg-yellow-400", val: stats.em_analise }, { label: "Resolvidos", dot: "bg-green-400", val: stats.resolvido }].map(({ label, dot, val }) => (
                <div key={label} className="flex items-center justify-between"><div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${dot}`} /><span className="text-xs font-semibold text-muted-foreground">{label}</span></div><span className="text-xs font-bold text-foreground">{val}</span></div>
              ))}
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 px-2 mt-4 text-xs font-bold text-muted-foreground hover:text-destructive transition-colors"><LogOut size={13} />Trocar perfil</button>
          </div>
        </aside>

        {/* Feed */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-lg mx-auto py-6 px-4">
            {activeTab === "feed" && <>
              <div className="flex gap-4 mb-6 overflow-x-auto scrollbar-hide pb-1">
                {STORIES.map((s) => <div key={s.id} className="flex flex-col items-center gap-1.5 shrink-0"><div className="w-14 h-14 rounded-full p-0.5" style={{ background: s.active ? "linear-gradient(135deg, #f97316, #ea580c)" : "transparent", border: s.active ? "none" : "2px solid var(--border)" }}><img src={s.img} alt={s.user} className="w-full h-full rounded-full object-cover" /></div><span className="text-xs text-muted-foreground font-semibold truncate w-14 text-center">{s.user}</span></div>)}
              </div>
              <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
                <button onClick={() => setFilterType("todos")} className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${filterType === "todos" ? "" : "bg-muted text-muted-foreground"}`} style={filterType === "todos" ? { backgroundColor: "#f97316", color: "#0f0f0f" } : {}}>Todos</button>
                {PROBLEM_TYPES.map((t) => <button key={t.id} onClick={() => setFilterType(t.id as ProblemId)} className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 ${filterType === t.id ? "" : "bg-muted text-muted-foreground"}`} style={filterType === t.id ? { backgroundColor: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40` } : {}}><t.icon size={11} />{t.label}</button>)}
              </div>
              <div className="space-y-5">{filtered.map((p) => <PostCard key={p.id} post={p} onToggleLike={toggleLike} onToggleSave={toggleSave} onOpenComments={setCommentPost} />)}</div>
            </>}
            {activeTab === "buscar" && <ExploreTab posts={posts} onOpenComments={setCommentPost} />}
            {activeTab === "notif"  && <NotifTab notifs={notifs} onMarkAll={markAllRead} />}
            {activeTab === "perfil" && <ProfileTab posts={posts} onLogout={onLogout} avatarUrl={avatarUrl} bannerUrl={bannerUrl} onChangeAvatar={changeAvatar} onChangeBanner={changeBanner} />}
          </div>
        </main>

        {/* Right sidebar */}
        <aside className="w-72 shrink-0 border-l border-border py-6 px-4 overflow-y-auto scrollbar-hide" style={{ backgroundColor: "var(--sidebar)" }}>
          <div className="flex items-center gap-3 mb-6"><img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&auto=format" alt="" className="w-11 h-11 rounded-full object-cover" /><div><p className="text-sm font-bold text-foreground">João Cidadão</p><p className="text-xs text-muted-foreground">@joao_cidadao</p></div></div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3"><TrendingUp size={14} className="text-primary" /><p className="text-xs font-bold text-foreground uppercase tracking-wider">Mais Reportados</p></div>
            <div className="space-y-2">{PROBLEM_TYPES.slice(0, 5).map((t, i) => <div key={t.id} className="flex items-center justify-between py-1"><div className="flex items-center gap-2.5"><span className="text-xs font-black text-muted-foreground w-4">{i + 1}</span><t.icon size={14} style={{ color: t.color }} /><span className="text-xs font-semibold text-foreground">{t.label}</span></div><span className="text-xs font-bold" style={{ color: t.color }}>{[87,64,51,43,38][i]}</span></div>)}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3"><CheckCircle size={14} className="text-primary" /><p className="text-xs font-bold text-foreground uppercase tracking-wider">Esta Semana</p></div>
            <div className="grid grid-cols-2 gap-2">
              {[{ label: "Reportados", value: "127", icon: AlertTriangle, color: "#f97316" }, { label: "Resolvidos", value: "89", icon: CheckCircle, color: "#22c55e" }, { label: "Em Análise", value: "31", icon: Clock, color: "#facc15" }, { label: "Cidadãos", value: "342", icon: User, color: "#3b82f6" }].map(({ label, value, icon: Icon, color }) => <div key={label} className="bg-muted rounded-xl p-3 flex flex-col gap-1"><Icon size={14} style={{ color }} /><p className="text-lg font-black text-foreground leading-none">{value}</p><p className="text-xs text-muted-foreground font-semibold">{label}</p></div>)}
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex flex-col h-screen">
        <header className="border-b border-border px-4 py-3 flex items-center justify-between shrink-0" style={{ backgroundColor: "var(--card)" }}>
          <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#f97316" }}><span className="text-xs font-black" style={{ color: "#0f0f0f" }}>P</span></div><span className="text-sm font-black text-foreground">TamoAqui</span></div>
          <div className="flex items-center gap-2"><button onClick={onToggleDark} className="text-muted-foreground p-1">{dark ? <Sun size={20} /> : <Moon size={20} />}</button><button onClick={() => setShowModal(true)} className="text-primary"><PlusSquare size={24} /></button></div>
        </header>
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="px-3 py-4">
            {activeTab === "feed" && <>
              <div className="flex gap-3 mb-4 overflow-x-auto scrollbar-hide pb-1">{STORIES.map((s) => <div key={s.id} className="flex flex-col items-center gap-1 shrink-0"><div className="w-12 h-12 rounded-full p-0.5" style={{ background: s.active ? "linear-gradient(135deg, #f97316, #ea580c)" : "transparent", border: s.active ? "none" : "2px solid var(--border)" }}><img src={s.img} alt={s.user} className="w-full h-full rounded-full object-cover" /></div><span className="text-xs text-muted-foreground truncate w-12 text-center">{s.user}</span></div>)}</div>
              <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
                <button onClick={() => setFilterType("todos")} className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${filterType === "todos" ? "" : "bg-muted text-muted-foreground"}`} style={filterType === "todos" ? { backgroundColor: "#f97316", color: "#0f0f0f" } : {}}>Todos</button>
                {PROBLEM_TYPES.map((t) => <button key={t.id} onClick={() => setFilterType(t.id as ProblemId)} className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1 ${filterType === t.id ? "" : "bg-muted text-muted-foreground"}`} style={filterType === t.id ? { backgroundColor: `${t.color}20`, color: t.color } : {}}><t.icon size={10} />{t.label}</button>)}
              </div>
              <div className="space-y-4">{filtered.map((p) => <PostCard key={p.id} post={p} onToggleLike={toggleLike} onToggleSave={toggleSave} onOpenComments={setCommentPost} />)}</div>
            </>}
            {activeTab === "buscar" && <ExploreTab posts={posts} onOpenComments={setCommentPost} />}
            {activeTab === "notif"  && <NotifTab notifs={notifs} onMarkAll={markAllRead} />}
            {activeTab === "perfil" && <ProfileTab posts={posts} onLogout={onLogout} avatarUrl={avatarUrl} bannerUrl={bannerUrl} onChangeAvatar={changeAvatar} onChangeBanner={changeBanner} />}
          </div>
        </main>
        <nav className="border-t border-border flex items-center justify-around py-3 px-4 shrink-0" style={{ backgroundColor: "var(--card)" }}>
          {NAV.map(({ id, icon: Icon, badge }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`relative p-2 rounded-xl ${activeTab === id ? "text-primary" : "text-muted-foreground"}`}>
              <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 1.5} />
              {badge ? <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs font-black flex items-center justify-center" style={{ backgroundColor: "#f97316", color: "#0f0f0f" }}>{badge}</span> : null}
            </button>
          ))}
        </nav>
      </div>

      <AnimatePresence>
        {showModal   && <CreatePostModal onClose={() => setShowModal(false)} onPost={addPost} />}
        {currentPost && <CommentSheet post={currentPost} onClose={() => setCommentPost(null)} onAddComment={addComment} />}
      </AnimatePresence>
      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type Screen = "welcome" | "login" | "signup" | "app";

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [role,   setRole]   = useState<Role>("cidadao");
  const [dark,   setDark]   = useState(true);
  const [posts,  setPosts]  = useState<Post[]>(INITIAL_POSTS);

  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);

  const toggleDark   = () => setDark((d) => !d);
  const handleLogout = () => setScreen("welcome");

  const handleChooseRole = (r: Role) => { setRole(r); setScreen("login"); };
  const handleLogin      = ()        => setScreen("app");
  const handleSignUp     = ()        => setScreen("signup");
  const handleSignUpDone = ()        => setScreen("app");

  const updateStatus = (id: number, status: PostStatus, obs: string) => {
    setPosts((prev) => prev.map((p) => p.id === id
      ? { ...p, status, comments: obs ? [...p.comments, { id: Date.now(), user: "prefeitura_sp", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=64&h=64&fit=crop&auto=format", text: `[Prefeitura] Status atualizado para "${STATUS_META[status].label}". ${obs}`, time: "agora", likes: 0, liked: false }] : p.comments }
      : p
    ));
  };

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
    <SignUpScreen onSuccess={handleSignUpDone} onBack={() => setScreen("login")} dark={dark} onToggleDark={toggleDark} />
  );

  if (role === "prefeitura") return (
    <PrefeituraDashboard posts={posts} dark={dark} onToggleDark={toggleDark} onLogout={handleLogout} onUpdateStatus={updateStatus} />
  );

  return (
    <CidadaoApp posts={posts} dark={dark} onToggleDark={toggleDark} onLogout={handleLogout} setPosts={setPosts} />
  );
}