"use client";

import { FormEvent } from "react";
import { Search, Package, Hash } from "lucide-react";
import { motion } from "framer-motion";

interface HeroTrackerProps {
  numeroOrden: string;
  setNumeroOrden: (val: string) => void;
  codigoRastreo: string;
  setCodigoRastreo: (val: string) => void;
  onSearch: (e: FormEvent) => void;
  isLoading: boolean;
}

export function HeroTracker({ 
  numeroOrden, setNumeroOrden, 
  codigoRastreo, setCodigoRastreo, 
  onSearch, isLoading 
}: HeroTrackerProps) {
  
  return (
    <div style={{
      position: "relative",
      background: "var(--color-primary-900)",
      color: "white",
      padding: "var(--space-20) var(--space-6)",
      borderRadius: "var(--radius-2xl)",
      overflow: "hidden",
      marginBottom: "var(--space-12)",
      boxShadow: "var(--shadow-xl)"
    }}>
      {/* Background Graphic */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 100%)",
        zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        top: "-20%", right: "-10%",
        width: "50%", height: "150%",
        background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%)",
        zIndex: 0,
        transform: "rotate(-15deg)"
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: "var(--fs-4xl)", fontWeight: "900", marginBottom: "var(--space-4)", letterSpacing: "-1px" }}
        >
          Rastrea tu Envío
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ fontSize: "var(--fs-lg)", opacity: 0.8, marginBottom: "var(--space-10)" }}
        >
          Ingresa tu número de orden y código de rastreo para conocer la ubicación exacta de tu paquete en tiempo real.
        </motion.p>

        <motion.form 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          onSubmit={onSearch} 
          style={{ 
            display: "flex", flexWrap: "wrap", gap: "var(--space-4)", 
            background: "rgba(255,255,255,0.1)", padding: "var(--space-3)", 
            borderRadius: "var(--radius-xl)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)"
          }}
        >
          <div style={{ flex: "1 1 250px", position: "relative" }}>
            <div style={{ position: "absolute", left: "var(--space-4)", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
              <Hash size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Nº de Orden (Ej. ORD-123)"
              value={numeroOrden}
              onChange={(e) => setNumeroOrden(e.target.value)}
              style={{
                width: "100%", padding: "var(--space-4) var(--space-4) var(--space-4) calc(var(--space-4) + 32px)",
                fontSize: "var(--fs-base)", background: "white", color: "black",
                borderRadius: "var(--radius-lg)", border: "none", transition: "all 0.2s",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)"
              }}
            />
          </div>

          <div style={{ flex: "1 1 250px", position: "relative" }}>
            <div style={{ position: "absolute", left: "var(--space-4)", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
              <Package size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Cód. Rastreo (Ej. RC-456)"
              value={codigoRastreo}
              onChange={(e) => setCodigoRastreo(e.target.value)}
              style={{
                width: "100%", padding: "var(--space-4) var(--space-4) var(--space-4) calc(var(--space-4) + 32px)",
                fontSize: "var(--fs-base)", background: "white", color: "black",
                borderRadius: "var(--radius-lg)", border: "none", transition: "all 0.2s",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)"
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              padding: "var(--space-4) var(--space-8)", background: "var(--color-primary-500)", color: "white", 
              border: "none", borderRadius: "var(--radius-lg)", fontSize: "var(--fs-md)", fontWeight: "var(--fw-bold)", 
              cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1, transition: "background 0.2s, transform 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)",
              flex: "0 0 auto"
            }}
          >
            <Search size={20} />
            {isLoading ? "Buscando..." : "Rastrear"}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
