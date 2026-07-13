"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2, AlertCircle } from "lucide-react";

function GoogleCallbackContent() {
  const router = useRouter();
  const { loginWithGoogle } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // En el flujo implicit, Google devuelve los tokens en el hash fragment (#id_token=...)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const idToken = params.get("id_token");

        // Si por alguna razón los devolvió en la query string (?id_token=...)
        const queryParams = new URLSearchParams(window.location.search);
        const idTokenQuery = queryParams.get("id_token");
        
        // También puede devolver un error
        const errorParams = params.get("error") || queryParams.get("error");
        if (errorParams) {
          setError(`Error de Google: ${errorParams}`);
          return;
        }

        const finalToken = idToken || idTokenQuery;

        if (!finalToken) {
          setError("No se encontró el token de Google en la respuesta.");
          return;
        }

        // Llamamos al store para hacer el login con el backend
        await loginWithGoogle(finalToken);
        
        // Verificamos si fue exitoso
        const state = useAuthStore.getState();
        if (state.isAuthenticated && !state.error && state.user) {
          if (state.user.rol === "CLIENTE") {
            router.push("/cliente/dashboard");
          } else {
            router.push("/dashboard");
          }
        } else if (state.error) {
          setError(state.error);
        }
      } catch (err: any) {
        setError(err.message || "Error procesando el login con Google");
      }
    };

    handleGoogleCallback();
  }, [loginWithGoogle, router]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", alignItems: "center", justifyContent: "center", gap: "var(--space-4)", background: "var(--bg-primary)" }}>
      {error ? (
        <div className="glass" style={{ padding: "var(--space-6)", borderRadius: "var(--radius-xl)", maxWidth: "400px", textAlign: "center", border: "1px solid var(--color-error)" }}>
          <AlertCircle size={48} style={{ margin: "0 auto var(--space-4)", color: "var(--color-error)" }} />
          <h2 style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", marginBottom: "var(--space-2)", color: "var(--text-primary)" }}>
            Error de Autenticación
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-6)" }}>
            {error}
          </p>
          <button 
            onClick={() => router.push("/login")}
            style={{ padding: "var(--space-3) var(--space-6)", background: "var(--color-primary-500)", color: "white", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: "var(--fw-medium)" }}
          >
            Volver al Login
          </button>
        </div>
      ) : (
        <>
          <Loader2 size={48} style={{ animation: "spin 1s linear infinite", color: "var(--color-primary-500)" }} />
          <h2 style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)" }}>
            Procesando inicio de sesión...
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Conectando de forma segura con Google.
          </p>
        </>
      )}
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} />
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
