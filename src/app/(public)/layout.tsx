import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicSidebar } from "@/components/public/PublicSidebar";
import { PublicFooter } from "@/components/public/PublicFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f8f9fa" }}>
      <PublicHeader />
      
      <div className="public-content-wrapper" style={{ display: "flex", flex: 1 }}>
        {/* Sidebar — se oculta en móvil via CSS */}
        <div className="public-sidebar-wrapper" style={{ flex: "0 0 280px" }}>
          <PublicSidebar />
        </div>
        
        <main style={{ flex: 1, padding: "var(--space-6)", display: "flex", flexDirection: "column", minWidth: 0 }}>
          {children}
        </main>
      </div>

      <PublicFooter />
    </div>
  );
}
