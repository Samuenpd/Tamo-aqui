import { useEffect, useId, useRef, useState } from "react";
import {
  Home,
  Search,
  PlusSquare,
  Bell,
  User,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MapPin,
  X,
  ChevronDown,
  AlertTriangle,
  Lightbulb,
  Trash2,
  Droplets,
  Construction,
  TreeDeciduous,
  Navigation,
  Camera,
  CheckCircle,
  Clock,
  TrendingUp,
  Send,
  Grid,
  List,
  Settings,
  LogOut,
  Sun,
  Moon,
  Award,
  Building2,
  Users,
  ArrowRight,
  BarChart3,
  ClipboardList,
  ChevronUp,
  Eye,
  EyeOff,
  Edit3,
  RefreshCw,
  Lock,
  AtSign,
  Filter,
  ChevronRight,
  MailCheck,
  Calendar,
  Ticket,
  Trophy,
  GraduationCap,
  HeartHandshake,
  School,
  Landmark,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth, type Role, type Profile } from "../../hooks/useAuth";
import {
  fetchComments,
  addComment as addCommentDb,
  toggleLike as toggleLikeDb,
  toggleSave as toggleSaveDb,
  createPost as createPostDb,
  type UIPost,
  type UIComment,
  type UINotification,
  type ProblemId,
  type PostStatus,
} from "../../hooks/useOccurrences";
import {
  LocationPicker,
  type LocationValue,
} from "../components/LocationPicker";
import {
  useEvents,
  createEvent,
  type UIEvent,
  type EventCategory,
} from "../../hooks/useEvents";
import { DISTRICTS } from "../constants";

export function WelcomeScreen({
  onChoose,
  dark,
  onToggleDark,
}: {
  onChoose: (r: Role) => void;
  dark: boolean;
  onToggleDark: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #f97316, transparent)",
          }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #ea580c, transparent)",
          }}
        />
      </div>
      <div className="absolute top-4 right-4">
        <button
          onClick={onToggleDark}
          className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div
          className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-2xl"
          style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
        >
          <Building2 size={36} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-foreground leading-tight">
          TamoAqui
        </h1>
        <p className="text-base text-muted-foreground mt-2 font-semibold">
          Prefeitura de São Paulo
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Reporte problemas. Acompanhe soluções.
        </p>
      </motion.div>

      <div className="w-full max-w-sm flex flex-col gap-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center mb-1">
          Como deseja entrar?
        </p>

        <motion.button
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          onClick={() => onChoose("cidadao")}
          className="group w-full flex items-center gap-5 p-5 rounded-2xl border-2 border-border bg-card hover:border-primary transition-all text-left"
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-105"
            style={{ backgroundColor: "#f97316" }}
          >
            <Users size={26} style={{ color: "#0f0f0f" }} />
          </div>
          <div className="flex-1">
            <p className="text-base font-black text-foreground">Sou Cidadão</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              Reporte problemas urbanos, acompanhe ocorrências e interaja com a
              comunidade.
            </p>
          </div>
          <ArrowRight
            size={18}
            className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0"
          />
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          onClick={() => onChoose("prefeitura")}
          className="group w-full flex items-center gap-5 p-5 rounded-2xl border-2 border-border bg-card hover:border-primary transition-all text-left"
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #1a1207, #3a2010)",
              border: "2px solid #f97316",
            }}
          >
            <Building2 size={26} style={{ color: "#f97316" }} />
          </div>
          <div className="flex-1">
            <p className="text-base font-black text-foreground">
              Sou da Prefeitura
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              Gerencie ocorrências, atualize status e monitore indicadores da
              cidade.
            </p>
          </div>
          <ArrowRight
            size={18}
            className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0"
          />
        </motion.button>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xs text-muted-foreground mt-10 text-center"
      >
        Versão 2.6 · Secretaria de Serviços Urbanos
      </motion.p>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

