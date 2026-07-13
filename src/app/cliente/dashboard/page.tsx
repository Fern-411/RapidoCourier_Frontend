"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Package, Search, Boxes, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ClienteDashboardPage() {
  const { user } = useAuthStore();
  const userName = user?.email?.split("@")[0] || "Usuario";

  const cards = [
    {
      title: "Registra",
      description: "Registra envíos y ahorra tiempo.",
      icon: <Package size={40} />,
      color: "#e53935", // Rojo
      link: "/cliente/registra",
    },
    {
      title: "Rastreo",
      description: "Sigue tu envío en tiempo real.",
      icon: <Search size={40} />,
      color: "#1e3a5f", // Azul oscuro
      link: "/#rastrea",
    },
    {
      title: "Registro masivo",
      description: "Registra múltiples envíos y ahorra tiempo.",
      icon: <Boxes size={40} />,
      color: "#1e3a5f", // Azul oscuro
      link: "#",
    },
    {
      title: "Cobro Seguro",
      description: "Vende en contra entrega y cobramos por ti.",
      icon: <ShieldCheck size={40} />,
      color: "#1e3a5f", // Azul oscuro
      link: "#",
    },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "var(--space-8)" }}>
      {/* Banner Promocional simulado */}
      <div style={{ 
        width: "100%", 
        height: "200px", 
        background: "linear-gradient(90deg, #e0f2fe 0%, #f0f9ff 100%)", 
        borderRadius: "var(--radius-xl)", 
        marginBottom: "var(--space-8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 var(--space-12)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decoraciones del banner */}
        <div style={{ position: "absolute", right: "-20px", top: "-20px", width: "150px", height: "150px", background: "#4ade80", borderRadius: "50%", opacity: 0.2 }} />
        <div style={{ position: "absolute", left: "10%", bottom: "-30px", width: "100px", height: "100px", background: "#3b82f6", borderRadius: "50%", opacity: 0.1 }} />
        
        <div style={{ zIndex: 1 }}>
          <h2 style={{ fontSize: "var(--fs-3xl)", fontWeight: "900", color: "#1e3a5f", lineHeight: 1.1, marginBottom: "var(--space-2)" }}>
            Vende en <span style={{ color: "#e53935" }}>CONTRAENTREGA</span>
          </h2>
          <p style={{ fontSize: "var(--fs-xl)", color: "#475569", marginBottom: "var(--space-4)" }}>
            ¡RápidoPRO cobra por ti!
          </p>
          <button style={{ 
            background: "#e53935", 
            color: "white", 
            border: "none", 
            padding: "10px 24px", 
            borderRadius: "var(--radius-full)", 
            fontWeight: "bold",
            fontSize: "16px",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(229, 57, 53, 0.4)"
          }}>
            Regístrate aquí
          </button>
        </div>
      </div>

      {/* Saludo */}
      <h1 style={{ 
        fontSize: "var(--fs-3xl)", 
        color: "#1e3a5f", 
        fontWeight: "bold", 
        marginBottom: "var(--space-8)" 
      }}>
        Hola, {userName}
      </h1>

      {/* Grid de Tarjetas */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: "var(--space-6)" 
      }}>
        {cards.map((card, index) => (
          <Link href={card.link} key={index} style={{ textDecoration: "none" }}>
            <motion.div 
              whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
              style={{
                background: "white",
                borderRadius: "24px",
                padding: "var(--space-8) var(--space-6)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                height: "100%",
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                border: "1px solid rgba(0,0,0,0.02)",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            >
              <div style={{ 
                width: "90px", 
                height: "90px", 
                borderRadius: "50%", 
                background: card.color, 
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "var(--space-6)",
                boxShadow: `0 8px 20px ${card.color}40`
              }}>
                {card.icon}
              </div>
              
              <h3 style={{ 
                fontSize: "var(--fs-xl)", 
                fontWeight: "bold", 
                color: "#475569", 
                marginBottom: "var(--space-3)" 
              }}>
                {card.title}
              </h3>
              
              <p style={{ 
                fontSize: "14px", 
                color: "#94a3b8", 
                lineHeight: 1.5 
              }}>
                {card.description}
              </p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
