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
import { EVENT_CATEGORIES, PROBLEM_TYPES, STATUS_META } from "../constants";
import { ProblemBadge, StatusBadge } from "../components/common";

export function CommentSheet({
  post,
  loading,
  onClose,
  onSubmitComment,
}: {
  post: UIPost;
  loading: boolean;
  onClose: () => void;
  onSubmitComment: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await onSubmitComment(text.trim());
      setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="bg-card border border-border rounded-t-2xl md:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-primary" />
            <h2 className="text-sm font-bold text-foreground">Comentários</h2>
            <span className="text-xs font-bold text-muted-foreground">
              ({post.comments.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-3 border-b border-border flex items-center gap-3 shrink-0">
          <img
            src={post.image}
            alt=""
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground truncate">
              @{post.user}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {post.caption.slice(0, 60)}…
            </p>
          </div>
          <ProblemBadge typeId={post.problemType} />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-3 space-y-4">
          {loading && (
            <div className="text-center py-10">
              <RefreshCw
                size={20}
                className="mx-auto animate-spin text-muted-foreground"
              />
            </div>
          )}
          {!loading && post.comments.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">
                Seja o primeiro a comentar
              </p>
            </div>
          )}
          {!loading &&
            post.comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <img
                  src={c.avatar}
                  alt={c.user}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <div className="flex-1">
                  <div className="bg-muted rounded-xl px-3 py-2">
                    <p className="text-xs font-bold text-foreground mb-0.5">
                      @{c.user}
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {c.text}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 px-1">
                    <span className="text-xs text-muted-foreground">
                      {c.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center gap-3 shrink-0">
          <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-4 py-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Adicione um comentário..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button
              onClick={submit}
              disabled={!text.trim() || sending}
              className="text-primary disabled:opacity-30"
            >
              {sending ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

export function PostCard({
  post,
  onToggleLike,
  onToggleSave,
  onOpenComments,
  onOpenProfile,
}: {
  post: UIPost;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onOpenComments: (p: UIPost) => void;
  onOpenProfile?: (username: string) => void;
}) {
  const prob = PROBLEM_TYPES.find((t) => t.id === post.problemType)!;
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => onOpenProfile?.(post.user)}
          className="flex items-center gap-3 text-left"
        >
          <div
            className="w-9 h-9 rounded-full overflow-hidden"
            style={{ outline: `2px solid ${prob.color}`, outlineOffset: "2px" }}
          >
            <img
              src={post.avatar}
              alt={post.user}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-none mb-0.5 hover:underline">
              @{post.user}
            </p>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin size={10} />
              <span className="text-xs">{post.location}</span>
            </div>
          </div>
        </button>
        <StatusBadge status={post.status} />
      </div>
      <div
        className="mx-4 mb-3 px-3 py-2 rounded-xl flex items-center gap-2"
        style={{
          backgroundColor: `${prob.color}15`,
          borderLeft: `3px solid ${prob.color}`,
        }}
      >
        <prob.icon size={14} style={{ color: prob.color }} />
        <span className="text-xs font-bold" style={{ color: prob.color }}>
          Tipo de Problema:
        </span>
        <span className="text-xs font-semibold text-foreground">
          {prob.label}
        </span>
      </div>
      <div className="relative mx-4 rounded-xl overflow-hidden bg-muted aspect-square">
        <img
          src={post.image}
          alt="Problema"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onToggleLike(post.id)}
            className="flex items-center gap-1.5"
          >
            <Heart
              size={22}
              className={
                post.liked
                  ? "fill-primary text-primary"
                  : "text-muted-foreground"
              }
            />
            <span className="text-sm font-semibold text-muted-foreground">
              {post.likes}
            </span>
          </button>
          <button
            onClick={() => onOpenComments(post)}
            className="flex items-center gap-1.5"
          >
            <MessageCircle size={22} className="text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground">
              {post.commentsCount}
            </span>
          </button>
          <button>
            <Share2 size={22} className="text-muted-foreground" />
          </button>
        </div>
        <button onClick={() => onToggleSave(post.id)}>
          <Bookmark
            size={22}
            className={
              post.saved ? "fill-primary text-primary" : "text-muted-foreground"
            }
          />
        </button>
      </div>
      <div className="px-4 pb-4">
        <p className="text-sm text-foreground leading-relaxed">
          <span className="font-bold mr-1">@{post.user}</span>
          {post.caption}
        </p>
        <button
          onClick={() => onOpenComments(post)}
          className="text-xs text-muted-foreground mt-1 hover:text-primary transition-colors"
        >
          Ver todos os {post.commentsCount} comentários
        </button>
        <p className="text-xs text-muted-foreground mt-1">{post.time} atrás</p>
      </div>
    </motion.article>
  );
}

// ─── Create Post Modal ────────────────────────────────────────────────────────

export function CreatePostModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (
    file: File,
    caption: string,
    location: string,
    problemType: ProblemId,
    lat?: number,
    lng?: number,
  ) => Promise<void>;
}) {
  const [step, setStep] = useState<"upload" | "details">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loc, setLoc] = useState<LocationValue | null>(null);
  const [problemType, setProblemType] = useState<ProblemId | null>(null);
  const [dropOpen, setDropOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const sel = PROBLEM_TYPES.find((t) => t.id === problemType);

  const pickFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep("details");
  };

  const submit = async () => {
    if (!problemType || !caption || !file) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await onCreate(
        file,
        caption,
        loc?.address ?? "",
        problemType,
        loc?.lat,
        loc?.lng,
      );
      onClose();
    } catch (err) {
      console.error(err);
      setSubmitError("Não foi possível publicar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

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
          <h2 className="text-base font-bold text-foreground">
            Nova Ocorrência
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>
        {step === "upload" ? (
          <div className="p-6 flex flex-col items-center gap-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary transition-colors bg-muted/40"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera size={24} className="text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Toque para adicionar foto
              </p>
              <p className="text-xs text-muted-foreground">JPG, PNG ou HEIC</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) pickFile(f);
              }}
            />
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
            {preview && (
              <div className="relative w-full h-48 rounded-xl overflow-hidden bg-muted">
                <img
                  src={preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => {
                    setPreview(null);
                    setFile(null);
                    setStep("upload");
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Tipo de Problema *
              </label>
              <div className="relative">
                <button
                  onClick={() => setDropOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-input-background text-sm font-semibold text-foreground"
                >
                  {sel ? (
                    <span className="flex items-center gap-2">
                      <sel.icon size={16} style={{ color: sel.color }} />
                      {sel.label}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Selecione o tipo...
                    </span>
                  )}
                  <ChevronDown
                    size={16}
                    className={`text-muted-foreground transition-transform ${dropOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {dropOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-xl overflow-hidden shadow-xl">
                    {PROBLEM_TYPES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setProblemType(t.id as ProblemId);
                          setDropOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted text-sm font-semibold text-foreground text-left"
                      >
                        <t.icon size={16} style={{ color: t.color }} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Localização
              </label>
              <LocationPicker value={loc} onChange={setLoc} />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Descrição *
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                placeholder="Descreva o problema encontrado..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none"
              />
            </div>
            {submitError && (
              <p className="text-xs font-semibold text-destructive">
                {submitError}
              </p>
            )}
            <button
              onClick={submit}
              disabled={!problemType || !caption || submitting}
              className="w-full py-3.5 rounded-xl text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#f97316", color: "#0f0f0f" }}
            >
              {submitting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Publicando…
                </>
              ) : (
                "Publicar Ocorrência"
              )}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Event Card ────────────────────────────────────────────────────────

export function EventCard({ event }: { event: UIEvent }) {
  const cat = EVENT_CATEGORIES.find((c) => c.id === event.category)!;
  const dateLabel = new Date(event.eventDate + "T00:00:00").toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "short",
    },
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      {event.image && (
        <div className="relative w-full h-40 bg-muted">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
          >
            <cat.icon size={11} />
            {cat.label}
          </span>
          <span className="text-xs font-bold text-muted-foreground ml-auto">
            {dateLabel}
            {event.eventTime ? ` · ${event.eventTime}` : ""}
          </span>
        </div>
        <h3 className="text-sm font-bold text-foreground">{event.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {event.description}
        </p>
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin size={11} />
          <span className="text-xs">{event.location}</span>
        </div>
        <p className="text-xs text-muted-foreground">por @{event.user}</p>
      </div>
    </motion.article>
  );
}

// ─── create event modal ────────────────────────────────────────────────────────

export function CreateEventModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (params: {
    title: string;
    description: string;
    eventDate: string;
    eventTime: string;
    location: string;
    category: EventCategory;
    file: File | null;
  }) => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<EventCategory | null>(null);
  const [dropOpen, setDropOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const sel = EVENT_CATEGORIES.find((c) => c.id === category);

  const submit = async () => {
    if (!title || !description || !eventDate || !category) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await onCreate({
        title,
        description,
        eventDate,
        eventTime,
        location,
        category,
        file,
      });
      onClose();
    } catch (err) {
      console.error(err);
      setSubmitError("Não foi possível publicar o evento. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

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
        className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-bold text-foreground">Novo Evento</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary bg-muted/40 overflow-hidden"
          >
            {preview ? (
              <img
                src={preview}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <Camera size={20} className="text-primary" />
                <p className="text-xs text-muted-foreground">
                  Foto do evento (opcional)
                </p>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setFile(f);
                setPreview(URL.createObjectURL(f));
              }
            }}
          />

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Categoria *
            </label>
            <div className="relative">
              <button
                onClick={() => setDropOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-input-background text-sm font-semibold text-foreground"
              >
                {sel ? (
                  <span className="flex items-center gap-2">
                    <sel.icon size={16} style={{ color: sel.color }} />
                    {sel.label}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Selecione a categoria...
                  </span>
                )}
                <ChevronDown
                  size={16}
                  className={dropOpen ? "rotate-180" : ""}
                />
              </button>
              {dropOpen && (
                <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-xl overflow-hidden shadow-xl">
                  {EVENT_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCategory(c.id as EventCategory);
                        setDropOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted text-sm font-semibold text-foreground text-left"
                    >
                      <c.icon size={16} style={{ color: c.color }} />
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Título *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Feira Comunitária"
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-background text-sm text-foreground outline-none"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Data *
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background text-sm text-foreground outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Horário
              </label>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background text-sm text-foreground outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Localização
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Praça Central"
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-background text-sm text-foreground outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Descrição *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-background text-sm text-foreground outline-none resize-none"
            />
          </div>

          {submitError && (
            <p className="text-xs font-semibold text-destructive">
              {submitError}
            </p>
          )}
          <button
            onClick={submit}
            disabled={
              !title || !description || !eventDate || !category || submitting
            }
            className="w-full py-3.5 rounded-xl text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ backgroundColor: "#f97316", color: "#0f0f0f" }}
          >
            {submitting ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Publicando…
              </>
            ) : (
              "Publicar Evento"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Events Tab ───────────────────────────────────────────────────────────────

export function EventsTab({
  events,
  onOpenModal,
}: {
  events: UIEvent[];
  onOpenModal: () => void;
}) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const sorted = [...events].sort((a, b) =>
    a.eventDate.localeCompare(b.eventDate),
  );
  const upcoming = sorted.filter((e) => e.eventDate >= todayStr);
  const past = sorted.filter((e) => e.eventDate < todayStr).reverse();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-foreground">Eventos</h2>
        <button
          onClick={onOpenModal}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
          style={{ backgroundColor: "#f97316", color: "#0f0f0f" }}
        >
          <Ticket size={14} />
          Criar Evento
        </button>
      </div>

      {events.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Ticket size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold">Nenhum evento por aqui ainda</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Próximos
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Passados
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-70">
            {past.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Explore Tab ──────────────────────────────────────────────────────────────

export function ExploreTab({
  posts,
  onOpenComments,
  onOpenProfile,
}: {
  posts: UIPost[];
  onOpenComments: (p: UIPost) => void;
  onOpenProfile?: (username: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [fs, setFs] = useState<PostStatus | "todos">("todos");
  const [fp, setFp] = useState<ProblemId | "todos">("todos");

  const filtered = posts.filter((p) => {
    const ms = fs === "todos" || p.status === fs;
    const mp = fp === "todos" || p.problemType === fp;
    const mq =
      !query ||
      [p.caption, p.location, p.user].some((s) =>
        s.toLowerCase().includes(query.toLowerCase()),
      );
    return ms && mp && mq;
  });

  const showResults = !!(query || fs !== "todos" || fp !== "todos");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-2xl">
        <Search size={16} className="text-muted-foreground shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por local, usuário ou descrição..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        {query && (
          <button onClick={() => setQuery("")}>
            <X size={14} className="text-muted-foreground" />
          </button>
        )}
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Filter size={11} />
            Status
          </p>
          <div className="flex flex-wrap gap-2">
            {(["todos", "aberto", "em_analise", "resolvido"] as const).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setFs(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${fs === s ? "" : "bg-muted text-muted-foreground"}`}
                  style={
                    fs === s
                      ? { backgroundColor: "#f97316", color: "#0f0f0f" }
                      : {}
                  }
                >
                  {s === "todos" ? "Todos" : STATUS_META[s].label}
                </button>
              ),
            )}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Filter size={11} />
            Tipo
          </p>
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
              Todos
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
      </div>
      {!showResults && (
        <div className="grid grid-cols-3 gap-1.5">
          {posts.map((p) => {
            const pr = PROBLEM_TYPES.find((t) => t.id === p.problemType)!;
            return (
              <div
                key={p.id}
                onClick={() => onOpenComments(p)}
                className="relative aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer"
              >
                <img
                  src={p.image}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-3 text-white text-xs font-bold">
                    <span className="flex items-center gap-1">
                      <Heart size={12} />
                      {p.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={12} />
                      {p.commentsCount}
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-1.5 left-1.5">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${pr.color}cc` }}
                  >
                    <pr.icon size={10} style={{ color: "#fff" }} />
                  </span>
                </div>
              </div>
            );
          })}
          {posts.length === 0 && (
            <div className="col-span-3 text-center py-10 text-muted-foreground">
              <Search size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">Nenhuma ocorrência ainda</p>
            </div>
          )}
        </div>
      )}
      {showResults && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-semibold">
            {filtered.length} ocorrência{filtered.length !== 1 ? "s" : ""}{" "}
            encontrada{filtered.length !== 1 ? "s" : ""}
          </p>
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Search size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">
                Nenhuma ocorrência encontrada
              </p>
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 bg-muted/40 rounded-xl p-3"
              >
                <img
                  src={p.image}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => onOpenProfile?.(p.user)}
                    className="text-xs font-bold text-foreground hover:underline text-left"
                  >
                    @{p.user}
                  </button>
                  <p className="text-xs text-muted-foreground truncate">
                    {p.caption.slice(0, 50)}…
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <ProblemBadge typeId={p.problemType} />
                    <StatusBadge status={p.status} />
                  </div>
                </div>
                <button
                  onClick={() => onOpenComments(p)}
                  className="text-muted-foreground hover:text-primary shrink-0"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

export function NotifTab({
  notifs,
  onMarkAll,
}: {
  notifs: UINotification[];
  onMarkAll: () => void;
}) {
  const unread = notifs.filter((n) => !n.read).length;
  const icon = (t: string) =>
    t === "like" ? (
      <Heart size={14} className="text-red-400" />
    ) : t === "comment" ? (
      <MessageCircle size={14} className="text-blue-400" />
    ) : t === "status" ? (
      <CheckCircle size={14} className="text-green-400" />
    ) : (
      <Bell size={14} className="text-primary" />
    );
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-black text-foreground">Notificações</h2>
          {unread > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: "#f97316", color: "#0f0f0f" }}
            >
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={onMarkAll}
            className="text-xs font-bold text-primary"
          >
            Marcar tudo como lido
          </button>
        )}
      </div>
      {notifs.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Bell size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold">Nenhuma notificação ainda</p>
        </div>
      )}
      <div className="space-y-1">
        {notifs.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-3 p-3 rounded-xl ${n.read ? "" : "bg-primary/5 border border-primary/10"}`}
          >
            <div className="relative shrink-0">
              <span className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                {icon(n.type)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">
                {n.message}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {n.time} atrás
              </p>
            </div>
            {n.postImage && (
              <img
                src={n.postImage}
                alt=""
                className="w-10 h-10 rounded-lg object-cover shrink-0"
              />
            )}
            {!n.read && (
              <span
                className="w-2 h-2 rounded-full mt-2 shrink-0"
                style={{ backgroundColor: "#f97316" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Avatar Crop Modal (arrastar + zoom pra centralizar, estilo redes sociais) ─
