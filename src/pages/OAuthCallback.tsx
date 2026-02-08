import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * OAuth callback landing page.
 * Handles code exchange after Google OAuth redirect.
 */
export default function OAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const errorParam = url.searchParams.get("error");
        const errorDescription = url.searchParams.get("error_description");

        // Handle OAuth error from provider
        if (errorParam) {
          throw new Error(errorDescription || errorParam);
        }

        // Exchange PKCE code for session
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        // Verify we have a session
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (cancelled) return;

        if (data.session) {
          setStatus("success");
          // Short delay to show success state
          setTimeout(() => {
            if (!cancelled) navigate("/", { replace: true });
          }, 500);
        } else {
          throw new Error("Session non établie après authentification");
        }
      } catch (err) {
        if (cancelled) return;
        console.error("OAuth callback error:", err);
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Erreur inconnue");
        // Redirect to auth after delay
        setTimeout(() => {
          if (!cancelled) navigate("/auth", { replace: true });
        }, 3000);
      }
    };

    handleCallback();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
      {status === "loading" && (
        <>
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Connexion en cours...</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="w-10 h-10 text-primary" />
          <p className="text-foreground font-medium">Connexion réussie !</p>
          <p className="text-muted-foreground text-sm">Redirection...</p>
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle className="w-10 h-10 text-destructive" />
          <p className="text-foreground font-medium">Échec de la connexion</p>
          <p className="text-muted-foreground text-sm text-center max-w-xs">
            {errorMessage || "Une erreur s'est produite."}
          </p>
          <p className="text-muted-foreground text-xs">Redirection vers la page de connexion...</p>
        </>
      )}
    </div>
  );
}
