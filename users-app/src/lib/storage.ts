import { supabase } from "./supabaseClient";

export async function uploadFile(bucket: "videos" | "thumbnails" | "avatars" | "player-cards", file: File) {
  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw error;
  const pub = bucket === "videos" ? null : supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  return { path, publicUrl: pub || null };
}
