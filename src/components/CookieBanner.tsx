"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Shield } from "lucide-react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Solo mostrar si no se ha aceptado antes
    const accepted = localStorage.getItem("cookies-accepted");
    if (!accepted) {
      // Pequeño delay para no bloquear el primer render
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookies-accepted", "true");
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookies-accepted", "essential-only");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            width: "min(680px, calc(100vw - 32px))",
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            padding: "24px 28px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)",
            color: "white",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Botón cerrar */}
          <button
            onClick={handleReject}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255,255,255,0.6)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
            }}
          >
            <X size={14} />
          </button>

          {/* Contenido */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              borderRadius: "14px",
              padding: "10px",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
            }}>
              <Cookie size={24} />
            </div>
            <div>
              <h3 style={{
                fontSize: "16px",
                fontWeight: "700",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
                <Shield size={14} style={{ color: "#a5b4fc" }} />
                Usamos Cookies
              </h3>
              <p style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.65)",
                lineHeight: "1.5",
                margin: 0,
              }}>
                Este sitio utiliza cookies para autenticación, seguridad y mejorar tu experiencia de navegación. 
                Al continuar, aceptas nuestra política de cookies.
              </p>
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button
              onClick={handleReject}
              style={{
                padding: "8px 20px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.7)",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
              }}
            >
              Solo esenciales
            </button>
            <button
              onClick={handleAccept}
              style={{
                padding: "8px 24px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none",
                color: "white",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(99, 102, 241, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.4)";
              }}
            >
              Aceptar todas
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
