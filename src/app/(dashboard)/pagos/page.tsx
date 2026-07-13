"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { pagoService } from "@/services/pagoService";
import { paqueteService, type PaqueteResponse } from "@/services/paqueteService";
import { envioService, type BoletaDetalleResponse } from "@/services/envioService";
import { CreditCard, CheckCircle, Package, FileText, Download } from "lucide-react";
import Link from "next/link";
import { pdf } from "@react-pdf/renderer";
import { BoletaDocument } from "@/components/pdf/BoletaDocument";

function PagoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paqueteIdQuery = searchParams?.get("paqueteId") || "";
  const numeroOrdenQuery = searchParams?.get("numeroOrden") || "";
  const codigoRastreoQuery = searchParams?.get("codigoRastreo") || "";
  const envioIdQuery = searchParams?.get("envioId") || "";

  const [paqueteId, setPaqueteId] = useState(paqueteIdQuery);
  const [paqueteInfo, setPaqueteInfo] = useState<PaqueteResponse | null>(null);
  
  const [monto, setMonto] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  // Intentar cargar info del paquete para calcular tarifa sugerida
  useEffect(() => {
    if (paqueteId && paqueteId.length > 20) {
      paqueteService.getAll().then((paquetes) => {
        const found = paquetes.find(p => p.id === paqueteId);
        if (found) {
          setPaqueteInfo(found);
          const base = 10;
          const pesoExtra = Math.max(0, found.pesoKg - 1);
          const tarifaSugerida = base + (pesoExtra * 2);
          setMonto(tarifaSugerida.toFixed(2));
        } else {
          setMonto("10.00");
        }
      }).catch(() => setMonto("10.00"));
    }
  }, [paqueteId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await pagoService.procesar({
        paqueteId,
        monto: parseFloat(monto)
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || 
        err.response?.data?.message || 
        "Error al procesar el pago. Verifica el ID del paquete."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBoleta = async () => {
    if (!numeroOrdenQuery || !codigoRastreoQuery || !envioIdQuery) {
      setError("Faltan datos del envío para generar la boleta.");
      return;
    }
    
    setIsGeneratingPdf(true);
    setError(null);
    
    try {
      // 1. Obtener datos completos de la boleta desde el backend
      const boletaDatos = await envioService.getBoletaDatos(numeroOrdenQuery, codigoRastreoQuery);
      
      if (!boletaDatos) throw new Error("No se obtuvieron los datos de la boleta");

      // 2. Renderizar el PDF como Blob en el cliente
      const blob = await pdf(<BoletaDocument data={boletaDatos} />).toBlob();
      
      // 3. Crear el File object para subirlo
      const file = new File([blob], `Boleta_${numeroOrdenQuery}.pdf`, { type: "application/pdf" });
      
      // 4. Subir la boleta al backend (R2)
      await envioService.subirBoletaPdf(envioIdQuery, file);
      
      // 5. Descargar/Mostrar al usuario
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setPdfGenerated(true);
    } catch (err: any) {
      setError("Hubo un error al generar y subir la boleta.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="glass" style={{ maxWidth: "500px", margin: "0 auto", padding: "var(--space-8)", borderRadius: "var(--radius-xl)", textAlign: "center" }}>
        <CheckCircle size={64} style={{ margin: "0 auto var(--space-4)", color: "var(--color-success)" }} />
        <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: "var(--fw-bold)", marginBottom: "var(--space-2)" }}>¡Pago Exitoso!</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-6)" }}>
          El pago por S/ {monto} ha sido registrado. El paquete está listo para ser despachado.
        </p>
        
        {error && (
          <div style={{ color: "var(--color-error)", padding: "var(--space-3)", background: "rgba(239,68,68,0.1)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-4)" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Button 
            onClick={handleGenerateBoleta} 
            isLoading={isGeneratingPdf}
            disabled={pdfGenerated}
            style={{ width: "100%", display: "flex", justifyContent: "center", gap: "var(--space-2)", background: pdfGenerated ? "var(--color-success)" : "var(--color-primary-500)" }}
          >
            {pdfGenerated ? (
              <><CheckCircle size={20} /> Boleta Generada y Subida</>
            ) : (
              <><FileText size={20} /> Generar e Imprimir Boleta (PDF)</>
            )}
          </Button>

          <div style={{ display: "flex", gap: "var(--space-4)", justifyContent: "center", marginTop: "var(--space-2)" }}>
            <Link href="/envios">
              <Button variant="secondary">Ver Envíos</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary">Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", width: "100%" }}>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-bold)" }}>Caja - Cobro de Envío</h1>
        <p style={{ color: "var(--text-secondary)" }}>Verifique el monto y procese el pago del cliente.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass" style={{ padding: "var(--space-6)", borderRadius: "var(--radius-xl)", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        {error && (
          <div style={{ color: "var(--color-error)", padding: "var(--space-3)", background: "rgba(239,68,68,0.1)", borderRadius: "var(--radius-md)" }}>
            {error}
          </div>
        )}

        <div>
          <h3 style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--fs-md)", borderBottom: "1px solid var(--border-color)", paddingBottom: "var(--space-2)", marginBottom: "var(--space-4)" }}>
            <Package size={18} /> Datos del Servicio
          </h3>
          <Input
            label="ID del Paquete"
            required
            value={paqueteId}
            onChange={(e) => setPaqueteId(e.target.value)}
          />
          {paqueteInfo && (
            <div style={{ marginTop: "var(--space-3)", padding: "var(--space-3)", background: "var(--bg-primary)", borderRadius: "var(--radius-md)", fontSize: "var(--fs-sm)", color: "var(--text-secondary)" }}>
              <strong>Peso registrado:</strong> {paqueteInfo.pesoKg} kg <br/>
              <strong>Dimensiones:</strong> {paqueteInfo.largoCm}x{paqueteInfo.anchoCm}x{paqueteInfo.altoCm} cm
            </div>
          )}
        </div>

        <div>
          <h3 style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--fs-md)", borderBottom: "1px solid var(--border-color)", paddingBottom: "var(--space-2)", marginBottom: "var(--space-4)" }}>
            <CreditCard size={18} /> Liquidación
          </h3>
          
          <div style={{ background: "rgba(79, 70, 229, 0.05)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--color-primary-300)" }}>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--color-primary-600)", marginBottom: "var(--space-2)" }}>
              El monto sugerido (Tarifa base S/10 + S/2 por kg adicional) puede ser modificado manualmente en caso de aplicar descuentos o tarifas comerciales.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <span style={{ fontSize: "var(--fs-xl)", fontWeight: "var(--fw-bold)", color: "var(--text-primary)" }}>S/</span>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                style={{
                  width: "100%", padding: "var(--space-3)", fontSize: "var(--fs-xl)", fontWeight: "var(--fw-bold)",
                  fontFamily: "var(--font-sans)", color: "var(--text-primary)", background: "var(--bg-primary)",
                  border: "2px solid var(--border-color)", borderRadius: "var(--radius-md)", outline: "none"
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
          <Button type="submit" isLoading={isLoading} style={{ minWidth: "150px" }}>
            Cobrar S/ {monto || "0.00"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function PagosPage() {
  return (
    <Suspense fallback={<div>Cargando módulo de pagos...</div>}>
      <PagoContent />
    </Suspense>
  );
}
