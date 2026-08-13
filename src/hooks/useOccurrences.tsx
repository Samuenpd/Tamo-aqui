import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// ─── Tipos que espelham o que a UI (App.tsx) já espera ─────────────────────

export type ProblemId =
  | "buraco" | "iluminacao" | "lixo" | "alagamento" | "calcada" | "arvore" | "sinalizacao";
export type PostStatus = "aberto" | "em_analise" | "resolvido";

export interface UIComment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
}

export interface UIPost {
  id: string;
  userId: string;
  user: string;
  avatar: string;
  location: string;
  image: string;
  caption: string;
  problemType: ProblemId;
  likes: number;
  comments: UIComment[]; // preenchido sob demanda (ver fetchComments)
  commentsCount: number;
  time: string;
  status: PostStatus;
  liked: boolean;
  saved: boolean;
  district: string;
}

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&auto=format";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

// ─── Fetch da lista principal de posts ──────────────────────────────────────
// Faz 3 queries simples (posts+perfil, likes do usuário, saves do usuário)
// em vez de um join complexo — mais fácil de debugar e ajustar.

export function usePosts(currentUserId: string | null) {
  const [posts, setPosts] = useState<UIPost[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);

    const { data: rows, error } = await supabase
      .from("posts")
      .select(
        `id, user_id, location, image_url, caption, problem_type, status, district, created_at,
         profiles:user_id ( username, avatar_url ),
         likes:likes(count),
         comments:comments(count)`
      )
      .order("created_at", { ascending: false });

    if (error || !rows) {
      console.error(error);
      setLoading(false);
      return;
    }

    let likedSet = new Set<string>();
    let savedSet = new Set<string>();

    if (currentUserId) {
      const [{ data: myLikes }, { data: mySaves }] = await Promise.all([
        supabase.from("likes").select("post_id").eq("user_id", currentUserId),
        supabase.from("saves").select("post_id").eq("user_id", currentUserId),
      ]);
      likedSet = new Set((myLikes ?? []).map((l) => l.post_id));
      savedSet = new Set((mySaves ?? []).map((s) => s.post_id));
    }

    const mapped: UIPost[] = rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      user: r.profiles?.username ?? "usuário",
      avatar: r.profiles?.avatar_url ?? DEFAULT_AVATAR,
      location: r.location ?? "",
      image: r.image_url,
      caption: r.caption,
      problemType: r.problem_type,
      likes: r.likes?.[0]?.count ?? 0,
      comments: [],
      commentsCount: r.comments?.[0]?.count ?? 0,
      time: timeAgo(r.created_at),
      status: r.status,
      liked: likedSet.has(r.id),
      saved: savedSet.has(r.id),
      district: r.district ?? "",
    }));

    setPosts(mapped);
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { posts, loading, refetch, setPosts };
}

// ─── Comentários de um post específico (sob demanda, ao abrir o sheet) ──────

export async function fetchComments(postId: string): Promise<UIComment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("id, text, created_at, profiles:user_id ( username, avatar_url )")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((c: any) => ({
    id: c.id,
    user: c.profiles?.username ?? "usuário",
    avatar: c.profiles?.avatar_url ?? DEFAULT_AVATAR,
    text: c.text,
    time: timeAgo(c.created_at),
    likes: 0,
    liked: false,
  }));
}

export async function addComment(postId: string, userId: string, text: string) {
  const { error } = await supabase.from("comments").insert({ post_id: postId, user_id: userId, text });
  if (error) throw error;
}

// ─── Curtidas e salvos ───────────────────────────────────────────────────────

export async function toggleLike(postId: string, userId: string, currentlyLiked: boolean) {
  if (currentlyLiked) {
    const { error } = await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("likes").insert({ post_id: postId, user_id: userId });
    if (error) throw error;
  }
}

export async function toggleSave(postId: string, userId: string, currentlySaved: boolean) {
  if (currentlySaved) {
    const { error } = await supabase.from("saves").delete().eq("post_id", postId).eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("saves").insert({ post_id: postId, user_id: userId });
    if (error) throw error;
  }
}

// ─── Criar ocorrência (com upload real de imagem) ───────────────────────────

interface CreatePostParams {
  userId: string;
  file: File;
  caption: string;
  location: string;
  problemType: ProblemId;
  district: string;
}

export async function createPost({ userId, file, caption, location, problemType, district }: CreatePostParams) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("post-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(path);

  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: userId,
      image_url: urlData.publicUrl,
      caption,
      location,
      problem_type: problemType,
      district,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Prefeitura: atualizar status de uma ocorrência ─────────────────────────

const STATUS_LABELS: Record<PostStatus, string> = {
  aberto: "Aberto",
  em_analise: "Em Análise",
  resolvido: "Resolvido",
};

export async function updatePostStatus(
  postId: string,
  status: PostStatus,
  obs: string,
  prefeituraUserId: string,
  ownerUserId: string
) {
  const { error } = await supabase.from("posts").update({ status }).eq("id", postId);
  if (error) throw error;

  if (obs) {
    await supabase.from("comments").insert({
      post_id: postId,
      user_id: prefeituraUserId,
      text: `[Prefeitura] Status atualizado para "${STATUS_LABELS[status]}". ${obs}`,
    });
  }

  // Notifica o dono do post
  await supabase.from("notifications").insert({
    user_id: ownerUserId,
    type: "status",
    message: `atualizou o status da sua ocorrência para ${STATUS_LABELS[status]}.`,
    post_id: postId,
  });
}

// ─── Notificações ────────────────────────────────────────────────────────────

export interface UINotification {
  id: string;
  type: "like" | "comment" | "status";
  message: string;
  time: string;
  read: boolean;
  postImage: string | null;
}

export async function fetchNotifications(userId: string): Promise<UINotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, message, read, created_at, posts:post_id ( image_url )")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((n: any) => ({
    id: n.id,
    type: n.type,
    message: n.message,
    time: timeAgo(n.created_at),
    read: n.read,
    postImage: n.posts?.image_url ?? null,
  }));
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
  if (error) throw error;
}