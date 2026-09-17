import {
  AlertTriangle,
  Construction,
  Droplets,
  Lightbulb,
  Navigation,
  Trash2,
  TreeDeciduous,
  Ticket,
  Trophy,
  GraduationCap,
  HeartHandshake,
  School,
  Landmark,
} from "lucide-react";
import type { PostStatus } from "../hooks/useOccurrences";

export const PROBLEM_TYPES = [
  {
    id: "buraco",
    label: "Buraco na Via",
    icon: Construction,
    color: "#ef4444",
    bg: "bg-red-950/60",
  },
  {
    id: "iluminacao",
    label: "Iluminação Pública",
    icon: Lightbulb,
    color: "#facc15",
    bg: "bg-yellow-950/60",
  },
  {
    id: "lixo",
    label: "Lixo / Entulho",
    icon: Trash2,
    color: "#22c55e",
    bg: "bg-green-950/60",
  },
  {
    id: "alagamento",
    label: "Alagamento",
    icon: Droplets,
    color: "#3b82f6",
    bg: "bg-blue-950/60",
  },
  {
    id: "calcada",
    label: "Calçada Danificada",
    icon: AlertTriangle,
    color: "#f97316",
    bg: "bg-orange-950/60",
  },
  {
    id: "arvore",
    label: "Árvore / Vegetação",
    icon: TreeDeciduous,
    color: "#84cc16",
    bg: "bg-lime-950/60",
  },
  {
    id: "sinalizacao",
    label: "Sinalização",
    icon: Navigation,
    color: "#a78bfa",
    bg: "bg-violet-950/60",
  },
] as const;

export const EVENT_CATEGORIES = [
  { id: "cultural", label: "Cultural", icon: Ticket, color: "#a78bfa" },
  { id: "esportivo", label: "Esportivo", icon: Trophy, color: "#22c55e" },
  {
    id: "educacional",
    label: "Educacional",
    icon: GraduationCap,
    color: "#3b82f6",
  },
  {
    id: "comunitario",
    label: "Ação da Comunidade",
    icon: HeartHandshake,
    color: "#f97316",
  },
  { id: "escolar", label: "Evento Escolar", icon: School, color: "#facc15" },
  {
    id: "associacao",
    label: "Associação de Bairro",
    icon: Landmark,
    color: "#ef4444",
  },
] as const;

export type TabId = "feed" | "buscar" | "notif" | "eventos" | "perfil";

export const STATUS_META: Record<
  PostStatus,
  {
    label: string;
    color: string;
    bg: string;
    dot: string;
    next: PostStatus | null;
    nextLabel: string;
  }
> = {
  aberto: {
    label: "Aberto",
    color: "text-red-400",
    bg: "bg-red-950/60",
    dot: "bg-red-400",
    next: "em_analise",
    nextLabel: "Iniciar Análise",
  },
  em_analise: {
    label: "Em Análise",
    color: "text-yellow-400",
    bg: "bg-yellow-950/60",
    dot: "bg-yellow-400",
    next: "resolvido",
    nextLabel: "Marcar Resolvido",
  },
  resolvido: {
    label: "Resolvido",
    color: "text-green-400",
    bg: "bg-green-950/60",
    dot: "bg-green-400",
    next: null,
    nextLabel: "",
  },
};

export const DISTRICTS = [
  "Bela Vista",
  "Centro",
  "Consolação",
  "Jardins",
  "Ibirapuera",
  "República",
  "Vila Madalena",
  "Pinheiros",
  "Santana",
  "Mooca",
  "Lapa",
  "Ipiranga",
  "Santo André",
  "Guarulhos",
  "Osasco",
];

export const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 160 160%22%3E%3Crect width=%22160%22 height=%22160%22 rx=%2280%22 fill=%22%23d1d5db%22/%3E%3Ccircle cx=%2280%22 cy=%2258%22 r=%2229%22 fill=%22%236b7280%22/%3E%3Cpath d=%22M28 137c6-29 25-45 52-45s46 16 52 45%22 fill=%22%236b7280%22/%3E%3C/svg%3E";
export const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&h=360&fit=crop&auto=format";

// ─── Helpers ──────────────────────────────────────────────────────────────────
