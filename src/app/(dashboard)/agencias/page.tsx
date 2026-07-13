"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import { MapPin, Plus, Edit2, Trash2 } from "lucide-react";
import styles from "./agencias.module.css";
import Swal from "sweetalert2";

interface Agencia {
  id: string;
  nombre: string;
  direccion: string;
}

export default function AgenciasPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nombre: "", direccion: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirigir si no es ADMIN (protección extra en frontend)
    if (user && user.rol !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchAgencias();
  }, [user, router]);

  const fetchAgencias = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/agencias");
      if (data.success) {
        setAgencias(data.data);
      }
    } catch (err) {
      console.error("Error al obtener agencias", err);
      Swal.fire("Error", "No se pudieron cargar las agencias.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const openModalNew = () => {
    setError(null);
    setEditingId(null);
    setFormData({ nombre: "", direccion: "" });
    setIsModalOpen(true);
  };

  const openModalEdit = (agencia: Agencia) => {
    setError(null);
    setEditingId(agencia.id);
    setFormData({ nombre: agencia.nombre, direccion: agencia.direccion });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.direccion) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingId) {
        // Actualizar
        const { data } = await api.put(`/agencias/${editingId}`, formData);
        if (data.success) {
          Swal.fire("Éxito", "Agencia actualizada correctamente", "success");
          fetchAgencias();
          closeModal();
        }
      } else {
        // Crear
        const { data } = await api.post("/agencias", formData);
        if (data.success) {
          Swal.fire("Éxito", "Agencia creada correctamente", "success");
          fetchAgencias();
          closeModal();
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Ocurrió un error al guardar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esto. La agencia se eliminará.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (confirm.isConfirmed) {
      try {
        const { data } = await api.delete(`/agencias/${id}`);
        if (data.success) {
          Swal.fire("Eliminado", "La agencia ha sido eliminada.", "success");
          fetchAgencias();
        }
      } catch (err: any) {
        Swal.fire("Error", err.response?.data?.message || "No se pudo eliminar la agencia.", "error");
      }
    }
  };

  if (!user || user.rol !== "ADMIN") return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1><MapPin size={28} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> Gestión de Agencias</h1>
          <p>Administra las sucursales habilitadas para orígenes y destinos de envíos.</p>
        </div>
        <button className={styles.btnAdd} onClick={openModalNew}>
          <Plus size={20} />
          Nueva Agencia
        </button>
      </div>

      <div className={styles.card}>
        {isLoading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando agencias...</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Dirección</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {agencias.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>No hay agencias registradas.</td>
                  </tr>
                ) : (
                  agencias.map((agencia) => (
                    <tr key={agencia.id}>
                      <td style={{ fontWeight: 600 }}>{agencia.nombre}</td>
                      <td>{agencia.direccion}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            className={styles.btnEdit} 
                            onClick={() => openModalEdit(agencia)}
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className={styles.btnDelete} 
                            onClick={() => handleDelete(agencia.id)}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{editingId ? "Editar Agencia" : "Nueva Agencia"}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Nombre de la Agencia</label>
                <input 
                  type="text" 
                  value={formData.nombre} 
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} 
                  placeholder="Ej. Agencia Central" 
                  autoFocus
                />
              </div>
              <div className={styles.formGroup}>
                <label>Dirección</label>
                <input 
                  type="text" 
                  value={formData.direccion} 
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} 
                  placeholder="Ej. Av. Principal 123" 
                />
              </div>

              {error && <span className={styles.errorText}>{error}</span>}

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={closeModal} disabled={isSubmitting}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar Agencia"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
