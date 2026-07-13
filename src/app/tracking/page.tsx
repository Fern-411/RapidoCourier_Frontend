"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Package, Search, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { envioService } from "@/services/envioService";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import styles from "./tracking.module.css";
import Link from "next/link";

function TrackingContent() {
  const searchParams = useSearchParams();
  const paramOrden = searchParams.get("orden") || "";
  const paramRastreo = searchParams.get("rastreo") || "";

  const [numeroOrden, setNumeroOrden] = useState(paramOrden);
  const [codigoRastreo, setCodigoRastreo] = useState(paramRastreo);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [envioData, setEnvioData] = useState<any>(null);

  const fetchRastreo = async (orden: string, rastreo: string) => {
    setIsLoading(true);
    setError(null);
    setEnvioData(null);

    try {
      const data = await envioService.getByRastreo(orden.trim(), rastreo.trim());
      setEnvioData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "No se encontró ningún envío con esos datos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (paramOrden && paramRastreo) {
      fetchRastreo(paramOrden, paramRastreo);
    }
  }, [paramOrden, paramRastreo]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroOrden || !codigoRastreo) {
      setError("Por favor ingrese ambos campos.");
      return;
    }
    await fetchRastreo(numeroOrden, codigoRastreo);
  };

  const getStatusConfig = (estado: string) => {
    switch (estado) {
      case "REGISTRADO": 
        return { label: "Registrado", icon: Package, color: "#64748b", bg: "#f1f5f9" };
      case "EN_AGENCIA_ORIGEN": 
        return { label: "En Agencia Origen", icon: Package, color: "#3b82f6", bg: "#eff6ff" };
      case "EN_TRANSITO": 
        return { label: "En Tránsito", icon: Truck, color: "#f59e0b", bg: "#fffbeb" };
      case "EN_AGENCIA_DESTINO": 
        return { label: "En Agencia Destino", icon: Package, color: "#0ea5e9", bg: "#f0f9ff" };
      case "ENTREGADO": 
        return { label: "Entregado", icon: CheckCircle, color: "#10b981", bg: "#ecfdf5" };
      default: 
        return { label: estado, icon: Clock, color: "#64748b", bg: "#f1f5f9" };
    }
  };

  // Simulación de línea de tiempo basada en estado actual
  const timelineSteps = [
    { key: "REGISTRADO", title: "Envío Registrado", desc: "El envío ha sido creado en nuestro sistema." },
    { key: "EN_AGENCIA_ORIGEN", title: "En Agencia Origen", desc: "El paquete está en la agencia de origen preparándose para viajar." },
    { key: "EN_TRANSITO", title: "En Tránsito", desc: "El paquete está viajando hacia la ciudad destino." },
    { key: "EN_AGENCIA_DESTINO", title: "En Agencia Destino", desc: "El paquete ha llegado a la agencia de destino y espera recojo." },
    { key: "ENTREGADO", title: "Entregado", desc: "El paquete fue entregado exitosamente al destinatario." }
  ];

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const keys = timelineSteps.map(s => s.key);
    const currentIndex = keys.indexOf(currentStatus);
    const stepIndex = keys.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className={styles.logoIcon}>
            <Package size={28} />
          </div>
          <div className={styles.brandText}>Rápido Courier</div>
        </Link>
      </header>

      <main className={styles.main}>
        {!envioData && (
          <div className={styles.searchCard}>
            <h1>Rastrea tu Envío</h1>
            <p>Ingresa los datos de tu boleta para conocer el estado actual de tu paquete.</p>

            {error && (
              <div className={styles.errorBox}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSearch}>
              <div className={styles.inputGroup}>
                <label>Número de Orden</label>
                <input 
                  type="text" 
                  value={numeroOrden} 
                  onChange={(e) => setNumeroOrden(e.target.value.toUpperCase())}
                  placeholder="Ej. ORD-12345"
                  autoFocus
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label>Código de Rastreo</label>
                <input 
                  type="text" 
                  value={codigoRastreo} 
                  onChange={(e) => setCodigoRastreo(e.target.value.toUpperCase())}
                  placeholder="Ej. TRK-ABCDE"
                />
              </div>

              <button type="submit" className={styles.btnSearch} disabled={isLoading}>
                {isLoading ? "Buscando..." : <><Search size={20} /> Rastrear Paquete</>}
              </button>
            </form>
          </div>
        )}

        {envioData && (
          <div className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <div>
                <div className={styles.resultTitle}>Orden: {envioData.numeroOrden || "---"}</div>
                <div style={{ color: "#64748b", marginTop: "0.25rem" }}>
                  Código: {envioData.codigoRastreo}
                </div>
              </div>
              <div 
                className={styles.resultStatus} 
                style={{ 
                  backgroundColor: getStatusConfig(envioData.estadoActual).bg, 
                  color: getStatusConfig(envioData.estadoActual).color 
                }}
              >
                {(() => {
                  const Icon = getStatusConfig(envioData.estadoActual).icon;
                  return <Icon size={16} />;
                })()}
                {getStatusConfig(envioData.estadoActual).label}
              </div>
            </div>

            <div className={styles.timeline}>
              {timelineSteps.map((step) => {
                const status = getStepStatus(step.key, envioData.estadoActual);
                if (envioData.estadoActual === "CANCELADO" && status === "pending") return null;

                const isActive = status === 'active';
                const isCompleted = status === 'completed';

                return (
                  <div key={step.key} className={`${styles.timelineItem} ${isActive || isCompleted ? styles.active : ''}`} style={{ opacity: status === 'pending' ? 0.5 : 1 }}>
                    <div className={styles.timelineDot}>
                      {isCompleted ? <CheckCircle size={14} /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? 'white' : 'currentColor' }} />}
                    </div>
                    <div className={styles.timelineContent} style={{ borderColor: isActive ? 'var(--color-primary-200)' : '#f1f5f9' }}>
                      <h4>{step.title}</h4>
                      <p>{step.desc}</p>
                      {isActive && (
                        <span className={styles.timelineDate}>
                          Actualizado: {format(new Date(envioData.updatedAt), "dd 'de' MMMM, yyyy - HH:mm", { locale: es })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {envioData.estadoActual === "CANCELADO" && (
                <div className={`${styles.timelineItem} ${styles.active}`}>
                  <div className={styles.timelineDot} style={{ background: '#ef4444', borderColor: '#ef4444' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
                  </div>
                  <div className={styles.timelineContent} style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
                    <h4 style={{ color: '#b91c1c' }}>Envío Cancelado</h4>
                    <p style={{ color: '#dc2626' }}>El envío ha sido cancelado y ya no está en tránsito.</p>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setEnvioData(null)}
              style={{
                width: '100%',
                marginTop: '2rem',
                padding: '1rem',
                background: 'white',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Rastrear otro envío
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Cargando portal de rastreo...</div>}>
      <TrackingContent />
    </Suspense>
  );
}
