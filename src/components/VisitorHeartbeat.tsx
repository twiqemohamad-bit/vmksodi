import { useHeartbeat } from "@/hooks/useHeartbeat";

/** Keeps visitor `last_seen_at` fresh for the admin panel. */
export function VisitorHeartbeat() {
  useHeartbeat();
  return null;
}