export function LoginScreen({
  intentRole,
  onBack,
  onSignUp,
  dark,
  onToggleDark,
}: {
  intentRole: Role;
  onBack: () => void;
  onSignUp: () => void;
  dark: boolean;
  onToggleDark: () => void;
}) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    () => localStorage.getItem("tamoaqui-remember-me") !== "false",
  );

  const isPrefeitura = intentRole === "prefeitura";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    localStorage.setItem("tamoaqui-remember-me", String(rememberMe));
    const { error } = await signIn(email, password, rememberMe);
    setLoading(false);
    if (error) setError(error);
    // Se der certo, o AuthProvider atualiza a sessão e o componente raiz troca de tela sozinho.
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #f97316, transparent)",
          }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #ea580c, transparent)",
          }}
        />
      </div>
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight size={16} className="rotate-180" />
          Voltar
        </button>
        <button
          onClick={onToggleDark}
          className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl"
            style={
              isPrefeitura
                ? {
                    background: "linear-gradient(135deg, #1a0a00, #3a1a00)",
                    border: "2px solid #f97316",
                  }
                : { background: "linear-gradient(135deg, #f97316, #ea580c)" }
            }
          >
            {isPrefeitura ? (
              <Building2 size={28} style={{ color: "#f97316" }} />
            ) : (
              <Users size={28} className="text-white" />
            )}
          </div>
          <h1 className="text-2xl font-black text-foreground">
            {isPrefeitura ? "Acesso Restrito" : "Bem-vindo!"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isPrefeitura
              ? "Painel da Prefeitura de São Paulo"
              : "Entre na sua conta de cidadão"}
          </p>
        </div>

        {isPrefeitura && (
          <div className="mb-5 px-4 py-3 rounded-xl border border-border bg-muted/40 text-xs text-muted-foreground">
            Contas da prefeitura são criadas manualmente pela equipe
            administrativa no painel do Supabase.
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              E-mail
            </label>
            <div
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${email ? "border-primary" : "border-border"}`}
            >
              <AtSign size={16} className="text-muted-foreground shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="voce@email.com"
                autoComplete="email"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Senha
            </label>
            <div
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${password ? "border-primary" : "border-border"}`}
            >
              <Lock size={16} className="text-muted-foreground shrink-0" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 px-1 text-sm text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => {
                setRememberMe(e.target.checked);
                localStorage.setItem(
                  "tamoaqui-remember-me",
                  String(e.target.checked),
                );
              }}
              className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
            />
            Lembrar de mim
          </label>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs font-semibold text-destructive px-1"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              color: "#fff",
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Entrando…
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        {!isPrefeitura && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            Não tem conta?{" "}
            <button
              type="button"
              onClick={onSignUp}
              className="text-primary font-black hover:opacity-75 transition-opacity"
            >
              Criar conta grátis
            </button>
          </p>
        )}
      </motion.div>
    </div>
  );
}

// ─── Sign Up Screen ───────────────────────────────────────────────────────────

