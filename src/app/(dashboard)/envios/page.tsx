"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { envioService, type EnvioResponse } from "@/services/envioService";
import { Plus, Truck, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { EnvioEntregarModal } from "@/components/EnvioEntregarModal";
import { PagoModal } from "@/components/PagoModal";
import Swal from "sweetalert2";

export default function EnviosPage() {
  const [envios, setEnvios] = useState<EnvioResponse[]>([]);
  const [filteredEnvios, setFilteredEnvios] = useState<EnvioResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEnvio, setSelectedEnvio] = useState<{ id: string; codigoRastreo: string } | null>(null);
  const [pagoEnvio, setPagoEnvio] = useState<EnvioResponse | null>(null);

  const fetchEnvios = async () => {
    try {
      const data = await envioService.getAll();
      setEnvios(data);
      setFilteredEnvios(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Error al cargar envíos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvios();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEnvios(envios);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredEnvios(
        envios.filter((envio) =>
          envio.codigoRastreo.toLowerCase().includes(term) ||
          envio.agenciaOrigen.toLowerCase().includes(term) ||
          envio.agenciaDestino.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, envios]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EN_ALMACEN": return "var(--color-primary-500)";
      case "EN_TRANSITO": return "var(--color-warning)";
      case "ENTREGADO": return "var(--color-success)";
      default: return "var(--text-secondary)";
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)", flexWrap: "wrap", gap: "var(--space-3)" }}>
        <div>
          <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-bold)" }}>Envíos</h1>
          <p style={{ color: "var(--text-secondary)" }}>Gestión y seguimiento de paquetes en ruta</p>
        </div>
        <Link href="/envios/nuevo">
          <Button>
            <Plus size={18} />
            Generar Envío
          </Button>
        </Link>
      </div>

      <div className="glass" style={{ padding: "var(--space-4)", borderRadius: "var(--radius-xl)", marginBottom: "var(--space-6)", display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <div style={{ flex: 1, maxWidth: "400px" }}>
          <Input 
            placeholder="Buscar por código de rastreo o agencia..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ margin: 0 }}
          />
        </div>
        <Search size={20} color="var(--text-secondary)" />
      </div>

      {error && (
        <div style={{ color: "var(--color-error)", padding: "var(--space-4)", background: "rgba(239,68,68,0.1)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-6)" }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--text-muted)" }}>
          Cargando envíos...
        </div>
      ) : filteredEnvios.length === 0 ? (
        <div className="glass" style={{ textAlign: "center", padding: "var(--space-10)", borderRadius: "var(--radius-xl)" }}>
          <Truck size={48} style={{ margin: "0 auto var(--space-4)", color: "var(--color-primary-300)" }} />
          <h3 style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-semibold)", marginBottom: "var(--space-2)" }}>No hay envíos</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-6)" }}>No se han encontrado envíos que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          {filteredEnvios.map((envio) => (
            <div key={envio.id} className="glass" style={{ padding: "var(--space-4) var(--space-6)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-3)" }}>
              <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "rgba(79, 70, 229, 0.1)", color: getStatusColor(envio.estadoActual), display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Truck size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: "var(--fw-bold)", fontSize: "var(--fs-md)" }}>
                    Rastreo: {envio.codigoRastreo}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--fs-sm)", color: "var(--text-secondary)" }}>
                    <MapPin size={14} /> {envio.agenciaOrigen} <span style={{ color: "var(--text-muted)" }}>→</span> {envio.agenciaDestino}
                  </div>
                </div>
              </div>
              
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "var(--space-2)" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ 
                    display: "inline-block",
                    padding: "var(--space-1) var(--space-3)", 
                    borderRadius: "var(--radius-full)", 
                    fontSize: "var(--fs-xs)", 
                    fontWeight: "var(--fw-bold)", 
                    background: `color-mix(in srgb, ${getStatusColor(envio.estadoActual)} 15%, transparent)`,
                    color: getStatusColor(envio.estadoActual),
                    border: `1px solid color-mix(in srgb, ${getStatusColor(envio.estadoActual)} 30%, transparent)`,
                    letterSpacing: "0.05em"
                  }}>
                    {envio.estadoActual.replace("_", " ")}
                  </span>
                  
                  <span style={{ 
                    display: "inline-block",
                    padding: "var(--space-1) var(--space-3)", 
                    borderRadius: "var(--radius-full)", 
                    fontSize: "var(--fs-xs)", 
                    fontWeight: "var(--fw-bold)", 
                    background: envio.tipoPago === 'DESTINO' ? '#fffbeb' : '#f0fdf4',
                    color: envio.tipoPago === 'DESTINO' ? '#d97706' : '#166534',
                    border: `1px solid ${envio.tipoPago === 'DESTINO' ? '#fcd34d' : '#bbf7d0'}`,
                    letterSpacing: "0.05em"
                  }}>
                    {envio.tipoPago === 'DESTINO' ? 'PAGO EN DESTINO' : 'PAGO EN ORIGEN'}
                  </span>
                </div>
                
                {envio.estadoActual === "EN_AGENCIA_ORIGEN" && (
                  <Button 
                    variant="secondary" 
                    style={{ padding: "var(--space-1) var(--space-3)", fontSize: "var(--fs-xs)", minHeight: "30px", width: "100%" }}
                    onClick={async () => {
                      const result = await Swal.fire({
                        title: '¿Enviar a Tránsito?',
                        text: `El paquete ${envio.codigoRastreo} será enviado a tránsito.`,
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Sí, enviar',
                        cancelButtonText: 'Cancelar'
                      });
                      
                      if (result.isConfirmed) {
                        try {
                          await envioService.actualizarEstado(envio.id, "EN_TRANSITO");
                          fetchEnvios();
                          Swal.fire('Actualizado', 'El paquete ahora está en tránsito', 'success');
                        } catch (e: any) {
                          console.error("Error al cambiar estado", e);
                          Swal.fire('Error', e.response?.data?.message || e.message || "Error al cambiar estado", 'error');
                        }
                      }
                    }}
                  >
                    Enviar a Tránsito
                  </Button>
                )}

                {envio.estadoActual === "EN_TRANSITO" && (
                  <Button 
                    variant="secondary" 
                    style={{ padding: "var(--space-1) var(--space-3)", fontSize: "var(--fs-xs)", minHeight: "30px", width: "100%" }}
                    onClick={async () => {
                      const result = await Swal.fire({
                        title: '¿Recibir en Destino?',
                        text: `El paquete ${envio.codigoRastreo} será marcado como recibido en la agencia destino.`,
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Sí, recibir',
                        cancelButtonText: 'Cancelar'
                      });
                      
                      if (result.isConfirmed) {
                        try {
                          await envioService.actualizarEstado(envio.id, "EN_AGENCIA_DESTINO");
                          fetchEnvios();
                          Swal.fire('Actualizado', 'El paquete ha sido recibido en la agencia de destino', 'success');
                        } catch (e: any) {
                          console.error("Error al cambiar estado", e);
                          Swal.fire('Error', e.response?.data?.message || e.message || "Error al cambiar estado", 'error');
                        }
                      }
                    }}
                  >
                    Recibir en Destino
                  </Button>
                )}

                {envio.estadoActual === "EN_AGENCIA_DESTINO" && (
                  <Button 
                    variant="primary" 
                    style={{ padding: "var(--space-1) var(--space-3)", fontSize: "var(--fs-xs)", minHeight: "30px", width: "100%" }}
                    onClick={() => {
                      setSelectedEnvio({ id: envio.id, codigoRastreo: envio.codigoRastreo });
                      setIsModalOpen(true);
                    }}
                  >
                    Entregar
                  </Button>
                )}

                {envio.urlGuia && (
                  <a 
                    href={envio.urlGuia}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: "var(--fs-xs)", color: "var(--color-primary-600)", textDecoration: "underline", display: "inline-block", marginRight: "10px" }}
                  >
                    Descargar Guía
                  </a>
                )}
                {envio.urlBoleta ? (
                  <a 
                    href={envio.urlBoleta}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: "var(--fs-xs)", color: "var(--color-success)", textDecoration: "underline", display: "inline-block" }}
                  >
                    Descargar Boleta
                  </a>
                ) : (
                  <Button
                    variant="primary"
                    style={{ padding: "var(--space-1) var(--space-3)", fontSize: "var(--fs-xs)", minHeight: "30px", width: "100%", backgroundColor: "var(--color-success)", color: "white" }}
                    onClick={() => setPagoEnvio(envio)}
                  >
                    Pagar
                  </Button>
                )}
                
                <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", marginTop: "var(--space-2)" }}>
                  {new Date(envio.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEnvio && (
        <EnvioEntregarModal
          isOpen={isModalOpen}
          envioId={selectedEnvio.id}
          codigoRastreo={selectedEnvio.codigoRastreo}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchEnvios();
          }}
        />
      )}

      <PagoModal
        isOpen={!!pagoEnvio}
        onClose={() => setPagoEnvio(null)}
        onSuccess={() => {
          fetchEnvios();
        }}
        envio={pagoEnvio}
      />
    </div>
  );
}
