"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { envioService, type BoletaDetalleResponse } from "@/services/envioService";
import { Printer, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function ImprimirDocumentoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orden = searchParams.get("orden");
  const rastreo = searchParams.get("rastreo");
  const tipo = searchParams.get("tipo") || "boleta"; // 'boleta' o 'ticket'
  
  const [datos, setDatos] = useState<BoletaDetalleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orden || !rastreo) {
      setError("Faltan parámetros de orden o rastreo.");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const data = await envioService.getBoletaDatos(orden, rastreo);
        setDatos(data);
      } catch (err: any) {
        setError("Error al obtener los datos de impresión.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [orden, rastreo]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div style={{ padding: "var(--space-8)", textAlign: "center" }}>Cargando documento...</div>;
  }

  if (error || !datos) {
    return <div style={{ padding: "var(--space-8)", color: "var(--color-error)" }}>{error}</div>;
  }

  return (
    <div style={{ padding: "var(--space-8)", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Controles (Ocultos en impresión) */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-8)" }}>
        <button 
          onClick={() => router.back()} 
          style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-3) var(--space-4)", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}
        >
          <ArrowLeft size={18} /> Volver
        </button>
        <button 
          onClick={handlePrint} 
          style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-3) var(--space-6)", background: "var(--color-primary-600)", color: "white", borderRadius: "var(--radius-md)", fontWeight: "var(--fw-bold)" }}
        >
          <Printer size={18} /> Imprimir {tipo === "boleta" ? "Boleta A4" : "Ticket Térmico"}
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        {tipo === "boleta" ? (
          <BoletaA4 datos={datos} />
        ) : (
          <TicketTermico datos={datos} />
        )}
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 0;
            size: ${tipo === "boleta" ? "A4" : "80mm auto"};
          }
        }
      `}</style>
    </div>
  );
}

function BoletaA4({ datos }: { datos: BoletaDetalleResponse }) {
  return (
    <div style={{ 
      width: "210mm", 
      minHeight: "297mm", 
      background: "white", 
      padding: "20mm",
      boxShadow: "0 0 20px rgba(0,0,0,0.1)",
      color: "black",
      fontFamily: "Arial, sans-serif"
    }}>
      {/* Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #dc2626", paddingBottom: "20px", marginBottom: "20px" }}>
        <div>
          <h1 style={{ color: "#dc2626", margin: 0, fontSize: "28px", fontWeight: "900", letterSpacing: "-1px" }}>RÁPIDO COURIER</h1>
          <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "14px" }}>Soluciones Logísticas Premium</p>
          <p style={{ margin: "2px 0 0 0", color: "#666", fontSize: "12px" }}>RUC: 20123456789</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <h2 style={{ margin: 0, fontSize: "24px", color: "#333" }}>BOLETA DE VENTA</h2>
          <p style={{ margin: "5px 0 0 0", fontSize: "16px", fontWeight: "bold" }}>Nº Orden: {datos.numeroOrden}</p>
          <p style={{ margin: "2px 0 0 0", fontSize: "14px", color: "#dc2626" }}>Rastreo: {datos.codigoRastreo}</p>
          <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#666" }}>Fecha: {new Date(datos.fechaEmision).toLocaleString()}</p>
        </div>
      </div>

      {/* Info Remitente y Destinatario */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <div style={{ flex: 1, padding: "15px", border: "1px solid #eee", borderRadius: "8px", background: "#f9f9f9" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#dc2626", textTransform: "uppercase" }}>Remitente</h3>
          <p style={{ margin: "0 0 5px 0", fontWeight: "bold", fontSize: "16px" }}>{datos.remitente.nombreCompleto}</p>
          <p style={{ margin: "0 0 3px 0", fontSize: "14px" }}>DNI: {datos.remitente.dni}</p>
          <p style={{ margin: "0", fontSize: "14px" }}>Tel: {datos.remitente.telefono}</p>
          <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #ddd" }}>
            <p style={{ margin: "0 0 3px 0", fontSize: "12px", color: "#666" }}>Origen:</p>
            <p style={{ margin: "0", fontSize: "14px", fontWeight: "bold" }}>{datos.agenciaOrigen}</p>
            <p style={{ margin: "0", fontSize: "12px" }}>{datos.direccionOrigen}</p>
          </div>
        </div>
        
        <div style={{ flex: 1, padding: "15px", border: "1px solid #eee", borderRadius: "8px", background: "#f9f9f9" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#dc2626", textTransform: "uppercase" }}>Destinatario</h3>
          <p style={{ margin: "0 0 5px 0", fontWeight: "bold", fontSize: "16px" }}>{datos.destinatario.nombreCompleto}</p>
          <p style={{ margin: "0 0 3px 0", fontSize: "14px" }}>DNI: {datos.destinatario.dni}</p>
          <p style={{ margin: "0", fontSize: "14px" }}>Tel: {datos.destinatario.telefono}</p>
          <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #ddd" }}>
            <p style={{ margin: "0 0 3px 0", fontSize: "12px", color: "#666" }}>Destino:</p>
            <p style={{ margin: "0", fontSize: "14px", fontWeight: "bold" }}>{datos.agenciaDestino}</p>
            <p style={{ margin: "0", fontSize: "12px" }}>{datos.direccionDestino}</p>
          </div>
        </div>
      </div>

      {/* Detalles del Paquete */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
        <thead>
          <tr style={{ background: "#f1f1f1" }}>
            <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Descripción</th>
            <th style={{ padding: "10px", textAlign: "center", border: "1px solid #ddd" }}>Peso (Kg)</th>
            <th style={{ padding: "10px", textAlign: "right", border: "1px solid #ddd" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>{datos.descripcionPaquete}</td>
            <td style={{ padding: "10px", textAlign: "center", border: "1px solid #ddd" }}>{datos.pesoKg}</td>
            <td style={{ padding: "10px", textAlign: "right", border: "1px solid #ddd" }}>S/ {datos.montoTotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      {/* Totales */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ width: "300px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid #ddd" }}>
            <span>Subtotal:</span>
            <span>S/ {(datos.montoTotal / 1.18).toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid #ddd" }}>
            <span>IGV (18%):</span>
            <span>S/ {(datos.montoTotal - (datos.montoTotal / 1.18)).toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 10px", background: "#dc2626", color: "white", fontWeight: "bold", fontSize: "18px", marginTop: "10px", borderRadius: "8px" }}>
            <span>TOTAL:</span>
            <span>S/ {datos.montoTotal.toFixed(2)}</span>
          </div>
          <div style={{ textAlign: "right", marginTop: "10px", fontSize: "14px", color: datos.estadoPago === "PAGADO" ? "#10b981" : "#f59e0b", fontWeight: "bold" }}>
            ESTADO: {datos.estadoPago}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "50px", textAlign: "center", fontSize: "12px", color: "#888", borderTop: "1px solid #eee", paddingTop: "20px" }}>
        <p>Gracias por confiar en Rápido Courier.</p>
        <p>Conserve esta boleta para cualquier reclamo o seguimiento.</p>
        <p>Rastree su envío en: www.rapidocourier.com</p>
      </div>
    </div>
  );
}

function TicketTermico({ datos }: { datos: BoletaDetalleResponse }) {
  return (
    <div style={{ 
      width: "80mm", 
      background: "white", 
      padding: "5mm",
      color: "black",
      fontFamily: "monospace",
      fontSize: "12px",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)"
    }}>
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <h2 style={{ margin: "0 0 5px 0", fontSize: "18px" }}>RAPIDO COURIER</h2>
        <p style={{ margin: "0", fontSize: "10px" }}>RUC: 20123456789</p>
        <p style={{ margin: "0", fontSize: "10px" }}>{datos.agenciaOrigen}</p>
        <p style={{ margin: "0", fontSize: "10px" }}>{datos.direccionOrigen}</p>
      </div>

      <div style={{ borderTop: "1px dashed black", borderBottom: "1px dashed black", padding: "10px 0", marginBottom: "10px" }}>
        <p style={{ margin: "0 0 5px 0" }}>ORDEN: <strong style={{ fontSize: "14px" }}>{datos.numeroOrden}</strong></p>
        <p style={{ margin: "0 0 5px 0" }}>RASTREO: <strong style={{ fontSize: "14px" }}>{datos.codigoRastreo}</strong></p>
        <p style={{ margin: "0", fontSize: "10px" }}>FECHA: {new Date(datos.fechaEmision).toLocaleString()}</p>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <p style={{ margin: "0 0 2px 0", fontWeight: "bold" }}>REMITENTE:</p>
        <p style={{ margin: "0 0 2px 0" }}>{datos.remitente.nombreCompleto.substring(0, 20)}</p>
        <p style={{ margin: "0 0 5px 0" }}>DNI: {datos.remitente.dni}</p>

        <p style={{ margin: "0 0 2px 0", fontWeight: "bold" }}>DESTINATARIO:</p>
        <p style={{ margin: "0 0 2px 0" }}>{datos.destinatario.nombreCompleto.substring(0, 20)}</p>
        <p style={{ margin: "0 0 2px 0" }}>DNI: {datos.destinatario.dni}</p>
        <p style={{ margin: "0 0 5px 0" }}>DESTINO: {datos.agenciaDestino}</p>
      </div>

      <div style={{ borderTop: "1px dashed black", padding: "10px 0", marginBottom: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
          <span>DESCRIP:</span>
          <span>{datos.descripcionPaquete.substring(0, 10)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
          <span>PESO:</span>
          <span>{datos.pesoKg} Kg</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "14px", marginTop: "10px" }}>
          <span>TOTAL:</span>
          <span>S/ {datos.montoTotal.toFixed(2)}</span>
        </div>
      </div>
      
      <div style={{ textAlign: "center", marginTop: "20px", fontSize: "10px" }}>
        <p style={{ margin: "0 0 5px 0" }}>ESTADO: {datos.estadoPago}</p>
        <p style={{ margin: "0" }}>*** GRACIAS POR SU COMPRA ***</p>
        <p style={{ margin: "5px 0 0 0" }}>rapidocourier.com</p>
      </div>
    </div>
  );
}