export function SignUpScreen({
  onBack,
  dark,
  onToggleDark,
}: {
  onBack: () => void;
  dark: boolean;
  onToggleDark: () => void;
}) {
  const { signUp } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [district, setDistrict] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmationSent, setConfirmationSent] = useState(false);

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Nome obrigatório.";
    if (!email.includes("@")) e.email = "E-mail inválido.";
    if (username.length < 3) e.username = "Mínimo 3 caracteres.";
    if (!/^[a-z0-9_]+$/.test(username))
      e.username = "Apenas letras minúsculas, números e _.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (password.length < 6) e.password = "Mínimo 6 caracteres.";
    if (password !== confirm) e.confirm = "As senhas não coincidem.";
    if (!district) e.district = "Selecione seu bairro/região.";
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
    const { error, needsConfirmation } = await signUp({
      email,
      password,
      username,
      fullName: name,
      district,
      role: "cidadao",
    });
    setLoading(false);
    if (error) {
      setErrors({ confirm: error });
      return;
    }
    if (needsConfirmation) {
      setConfirmationSent(true);
      return;
    }
    // Sem confirmação necessária: a sessão já foi criada, o componente raiz troca de tela sozinho.
  };

  const strength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : /[A-Z]/.test(password) && /[0-9]/.test(password)
          ? 3
          : 2;
  const strengthLabel = ["", "Fraca", "Média", "Forte"];
  const strengthColor = ["", "#ef4444", "#facc15", "#22c55e"];

  if (confirmationSent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center">
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
        >
          <MailCheck size={28} className="text-white" />
        </div>
        <h1 className="text-xl font-black text-foreground mb-2">
          Confirme seu e-mail
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Enviamos um link de confirmação para{" "}
          <span className="font-bold text-foreground">{email}</span>. Clique
          nele para ativar sua conta e depois faça login.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl text-sm font-black"
          style={{
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            color: "#fff",
          }}
        >
          Ir para login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #f97316, transparent)",
          }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #ea580c, transparent)",
          }}
        />
      </div>

      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight size={16} className="rotate-180" />
          Voltar
        </button>
        <button
          onClick={onToggleDark}
          className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
          >
            <Users size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-foreground">Criar Conta</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Junte-se à comunidade TamoAqui
          </p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all"
                style={{
                  backgroundColor: step >= s ? "#f97316" : "var(--muted)",
                  color: step >= s ? "#0f0f0f" : "var(--muted-foreground)",
                }}
              >
                {step > s ? <CheckCircle size={14} /> : s}
              </div>
              <span
                className="text-xs font-bold"
                style={{
                  color: step >= s ? "#f97316" : "var(--muted-foreground)",
                }}
              >
                {s === 1 ? "Seus dados" : "Segurança"}
              </span>
              {s < 2 && (
                <div
                  className="flex-1 h-px mx-1"
                  style={{
                    backgroundColor: step > s ? "#f97316" : "var(--border)",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleNext}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Nome Completo
                </label>
                <div
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${errors.name ? "border-destructive" : name ? "border-primary" : "border-border"}`}
                >
                  <User size={16} className="text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors((p) => ({ ...p, name: "" }));
                    }}
                    placeholder="João da Silva"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-destructive mt-1 font-semibold">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  E-mail
                </label>
                <div
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${errors.email ? "border-destructive" : email ? "border-primary" : "border-border"}`}
                >
                  <AtSign
                    size={16}
                    className="text-muted-foreground shrink-0"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((p) => ({ ...p, email: "" }));
                    }}
                    placeholder="joao@email.com"
                    autoComplete="email"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive mt-1 font-semibold">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Nome de Usuário
                </label>
                <div
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${errors.username ? "border-destructive" : username ? "border-primary" : "border-border"}`}
                >
                  <span className="text-muted-foreground text-sm font-bold shrink-0">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(
                        e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                      );
                      setErrors((p) => ({ ...p, username: "" }));
                    }}
                    placeholder="joao_silva"
                    autoComplete="username"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                  {username.length >= 3 && !errors.username && (
                    <CheckCircle
                      size={14}
                      className="text-green-400 shrink-0"
                    />
                  )}
                </div>
                {errors.username ? (
                  <p className="text-xs text-destructive mt-1 font-semibold">
                    {errors.username}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    Apenas letras minúsculas, números e _
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 mt-2"
                style={{
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  color: "#fff",
                }}
              >
                Continuar <ArrowRight size={16} />
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Senha
                </label>
                <div
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${errors.password ? "border-destructive" : password ? "border-primary" : "border-border"}`}
                >
                  <Lock size={16} className="text-muted-foreground shrink-0" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((p) => ({ ...p, password: "" }));
                    }}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="text-muted-foreground hover:text-foreground shrink-0"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-1.5 flex-1 rounded-full transition-all"
                          style={{
                            backgroundColor:
                              strength >= i
                                ? strengthColor[strength]
                                : "var(--muted)",
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{ color: strengthColor[strength] }}
                    >
                      {strengthLabel[strength]}
                    </span>
                  </div>
                )}
                {errors.password && (
                  <p className="text-xs text-destructive mt-1 font-semibold">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Confirmar Senha
                </label>
                <div
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${errors.confirm ? "border-destructive" : confirm && confirm === password ? "border-green-500" : confirm ? "border-destructive" : "border-border"}`}
                >
                  <Lock size={16} className="text-muted-foreground shrink-0" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      setErrors((p) => ({ ...p, confirm: "" }));
                    }}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                  {confirm && confirm === password && (
                    <CheckCircle
                      size={14}
                      className="text-green-400 shrink-0"
                    />
                  )}
                </div>
                {errors.confirm && (
                  <p className="text-xs text-destructive mt-1 font-semibold">
                    {errors.confirm}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Seu Bairro / Região
                </label>
                <div
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors bg-input-background ${errors.district ? "border-destructive" : district ? "border-primary" : "border-border"}`}
                >
                  <MapPin
                    size={16}
                    className="text-muted-foreground shrink-0"
                  />
                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setErrors((p) => ({ ...p, district: "" }));
                    }}
                    className="flex-1 bg-transparent text-sm text-foreground outline-none appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-card">
                      Selecione seu bairro…
                    </option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d} className="bg-card">
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="text-muted-foreground shrink-0 pointer-events-none"
                  />
                </div>
                {errors.district && (
                  <p className="text-xs text-destructive mt-1 font-semibold">
                    {errors.district}
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-xl text-sm font-bold bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  style={{
                    background: "linear-gradient(135deg, #f97316, #ea580c)",
                    color: "#fff",
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Criando…
                    </>
                  ) : (
                    "Criar Conta"
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Já tem conta?{" "}
          <button
            type="button"
            onClick={onBack}
            className="text-primary font-black hover:opacity-75 transition-opacity underline underline-offset-2"
          >
            Entrar
          </button>
        </p>
      </motion.div>
    </div>
  );
}

// ─── Comment Sheet ────────────────────────────────────────────────────────────
