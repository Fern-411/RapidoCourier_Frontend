"use client";

import { Phone, BookOpen, MessageCircle, Tv, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer style={{ 
      background: "white",
      borderTop: "1px solid var(--color-primary-500)",
      padding: "var(--space-6)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "auto",
      flexWrap: "wrap",
      gap: "var(--space-4)"
    }}>
      <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
        <a href="#" style={{ color: "#E51B24", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}><MessageCircle size={20} /> <span style={{fontSize: "12px", fontWeight: "bold"}}>FB</span></a>
        <a href="#" style={{ color: "#E51B24", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}><ImageIcon size={20} /> <span style={{fontSize: "12px", fontWeight: "bold"}}>IG</span></a>
        <a href="#" style={{ color: "#E51B24", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}><Tv size={20} /> <span style={{fontSize: "12px", fontWeight: "bold"}}>YT</span></a>
        <a href="#" style={{ color: "#E51B24", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}><Phone size={20} /> <span style={{fontSize: "12px", fontWeight: "bold"}}>CALL</span></a>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)", flexWrap: "wrap" }}>
        <Link href="/terminos" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "13px", fontWeight: "500" }}>
          Términos y condiciones
        </Link>
        <Link href="/reclamaciones" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "var(--text-secondary)", textDecoration: "none", fontSize: "13px", fontWeight: "500" }}>
          Libro de reclamaciones
          <BookOpen size={18} color="#E51B24" />
        </Link>
      </div>
    </footer>
  );
}
