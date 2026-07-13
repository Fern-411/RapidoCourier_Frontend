"use client";

import { useEffect, useState } from "react";
import { envioService, type EstadisticasEnvioResponse } from "@/services/envioService";
import { Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasEnvioResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        const data = await envioService.getEstadisticasDiarias();
        setEstadisticas(data);
      } catch (err: any) {
        setError("Error al cargar las estadísticas del dashboard.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEstadisticas();
  }, []);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "EN_AGENCIA_ORIGEN": return "#dc2626"; // primary-600
      case "EN_TRANSITO": return "#f59e0b"; // warning
      case "EN_AGENCIA_DESTINO": return "#0284c7"; // sky
      case "ENTREGADO": return "#10b981"; // success
      case "CANCELADO": return "#ef4444"; // error
      default: return "#dc2626"; // primary
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "EN_AGENCIA_ORIGEN": return <Package size={24} color={getStatusColor(estado)} />;
      case "EN_TRANSITO": return <Truck size={24} color={getStatusColor(estado)} />;
      case "EN_AGENCIA_DESTINO": return <Package size={24} color={getStatusColor(estado)} />;
      case "ENTREGADO": return <CheckCircle size={24} color={getStatusColor(estado)} />;
      default: return <Clock size={24} color={getStatusColor(estado)} />;
    }
  };

  const formatEstado = (estado: string) => estado.replace("_", " ");

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-12)" }}>
        <p style={{ color: "var(--text-secondary)" }}>Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "var(--space-4)", background: "rgba(239,68,68,0.1)", color: "var(--color-error)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <AlertCircle size={20} />
        {error}
      </div>
    );
  }

  const chartData = estadisticas ? Object.entries(estadisticas.enviosPorEstado).map(([estado, cantidad]) => ({
    name: formatEstado(estado),
    cantidad,
    originalKey: estado
  })) : [];

  return (
    <div>
      <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-bold)", marginBottom: "var(--space-2)" }}>
        Dashboard General
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-6)" }}>
        Resumen de operaciones y estado de los envíos del día.
      </p>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
        
        {/* Total Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="glass" 
          style={{ padding: "var(--space-6)", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", gap: "var(--space-4)" }}
        >
          <div style={{ padding: "var(--space-3)", background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)" }}>
            <Package size={28} color="var(--color-primary-500)" />
          </div>
          <div>
            <div style={{ color: "var(--text-secondary)", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", marginBottom: "var(--space-1)" }}>
              Total Envíos Hoy
            </div>
            <div style={{ fontSize: "var(--fs-3xl)", fontWeight: "var(--fw-bold)" }}>
              {estadisticas?.totalEnviosHoy || 0}
            </div>
          </div>
        </motion.div>

        {/* Dynamic State Cards */}
        {estadisticas && Object.entries(estadisticas.enviosPorEstado).map(([estado, cantidad], i) => (
          <motion.div 
            key={estado}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: (i + 1) * 0.1 }}
            className="glass" 
            style={{ padding: "var(--space-6)", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", gap: "var(--space-4)" }}
          >
            <div style={{ padding: "var(--space-3)", background: `color-mix(in srgb, ${getStatusColor(estado)} 10%, transparent)`, borderRadius: "var(--radius-lg)" }}>
              {getStatusIcon(estado)}
            </div>
            <div>
              <div style={{ color: "var(--text-secondary)", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", marginBottom: "var(--space-1)" }}>
                {formatEstado(estado)}
              </div>
              <div style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-bold)", color: getStatusColor(estado) }}>
                {cantidad}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
        className="glass"
        style={{ padding: "var(--space-6)", borderRadius: "var(--radius-xl)" }}
      >
        <h2 style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", marginBottom: "var(--space-6)" }}>
          Distribución de Estados
        </h2>
        
        <div style={{ height: "300px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: "var(--bg-secondary)" }}
                contentStyle={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)" }}
              />
              <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getStatusColor(entry.originalKey)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
