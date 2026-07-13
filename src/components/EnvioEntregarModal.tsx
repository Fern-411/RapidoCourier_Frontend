"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Key, CheckCircle, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { envioService } from "@/services/envioService";

interface ModalProps {
  envioId: string;
  codigoRastreo: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EnvioEntregarModal({ envioId, codigoRastreo, isOpen, onClose, onSuccess }: ModalProps) {
  const [pin, setPin] = useState("");
  const [dni, setDni] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Estados para el desbloqueo
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otp, setOtp] = useState("");
  const [nuevaClave, setNuevaClave] = useState("");

  if (!isOpen) return null;

  const handleEntregar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await envioService.entregar(envioId, pin, dni);
      onSuccess();
    } catch (err: any) {
      if (err.response?.status === 423) {
        setIsLocked(true);
        setError("El paquete ha sido bloqueado por múltiples intentos fallidos.");
      } else {
        setError(err.response?.data?.message || "PIN o DNI incorrecto.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSolicitarDesbloqueo = async () => {
    setIsRequestingOtp(true);
    setError(null);
    try {
      await envioService.solicitarDesbloqueo(envioId);
      setOtpRequested(true);
    } catch (err: any) {
      setError("Error al solicitar el OTP de desbloqueo.");
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleDesbloquear = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
        await envioService.desbloquear(envioId, { 
        otp: otp, 
        nuevaClaveRecojo: nuevaClave 
      });
      setIsLocked(false);
      setOtpRequested(false);
      setOtp("");
      setNuevaClave("");
      setPin("");
      setError("Desbloqueo exitoso. Ahora puede entregar el paquete con su nuevo PIN.");
    } catch (err: any) {
      setError(err.response?.data?.message || "OTP incorrecto o expirado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{ background: "var(--bg-primary)", width: "100%", maxWidth: "450px", borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
        >
          {/* Header */}
          <div style={{ padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", background: isLocked ? "rgba(239, 68, 68, 0.1)" : "var(--bg-secondary)" }}>
            <h2 style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", display: "flex", alignItems: "center", gap: "var(--space-2)", color: isLocked ? "var(--color-error)" : "var(--text-primary)" }}>
              {isLocked ? <ShieldAlert size={20} /> : <Lock size={20} />} 
              {isLocked ? "Paquete Bloqueado" : "Entregar Paquete"}
            </h2>
            <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ padding: "var(--space-6)" }}>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>
              Rastreo: <strong style={{ color: "var(--text-primary)" }}>{codigoRastreo}</strong>
            </p>

            {error && (
              <div style={{ padding: "var(--space-3)", background: isLocked && !otpRequested ? "rgba(239, 68, 68, 0.1)" : "var(--bg-secondary)", color: isLocked && !otpRequested ? "var(--color-error)" : "var(--text-primary)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-4)", fontSize: "var(--fs-sm)" }}>
                {error}
              </div>
            )}

            {!isLocked ? (
              <form onSubmit={handleEntregar} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <Input
                  label="DNI del Destinatario"
                  placeholder="Ingrese el DNI físico"
                  required
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                />
                <Input
                  label="PIN Secreto"
                  type="password"
                  placeholder="PIN de 4-6 dígitos"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />
                <Button type="submit" isLoading={isLoading} style={{ marginTop: "var(--space-2)" }}>
                  Validar y Entregar
                </Button>
              </form>
            ) : (
              // Modo Bloqueado
              <div>
                {!otpRequested ? (
                  <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
                    <p style={{ fontSize: "var(--fs-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>
                      El sistema ha bloqueado temporalmente la entrega por seguridad. Solicite un código OTP que será enviado al correo del remitente.
                    </p>
                    <Button onClick={handleSolicitarDesbloqueo} isLoading={isRequestingOtp} style={{ width: "100%" }}>
                      Solicitar OTP de Desbloqueo
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleDesbloquear} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                    <p style={{ fontSize: "var(--fs-sm)", color: "var(--color-success)", background: "rgba(16, 185, 129, 0.1)", padding: "var(--space-2)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                      OTP enviado al remitente.
                    </p>
                    <Input
                      label="Código OTP"
                      placeholder="Ingrese el código de 6 dígitos"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <Input
                      label="Nuevo PIN Secreto"
                      type="password"
                      placeholder="Ingrese un nuevo PIN"
                      required
                      value={nuevaClave}
                      onChange={(e) => setNuevaClave(e.target.value)}
                    />
                    <Button type="submit" isLoading={isLoading} style={{ marginTop: "var(--space-2)" }}>
                      <Key size={18} style={{ marginRight: "var(--space-2)" }}/> Desbloquear Paquete
                    </Button>
                  </form>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
