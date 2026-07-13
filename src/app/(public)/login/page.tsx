"use client";

import { useState, type FormEvent, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./login.module.css";

/* ── OAuth Config ── */
const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "391674918861-p4armes7nkelp2jooo4ps2lsfcaljvlu.apps.googleusercontent.com";
const GITHUB_CLIENT_ID =
  process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "Ov23lizxQkg2BgbzlqUz";
const GITHUB_REDIRECT_URI =
  process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI ||
  "http://localhost:3000/auth/github/callback";

/* ── Variantes de animación ── */
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams?.get("registered");
  const emailQuery = searchParams?.get("email");

  const [email, setEmail] = useState(emailQuery || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, errorCode, clearError } = useAuthStore();

  /* ── Manejo del submit ── */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    await login(email, password);

    const state = useAuthStore.getState();
    
    // Si la cuenta no está verificada, redirigir a la página de verificación
    if (state.errorCode === "AUTH_016") {
      router.push(`/verify?email=${encodeURIComponent(email)}`);
      return;
    }

    // Si el login fue exitoso, redirigir según el rol
    if (state.isAuthenticated && !state.error && state.user) {
      if (state.user.rol === "CLIENTE") {
        window.location.href = "/cliente/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    }
  };

  /* ── Login con Google (Google Identity Services) ── */
  const handleGoogleLogin = () => {
    // Redirigir al flujo OAuth2 de Google
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/google/callback`,
      response_type: "id_token",
      scope: "openid email profile",
      nonce: crypto.randomUUID(),
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  /* ── Login con GitHub ── */
  const handleGitHubLogin = () => {
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: GITHUB_REDIRECT_URI,
      scope: "user:email",
    });
    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
  };

  return (
    <div className={styles.loginPage}>
      {/* Orbes decorativos */}
      <div className={styles.orbOne} />
      <div className={styles.orbTwo} />
      <div className={styles.orbThree} />
      <div className={styles.gridPattern} />

      {/* Card de Login */}
      <motion.div
        className={styles.loginCard}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Branding */}
        <motion.div className={styles.brandSection} variants={itemVariants}>
          <div className={styles.logoIcon}>
            <Package size={32} strokeWidth={2} />
          </div>
          <h1 className={styles.brandTitle}>Rápido Courier</h1>
          <p className={styles.brandSubtitle}>Sistema de Gestión de Envíos</p>
        </motion.div>

        {/* Formulario */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Email */}
          <motion.div className={styles.inputGroup} variants={itemVariants}>
            <label htmlFor="login-email" className={styles.inputLabel}>
              Correo electrónico
            </label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                id="login-email"
                name="email"
                type="email"
                className={styles.input}
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) clearError();
                }}
                required
                autoComplete="email"
                autoFocus
              />
            </div>
          </motion.div>

          {/* Password */}
          <motion.div className={styles.inputGroup} variants={itemVariants}>
            <label htmlFor="login-password" className={styles.inputLabel}>
              Contraseña
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) clearError();
                }}
                required
                autoComplete="current-password"
                minLength={8}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                className={styles.errorBox}
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 0 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.25 }}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {registered && (
              <motion.div
                className={styles.errorBox}
                style={{ background: "rgba(34, 197, 94, 0.1)", color: "var(--color-primary-500)", border: "1px solid var(--color-primary-500)" }}
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 0 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.25 }}
              >
                <span>¡Registro exitoso! Por favor, inicia sesión.</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.div variants={itemVariants}>
            <motion.button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className={styles.spinner} />
              ) : (
                <>
                  <LogIn size={18} />
                  Iniciar Sesión
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Divider */}
          <motion.div className={styles.divider} variants={itemVariants}>
            <span className={styles.dividerText}>o continúa con</span>
          </motion.div>

          {/* OAuth Buttons */}
          <motion.div className={styles.oauthGroup} variants={itemVariants}>
            <button
              type="button"
              className={styles.oauthBtn}
              onClick={handleGoogleLogin}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>

            <button
              type="button"
              className={styles.oauthBtn}
              onClick={handleGitHubLogin}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
          </motion.div>
        </form>

        {/* Footer */}
        <motion.p className={styles.footer} variants={itemVariants}>
          ¿No tienes cuenta?{" "}
          <a href="/signup">Crear una cuenta</a>
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>Cargando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
