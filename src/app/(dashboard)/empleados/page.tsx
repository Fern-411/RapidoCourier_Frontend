"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import { Plus, Users, ShieldAlert, X, UserPlus, Mail, Phone, Lock, Tag, Edit, Eye, EyeOff, RefreshCw } from "lucide-react";
import styles from "./empleados.module.css";

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  numeroContacto: string;
  rol: string;
}

export default function EmpleadosPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    numeroContacto: "",
    rol: "EMPLEADO"
  });

  // Role Edit state
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [newRole, setNewRole] = useState("EMPLEADO");
  const [phonePrefix, setPhonePrefix] = useState("+51");
  const [showPassword, setShowPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let newPassword = "";
    for (let i = 0; i < 12; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: newPassword }));
    setShowPassword(true);
  };

  useEffect(() => {
    if (user && user.rol !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    if (user && user.rol === "ADMIN") {
      fetchUsuarios();
    }
  }, [user, router]);

  const fetchUsuarios = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/admin/usuarios");
      if (data.success) {
        setUsuarios(data.data);
      }
    } catch (err) {
      console.error("Error fetching usuarios", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = { ...formData, numeroContacto: phonePrefix + formData.numeroContacto };
      const { data } = await api.post("/auth/register", payload);
      if (data.success) {
        setIsModalOpen(false);
        setFormData({ nombre: "", email: "", password: "", numeroContacto: "", rol: "EMPLEADO" });
        fetchUsuarios();
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || "Error al registrar usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRoleModal = (u: Usuario) => {
    setSelectedUser(u);
    setNewRole(u.rol);
    setIsRoleModalOpen(true);
    setError(null);
  };

  const handleRoleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const { data } = await api.put(`/admin/usuarios/${selectedUser.id}/rol`, { nuevoRol: newRole });
      if (data.success) {
        setIsRoleModalOpen(false);
        setSelectedUser(null);
        fetchUsuarios();
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || "Error al cambiar rol");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.rol !== "ADMIN") {
    return (
      <div className={styles.deniedContainer}>
        <ShieldAlert size={48} className={styles.deniedIcon} />
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para ver esta página.</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gestión de Personal</h1>
          <p className={styles.subtitle}>Administra los empleados y roles del sistema.</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => { setIsModalOpen(true); setError(null); }}>
          <Plus size={18} />
          <span>Nuevo Personal</span>
        </button>
      </div>

      <div className={styles.tableContainer}>
        {isLoading ? (
          <div className={styles.loading}>Cargando personal...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className={styles.userRow}>
                      <div className={styles.avatar}>{u.nombre.charAt(0).toUpperCase()}</div>
                      <span className={styles.userName}>{u.nombre}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.numeroContacto || "-"}</td>
                  <td>
                    <span className={`${styles.badge} ${styles['badge' + u.rol]}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={styles.iconBtn} 
                      onClick={() => openRoleModal(u)}
                      title="Cambiar Rol"
                      disabled={u.email === user.email}
                    >
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>No hay usuarios registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal para Crear Usuario */}
      <AnimatePresence>
        {isModalOpen && (
          <div className={styles.modalOverlay}>
            <motion.div 
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalTitle}>
                  <UserPlus size={20} />
                  <h2>Registrar Nuevo Empleado</h2>
                </div>
                <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label>Nombre Completo</label>
                  <div className={styles.inputWrapper}>
                    <Users size={16} className={styles.inputIcon} />
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required placeholder="Ej. Juan Pérez" />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Correo Electrónico</label>
                  <div className={styles.inputWrapper}>
                    <Mail size={16} className={styles.inputIcon} />
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="ejemplo@rapidocourier.com" />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Contraseña</label>
                  <div className={styles.inputWrapper}>
                    <Lock size={16} className={styles.inputIcon} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      value={formData.password} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="Mínimo 8 caracteres" 
                      minLength={8} 
                    />
                    <button
                      type="button"
                      className={styles.togglePasswordBtn}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      type="button"
                      className={styles.generateBtn}
                      onClick={generatePassword}
                      title="Generar contraseña"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.inputGroup}>
                    <label>Teléfono</label>
                    <div className={styles.phoneInputWrapper}>
                      <select 
                        className={styles.phonePrefixSelect}
                        value={phonePrefix}
                        onChange={(e) => setPhonePrefix(e.target.value)}
                      >
                        <option value="+51">+51</option>
                        <option value="+52">+52</option>
                        <option value="+57">+57</option>
                        <option value="+1">+1</option>
                      </select>
                      <div className={styles.inputWrapper} style={{ flex: 1 }}>
                        <Phone size={16} className={styles.inputIcon} />
                        <input type="tel" name="numeroContacto" value={formData.numeroContacto} onChange={handleInputChange} required placeholder="999888777" />
                      </div>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Rol</label>
                    <div className={styles.inputWrapper}>
                      <Tag size={16} className={styles.inputIcon} />
                      <select name="rol" value={formData.rol} onChange={handleInputChange} required>
                        <option value="EMPLEADO">Empleado (Operador)</option>
                        <option value="REPARTIDOR">Repartidor</option>
                        <option value="SUPERVISOR">Supervisor</option>
                        <option value="ADMIN">Administrador</option>
                      </select>
                    </div>
                  </div>
                </div>

                {error && <div className={styles.errorAlert}>{error}</div>}

                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                  <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                    {isSubmitting ? "Registrando..." : "Registrar"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal para Cambiar Rol */}
      <AnimatePresence>
        {isRoleModalOpen && selectedUser && (
          <div className={styles.modalOverlay}>
            <motion.div 
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalTitle}>
                  <Tag size={20} />
                  <h2>Cambiar Rol de Usuario</h2>
                </div>
                <button className={styles.closeBtn} onClick={() => setIsRoleModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleRoleChange} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label>Usuario a modificar</label>
                  <div className={styles.inputWrapper}>
                    <Users size={16} className={styles.inputIcon} />
                    <input type="text" value={selectedUser.nombre} disabled />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Nuevo Rol</label>
                  <div className={styles.inputWrapper}>
                    <Tag size={16} className={styles.inputIcon} />
                    <select value={newRole} onChange={(e) => setNewRole(e.target.value)} required>
                      <option value="CLIENTE">Cliente</option>
                      <option value="EMPLEADO">Empleado (Operador)</option>
                      <option value="REPARTIDOR">Repartidor</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                </div>

                {error && <div className={styles.errorAlert}>{error}</div>}

                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setIsRoleModalOpen(false)}>Cancelar</button>
                  <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                    {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
