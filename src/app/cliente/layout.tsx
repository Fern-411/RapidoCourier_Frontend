"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, User, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { PublicFooter } from "@/components/public/PublicFooter";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f4f7fa" }}>
      {/* Header Rojo Estilo Shalom Pro */}
      <header style={{
        background: "#e53935", // Rojo vibrante
        color: "white",
        padding: "0 var(--space-8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 4px 12px rgba(229, 57, 53, 0.3)"
      }}>
        {/* Logo */}
        <Link href="/cliente/dashboard" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", textDecoration: "none", color: "white" }}>
          <Package size={28} strokeWidth={2.5} />
          <div style={{ fontWeight: "900", fontSize: "22px", letterSpacing: "-0.5px", fontStyle: "italic" }}>
            Rápido<span style={{ fontWeight: "400" }}>PRO</span>
          </div>
        </Link>

        {/* Navegación Central */}
        <nav style={{ display: "flex", gap: "var(--space-8)", height: "100%" }}>
          {[
            { name: "Registra", path: "/cliente/dashboard" },
            { name: "Operaciones", path: "#" },
            { name: "Mantenimiento", path: "#" },
            { name: "Centro de ayuda", path: "#" },
          ].map((item) => (
            <Link 
              key={item.name} 
              href={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                color: "white",
                textDecoration: "none",
                fontWeight: pathname === item.path ? "bold" : "500",
                fontSize: "15px",
                borderBottom: pathname === item.path ? "3px solid white" : "3px solid transparent",
                padding: "0 var(--space-2)",
                transition: "all 0.2s"
              }}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Perfil Usuario */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", cursor: "pointer", padding: "var(--space-1) var(--space-3)", borderRadius: "var(--radius-full)", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={18} />
            </div>
            <span style={{ fontWeight: "500", fontSize: "14px" }}>{user?.email?.split("@")[0] || "Usuario"}</span>
          </div>
          
          <button 
            onClick={handleLogout}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              padding: "6px 12px",
              borderRadius: "var(--radius-full)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
          >
            <LogOut size={14} /> Salir
          </button>
        </div>
      </header>
      
      <main style={{ flex: 1, paddingBottom: "var(--space-8)" }}>
        {children}
      </main>

      <PublicFooter />
    </div>
  );
}
