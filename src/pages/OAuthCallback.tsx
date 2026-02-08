import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * OAuth callback landing page.
 * Goal: be a stable, always-existing route to land on after Google OAuth.
 */
export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        // If we came back with a PKCE code, exchange it for a session.
        // (Safe even if session is already present.)
        if (code) {
          await supabase.auth.exchangeCodeForSession(window.location.href);
        }

        const { data } = await supabase.auth.getSession();
        if (cancelled) return;

        navigate(data.session ? "/" : "/auth", { replace: true });
      } catch {
        if (cancelled) return;
        navigate("/auth", { replace: true });
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
