"use client";

import { useState, useEffect, useRef, Suspense, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Package, Mail, Phone, ShieldCheck, AlertCircle,
  CheckCircle2, ArrowRight, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import styles from "../login/login.module.css";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";

  // Pasos: 1 = verificar email, 2 = enviar OTP SMS, 3 = verificar SMS, 4 = completado
  const [step, setStep] = useState(1);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown para reenvío
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Focus en el primer input al cambiar de paso
  useEffect(() => {
    setCode(["", "", "", "", "", ""]);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [step]);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    pastedData.split("").forEach((char, i) => { newCode[i] = char; });
    setCode(newCode);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const fullCode = code.join("");

  // Paso 1: Verificar código de correo
  const handleVerifyEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (fullCode.length < 6) { setError("Ingresa el código completo de 6 dígitos"); return; }
    setIsLoading(true);
    setError(null);
    try {
      const { default: api } = await import("@/lib/axios");
      const { data } = await api.post("/auth/verify-email", { email, codigo: fullCode });
      if (data.success) {
        setSuccess("¡Correo verificado! Ahora verifica tu teléfono.");
        setTimeout(() => { setSuccess(null); setStep(2); }, 1500);
      } else {
        setError(data.message || "Código inválido");
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || "Error al verificar");
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 2: Solicitar envío del OTP por SMS
  const handleSendSmsOtp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { default: api } = await import("@/lib/axios");
      const { data } = await api.post("/auth/otp/send", { email, canal: "SMS" });
      if (data.success) {
        setSuccess("¡Código SMS enviado!");
        setCountdown(60);
        setTimeout(() => { setSuccess(null); setStep(3); }, 1200);
      } else {
        setError(data.message || "Error al enviar SMS");
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || "Error al enviar el código SMS");
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 3: Verificar código SMS
  const handleVerifyPhone = async (e: FormEvent) => {
    e.preventDefault();
    if (fullCode.length < 6) { setError("Ingresa el código completo de 6 dígitos"); return; }
    setIsLoading(true);
    setError(null);
    try {
      const { default: api } = await import("@/lib/axios");
      const { data } = await api.post("/auth/verify-phone", { email, codigo: fullCode });
      if (data.success) {
        setStep(4);
      } else {
        setError(data.message || "Código inválido");
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || "Error al verificar teléfono");
    } finally {
      setIsLoading(false);
    }
  };

  // Reenviar código email
  const handleResendEmail = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const { default: api } = await import("@/lib/axios");
      await api.post("/auth/otp/send", { email, canal: "EMAIL" });
      setSuccess("Código reenviado a tu correo.");
      setCountdown(60);
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Error al reenviar el código.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reenviar SMS
  const handleResendSms = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const { default: api } = await import("@/lib/axios");
      await api.post("/auth/otp/send", { email, canal: "SMS" });
      setSuccess("Código SMS reenviado.");
      setCountdown(60);
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Error al reenviar el código SMS.");
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar los 6 inputs del código
  const renderCodeInputs = () => (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center", margin: "24px 0 16px" }}>
      {code.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleCodeChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          style={{
            width: "48px",
            height: "56px",
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "700",
            borderRadius: "12px",
            border: digit ? "2px solid var(--color-primary-500)" : "2px solid var(--border-color)",
            background: digit ? "rgba(79, 70, 229, 0.05)" : "var(--bg-secondary)",
            color: "var(--text-primary)",
            outline: "none",
            transition: "all 0.2s",
            caretColor: "var(--color-primary-500)",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary-500)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.15)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = digit ? "var(--color-primary-500)" : "var(--border-color)"; e.currentTarget.style.boxShadow = "none"; }}
        />
      ))}
    </div>
  );

  // Indicadores de progreso
  const renderProgress = () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
      {[1, 2, 3].map((s) => (
        <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: "700",
            background: step >= s
              ? (step > s ? "var(--color-primary-500)" : "linear-gradient(135deg, #6366f1, #8b5cf6)")
              : "var(--bg-secondary)",
            color: step >= s ? "white" : "var(--text-secondary)",
            border: step === s ? "2px solid var(--color-primary-500)" : "2px solid transparent",
            transition: "all 0.3s",
            boxShadow: step === s ? "0 0 0 4px rgba(99,102,241,0.15)" : "none",
          }}>
            {step > s ? <CheckCircle2 size={16} /> : s}
          </div>
          {s < 3 && (
            <div style={{
              width: "40px",
              height: "3px",
              borderRadius: "2px",
              background: step > s ? "var(--color-primary-500)" : "var(--border-color)",
              transition: "background 0.3s",
            }} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.loginPage}>
      <div className={styles.orbOne} />
      <div className={styles.orbTwo} />
      <div className={styles.orbThree} />
      <div className={styles.gridPattern} />

      <motion.div className={styles.loginCard} variants={cardVariants} initial="hidden" animate="visible" style={{ maxWidth: "480px" }}>
        <motion.div className={styles.brandSection} variants={itemVariants}>
          <div className={styles.logoIcon}>
            <ShieldCheck size={32} strokeWidth={2} />
          </div>
          <h1 className={styles.brandTitle}>Verificación</h1>
          <p className={styles.brandSubtitle}>
            {step === 1 && "Ingresa el código enviado a tu correo"}
            {step === 2 && "Ahora verificaremos tu teléfono"}
            {step === 3 && "Ingresa el código enviado por SMS"}
            {step === 4 && "¡Cuenta verificada exitosamente!"}
          </p>
        </motion.div>

        {step < 4 && renderProgress()}

        {/* PASO 1: Verificar Email */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form key="step1" onSubmit={handleVerifyEmail} className={styles.form}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: "64px", height: "64px", margin: "0 auto 12px", borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Mail size={28} style={{ color: "var(--color-primary-500)" }} />
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
                  Enviamos un código de 6 dígitos a<br />
                  <strong style={{ color: "var(--text-primary)" }}>{email}</strong>
                </p>
              </div>

              {renderCodeInputs()}

              <AnimatePresence>
                {error && (
                  <motion.div className={styles.errorBox} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <AlertCircle size={18} /><span>{error}</span>
                  </motion.div>
                )}
                {success && (
                  <motion.div className={styles.errorBox} style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid #22c55e" }}
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <CheckCircle2 size={18} /><span>{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button type="submit" className={styles.submitBtn} disabled={isLoading || fullCode.length < 6} whileTap={{ scale: 0.98 }}>
                {isLoading ? <div className={styles.spinner} /> : <><ShieldCheck size={18} /> Verificar Correo</>}
              </motion.button>

              <button type="button" onClick={handleResendEmail} disabled={countdown > 0 || isLoading}
                style={{
                  background: "none", border: "none", color: countdown > 0 ? "var(--text-secondary)" : "var(--color-primary-500)",
                  cursor: countdown > 0 ? "default" : "pointer", fontSize: "13px", fontWeight: "600",
                  display: "flex", alignItems: "center", gap: "6px", margin: "8px auto 0",
                }}>
                <RefreshCw size={14} />
                {countdown > 0 ? `Reenviar en ${countdown}s` : "Reenviar código"}
              </button>
            </motion.form>
          )}

          {/* PASO 2: Solicitar código SMS */}
          {step === 2 && (
            <motion.div key="step2" className={styles.form}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: "64px", height: "64px", margin: "0 auto 12px", borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(34,197,94,0.1))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Phone size={28} style={{ color: "#10b981" }} />
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "0 0 20px" }}>
                  Para completar tu verificación, enviaremos un código SMS al número registrado.
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div className={styles.errorBox} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <AlertCircle size={18} /><span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button type="button" className={styles.submitBtn} onClick={handleSendSmsOtp} disabled={isLoading} whileTap={{ scale: 0.98 }}>
                {isLoading ? <div className={styles.spinner} /> : <><Phone size={18} /> Enviar Código SMS</>}
              </motion.button>

              <button type="button" onClick={() => { setStep(3); setSuccess(null); }}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px", margin: "8px auto 0", display: "flex", alignItems: "center", gap: "4px" }}>
                Ya tengo un código <ArrowRight size={14} />
              </button>
            </motion.div>
          )}

          {/* PASO 3: Verificar código SMS */}
          {step === 3 && (
            <motion.form key="step3" onSubmit={handleVerifyPhone} className={styles.form}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: "64px", height: "64px", margin: "0 auto 12px", borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(34,197,94,0.1))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Phone size={28} style={{ color: "#10b981" }} />
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
                  Ingresa el código de 6 dígitos enviado por SMS
                </p>
              </div>

              {renderCodeInputs()}

              <AnimatePresence>
                {error && (
                  <motion.div className={styles.errorBox} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <AlertCircle size={18} /><span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button type="submit" className={styles.submitBtn} disabled={isLoading || fullCode.length < 6} whileTap={{ scale: 0.98 }}>
                {isLoading ? <div className={styles.spinner} /> : <><ShieldCheck size={18} /> Verificar Teléfono</>}
              </motion.button>

              <button type="button" onClick={handleResendSms} disabled={countdown > 0 || isLoading}
                style={{
                  background: "none", border: "none", color: countdown > 0 ? "var(--text-secondary)" : "var(--color-primary-500)",
                  cursor: countdown > 0 ? "default" : "pointer", fontSize: "13px", fontWeight: "600",
                  display: "flex", alignItems: "center", gap: "6px", margin: "8px auto 0",
                }}>
                <RefreshCw size={14} />
                {countdown > 0 ? `Reenviar en ${countdown}s` : "Reenviar código SMS"}
              </button>
            </motion.form>
          )}

          {/* PASO 4: Completado */}
          {step === 4 && (
            <motion.div key="step4" className={styles.form}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div style={{ textAlign: "center" }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                  style={{
                    width: "80px", height: "80px", margin: "0 auto 16px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #10b981, #22c55e)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 10px 30px rgba(34, 197, 94, 0.3)",
                  }}
                >
                  <CheckCircle2 size={40} color="white" />
                </motion.div>
                <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "8px" }}>
                  ¡Verificación Completa!
                </h2>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
                  Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.
                </p>
              </div>

              <motion.button
                type="button"
                className={styles.submitBtn}
                onClick={() => router.push(`/login?registered=true&email=${encodeURIComponent(email)}`)}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowRight size={18} /> Ir a Iniciar Sesión
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {step < 4 && (
          <motion.p className={styles.footer} variants={itemVariants}>
            ¿Ya verificaste tu cuenta? <Link href="/login">Iniciar Sesión</Link>
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>Cargando...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
