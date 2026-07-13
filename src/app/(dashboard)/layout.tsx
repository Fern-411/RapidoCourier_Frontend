import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import styles from "./dashboard-layout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className={styles.wrapper}>
        <Sidebar />
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
