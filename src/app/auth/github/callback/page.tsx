"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2, AlertCircle } from "lucide-react";

function GitHubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithGitHub } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGitHubCallback = async () => {
      try {
        const code = searchParams?.get("code");
        const errorParams = searchParams?.get("error");
        
        if (errorParams) {
          setError(`Error de GitHub: ${errorParams}`);
          return;
        }

        if (!code) {
          setError("No se encontró el código de autorización de GitHub en la respuesta.");
          return;
        }

        // Llamamos al store para hacer el login con el backend
        await loginWithGitHub(code);
        
        // Verificamos si fue exitoso
        const { isAuthenticated, error: authError } = useAuthStore.getState();
        if (isAuthenticated && !authError) {
          router.push("/");
        } else if (authError) {
          setError(authError);
        }
      } catch (err: any) {
        setError(err.message || "Error procesando el login con GitHub");
      }
    };

    handleGitHubCallback();
  }, [loginWithGitHub, router, searchParams]);

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
            Conectando de forma segura con GitHub.
          </p>
        </>
      )}
    </div>
  );
}

export default function GitHubCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} />
      </div>
    }>
      <GitHubCallbackContent />
    </Suspense>
  );
}
