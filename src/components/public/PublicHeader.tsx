"use client";

import Link from "next/link";
import { Home, Search, CreditCard, MapPin, Tag, User, Package, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";

export function PublicHeader() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { name: "Inicio", path: "/", icon: <Home size={18} /> },
    { name: "Rastrear Envío", path: "/#rastrea", icon: <Search size={18} /> },
    { name: "Pago en Línea", path: "/#pagalo", icon: <CreditCard size={18} /> },
    { name: "Nuestras Sedes", path: "/#agencias", icon: <MapPin size={18} /> },
    { name: "Cotizador", path: "/#tarifas", icon: <Tag size={18} /> },
  ];

  return (
    <>
      <header style={{ 
        background: "var(--bg-primary)",
        borderBottom: "1px solid var(--border-color)",
        color: "var(--text-primary)", 
        padding: "var(--space-4) var(--space-6)",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        gap: "var(--space-3)",
        flexWrap: "wrap"
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", textDecoration: "none", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-700) 100%)", color: "white", boxShadow: "0 4px 10px rgba(79, 70, 229, 0.3)" }}>
            <Package size={20} />
          </div>
          <div style={{ fontWeight: "900", fontSize: "20px", letterSpacing: "-1px", color: "var(--text-primary)" }}>
            Rápido<span style={{ color: "var(--color-primary-500)" }}>Courier</span>
          </div>
        </Link>

        {/* Botón hamburguesa para móvil */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="public-menu-toggle"
          aria-label="Toggle menu"
          style={{
            display: "none", /* Se muestra solo en móvil via CSS */
            background: "none",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-2)",
            color: "var(--text-primary)",
            cursor: "pointer"
          }}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Navigation (Centro) — se oculta en móvil, se muestra como columna */}
        <nav 
          className="public-nav"
          style={{ 
            display: "flex", 
            gap: "var(--space-4)", 
            background: "var(--bg-secondary)", 
            padding: "var(--space-2) var(--space-5)", 
            borderRadius: "var(--radius-full)", 
            border: "1px solid var(--border-color)",
            alignItems: "center"
          }}
        >
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.path}
              onClick={() => setMenuOpen(false)}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "6px",
                color: pathname === item.path ? "var(--color-primary-500)" : "var(--text-secondary)",
                textDecoration: "none",
                fontWeight: pathname === item.path ? "700" : "500",
                fontSize: "13px",
                transition: "color 0.2s",
                whiteSpace: "nowrap"
              }}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="public-auth" style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexShrink: 0 }}>
          {isAuthenticated && user ? (
            <Link href={user.rol === "CLIENTE" ? "/cliente/dashboard" : "/dashboard"} style={{ textDecoration: "none" }}>
              <button style={{
                background: "var(--color-primary-500)",
                color: "white",
                border: "none",
                padding: "var(--space-2) var(--space-4)",
                borderRadius: "var(--radius-full)",
                fontWeight: "600",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(79, 70, 229, 0.3)",
                transition: "transform 0.2s"
              }}>
                <User size={16} />
                Hola, {user.email?.split("@")[0] || "Usuario"}
              </button>
            </Link>
          ) : (
            <>
              <Link href="/login" style={{ textDecoration: "none" }}>
                <button style={{
                  background: "transparent",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                  padding: "var(--space-2) var(--space-3)",
                  borderRadius: "var(--radius-full)",
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}>
                  Ingresar
                </button>
              </Link>
              <Link href="/signup" style={{ textDecoration: "none" }}>
                <button style={{
                  background: "var(--color-primary-500)",
                  color: "white",
                  border: "none",
                  padding: "var(--space-2) var(--space-3)",
                  borderRadius: "var(--radius-full)",
                  fontWeight: "600",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-1)",
                  cursor: "pointer",
                  boxShadow: "0 4px 10px rgba(79, 70, 229, 0.3)",
                  transition: "transform 0.2s"
                }}>
                  <User size={14} />
                  Crear Cuenta
                </button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Menú móvil desplegable — solo visible cuando menuOpen es true en móvil */}
      {menuOpen && (
        <div
          className="public-mobile-menu"
          style={{
            display: "none", /* Se muestra via CSS solo en móvil */
            flexDirection: "column",
            gap: "var(--space-2)",
            padding: "var(--space-4) var(--space-6)",
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border-color)",
            position: "sticky",
            top: "60px",
            zIndex: 99
          }}
        >
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.path}
              onClick={() => setMenuOpen(false)}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "var(--space-3)",
                color: pathname === item.path ? "var(--color-primary-500)" : "var(--text-secondary)",
                textDecoration: "none",
                fontWeight: pathname === item.path ? "700" : "500",
                fontSize: "14px",
                padding: "var(--space-3) var(--space-2)",
                borderRadius: "var(--radius-md)"
              }}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
