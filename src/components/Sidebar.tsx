"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  MapPin,
  LogOut,
  Box,
  PlusCircle,
  Menu,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import styles from "./Sidebar.module.css";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/envios/nuevo", label: "Nuevo Envío", icon: PlusCircle },
  { href: "/envios/entregar", label: "Entregar (POS)", icon: Package },
  { href: "/envios", label: "Historial Envíos", icon: Truck },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/paquetes", label: "Paquetes", icon: Box },
  { href: "/tracking", label: "Tracking", icon: MapPin },
  { href: "/empleados", label: "Personal", icon: Users },
  { href: "/agencias", label: "Agencias", icon: MapPin },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  // Cerrar sidebar al navegar (cambio de ruta)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Está seguro de querer cerrar sesión?',
      text: "Se cerrará su sesión actual.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      await logout();
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Botón hamburguesa — solo visible en móvil */}
      <button
        className={styles.hamburger}
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu size={24} />
      </button>

      {/* Backdrop semitransparente — solo visible en móvil cuando el sidebar está abierto */}
      {isOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        {/* Botón cerrar (X) — solo en móvil */}
        <button
          className={styles.closeBtn}
          onClick={() => setIsOpen(false)}
          aria-label="Cerrar menú"
        >
          <X size={20} />
        </button>

        {/* Branding */}
        <div className={styles.brand}>
          <div className={styles.logoIcon}>
            <Package size={24} />
          </div>
          <div className={styles.brandText}>Rápido Courier</div>
        </div>

        {/* Navegación */}
        <nav className={styles.nav}>
          {navItems.map((item) => {
            if (item.href === "/empleados" && user?.rol !== "ADMIN") return null;
            if (item.href === "/agencias" && user?.rol !== "ADMIN") return null;

            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.active : ""}`}
              >
                <Icon size={20} className={styles.navIcon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / User Info */}
        <div className={styles.footer}>
          {user && (
            <div className={styles.userInfo}>
              <div className={styles.userEmail}>{user.email}</div>
              <div className={styles.userRole}>{user.rol}</div>
            </div>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
