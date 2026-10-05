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
  fetchNotifications,
  markAllNotificationsRead,
} from "../../hooks/useOccurrences";
import { PROBLEM_TYPES, DEFAULT_AVATAR, type TabId } from "../constants";
import {
  PostCard,
  CreatePostModal,
  CreateEventModal,
  EventsTab,
  ExploreTab,
  NotifTab,
  CommentSheet,
} from "./OccurrenceComponents";
import { ProfileTab } from "./ProfileComponents";

export function CidadaoApp({
  posts,
  setPosts,
  profile,
  notifs,
  onMarkAllRead,
  dark,
  onToggleDark,
  onLogout,
  refetchPosts,
}: {
  posts: UIPost[];
  setPosts: React.Dispatch<React.SetStateAction<UIPost[]>>;
  profile: Profile;
  notifs: UINotification[];
  onMarkAllRead: () => void;
  dark: boolean;
  onToggleDark: () => void;
  onLogout: () => void;
  refetchPosts: () => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("feed");
  const [showModal, setShowModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [filterType, setFilterType] = useState<ProblemId | "todos">("todos");
  const [commentPost, setCommentPost] = useState<UIPost | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [viewedUsername, setViewedUsername] = useState<string | null>(null);
  const { updateBanner } = useAuth();
  const [bannerError, setBannerError] = useState("");
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Integração do hook de Eventos
  const { events, refetch: refetchEvents } = useEvents();

  const handleBannerChange = async (file: File) => {
    setBannerError("");
    if (!file.type.startsWith("image/")) {
      setBannerError("Selecione uma imagem válida.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setBannerError("A imagem da capa deve ter no máximo 8 MB.");
      return;
    }

    setUploadingBanner(true);
    const { error } = await updateBanner(file);
    setUploadingBanner(false);
    if (error) setBannerError(error);
  };

  const openProfile = (username: string) => {
    setViewedUsername(username);
    setActiveTab("perfil");
  };
  const backToOwnProfile = () => setViewedUsername(null);

  const toggleLike = async (id: string) => {
    const target = posts.find((p) => p.id === id);
    if (!target) return;

    const wasLiked = target.liked;
    setPosts((p) =>
      p.map((x) =>
        x.id === id
          ? { ...x, liked: !wasLiked, likes: x.likes + (wasLiked ? -1 : 1) }
          : x,
      ),
    );
    try {
      await toggleLikeDb(id, profile.id, wasLiked);
    } catch {
      refetchPosts();
    }
  };

  const toggleSave = async (id: string) => {
    const target = posts.find((p) => p.id === id);
    if (!target) return;
    const wasSaved = target.saved;
    setPosts((p) =>
      p.map((x) => (x.id === id ? { ...x, saved: !wasSaved } : x)),
    );
    try {
      await toggleSaveDb(id, profile.id, wasSaved);
    } catch {
      refetchPosts();
    }
  };

  const openComments = async (post: UIPost) => {
    setCommentPost(post);
    setCommentsLoading(true);
    const comments = await fetchComments(post.id);
    setCommentsLoading(false);
    setCommentPost((prev) =>
      prev && prev.id === post.id ? { ...prev, comments } : prev,
    );
  };

  const submitComment = async (text: string) => {
    if (!commentPost) return;
    await addCommentDb(commentPost.id, profile.id, text);
    const comments = await fetchComments(commentPost.id);
    setCommentPost((prev) => (prev ? { ...prev, comments } : prev));
    setPosts((p) =>
      p.map((x) =>
        x.id === commentPost.id
          ? { ...x, commentsCount: x.commentsCount + 1 }
          : x,
      ),
    );
  };

  const createOccurrence = async (
    file: File,
    caption: string,
    location: string,
    problemType: ProblemId,
    lat?: number,
    lng?: number,
  ) => {
    await createPostDb({
      userId: profile.id,
      file,
      caption,
      location,
      problemType,
      district: profile.district ?? "",
      latitude: lat,
      longitude: lng,
    });
    await refetchPosts();
  };

  // Handler de criação de eventos
  const createEventHandler = async (params: any) => {
    await createEvent({
      userId: profile.id,
      district: profile.district ?? "",
      ...params,
    });
    await refetchEvents();
    setShowEventModal(false);
  };

  const filtered =
    filterType === "todos"
      ? posts
      : posts.filter((p) => p.problemType === filterType);
  const unread = notifs.filter((n) => !n.read).length;
  const stats = {
    aberto: posts.filter((p) => p.status === "aberto").length,
    em_analise: posts.filter((p) => p.status === "em_analise").length,
    resolvido: posts.filter((p) => p.status === "resolvido").length,
  };

  const topReported = PROBLEM_TYPES.map((t) => ({
    ...t,
    count: posts.filter((p) => p.problemType === t.id).length,
  }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const NAV = [
    { id: "feed" as TabId, label: "Início", icon: Home },
    { id: "buscar" as TabId, label: "Explorar", icon: Search },
    { id: "eventos" as TabId, label: "Eventos", icon: Calendar },
    { id: "notif" as TabId, label: "Notificações", icon: Bell, badge: unread },
    { id: "perfil" as TabId, label: "Perfil", icon: User },
  ];

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <div className="hidden md:flex h-screen overflow-hidden">
        <aside
          className="w-64 shrink-0 border-r border-border flex flex-col py-6 px-4 gap-1"
          style={{ backgroundColor: "var(--sidebar)" }}
        >
          <div className="px-3 mb-6">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#f97316" }}
              >
                <span
                  className="text-sm font-black"
                  style={{ color: "#0f0f0f" }}
                >
                  P
                </span>
              </div>
              <div>
                <p className="text-sm font-black text-foreground leading-none">
                  Prefeitura
                </p>
                <p
                  className="text-xs font-semibold"
                  style={{ color: "#f97316" }}
                >
                  TamoAqui
                </p>
              </div>
            </div>
          </div>
          {NAV.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                if (id === "perfil") setViewedUsername(null);
              }}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === id ? "" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              style={
                activeTab === id
                  ? { backgroundColor: "#f97316", color: "#0f0f0f" }
                  : {}
              }
            >
              <Icon size={18} />
              {label}
              {badge ? (
                <span
                  className="ml-auto text-xs font-black px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: activeTab === id ? "#0f0f0f" : "#f97316",
                    color: activeTab === id ? "#f97316" : "#0f0f0f",
                  }}
                >
                  {badge}
                </span>
              ) : null}
            </button>
          ))}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold mt-2"
            style={{ backgroundColor: "#f97316", color: "#0f0f0f" }}
          >
            <PlusSquare size={18} />
            Nova Ocorrência
          </button>
          <button
            onClick={() => setShowEventModal(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold mt-1 bg-muted hover:bg-muted/80 text-foreground transition-colors"
          >
            <Calendar size={18} />
            Criar Evento
          </button>
          <button
            onClick={onToggleDark}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            {dark ? "Modo Claro" : "Modo Escuro"}
          </button>
          <div className="mt-auto border-t border-border pt-4 mx-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Resumo Geral
            </p>
            <div className="space-y-2 px-2">
              {[
                { label: "Abertos", dot: "bg-red-400", val: stats.aberto },
                {
                  label: "Em Análise",
                  dot: "bg-yellow-400",
                  val: stats.em_analise,
                },
                {
                  label: "Resolvidos",
                  dot: "bg-green-400",
                  val: stats.resolvido,
                },
              ].map(({ label, dot, val }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dot}`} />
                    <span className="text-xs font-semibold text-muted-foreground">
                      {label}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {val}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-2 mt-4 text-xs font-bold text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut size={13} />
              Sair
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-lg mx-auto py-6 px-4">
            {activeTab === "feed" && (
              <>
                <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
                  <button
                    onClick={() => setFilterType("todos")}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${filterType === "todos" ? "" : "bg-muted text-muted-foreground"}`}
                    style={
                      filterType === "todos"
                        ? { backgroundColor: "#f97316", color: "#0f0f0f" }
                        : {}
                    }
                  >
                    Todos
                  </button>
                  {PROBLEM_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setFilterType(t.id as ProblemId)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 ${filterType === t.id ? "" : "bg-muted text-muted-foreground"}`}
                      style={
                        filterType === t.id
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
                {filtered.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <AlertTriangle
                      size={32}
                      className="mx-auto mb-2 opacity-30"
                    />
                    <p className="text-sm font-semibold">
                      Nenhuma ocorrência por aqui ainda
                    </p>
                  </div>
                )}
                <div className="space-y-5">
                  {filtered.map((p) => (
                    <PostCard
                      key={p.id}
                      post={p}
                      onToggleLike={toggleLike}
                      onToggleSave={toggleSave}
                      onOpenComments={openComments}
                      onOpenProfile={openProfile}
                    />
                  ))}
                </div>
              </>
            )}
            {activeTab === "buscar" && (
              <ExploreTab
                posts={posts}
                onOpenComments={openComments}
                onOpenProfile={openProfile}
              />
            )}
            {activeTab === "eventos" && (
              <EventsTab
                events={events}
                onOpenModal={() => setShowEventModal(true)}
              />
            )}
            {activeTab === "notif" && (
              <NotifTab notifs={notifs} onMarkAll={onMarkAllRead} />
            )}
            {activeTab === "perfil" && (
              <>
                <ProfileTab
                  profile={profile}
                  posts={posts}
                  onLogout={onLogout}
                  viewedUsername={viewedUsername}
                  onBack={backToOwnProfile}
                  bannerUrl={profile.banner_url}
                  onChangeBanner={handleBannerChange}
                />

                {bannerError && (
                  <p className="text-xs font-semibold text-destructive mt-2 px-1">
                    {bannerError}
                  </p>
                )}

                {uploadingBanner && (
                  <p className="text-xs text-muted-foreground mt-2 px-1 flex items-center gap-1">
                    <RefreshCw size={12} className="animate-spin" />
                    Salvando capa…
                  </p>
                )}
              </>
            )}
          </div>
        </main>

        <aside
          className="w-72 shrink-0 border-l border-border py-6 px-4 overflow-y-auto scrollbar-hide"
          style={{ backgroundColor: "var(--sidebar)" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <img
              src={profile.avatar_url ?? DEFAULT_AVATAR}
              alt=""
              className="w-11 h-11 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-bold text-foreground">
                {profile.full_name}
              </p>
              <p className="text-xs text-muted-foreground">
                @{profile.username}
              </p>
            </div>
          </div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-primary" />
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                Mais Reportados
              </p>
            </div>
            <div className="space-y-2">
              {topReported.map((t, i) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-1"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black text-muted-foreground w-4">
                      {i + 1}
                    </span>
                    <t.icon size={14} style={{ color: t.color }} />
                    <span className="text-xs font-semibold text-foreground">
                      {t.label}
                    </span>
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{ color: t.color }}
                  >
                    {t.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={14} className="text-primary" />
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                Panorama Geral
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: "Total",
                  value: String(posts.length),
                  icon: AlertTriangle,
                  color: "#f97316",
                },
                {
                  label: "Resolvidos",
                  value: String(stats.resolvido),
                  icon: CheckCircle,
                  color: "#22c55e",
                },
                {
                  label: "Em Análise",
                  value: String(stats.em_analise),
                  icon: Clock,
                  color: "#facc15",
                },
                {
                  label: "Abertos",
                  value: String(stats.aberto),
                  icon: AlertTriangle,
                  color: "#ef4444",
                },
              ].map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className="bg-muted rounded-xl p-3 flex flex-col gap-1"
                >
                  <Icon size={14} style={{ color }} />
                  <p className="text-lg font-black text-foreground leading-none">
                    {value}
                  </p>
                  <p className="text-xs text-muted-foreground font-semibold">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="md:hidden flex flex-col h-screen">
        <header
          className="border-b border-border px-4 py-3 flex items-center justify-between shrink-0"
          style={{ backgroundColor: "var(--card)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#f97316" }}
            >
              <span className="text-xs font-black" style={{ color: "#0f0f0f" }}>
                P
              </span>
            </div>
            <span className="text-sm font-black text-foreground">TamoAqui</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleDark}
              className="text-muted-foreground p-1"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setShowEventModal(true)}
              className="text-muted-foreground p-1"
            >
              <Ticket size={22} />
            </button>
            <button onClick={() => setShowModal(true)} className="text-primary">
              <PlusSquare size={24} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="px-3 py-4">
            {activeTab === "feed" && (
              <>
                <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
                  <button
                    onClick={() => setFilterType("todos")}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${filterType === "todos" ? "" : "bg-muted text-muted-foreground"}`}
                    style={
                      filterType === "todos"
                        ? { backgroundColor: "#f97316", color: "#0f0f0f" }
                        : {}
                    }
                  >
                    Todos
                  </button>
                  {PROBLEM_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setFilterType(t.id as ProblemId)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1 ${filterType === t.id ? "" : "bg-muted text-muted-foreground"}`}
                      style={
                        filterType === t.id
                          ? { backgroundColor: `${t.color}20`, color: t.color }
                          : {}
                      }
                    >
                      <t.icon size={10} />
                      {t.label}
                    </button>
                  ))}
                </div>
                {filtered.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <AlertTriangle
                      size={32}
                      className="mx-auto mb-2 opacity-30"
                    />
                    <p className="text-sm font-semibold">
                      Nenhuma ocorrência por aqui ainda
                    </p>
                  </div>
                )}
                <div className="space-y-4">
                  {filtered.map((p) => (
                    <PostCard
                      key={p.id}
                      post={p}
                      onToggleLike={toggleLike}
                      onToggleSave={toggleSave}
                      onOpenComments={openComments}
                      onOpenProfile={openProfile}
                    />
                  ))}
                </div>
              </>
            )}
            {activeTab === "buscar" && (
              <ExploreTab
                posts={posts}
                onOpenComments={openComments}
                onOpenProfile={openProfile}
              />
            )}
            {activeTab === "eventos" && (
              <EventsTab
                events={events}
                onOpenModal={() => setShowEventModal(true)}
              />
            )}
            {activeTab === "notif" && (
              <NotifTab notifs={notifs} onMarkAll={onMarkAllRead} />
            )}
            {activeTab === "perfil" && (
              <>
                <ProfileTab
                  profile={profile}
                  posts={posts}
                  onLogout={onLogout}
                  viewedUsername={viewedUsername}
                  onBack={backToOwnProfile}
                  bannerUrl={profile.banner_url}
                  onChangeBanner={handleBannerChange}
                />

                {bannerError && (
                  <p className="text-xs font-semibold text-destructive mt-2 px-1">
                    {bannerError}
                  </p>
                )}

                {uploadingBanner && (
                  <p className="text-xs text-muted-foreground mt-2 px-1 flex items-center gap-1">
                    <RefreshCw size={12} className="animate-spin" />
                    Salvando capa…
                  </p>
                )}
              </>
            )}
          </div>
        </main>
        <nav
          className="border-t border-border flex items-center justify-around py-3 px-4 shrink-0"
          style={{ backgroundColor: "var(--card)" }}
        >
          {NAV.map(({ id, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                if (id === "perfil") setViewedUsername(null);
              }}
              className={`relative p-2 rounded-xl ${activeTab === id ? "text-primary" : "text-muted-foreground"}`}
            >
              <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 1.5} />
              {badge ? (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs font-black flex items-center justify-center"
                  style={{ backgroundColor: "#f97316", color: "#0f0f0f" }}
                >
                  {badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
      </div>

      <AnimatePresence>
        {showModal && (
          <CreatePostModal
            onClose={() => setShowModal(false)}
            onCreate={createOccurrence}
          />
        )}
        {showEventModal && (
          <CreateEventModal
            onClose={() => setShowEventModal(false)}
            onCreate={createEventHandler}
          />
        )}
        {commentPost && (
          <CommentSheet
            post={commentPost}
            loading={commentsLoading}
            onClose={() => setCommentPost(null)}
            onSubmitComment={submitComment}
          />
        )}
      </AnimatePresence>
      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
// ─── Authenticated shell (busca posts + notificações reais) ──────────────────
