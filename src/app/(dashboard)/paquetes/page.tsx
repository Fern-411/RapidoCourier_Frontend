"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { envioService, type EnvioResponse, type PaginaResponse } from "@/services/envioService";
import { Package, Search, Calendar, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function PaquetesPage() {
  const [pagina, setPagina] = useState<PaginaResponse<EnvioResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaInput, setBusquedaInput] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [estado, setEstado] = useState("");

  const fetchPaginados = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fInicio = fechaInicio ? `${fechaInicio}T00:00:00` : undefined;
      const fFin = fechaFin ? `${fechaFin}T23:59:59` : undefined;
      
      const data = await envioService.getPaginados(page, size, busqueda, fInicio, fFin, estado);
      setPagina(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Error al cargar la lista paginada");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaginados();
  }, [page, size, busqueda, fechaInicio, fechaFin, estado]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setBusqueda(busquedaInput);
  };

  const clearFilters = () => {
    setBusqueda("");
    setBusquedaInput("");
    setFechaInicio("");
    setFechaFin("");
    setEstado("");
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EN_ALMACEN": return "var(--color-primary-500)";
      case "EN_AGENCIA_ORIGEN": return "var(--color-primary-500)";
      case "EN_TRANSITO": return "var(--color-warning)";
      case "EN_AGENCIA_DESTINO": return "var(--color-info)";
      case "ENTREGADO": return "var(--color-success)";
      default: return "var(--text-secondary)";
    }
  };

  const formatFechaHora = (isoDate: string) => {
    const d = new Date(isoDate);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)", flexWrap: "wrap", gap: "var(--space-3)" }}>
        <div>
          <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-bold)" }}>Historial General de Paquetes</h1>
          <p style={{ color: "var(--text-secondary)" }}>Consulta avanzada, rastreo y paginación de los paquetes enviados.</p>
        </div>
      </div>

      <div className="glass" style={{ padding: "var(--space-4)", borderRadius: "var(--radius-xl)", marginBottom: "var(--space-6)" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)", alignItems: "flex-end" }}>
          
          <div style={{ flex: "1 1 250px" }}>
            <label style={{ fontSize: "var(--fs-xs)", fontWeight: "var(--fw-medium)", color: "var(--text-secondary)", marginBottom: "var(--space-1)", display: "block" }}>Buscar por Rastreo / Orden</label>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <Input 
                placeholder="Ej. ABC1 o 12345678" 
                value={busquedaInput}
                onChange={(e) => setBusquedaInput(e.target.value)}
                style={{ margin: 0, flex: 1 }}
              />
              <Button type="submit" variant="primary" style={{ padding: "0 var(--space-3)" }}>
                <Search size={18} />
              </Button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "var(--fs-xs)", fontWeight: "var(--fw-medium)", color: "var(--text-secondary)", marginBottom: "var(--space-1)", display: "block" }}>Fecha Inicio</label>
            <Input type="date" value={fechaInicio} onChange={(e) => { setFechaInicio(e.target.value); setPage(0); }} style={{ margin: 0 }} />
          </div>
          
          <div>
            <label style={{ fontSize: "var(--fs-xs)", fontWeight: "var(--fw-medium)", color: "var(--text-secondary)", marginBottom: "var(--space-1)", display: "block" }}>Fecha Fin</label>
            <Input type="date" value={fechaFin} onChange={(e) => { setFechaFin(e.target.value); setPage(0); }} style={{ margin: 0 }} />
          </div>

          <div>
            <label style={{ fontSize: "var(--fs-xs)", fontWeight: "var(--fw-medium)", color: "var(--text-secondary)", marginBottom: "var(--space-1)", display: "block" }}>Estado</label>
            <select 
              value={estado} 
              onChange={(e) => { setEstado(e.target.value); setPage(0); }}
              style={{
                width: "100%", padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)", background: "var(--bg-secondary)",
                color: "var(--text-primary)", fontSize: "var(--fs-sm)", outline: "none"
              }}
            >
              <option value="">Todos los Estados</option>
              <option value="EN_AGENCIA_ORIGEN">En Agencia Origen</option>
              <option value="EN_TRANSITO">En Tránsito</option>
              <option value="EN_AGENCIA_DESTINO">En Agencia Destino</option>
              <option value="ENTREGADO">Entregado</option>
            </select>
          </div>

          {(busqueda || fechaInicio || fechaFin || estado) && (
            <Button type="button" variant="secondary" onClick={clearFilters} style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}>
              Limpiar Filtros
            </Button>
          )}
        </form>
      </div>

      {error && (
        <div style={{ color: "var(--color-error)", padding: "var(--space-4)", background: "rgba(239,68,68,0.1)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-6)" }}>
          {error}
        </div>
      )}

      <div className="glass" style={{ borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)", background: "rgba(0,0,0,0.02)" }}>
                <th style={{ padding: "var(--space-4)", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-semibold)", color: "var(--text-secondary)" }}>Rastreo</th>
                <th style={{ padding: "var(--space-4)", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-semibold)", color: "var(--text-secondary)" }}>N° Orden</th>
                <th style={{ padding: "var(--space-4)", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-semibold)", color: "var(--text-secondary)" }}>Fecha y Hora</th>
                <th style={{ padding: "var(--space-4)", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-semibold)", color: "var(--text-secondary)" }}>Ruta</th>
                <th style={{ padding: "var(--space-4)", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-semibold)", color: "var(--text-secondary)" }}>Estado</th>
                <th style={{ padding: "var(--space-4)", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-semibold)", color: "var(--text-secondary)", textAlign: "center" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--text-muted)" }}>Cargando datos...</td>
                </tr>
              ) : !pagina || pagina.contenido.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "var(--space-10)", color: "var(--text-muted)" }}>
                    <Package size={32} style={{ margin: "0 auto var(--space-2)", opacity: 0.5 }} />
                    No se encontraron paquetes con los filtros actuales.
                  </td>
                </tr>
              ) : (
                pagina.contenido.map((envio) => (
                  <tr key={envio.id} style={{ borderBottom: "1px solid var(--border-color)", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.01)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "var(--space-4)" }}>
                      <span style={{ fontWeight: "var(--fw-bold)", color: "var(--color-primary-600)" }}>{envio.codigoRastreo}</span>
                    </td>
                    <td style={{ padding: "var(--space-4)", fontSize: "var(--fs-sm)" }}>{envio.numeroOrden}</td>
                    <td style={{ padding: "var(--space-4)", fontSize: "var(--fs-sm)", color: "var(--text-secondary)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                        <Calendar size={14} />
                        {formatFechaHora(envio.createdAt)}
                      </div>
                    </td>
                    <td style={{ padding: "var(--space-4)", fontSize: "var(--fs-sm)", color: "var(--text-secondary)" }}>
                      {envio.agenciaOrigen} → {envio.agenciaDestino}
                    </td>
                    <td style={{ padding: "var(--space-4)" }}>
                      <span style={{ 
                        display: "inline-block", padding: "2px 8px", borderRadius: "var(--radius-full)", 
                        fontSize: "0.7rem", fontWeight: "var(--fw-bold)", letterSpacing: "0.05em",
                        background: `color-mix(in srgb, ${getStatusColor(envio.estadoActual)} 15%, transparent)`,
                        color: getStatusColor(envio.estadoActual),
                        border: `1px solid color-mix(in srgb, ${getStatusColor(envio.estadoActual)} 30%, transparent)`
                      }}>
                        {envio.estadoActual.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td style={{ padding: "var(--space-4)", textAlign: "center" }}>
                      <Link href={`/envios`}>
                        <Button variant="secondary" style={{ padding: "var(--space-1) var(--space-3)", fontSize: "var(--fs-xs)" }}>
                          Gestionar
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagina && pagina.totalPaginas > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-4)", borderTop: "1px solid var(--border-color)", background: "rgba(0,0,0,0.01)" }}>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--text-secondary)" }}>
              Mostrando página <strong>{pagina.pagina + 1}</strong> de <strong>{pagina.totalPaginas}</strong> 
              (Total: {pagina.totalElementos} paquetes)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <select 
                value={size} 
                onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
                style={{ padding: "var(--space-1)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", fontSize: "var(--fs-sm)", outline: "none", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
              >
                <option value={5}>5 por pág.</option>
                <option value={10}>10 por pág.</option>
                <option value={20}>20 por pág.</option>
              </select>
              <Button 
                variant="secondary" 
                disabled={pagina.pagina === 0} 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                style={{ padding: "var(--space-1) var(--space-2)" }}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button 
                variant="secondary" 
                disabled={pagina.ultima} 
                onClick={() => setPage(p => p + 1)}
                style={{ padding: "var(--space-1) var(--space-2)" }}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
