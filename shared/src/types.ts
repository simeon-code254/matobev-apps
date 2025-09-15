export type UserRole = "player" | "scout" | "admin";

export interface UserProfile {
  id: string;
  role: UserRole;
  country: string;
  full_name?: string;
  avatar_url?: string;
  position?: string;
  team?: string;
  league?: string;
  bio?: string;
  approved?: boolean;
  created_at?: string;
}

export interface Trial {
  id: string;
  title: string;
  description: string;
  date: string;
  country: string;
  thumbnail_url?: string;
  created_by: string;
  created_at?: string;
}

export interface News {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  created_by: string;
  published?: boolean;
  created_at?: string;
}

export interface Tournament {
  id: string;
  title: string;
  description: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  created_by: string;
  created_at?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at?: string | null;
  thread_id: string;
}

export interface Upload {
  id: string;
  owner_id: string;
  storage_path: string;
  status: "uploaded" | "processing" | "ready" | "failed";
  created_at: string;
}

export interface PlayerCard {
  id: string;
  player_id: string;
  upload_id: string;
  speed: number;
  stamina: number;
  passing: number;
  shooting: number;
  strength: number;
  card_image_url: string;
  created_at: string;
}
