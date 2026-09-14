import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type EventCategory =
  | "cultural" | "esportivo" | "educacional" | "comunitario" | "escolar" | "associacao";

export interface UIEvent {
  id: string;
  userId: string;
  user: string;
  avatar: string;
  title: string;
  description: string;
  eventDate: string;   // ISO date, e.g. "2026-09-20"
  eventTime: string | null; // "19:00"
  location: string;
  image: string | null;
  category: EventCategory;
  district: string;
  createdAt: string;
}

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&auto=format";

export function useEvents() {
  const [events, setEvents] = useState<UIEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);

    const { data: rows, error } = await supabase
      .from("events")
      .select(
        `id, user_id, title, description, event_date, event_time, location,
         image_url, category, district, created_at,
         profiles:user_id ( username, avatar_url )`
      )
      .order("event_date", { ascending: true });

    if (error || !rows) {
      console.error(error);
      setLoading(false);
      return;
    }

    const mapped: UIEvent[] = rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      user: r.profiles?.username ?? "usuário",
      avatar: r.profiles?.avatar_url ?? DEFAULT_AVATAR,
      title: r.title,
      description: r.description,
      eventDate: r.event_date,
      eventTime: r.event_time,
      location: r.location ?? "",
      image: r.image_url,
      category: r.category,
      district: r.district ?? "",
      createdAt: r.created_at,
    }));

    setEvents(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { events, loading, refetch, setEvents };
}

interface CreateEventParams {
  userId: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  category: EventCategory;
  district: string;
  file: File | null;
}

export async function createEvent({
  userId, title, description, eventDate, eventTime, location, category, district, file,
}: CreateEventParams) {
  let imageUrl: string | null = null;

  if (file) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("event-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(path);
    imageUrl = urlData.publicUrl;
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      user_id: userId,
      title,
      description,
      event_date: eventDate,
      event_time: eventTime || null,
      location,
      image_url: imageUrl,
      category,
      district,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEvent(eventId: string) {
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) throw error;
}