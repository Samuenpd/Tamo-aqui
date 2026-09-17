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
import {
  PROBLEM_TYPES,
  STATUS_META,
  DEFAULT_AVATAR,
  type TabId,
} from "../constants";
import { ProblemBadge, StatusBadge } from "../components/common";

export function StatusModal({
  post,
  onClose,
  onUpdate,
}: {
  post: UIPost;
  onClose: () => void;
  onUpdate: (status: PostStatus, obs: string) => Promise<void>;
}) {
  const [next, setNext] = useState<PostStatus>(post.status);
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    setSaving(true);
    try {
      await onUpdate(next, obs);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const prob = PROBLEM_TYPES.find((t) => t.id === post.problemType)!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Edit3 size={16} className="text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              Atualizar Status
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 border-b border-border flex items-start gap-4">
          <img
            src={post.image}
            alt=""
            className="w-16 h-16 rounded-xl object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <prob.icon size={14} style={{ color: prob.color }} />
              <span className="text-xs font-bold" style={{ color: prob.color }}>
                {prob.label}
              </span>
            </div>
            <p className="text-sm font-bold text-foreground leading-snug truncate">
              @{post.user}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin size={10} />
              {post.location}
            </p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {post.caption}
            </p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Novo Status
            </p>
            <div className="space-y-2">
              {(["aberto", "em_analise", "resolvido"] as PostStatus[]).map(
                (s) => {
                  const m = STATUS_META[s];
                  const active = next === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setNext(s)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${active ? "border-primary" : "border-border hover:border-border/60"}`}
                      style={
                        active
                          ? {
                              backgroundColor: `${s === "aberto" ? "#ef4444" : s === "em_analise" ? "#facc15" : "#22c55e"}12`,
                            }
                          : {}
                      }
                    >
                      <div className={`w-3 h-3 rounded-full ${m.dot}`} />
                      <span
                        className={`text-sm font-bold ${active ? m.color : "text-muted-foreground"}`}
                      >
                        {m.label}
                      </span>
                      {post.status === s && (
                        <span className="ml-auto text-xs text-muted-foreground font-semibold">
                          Atual
                        </span>
                      )}
                      {active && post.status !== s && (
                        <CheckCircle
                          size={14}
                          className="ml-auto text-primary"
                        />
                      )}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Observação da Equipe
            </label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={3}
              placeholder="Ex: Equipe enviada ao local. Previsão de reparo: 3 dias úteis."
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-background text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none"
            />
          </div>

          <button
            onClick={confirm}
            disabled={saving || next === post.status}
            className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
            style={{ backgroundColor: "#f97316", color: "#0f0f0f" }}
          >
            {saving ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Salvando…
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Confirmar Atualização
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Prefeitura Dashboard ─────────────────────────────────────────────────────

export function PrefeituraDashboard({
  posts,
  profile,
  dark,
  onToggleDark,
  onLogout,
  onUpdateStatus,
}: {
  posts: UIPost[];
  profile: Profile;
  dark: boolean;
  onToggleDark: () => void;
  onLogout: () => void;
  onUpdateStatus: (
    post: UIPost,
    status: PostStatus,
    obs: string,
  ) => Promise<void>;
}) {
  const [pTab, setPTab] = useState<"ocorrencias" | "relatorios">("ocorrencias");
  const [fs, setFs] = useState<PostStatus | "todos">("todos");
  const [fp, setFp] = useState<ProblemId | "todos">("todos");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<UIPost | null>(null);

  const filtered = posts.filter((p) => {
    const ms = fs === "todos" || p.status === fs;
    const mp = fp === "todos" || p.problemType === fp;
    const mq =
      !query ||
      [p.caption, p.location, p.user, p.district].some((s) =>
        s.toLowerCase().includes(query.toLowerCase()),
      );
    return ms && mp && mq;
  });

  const stats = {
    aberto: posts.filter((p) => p.status === "aberto").length,
    em_analise: posts.filter((p) => p.status === "em_analise").length,
    resolvido: posts.filter((p) => p.status === "resolvido").length,
    total: posts.length,
  };

  const byType = PROBLEM_TYPES.map((t) => ({
    ...t,
    count: posts.filter((p) => p.problemType === t.id).length,
  })).sort((a, b) => b.count - a.count);

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <header
        className="border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm"
        style={{ backgroundColor: "var(--card)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
          >
            <Building2 size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-foreground leading-none">
              Painel da Prefeitura
            </p>
            <p className="text-xs" style={{ color: "#f97316" }}>
              TamoAqui · Secretaria de Serviços Urbanos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDark}
            className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className="w-56 shrink-0 border-r border-border py-6 px-3 hidden md:flex flex-col gap-1"
          style={{ backgroundColor: "var(--sidebar)" }}
        >
          {[
            {
              id: "ocorrencias" as const,
              label: "Ocorrências",
              icon: ClipboardList,
            },
            { id: "relatorios" as const, label: "Relatórios", icon: BarChart3 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setPTab(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${pTab === id ? "" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              style={
                pTab === id
                  ? { backgroundColor: "#f97316", color: "#0f0f0f" }
                  : {}
              }
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
          <div className="mt-auto pt-4 border-t border-border">
            <div className="flex items-center gap-2.5 px-3 py-2">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                <img
                  src={profile.avatar_url ?? DEFAULT_AVATAR}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground leading-none">
                  {profile.full_name}
                </p>
                <p className="text-xs text-muted-foreground">Gestora</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-6">
          {pTab === "ocorrencias" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    label: "Total",
                    value: stats.total,
                    color: "#f97316",
                    icon: ClipboardList,
                    filter: "todos",
                  },
                  {
                    label: "Abertos",
                    value: stats.aberto,
                    color: "#ef4444",
                    icon: AlertTriangle,
                    filter: "aberto",
                  },
                  {
                    label: "Em Análise",
                    value: stats.em_analise,
                    color: "#facc15",
                    icon: Clock,
                    filter: "em_analise",
                  },
                  {
                    label: "Resolvidos",
                    value: stats.resolvido,
                    color: "#22c55e",
                    icon: CheckCircle,
                    filter: "resolvido",
                  },
                ].map(({ label, value, color, icon: Icon, filter }) => (
                  <button
                    key={label}
                    onClick={() => setFs(filter as PostStatus | "todos")}
                    className={`flex flex-col gap-2 p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${fs === filter ? "border-primary" : "border-border"}`}
                    style={{ backgroundColor: `${color}10` }}
                  >
                    <div className="flex items-center justify-between">
                      <Icon size={18} style={{ color }} />
                      {fs === filter && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      )}
                    </div>
                    <p className="text-2xl font-black text-foreground">
                      {value}
                    </p>
                    <p className="text-xs font-bold text-muted-foreground">
                      {label}
                    </p>
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-xl">
                  <Search
                    size={15}
                    className="text-muted-foreground shrink-0"
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por bairro, usuário, descrição…"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                  {query && (
                    <button onClick={() => setQuery("")}>
                      <X size={13} className="text-muted-foreground" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFp("todos")}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold ${fp === "todos" ? "" : "bg-muted text-muted-foreground"}`}
                    style={
                      fp === "todos"
                        ? { backgroundColor: "#f97316", color: "#0f0f0f" }
                        : {}
                    }
                  >
                    Todos os tipos
                  </button>
                  {PROBLEM_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setFp(t.id as ProblemId)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${fp === t.id ? "" : "bg-muted text-muted-foreground"}`}
                      style={
                        fp === t.id
                          ? {
                              backgroundColor: `${t.color}20`,
                              color: t.color,
                              border: `1px solid ${t.color}40`,
                            }
                          : {}
                      }
                    >
                      <t.icon size={11} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {filtered.length} ocorrência{filtered.length !== 1 ? "s" : ""}
                </p>
                {filtered.map((post) => {
                  const prob = PROBLEM_TYPES.find(
                    (t) => t.id === post.problemType,
                  )!;
                  const sm = STATUS_META[post.status];
                  return (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4"
                    >
                      <img
                        src={post.image}
                        alt=""
                        className="w-full md:w-20 h-32 md:h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ProblemBadge typeId={post.problemType} />
                          <StatusBadge status={post.status} />
                          <span className="text-xs text-muted-foreground">
                            {post.time} atrás · {post.district}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                          <MapPin size={11} className="text-muted-foreground" />
                          {post.location}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {post.caption}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart size={11} />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={11} />
                            {post.commentsCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={11} />@{post.user}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col gap-2 shrink-0">
                        <button
                          onClick={() => setEditing(post)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                          style={{
                            backgroundColor: "#f97316",
                            color: "#0f0f0f",
                          }}
                        >
                          <Edit3 size={13} />
                          Atualizar Status
                        </button>
                        {sm.next && (
                          <button
                            onClick={() => onUpdateStatus(post, sm.next!, "")}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/60 transition-all ${sm.color}`}
                          >
                            <ChevronUp size={13} />
                            {sm.nextLabel}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <ClipboardList
                      size={40}
                      className="mx-auto mb-3 opacity-20"
                    />
                    <p className="font-semibold">
                      Nenhuma ocorrência encontrada
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {pTab === "relatorios" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-xl font-black text-foreground">
                Relatórios e Indicadores
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Taxa de Resolução
                  </p>
                  <div className="relative w-28 h-28 mx-auto">
                    <svg
                      viewBox="0 0 36 36"
                      className="w-full h-full -rotate-90"
                    >
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="var(--muted)"
                        strokeWidth="3"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="3"
                        strokeDasharray={`${stats.total ? (stats.resolvido / stats.total) * 100 : 0} 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-2xl font-black text-foreground">
                        {stats.total
                          ? Math.round((stats.resolvido / stats.total) * 100)
                          : 0}
                        %
                      </p>
                      <p className="text-xs text-muted-foreground">resolvido</p>
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    {stats.resolvido} de {stats.total} ocorrências
                  </p>
                </div>

                <div className="md:col-span-2 bg-card border border-border rounded-2xl p-5">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                    Ocorrências por Tipo
                  </p>
                  <div className="space-y-3">
                    {byType.map((t) => (
                      <div key={t.id} className="flex items-center gap-3">
                        <t.icon
                          size={14}
                          style={{ color: t.color }}
                          className="shrink-0"
                        />
                        <span className="text-xs font-semibold text-foreground w-36 shrink-0 truncate">
                          {t.label}
                        </span>
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${stats.total ? (t.count / stats.total) * 100 : 0}%`,
                              backgroundColor: t.color,
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground w-6 text-right">
                          {t.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                  Distribuição por Status
                </p>
                <div className="flex gap-2 h-24 items-end">
                  {[
                    { label: "Abertos", val: stats.aberto, color: "#ef4444" },
                    {
                      label: "Em Análise",
                      val: stats.em_analise,
                      color: "#facc15",
                    },
                    {
                      label: "Resolvidos",
                      val: stats.resolvido,
                      color: "#22c55e",
                    },
                  ].map(({ label, val, color }) => (
                    <div
                      key={label}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <span className="text-xs font-black text-foreground">
                        {val}
                      </span>
                      <div
                        className="w-full rounded-t-lg transition-all"
                        style={{
                          height: `${stats.total ? (val / stats.total) * 100 : 10}%`,
                          minHeight: "8px",
                          backgroundColor: color,
                        }}
                      />
                      <span className="text-xs text-muted-foreground text-center leading-tight">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                  Por Bairro / Região
                </p>
                <div className="space-y-2">
                  {Array.from(
                    new Set(posts.map((p) => p.district).filter(Boolean)),
                  ).map((d) => {
                    const count = posts.filter((p) => p.district === d).length;
                    const resolvedCount = posts.filter(
                      (p) => p.district === d && p.status === "resolvido",
                    ).length;
                    return (
                      <div
                        key={d}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <span className="text-sm font-semibold text-foreground">
                          {d}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {count} report{count !== 1 ? "es" : "e"}
                          </span>
                          <span className="text-xs font-bold text-green-400">
                            {resolvedCount} resolvido
                            {resolvedCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {posts.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Sem dados ainda.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {editing && (
          <StatusModal
            post={editing}
            onClose={() => setEditing(null)}
            onUpdate={(status, obs) => onUpdateStatus(editing, status, obs)}
          />
        )}
      </AnimatePresence>
      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}

// ─── Cidadão App ──────────────────────────────────────────────────────────────
