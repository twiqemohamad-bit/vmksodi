import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getVisitorRequestId } from "@/lib/session";

// Pings last_seen_at while the visitor is on any page, so the admin
// panel can show نشط / غير نشط in real time.
export function useHeartbeat() {
  useEffect(() => {
    let cancelled = false;

    const ping = async () => {
      const id = getVisitorRequestId();
      if (!id) return;
      await supabase
        .from("login_requests")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", id);
    };

    ping();
    const interval = setInterval(() => {
      if (!cancelled && document.visibilityState === "visible") ping();
    }, 10_000);

    const onVisible = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
}
