"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Truck, PackageCheck, Package } from "lucide-react";
import type { EnvioResponse, HistorialEstadoEnvioResponse } from "@/services/envioService";

interface TrackingTimelineProps {
  envio: EnvioResponse;
  historial: HistorialEstadoEnvioResponse[];
}

export function TrackingTimeline({ envio, historial }: TrackingTimelineProps) {
  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "EN_AGENCIA_ORIGEN": return <Package size={20} />;
      case "EN_TRANSITO": return <Truck size={20} />;
      case "EN_AGENCIA_DESTINO": return <MapPin size={20} />;
      case "ENTREGADO": return <PackageCheck size={20} />;
      default: return <Clock size={20} />;
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "EN_AGENCIA_ORIGEN": return "#dc2626";
      case "EN_TRANSITO": return "#f59e0b";
      case "EN_AGENCIA_DESTINO": return "#0284c7";
      case "ENTREGADO": return "#10b981";
      default: return "#6b7280";
    }
  };

  const formatEstado = (estado: string) => estado.replace("_", " ");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ 
        background: "var(--bg-secondary)", border: "1px solid var(--border-color)", 
        borderRadius: "var(--radius-xl)", overflow: "hidden", 
        boxShadow: "0 10px 30px rgba(0,0,0,0.03)" 
      }}
    >
      {/* Encabezado de la Tarjeta */}
      <div style={{ padding: "var(--space-6) var(--space-8)", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-secondary)" }}>
        <div>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "var(--fw-bold)" }}>
            Orden: {envio.numeroOrden}
          </div>
          <div style={{ fontSize: "var(--fs-xl)", fontWeight: "var(--fw-bold)", color: "var(--color-primary-600)" }}>
            {envio.codigoRastreo}
          </div>
        </div>
        <div style={{ 
          display: "inline-flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-2) var(--space-4)", 
          borderRadius: "var(--radius-full)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-sm)",
          background: `color-mix(in srgb, ${getStatusColor(envio.estadoActual)} 15%, transparent)`,
          color: getStatusColor(envio.estadoActual)
        }}>
          {getStatusIcon(envio.estadoActual)}
          {formatEstado(envio.estadoActual)}
        </div>
      </div>

      {/* Detalles de Ruta */}
      <div style={{ padding: "var(--space-6) var(--space-8)", display: "flex", alignItems: "center", gap: "var(--space-6)", background: "var(--bg-secondary)", flexWrap: "wrap", borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "var(--fw-bold)" }}>Agencia de Origen</div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--fs-lg)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)" }}>
            <MapPin size={18} color="var(--color-primary-500)" /> {envio.agenciaOrigen}
          </div>
        </div>
        
        {/* Flecha Animada (Sólo en pantallas grandes) */}
        <div style={{ flex: "1 1 100px", position: "relative", height: "2px", background: "var(--border-color)", display: "block" }}>
          <motion.div 
            initial={{ left: 0 }} animate={{ left: "100%" }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            style={{ position: "absolute", top: "-3px", width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-primary-500)", boxShadow: "0 0 10px var(--color-primary-500)" }}
          />
        </div>

        <div style={{ flex: 1, textAlign: "right", minWidth: "200px" }}>
          <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "var(--fw-bold)" }}>Agencia de Destino</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "var(--space-2)", fontSize: "var(--fs-lg)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)" }}>
            <MapPin size={18} color="#10b981" /> {envio.agenciaDestino}
          </div>
        </div>
      </div>

      {/* Historial Timeline */}
      <div style={{ padding: "var(--space-8)" }}>
        <h3 style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", marginBottom: "var(--space-6)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Clock size={20} color="var(--color-primary-500)" /> Historial de Movimientos
        </h3>
        
        {historial.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>No hay movimientos registrados.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {historial.map((hito, index) => {
              const isLast = index === 0;
              const color = getStatusColor(hito.estado);
              
              return (
                <div key={hito.id} style={{ display: "flex", gap: "var(--space-6)" }}>
                  <div style={{ flex: "0 0 120px", textAlign: "right", paddingTop: "var(--space-1)" }}>
                    <div style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-bold)", color: "var(--text-primary)" }}>
                      {new Date(hito.fechaCambio).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
                      {new Date(hito.fechaCambio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>

                  <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ 
                      width: 20, height: 20, borderRadius: "50%", background: isLast ? color : "var(--bg-secondary)", 
                      border: `3px solid ${color}`, zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: isLast ? `0 0 0 4px color-mix(in srgb, ${color} 20%, transparent)` : "none"
                    }}>
                      {isLast && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--bg-secondary)" }} />}
                    </div>
                    {index !== historial.length - 1 && (
                      <div style={{ width: 2, flex: 1, background: "var(--border-color)", margin: "4px 0", minHeight: "40px" }} />
                    )}
                  </div>

                  <div style={{ flex: 1, paddingBottom: index !== historial.length - 1 ? "var(--space-6)" : "var(--space-2)", paddingTop: "2px" }}>
                    <div style={{ fontSize: "var(--fs-base)", fontWeight: "var(--fw-bold)", color: isLast ? color : "var(--text-primary)" }}>
                      {formatEstado(hito.estado)}
                    </div>
                    <div style={{ fontSize: "var(--fs-sm)", color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>
                      Actualizado por: {hito.usuarioResponsable}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
