"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { paqueteService, type PaqueteRequest, type CategoriaResponse } from "@/services/paqueteService";
import { ArrowLeft, Package, User } from "lucide-react";
import Link from "next/link";

export default function NuevoPaquetePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<CategoriaResponse[]>([]);
  const [selectedCategorias, setSelectedCategorias] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<PaqueteRequest>({
    dniRemitente: "",
    dniDestinatario: "",
    pesoKg: 0,
    valorDeclarado: 0,
    altoCm: 0,
    anchoCm: 0,
    largoCm: 0,
    categorias: [],
  });

  useEffect(() => {
    // Cargar categorías disponibles
    paqueteService.getCategorias().then(setCategorias).catch(() => {
      // Si falla, mock data provisoria para que la UI funcione
      setCategorias([
        { id: "1", nombre: "FRAGIL", descripcion: "Cuidado especial" },
        { id: "2", nombre: "ELECTRONICO", descripcion: "Equipos electrónicos" },
        { id: "3", nombre: "DOCUMENTOS", descripcion: "Sobres y documentos" }
      ]);
    });
  }, []);

  const toggleCategoria = (nombre: string) => {
    const newSet = new Set(selectedCategorias);
    if (newSet.has(nombre)) {
      newSet.delete(nombre);
    } else {
      newSet.add(nombre);
    }
    setSelectedCategorias(newSet);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (selectedCategorias.size === 0) {
      setError("Debe seleccionar al menos una categoría");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        categorias: Array.from(selectedCategorias)
      };
      await paqueteService.create(payload);
      router.push("/paquetes");
    } catch (err: any) {
      const resData = err.response?.data;
      // Extraer detalles de validación si existen
      let msg = resData?.error?.message || resData?.message || "Error al crear el paquete.";
      if (resData?.error?.details) {
        const details = resData.error.details;
        if (typeof details === "object") {
          const fieldErrors = Object.entries(details).map(([k, v]) => `${k}: ${v}`).join("; ");
          msg += ` — ${fieldErrors}`;
        }
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        <Link href="/paquetes">
          <Button variant="secondary" style={{ padding: "var(--space-2)" }}>
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-bold)" }}>Registrar Paquete</h1>
          <p style={{ color: "var(--text-secondary)" }}>Ingrese los datos para un nuevo envío</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass" style={{ padding: "var(--space-6)", borderRadius: "var(--radius-xl)", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        
        {error && (
          <div style={{ color: "var(--color-error)", padding: "var(--space-3)", background: "rgba(239,68,68,0.1)", borderRadius: "var(--radius-md)" }}>
            {error}
          </div>
        )}

        {/* Sección Personas */}
        <div>
          <h3 style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--fs-md)", borderBottom: "1px solid var(--border-color)", paddingBottom: "var(--space-2)", marginBottom: "var(--space-4)" }}>
            <User size={18} /> Involucrados
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <Input
              label="DNI Remitente"
              placeholder="8 dígitos"
              maxLength={8}
              pattern="\d{8}"
              required
              value={formData.dniRemitente}
              onChange={(e) => setFormData({...formData, dniRemitente: e.target.value})}
            />
            <Input
              label="DNI Destinatario"
              placeholder="8 dígitos"
              maxLength={8}
              pattern="\d{8}"
              required
              value={formData.dniDestinatario}
              onChange={(e) => setFormData({...formData, dniDestinatario: e.target.value})}
            />
          </div>
        </div>

        {/* Sección Paquete */}
        <div>
          <h3 style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--fs-md)", borderBottom: "1px solid var(--border-color)", paddingBottom: "var(--space-2)", marginBottom: "var(--space-4)" }}>
            <Package size={18} /> Detalles del Paquete
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "var(--space-4)" }}>
            <Input
              label="Peso (kg)"
              type="number"
              step="0.1"
              min="0.1"
              required
              value={formData.pesoKg || ""}
              onChange={(e) => setFormData({...formData, pesoKg: parseFloat(e.target.value)})}
            />
            <Input
              label="Valor Declarado (S/.)"
              type="number"
              step="0.1"
              min="1"
              required
              value={formData.valorDeclarado || ""}
              onChange={(e) => setFormData({...formData, valorDeclarado: parseFloat(e.target.value)})}
            />
            <Input
              label="Largo (cm)"
              type="number"
              step="0.1"
              min="1"
              required
              value={formData.largoCm || ""}
              onChange={(e) => setFormData({...formData, largoCm: parseFloat(e.target.value)})}
            />
            <Input
              label="Ancho (cm)"
              type="number"
              step="0.1"
              min="1"
              required
              value={formData.anchoCm || ""}
              onChange={(e) => setFormData({...formData, anchoCm: parseFloat(e.target.value)})}
            />
            <Input
              label="Alto (cm)"
              type="number"
              step="0.1"
              min="1"
              required
              value={formData.altoCm || ""}
              onChange={(e) => setFormData({...formData, altoCm: parseFloat(e.target.value)})}
            />
          </div>
        </div>

        {/* Sección Categorías */}
        <div>
          <h3 style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", color: "var(--text-secondary)", marginBottom: "var(--space-2)" }}>
            Categorías (Seleccione al menos una)
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
            {categorias.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategoria(cat.nombre)}
                style={{
                  padding: "var(--space-2) var(--space-4)",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--fs-sm)",
                  fontWeight: "var(--fw-medium)",
                  border: `1px solid ${selectedCategorias.has(cat.nombre) ? 'var(--color-primary-500)' : 'var(--border-color)'}`,
                  background: selectedCategorias.has(cat.nombre) ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                  color: selectedCategorias.has(cat.nombre) ? 'var(--color-primary-600)' : 'var(--text-primary)',
                  transition: "all var(--transition-fast)"
                }}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-4)" }}>
          <Button type="submit" isLoading={isLoading} style={{ minWidth: "200px" }}>
            Generar Paquete
          </Button>
        </div>
      </form>
    </div>
  );
}
