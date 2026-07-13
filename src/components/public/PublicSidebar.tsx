"use client";

import { Package, Send, Store, Info, HelpCircle, PhoneCall, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function PublicSidebar() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const menuItems = [
    { name: "Servicios", icon: <Package size={20} color="var(--color-primary-500)" />, path: "/#servicios" },
    { name: "Envía", icon: <Send size={20} color="var(--color-primary-500)" />, path: "/#envia" },
    { name: "Rápido Store", icon: <Store size={20} color="var(--color-primary-500)" />, path: "/#store" },
    { name: "Rápido Informa", icon: <Info size={20} color="var(--color-primary-500)" />, path: "/#informa" },
    { name: "Ayuda", icon: <HelpCircle size={20} color="var(--color-primary-500)" />, path: "/#ayuda" },
    { name: "Comunícate", icon: <PhoneCall size={20} color="var(--color-primary-500)" />, path: "/#comunicate" },
  ];

  return (
    <aside style={{ 
      width: "260px", 
      background: "transparent",
      height: "calc(100vh - 80px)",
      position: "sticky",
      top: "80px",
      padding: "var(--space-6) var(--space-4)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)"
    }}>
      <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "var(--space-4)", boxShadow: "0 10px 30px rgba(0,0,0,0.03)", border: "1px solid var(--border-color)" }}>
        <h3 style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: "800", color: "var(--text-muted)", marginBottom: "var(--space-4)", paddingLeft: "var(--space-2)" }}>Accesos Rápidos</h3>
        {menuItems.map((item, i) => (
          <Link 
            key={item.name} 
            href={item.path}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "var(--space-3) var(--space-4)",
              textDecoration: "none",
              color: hoveredIndex === i ? "var(--color-primary-600)" : "var(--text-secondary)",
              fontWeight: "var(--fw-medium)",
              borderRadius: "var(--radius-lg)",
              background: hoveredIndex === i ? "var(--bg-secondary)" : "transparent",
              transition: "all 0.2s"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              {item.icon}
              <span style={{ fontSize: "14px", fontWeight: "600" }}>{item.name}</span>
            </div>
            <ChevronRight size={16} style={{ 
              transform: hoveredIndex === i ? "translateX(4px)" : "translateX(0)",
              transition: "transform 0.2s",
              opacity: hoveredIndex === i ? 1 : 0
            }} />
          </Link>
        ))}
      </div>
    </aside>
  );
}
