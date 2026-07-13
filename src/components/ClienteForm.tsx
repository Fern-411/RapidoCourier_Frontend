import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { clienteService, type ClienteRequest } from "@/services/clienteService";
import { Search } from "lucide-react";

interface ClienteFormProps {
  onSuccess: (dni: string) => void;
  onCancel: () => void;
  initialDni?: string;
}

export function ClienteForm({ onSuccess, onCancel, initialDni = "" }: ClienteFormProps) {
  const [formData, setFormData] = useState<ClienteRequest>({
    dni: initialDni,
    email: "",
    telefono: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await clienteService.createOrUpdate(formData);
      onSuccess(formData.dni);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || 
        err.response?.data?.message || 
        "Ocurrió un error al registrar el cliente"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {error && (
        <div style={{ color: "var(--color-error)", fontSize: "var(--fs-sm)", padding: "var(--space-2)", background: "rgba(239,68,68,0.1)", borderRadius: "var(--radius-md)" }}>
          {error}
        </div>
      )}

      <Input
        label="DNI"
        placeholder="8 dígitos"
        maxLength={8}
        pattern="\d{8}"
        required
        value={formData.dni}
        onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
      />

      <Input
        label="Correo Electrónico"
        type="email"
        placeholder="cliente@correo.com"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '14px', fontWeight: 500 }}>Teléfono (Opcional)</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select 
            value={formData.telefono.startsWith('+') ? formData.telefono.split(' ')[0] + ' ' : '+51 '}
            onChange={e => {
              const num = formData.telefono.startsWith('+') ? formData.telefono.substring(formData.telefono.split(' ')[0].length + 1) : formData.telefono;
              setFormData({ ...formData, telefono: e.target.value + num });
            }}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', outline: 'none' }}
          >
            <option value="+51 ">+51</option>
            <option value="+1 ">+1</option>
            <option value="+34 ">+34</option>
          </select>
          <input 
            type="tel" 
            value={formData.telefono.startsWith('+') ? formData.telefono.substring(formData.telefono.split(' ')[0].length + 1) : formData.telefono} 
            onChange={e => {
              const pref = formData.telefono.startsWith('+') ? formData.telefono.split(' ')[0] + ' ' : '+51 ';
              setFormData({ ...formData, telefono: pref + e.target.value });
            }}
            placeholder="999888777"
            maxLength={15}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Guardar Cliente
        </Button>
      </div>
    </form>
  );
}
