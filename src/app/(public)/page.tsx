"use client";

import { useState, FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight } from "lucide-react";
import { envioService, type EnvioResponse, type HistorialEstadoEnvioResponse } from "@/services/envioService";
import { HeroTracker } from "@/components/public/HeroTracker";
import { TrackingTimeline } from "@/components/public/TrackingTimeline";
import Link from "next/link";

export default function PublicHomePage() {
  const [numeroOrden, setNumeroOrden] = useState("");
  const [codigoRastreo, setCodigoRastreo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [envio, setEnvio] = useState<EnvioResponse | null>(null);
  const [historial, setHistorial] = useState<HistorialEstadoEnvioResponse[]>([]);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!numeroOrden.trim() || !codigoRastreo.trim()) {
      setError("Por favor ingrese el número de orden y el código de rastreo.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setEnvio(null);
    setHistorial([]);

    try {
      const dataEnvio = await envioService.getByRastreo(numeroOrden.trim(), codigoRastreo.trim());
      if (!dataEnvio) throw new Error("Envío no encontrado");
      
      setEnvio(dataEnvio);
      
      const dataHistorial = await envioService.getHistorial(dataEnvio.id);
      setHistorial(dataHistorial);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        "No se pudo encontrar el envío. Verifique sus datos e intente nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const banners = [
    { title: "Calcula tu tarifa", subtitle: "Fácil y rápido", bg: "var(--color-primary-50)", border: "var(--color-primary-100)", color: "var(--color-primary-700)" },
    { title: "Nuestros Puntos", subtitle: "Más cerca de ti", bg: "var(--color-primary-50)", border: "var(--color-primary-100)", color: "var(--color-primary-700)" },
    { title: "Gestión en línea", subtitle: "Todo desde tu celular", bg: "var(--color-primary-50)", border: "var(--color-primary-100)", color: "var(--color-primary-700)" },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      
      <HeroTracker 
        numeroOrden={numeroOrden} setNumeroOrden={setNumeroOrden}
        codigoRastreo={codigoRastreo} setCodigoRastreo={setCodigoRastreo}
        onSearch={handleSearch} isLoading={isLoading}
      />

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -10, height: 0 }}
            style={{ marginBottom: "var(--space-8)", padding: "var(--space-4)", background: "#fee2e2", border: "1px solid #f87171", borderRadius: "var(--radius-lg)", color: "#b91c1c", display: "flex", alignItems: "center", gap: "var(--space-3)", maxWidth: "800px", margin: "0 auto var(--space-8)" }}
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}

        {envio && (
          <div style={{ marginBottom: "var(--space-12)", maxWidth: "1000px", margin: "0 auto var(--space-12)" }}>
            <TrackingTimeline envio={envio} historial={historial} />
          </div>
        )}
      </AnimatePresence>

      {/* Grid de Banners de Acceso Rápido */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-6)", marginBottom: "var(--space-12)" }}>
        {banners.map((banner, i) => (
          <div key={i} style={{ 
            background: "var(--bg-secondary)", 
            border: `1px solid var(--border-color)`,
            borderRadius: "var(--radius-xl)", 
            padding: "var(--space-6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "var(--shadow-sm)"
          }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.transform = "translateY(-4px)"; 
            e.currentTarget.style.boxShadow = "var(--shadow-md)"; 
            e.currentTarget.style.borderColor = banner.border;
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.transform = "translateY(0)"; 
            e.currentTarget.style.boxShadow = "var(--shadow-sm)"; 
            e.currentTarget.style.borderColor = "var(--border-color)";
          }}
          >
            <div>
              <h3 style={{ fontSize: "var(--fs-lg)", fontWeight: "800", color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
                {banner.title}
              </h3>
              <p style={{ color: "var(--text-secondary)", fontWeight: "var(--fw-medium)", fontSize: "var(--fs-sm)" }}>
                {banner.subtitle}
              </p>
            </div>
            <div style={{ background: banner.bg, padding: "var(--space-3)", borderRadius: "50%", color: banner.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ArrowRight size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Banner Principal Promocional */}
      <div style={{ 
        background: "var(--bg-secondary)", 
        borderRadius: "var(--radius-2xl)", 
        padding: "var(--space-10)", 
        border: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "var(--space-6)",
      }}>
        <div>
          <div style={{ color: "var(--color-primary-600)", fontWeight: "var(--fw-bold)", textTransform: "uppercase", fontSize: "var(--fs-sm)", marginBottom: "var(--space-2)", letterSpacing: "1px" }}>
            Servicios Corporativos
          </div>
          <h2 style={{ fontSize: "var(--fs-3xl)", fontWeight: "900", marginBottom: "var(--space-3)", color: "var(--text-primary)", letterSpacing: "-1px" }}>
            Maneja tus envíos con nosotros
          </h2>
          <p style={{ fontSize: "var(--fs-lg)", color: "var(--text-secondary)", maxWidth: "500px" }}>
            Disfruta de tarifas especiales, acceso al panel de gestión avanzada y soporte prioritario uniéndote a Rápido Courier.
          </p>
        </div>
        <Link href="/login" style={{ 
          background: "var(--color-primary-600)", 
          color: "white", 
          padding: "var(--space-4) var(--space-8)", 
          borderRadius: "var(--radius-lg)", 
          fontSize: "var(--fs-base)", 
          fontWeight: "var(--fw-bold)",
          boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)",
          transition: "all 0.2s",
          display: "inline-block"
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "var(--color-primary-700)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "var(--color-primary-600)"; }}
        >
          Acceso Empleados
        </Link>
      </div>
      
    </div>
  );
}
