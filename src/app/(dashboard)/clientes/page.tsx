"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ClienteForm } from "@/components/ClienteForm";
import { clienteService, type ClienteResponse } from "@/services/clienteService";
import { Search, Plus, User } from "lucide-react";

export default function ClientesPage() {
  const [searchDni, setSearchDni] = useState("");
  const [cliente, setCliente] = useState<ClienteResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSearch = async () => {
    if (searchDni.length !== 8) {
      setError("El DNI debe tener 8 dígitos");
      return;
    }
    
    setIsSearching(true);
    setError(null);
    setCliente(null);

    try {
      const data = await clienteService.getByDni(searchDni);
      if (data) {
        setCliente(data);
        setEditEmail(data.email || "");
        setEditTelefono(data.telefono || "");
        setIsEditing(false);
      } else {
        setError("Cliente no encontrado");
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Cliente no encontrado. Puede registrarlo.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateSuccess = (dni: string) => {
    setIsModalOpen(false);
    setSearchDni(dni);
    handleSearch(); // Recargar datos
  };

  const handleSaveContact = async () => {
    if (!cliente) return;
    setIsSaving(true);
    try {
      const updated = await clienteService.updateContacto(cliente.id, {
        email: editEmail,
        telefono: editTelefono
      });
      setCliente(updated);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar el cliente");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <div>
          <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-bold)" }}>Clientes</h1>
          <p style={{ color: "var(--text-secondary)" }}>Consulta o registra remitentes y destinatarios</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Nuevo Cliente
        </Button>
      </div>

      <div className="glass" style={{ padding: "var(--space-6)", borderRadius: "var(--radius-xl)", marginBottom: "var(--space-6)" }}>
        <h2 style={{ fontSize: "var(--fs-md)", fontWeight: "var(--fw-semibold)", marginBottom: "var(--space-4)" }}>
          Buscar Cliente
        </h2>
        
        <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-end" }}>
          <div style={{ flex: 1, maxWidth: "300px" }}>
            <Input 
              label="DNI"
              placeholder="Ingrese DNI (8 dígitos)"
              value={searchDni}
              onChange={(e) => setSearchDni(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              maxLength={8}
            />
          </div>
          <Button onClick={handleSearch} isLoading={isSearching}>
            <Search size={18} />
            Buscar
          </Button>
        </div>

        {error && (
          <div style={{ marginTop: "var(--space-4)", color: "var(--color-warning)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <span>{error}</span>
            <Button variant="secondary" onClick={() => setIsModalOpen(true)} style={{ padding: "var(--space-2) var(--space-3)" }}>
              Registrar ahora
            </Button>
          </div>
        )}
      </div>

      {cliente && (
        <div className="glass" style={{ padding: "var(--space-6)", borderRadius: "var(--radius-xl)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <div style={{ width: 48, height: 48, borderRadius: "var(--radius-full)", background: "var(--color-primary-100)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary-600)" }}>
                <User size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-semibold)", color: "var(--text-primary)" }}>
                  {cliente.nombreCompleto || "Nombre no registrado (RENIEC pendiente)"}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "var(--fs-sm)" }}>DNI: {cliente.dni}</p>
              </div>
            </div>
            {isEditing ? (
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <Button variant="secondary" onClick={() => {
                  setIsEditing(false);
                  setEditEmail(cliente.email || "");
                  setEditTelefono(cliente.telefono || "");
                }} disabled={isSaving}>Cancelar</Button>
                <Button onClick={handleSaveContact} isLoading={isSaving}>Guardar</Button>
              </div>
            ) : (
              <Button variant="secondary" onClick={() => setIsEditing(true)}>Editar Contacto</Button>
            )}
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)", background: "var(--bg-primary)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}>
            <div>
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Email</div>
              {isEditing ? (
                <input 
                  type="email" 
                  value={editEmail} 
                  onChange={e => setEditEmail(e.target.value)}
                  style={{ padding: '6px', fontSize: '14px', width: '100%', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
                />
              ) : (
                <div style={{ fontWeight: "var(--fw-medium)" }}>{cliente.email}</div>
              )}
            </div>
            <div>
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Teléfono</div>
              {isEditing ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select 
                    value={editTelefono.startsWith('+') ? editTelefono.split(' ')[0] + ' ' : '+51 '}
                    onChange={e => {
                      const num = editTelefono.startsWith('+') ? editTelefono.substring(editTelefono.split(' ')[0].length + 1) : editTelefono;
                      setEditTelefono(e.target.value + num);
                    }}
                    style={{ padding: '6px', fontSize: '14px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', outline: 'none' }}
                  >
                    <option value="+51 ">+51</option>
                    <option value="+1 ">+1</option>
                    <option value="+34 ">+34</option>
                  </select>
                  <input 
                    type="tel" 
                    value={editTelefono.startsWith('+') ? editTelefono.substring(editTelefono.split(' ')[0].length + 1) : editTelefono} 
                    onChange={e => {
                      const pref = editTelefono.startsWith('+') ? editTelefono.split(' ')[0] + ' ' : '+51 ';
                      setEditTelefono(pref + e.target.value);
                    }}
                    style={{ flex: 1, padding: '6px', fontSize: '14px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', outline: 'none' }}
                  />
                </div>
              ) : (
                <div style={{ fontWeight: "var(--fw-medium)" }}>{cliente.telefono || "No especificado"}</div>
              )}
            </div>
            <div>
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Registrado en</div>
              <div style={{ fontWeight: "var(--fw-medium)" }}>{new Date(cliente.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Cliente">
        <ClienteForm 
          onSuccess={handleCreateSuccess} 
          onCancel={() => setIsModalOpen(false)} 
          initialDni={searchDni.length === 8 ? searchDni : ""}
        />
      </Modal>
    </div>
  );
}
