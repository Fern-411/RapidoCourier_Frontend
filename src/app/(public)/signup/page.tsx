"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Package, Mail, Lock, Eye, EyeOff, AlertCircle, UserPlus, User, Phone } from "lucide-react";
import Link from "next/link";
import styles from "../login/login.module.css"; // Reusamos los estilos del login

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export default function SignupPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+51");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Importamos api aquí o al inicio del archivo
      const { default: api } = await import("@/lib/axios");
      const { data } = await api.post("/auth/signup", {
        nombre,
        email,
        password,
        numeroContacto: phonePrefix + telefono,
      });

      if (data.success) {
        // Redirigir a la página de verificación
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      } else {
        setError(data.message || "Error al registrarse");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.response?.data?.message || "Error de conexión. Intente nuevamente.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.orbOne} />
      <div className={styles.orbTwo} />
      <div className={styles.orbThree} />
      <div className={styles.gridPattern} />

      <motion.div className={styles.loginCard} variants={cardVariants} initial="hidden" animate="visible">
        <motion.div className={styles.brandSection} variants={itemVariants}>
          <div className={styles.logoIcon}>
            <Package size={32} strokeWidth={2} />
          </div>
          <h1 className={styles.brandTitle}>Crear Cuenta</h1>
          <p className={styles.brandSubtitle}>Únete a Rápido Courier</p>
        </motion.div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <motion.div className={styles.inputGroup} variants={itemVariants}>
            <label htmlFor="signup-name" className={styles.inputLabel}>Nombre Completo</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                id="signup-name"
                type="text"
                className={styles.input}
                placeholder="Juan Pérez"
                value={nombre}
                onChange={(e) => { setNombre(e.target.value); setError(null); }}
                required
              />
            </div>
          </motion.div>

          <motion.div className={styles.inputGroup} variants={itemVariants}>
            <label htmlFor="signup-email" className={styles.inputLabel}>Correo electrónico</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                id="signup-email"
                type="email"
                className={styles.input}
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                required
              />
            </div>
          </motion.div>

          <motion.div className={styles.inputGroup} variants={itemVariants}>
            <label htmlFor="signup-password" className={styles.inputLabel}>Contraseña</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                required
                minLength={8}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </motion.div>

          <motion.div className={styles.inputGroup} variants={itemVariants}>
            <label htmlFor="signup-phone" className={styles.inputLabel}>Teléfono</label>
            <div className={styles.phoneInputWrapper}>
              <select 
                className={styles.phonePrefixSelect}
                value={phonePrefix}
                onChange={(e) => setPhonePrefix(e.target.value)}
              >
                <option value="+51">+51 (PE)</option>
                <option value="+52">+52 (MX)</option>
                <option value="+57">+57 (CO)</option>
                <option value="+1">+1 (US/CA)</option>
              </select>
              <div className={styles.inputWrapper} style={{ flex: 1 }}>
                <Phone size={18} className={styles.inputIcon} />
                <input
                  id="signup-phone"
                  name="phone"
                  type="tel"
                  className={styles.input}
                  placeholder="999 888 777"
                  value={telefono}
                  onChange={(e) => { setTelefono(e.target.value); setError(null); }}
                  required
                />
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                className={styles.errorBox}
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 0 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants}>
            <motion.button type="submit" className={styles.submitBtn} disabled={isLoading} whileTap={{ scale: 0.98 }}>
              {isLoading ? <div className={styles.spinner} /> : <><UserPlus size={18} /> Registrarse</>}
            </motion.button>
          </motion.div>
        </form>

        <motion.p className={styles.footer} variants={itemVariants}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia Sesión</Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
