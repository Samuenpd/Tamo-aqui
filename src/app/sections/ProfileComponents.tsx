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
  DEFAULT_AVATAR,
  DEFAULT_BANNER,
  DISTRICTS,
  PROBLEM_TYPES,
} from "../constants";
import { ProblemBadge, StatusBadge } from "../components/common";
import { PostCard } from "./OccurrenceComponents";

export function AvatarCropModal({
  file,
  saving,
  onClose,
  onConfirm,
}: {
  file: File;
  saving: boolean;
  onClose: () => void;
  onConfirm: (cropped: File) => void;
}) {
  const VIEWPORT = 280;
  const [imgSrc] = useState(() => URL.createObjectURL(file));
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [baseScale, setBaseScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => () => URL.revokeObjectURL(imgSrc), [imgSrc]);

  const clamp = (
    val: { x: number; y: number },
    scale: number,
    w: number,
    h: number,
  ) => {
    const maxX = Math.max(0, (w * scale) / 2 - VIEWPORT / 2);
    const maxY = Math.max(0, (h * scale) / 2 - VIEWPORT / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, val.x)),
      y: Math.min(maxY, Math.max(-maxY, val.y)),
    };
  };

  const onImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    const w = img.naturalWidth,
      h = img.naturalHeight;
    const cover = Math.max(VIEWPORT / w, VIEWPORT / h);
    setNatural({ w, h });
    setBaseScale(cover);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const effectiveScale = baseScale * zoom;

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = offset;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset(
      clamp(
        { x: offsetStart.current.x + dx, y: offsetStart.current.y + dy },
        effectiveScale,
        natural.w,
        natural.h,
      ),
    );
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  const onZoomChange = (val: number) => {
    setZoom(val);
    setOffset((prev) => clamp(prev, baseScale * val, natural.w, natural.h));
  };

  const generate = () => {
    if (!imgRef.current || !natural.w) return;
    const OUTPUT = 512;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ratio = OUTPUT / VIEWPORT;
    ctx.save();
    ctx.translate(OUTPUT / 2, OUTPUT / 2);
    ctx.scale(ratio, ratio);
    ctx.translate(offset.x, offset.y);
    ctx.scale(effectiveScale, effectiveScale);
    ctx.translate(-natural.w / 2, -natural.h / 2);
    ctx.drawImage(imgRef.current, 0, 0, natural.w, natural.h);
    ctx.restore();
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onConfirm(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-bold text-foreground">Ajustar Foto</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 flex flex-col items-center gap-5">
          <div
            className="relative rounded-full overflow-hidden bg-muted touch-none select-none cursor-grab active:cursor-grabbing"
            style={{ width: VIEWPORT, height: VIEWPORT }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            <img
              ref={imgRef}
              src={imgSrc}
              onLoad={onImgLoad}
              alt=""
              draggable={false}
              className="absolute top-1/2 left-1/2 max-w-none pointer-events-none"
              style={{
                width: natural.w,
                height: natural.h,
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${effectiveScale})`,
                transformOrigin: "center",
              }}
            />
            <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-white/40 pointer-events-none" />
          </div>

          <div className="w-full flex items-center gap-3">
            <span className="text-xs text-muted-foreground shrink-0">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => onZoomChange(parseFloat(e.target.value))}
              className="flex-1 accent-primary"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center -mt-2">
            Arraste a foto para centralizar
          </p>

          <button
            onClick={generate}
            disabled={saving || !natural.w}
            className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
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
                Salvar Foto
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Settings Modal ─────────────────────────────────────────────────────────

export function SettingsModal({
  profile,
  onClose,
  onLogout,
}: {
  profile: Profile;
  onClose: () => void;
  onLogout: () => void;
}) {
  const { updateProfile, updatePassword } = useAuth();
  const [fullName, setFullName] = useState(profile.full_name);
  const [username, setUsername] = useState(profile.username);
  const [district, setDistrict] = useState(profile.district ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  const saveProfile = async () => {
    setProfileError("");
    setProfileSaved(false);
    if (!fullName.trim()) {
      setProfileError("Nome não pode ficar em branco.");
      return;
    }
    if (username.length < 3 || !/^[a-z0-9_]+$/.test(username)) {
      setProfileError(
        "Usuário inválido (mín. 3 caracteres, letras minúsculas/números/_).",
      );
      return;
    }
    setSavingProfile(true);
    const { error } = await updateProfile({
      fullName,
      username,
      district,
      bio: bio.trim(),
    });
    setSavingProfile(false);
    if (error) setProfileError(error);
    else {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    }
  };

  const savePassword = async () => {
    setPasswordError("");
    setPasswordSaved(false);
    if (newPassword.length < 6) {
      setPasswordError("Mínimo 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem.");
      return;
    }
    setSavingPassword(true);
    const { error } = await updatePassword(newPassword);
    setSavingPassword(false);
    if (error) setPasswordError(error);
    else {
      setPasswordSaved(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 2500);
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
        className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-primary" />
            <h2 className="text-sm font-bold text-foreground">Configurações</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Dados Pessoais
            </p>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Nome Completo
              </label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-input-background">
                <User size={15} className="text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Nome de Usuário
              </label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-input-background">
                <span className="text-muted-foreground text-sm font-bold shrink-0">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                    )
                  }
                  className="flex-1 bg-transparent text-sm text-foreground outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Bio
              </label>
              <div className="px-4 py-3 rounded-xl border border-border bg-input-background">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 180))}
                  maxLength={180}
                  rows={3}
                  placeholder="Conte um pouco sobre você…"
                  className="w-full bg-transparent text-sm text-foreground outline-none resize-none"
                />
                <p className="text-[10px] text-muted-foreground text-right mt-1">
                  {bio.length}/180
                </p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Bairro / Região
              </label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-input-background">
                <MapPin size={15} className="text-muted-foreground shrink-0" />
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none appearance-none cursor-pointer"
                >
                  <option value="" className="bg-card">
                    Selecione…
                  </option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d} className="bg-card">
                      {d}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="text-muted-foreground shrink-0 pointer-events-none"
                />
              </div>
            </div>
            {profileError && (
              <p className="text-xs font-semibold text-destructive">
                {profileError}
              </p>
            )}
            {profileSaved && (
              <p className="text-xs font-semibold text-green-400 flex items-center gap-1">
                <CheckCircle size={13} />
                Dados atualizados!
              </p>
            )}
            <button
              onClick={saveProfile}
              disabled={savingProfile}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: "#f97316", color: "#0f0f0f" }}
            >
              {savingProfile ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  Salvando…
                </>
              ) : (
                "Salvar Dados"
              )}
            </button>
          </div>

          <div className="h-px bg-border" />

          <div className="space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Alterar Senha
            </p>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Nova Senha
              </label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-input-background">
                <Lock size={15} className="text-muted-foreground shrink-0" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Confirmar Nova Senha
              </label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-input-background">
                <Lock size={15} className="text-muted-foreground shrink-0" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
            </div>
            {passwordError && (
              <p className="text-xs font-semibold text-destructive">
                {passwordError}
              </p>
            )}
            {passwordSaved && (
              <p className="text-xs font-semibold text-green-400 flex items-center gap-1">
                <CheckCircle size={13} />
                Senha alterada!
              </p>
            )}
            <button
              onClick={savePassword}
              disabled={savingPassword || !newPassword}
              className="w-full py-3 rounded-xl text-sm font-bold bg-muted text-foreground flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {savingPassword ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  Salvando…
                </>
              ) : (
                "Alterar Senha"
              )}
            </button>
          </div>

          <div className="h-px bg-border" />

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={16} />
            Sair da conta
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Profile Banner ───────────────────────────────────────────────────────────
export function ProfileBanner({
  url,
  editable = false,
  onChangeFile,
}: {
  url?: string | null;
  editable?: boolean;
  onChangeFile?: (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const openPicker = () => {
    if (editable) fileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChangeFile?.(file);
    e.target.value = "";
  };

  return (
    <div
      className={`relative z-0 h-28 rounded-2xl overflow-hidden mb-0 group bg-muted ${editable ? "cursor-pointer" : ""}`}
      onClick={openPicker}
      role={editable ? "button" : undefined}
      tabIndex={editable ? 0 : undefined}
      onKeyDown={(e) => {
        if (editable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          openPicker();
        }
      }}
      aria-label={editable ? "Alterar banner do perfil" : "Banner do perfil"}
    >
      {url ? (
        <img
          src={url}
          alt="Capa do perfil"
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full"
          style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
        />
      )}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 25%, rgba(15,15,15,0.72))",
        }}
      />
      {editable && (
        <>
          <label
            htmlFor={inputId}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-black/70 text-white cursor-pointer opacity-100 shadow-md"
          >
            <Camera size={13} />
            Alterar capa
          </label>
          <input
            id={inputId}
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

export function ProfileTab({
  profile,
  posts,
  onLogout,
  viewedUsername,
  onBack,
  bannerUrl,
  onChangeBanner,
}: {
  profile: Profile;
  posts: UIPost[];
  onLogout: () => void;
  viewedUsername?: string | null;
  onBack?: () => void;
  bannerUrl?: string | null;
  onChangeBanner?: (file: File) => void;
}) {
  const { updateAvatar } = useAuth();
  const [pTab, setPTab] = useState<"posts" | "saved">("posts");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [following, setFollowing] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = !viewedUsername || viewedUsername === profile.username;
  const targetUsername = viewedUsername || profile.username;

  const userPosts = isOwnProfile
    ? posts.filter((p) => p.userId === profile.id)
    : posts.filter((p) => p.user === targetUsername);
  const saved = posts.filter((p) => p.saved);
  const display = isOwnProfile
    ? pTab === "saved"
      ? saved
      : userPosts
    : userPosts;
  const resolved = userPosts.filter((p) => p.status === "resolvido").length;
  const totalLikes = userPosts.reduce((a, p) => a + p.likes, 0);
  const otherAvatar = userPosts[0]?.avatar ?? DEFAULT_AVATAR;
  const otherDistrict = userPosts[0]?.district;

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCropFile(file);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleCropConfirm = async (croppedFile: File) => {
    setUploadingAvatar(true);
    setAvatarError("");
    const { error } = await updateAvatar(croppedFile);
    setUploadingAvatar(false);
    setCropFile(null);
    if (error)
      setAvatarError("Não foi possível atualizar a foto. Tente novamente.");
  };

  return (
    <div>
      {!isOwnProfile && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ChevronRight size={16} className="rotate-180" />
          Voltar
        </button>
      )}
      <ProfileBanner
        url={isOwnProfile ? bannerUrl : DEFAULT_BANNER}
        editable={isOwnProfile}
        onChangeFile={onChangeBanner}
      />
      <div className="relative z-10 flex items-end gap-4 -mt-10 mb-4 px-1">
        <div className="relative shrink-0">
          {isOwnProfile ? (
            <>
              <div
                className="relative z-20 w-20 h-20 rounded-full overflow-hidden border-4 bg-muted"
                style={{ borderColor: "#f97316" }}
              >
                <img
                  src={profile.avatar_url ?? DEFAULT_AVATAR}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <RefreshCw size={18} className="text-white animate-spin" />
                  </div>
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-background shadow-lg"
                style={{ backgroundColor: "#f97316" }}
                aria-label="Trocar foto de perfil"
              >
                <Camera size={13} style={{ color: "#0f0f0f" }} />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFilePicked}
              />
            </>
          ) : (
            <div
              className="relative z-20 w-20 h-20 rounded-full overflow-hidden border-4 bg-muted"
              style={{ borderColor: "#f97316" }}
            >
              <img
                src={otherAvatar || DEFAULT_AVATAR}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        <div className="relative z-20 flex-1 min-w-0 pb-1 rounded-xl px-2 py-1 bg-background/90 backdrop-blur-sm">
          <h2 className="text-base font-black text-foreground leading-none">
            {isOwnProfile ? profile.full_name : `@${targetUsername}`}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            @{targetUsername}
            {isOwnProfile
              ? profile.district
                ? ` · ${profile.district}`
                : ""
              : otherDistrict
                ? ` · ${otherDistrict}`
                : ""}
          </p>
        </div>
        {isOwnProfile ? (
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors pb-2"
            aria-label="Configurações"
          >
            <Settings size={16} />
          </button>
        ) : (
          <button
            onClick={() => setFollowing((f) => !f)}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={
              following
                ? {
                    backgroundColor: "var(--muted)",
                    color: "var(--muted-foreground)",
                  }
                : { backgroundColor: "#f97316", color: "#0f0f0f" }
            }
          >
            {following ? "Seguindo" : "Seguir"}
          </button>
        )}
      </div>
      {avatarError && (
        <p className="text-xs font-semibold text-destructive px-1 mb-3">
          {avatarError}
        </p>
      )}
      <p className="text-sm text-foreground leading-relaxed mb-4 px-1 whitespace-pre-wrap">
        {isOwnProfile
          ? (profile.bio ?? "")
          : "Cidadão engajado, reportando problemas urbanos para construir uma cidade melhor. 🏙️"}
      </p>
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[
          {
            label: "Reportes",
            value: userPosts.length,
            icon: AlertTriangle,
            color: "#f97316",
          },
          {
            label: "Resolvidos",
            value: resolved,
            icon: CheckCircle,
            color: "#22c55e",
          },
          {
            label: "Curtidas",
            value: totalLikes,
            icon: Heart,
            color: "#ef4444",
          },
          {
            label: "Pontos",
            value: isOwnProfile ? profile.points : userPosts.length * 40,
            icon: Award,
            color: "#a78bfa",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-muted rounded-xl p-2.5 flex flex-col items-center gap-1"
          >
            <Icon size={14} style={{ color }} />
            <p className="text-base font-black text-foreground leading-none">
              {value}
            </p>
            <p className="text-xs text-muted-foreground font-semibold text-center">
              {label}
            </p>
          </div>
        ))}
      </div>
      {isOwnProfile && (
        <div className="flex items-center gap-1 mb-4 bg-muted rounded-xl p-1">
          {(["posts", "saved"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setPTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${pTab === t ? "" : "text-muted-foreground"}`}
              style={
                pTab === t
                  ? { backgroundColor: "#f97316", color: "#0f0f0f" }
                  : {}
              }
            >
              {t === "posts" ? "Meus Reportes" : "Salvos"}
            </button>
          ))}
          <div className="flex gap-1 ml-1">
            <button
              onClick={() => setView("grid")}
              className={`p-1.5 rounded-lg ${view === "grid" ? "text-primary" : "text-muted-foreground"}`}
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-lg ${view === "list" ? "text-primary" : "text-muted-foreground"}`}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      )}
      {!isOwnProfile && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Reportes de @{targetUsername}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setView("grid")}
              className={`p-1.5 rounded-lg ${view === "grid" ? "text-primary" : "text-muted-foreground"}`}
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-lg ${view === "list" ? "text-primary" : "text-muted-foreground"}`}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      )}
      {display.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Bookmark size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold">
            {isOwnProfile
              ? pTab === "saved"
                ? "Nenhuma ocorrência salva"
                : "Você ainda não reportou nada"
              : "Nenhuma ocorrência ainda"}
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-3 gap-1.5">
          {display.map((p) => {
            const pr = PROBLEM_TYPES.find((t) => t.id === p.problemType)!;
            return (
              <div
                key={p.id}
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
        </div>
      ) : (
        <div className="space-y-3">
          {display.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 bg-muted/40 rounded-xl p-3"
            >
              <img
                src={p.image}
                alt=""
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{p.location}</p>
                <p className="text-sm text-foreground font-semibold truncate">
                  {p.caption.slice(0, 55)}…
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <ProblemBadge typeId={p.problemType} />
                  <StatusBadge status={p.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {isOwnProfile && (
        <div className="mt-8 pt-4 border-t border-border">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut size={16} />
            Sair da conta
          </button>
        </div>
      )}
      <AnimatePresence>
        {cropFile && (
          <AvatarCropModal
            file={cropFile}
            saving={uploadingAvatar}
            onClose={() => setCropFile(null)}
            onConfirm={handleCropConfirm}
          />
        )}
        {showSettings && (
          <SettingsModal
            profile={profile}
            onClose={() => setShowSettings(false)}
            onLogout={onLogout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Prefeitura – Status Modal ────────────────────────────────────────────────
