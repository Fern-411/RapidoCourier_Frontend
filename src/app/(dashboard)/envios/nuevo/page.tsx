"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Package, 
  Truck, 
  CheckCircle, 
  Search, 
  UserPlus, 
  Box, 
  MapPin, 
  CreditCard,
  Download,
  AlertCircle,
  RefreshCw,
  Printer,
  Loader2
} from "lucide-react";
import api from "@/lib/axios";
import { pdf } from "@react-pdf/renderer";
import { BoletaPDF } from "@/components/BoletaPDF";
import { GuiaEnvioPDF } from "@/components/GuiaEnvioPDF";
import { PagoModal } from "@/components/PagoModal";
import { envioService } from "@/services/envioService";
import styles from "./nuevo-envio.module.css";

// Tipos
interface Cliente {
  id: string;
  dni: string;
  nombreCompleto: string;
  email?: string;
  telefono?: string;
}

interface Agencia {
  id: string;
  nombre: string;
  direccion: string;
}

export default function NuevoEnvioPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Estados Globales del Flujo (Levantados para persistir)
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [envioData, setEnvioData] = useState<any>(null); // Datos del envío final (rastreo, orden, etc)
  const [pinRecojo, setPinRecojo] = useState("");

  // ================= STEP 1 STATES =================
  const [remitente, setRemitente] = useState<Cliente | null>(null);
  const [destinatario, setDestinatario] = useState<Cliente | null>(null);
  const [dniRemitente, setDniRemitente] = useState("");
  const [dniDestinatario, setDniDestinatario] = useState("");
  const [showRegisterRemitente, setShowRegisterRemitente] = useState(false);
  const [emailRemitente, setEmailRemitente] = useState("");
  const [telRemitente, setTelRemitente] = useState("+51 ");

  // ================= STEP 2 STATES =================
  const [paqueteId, setPaqueteId] = useState<string | null>(null);
  const [paqueteForm, setPaqueteForm] = useState({
    pesoKg: "",
    valorDeclarado: "",
    altoCm: "",
    anchoCm: "",
    largoCm: ""
  });
  const [categorias, setCategorias] = useState<string[]>([]);

  // ================= STEP 3 STATES =================
  const [agenciaOrigen, setAgenciaOrigen] = useState("");
  const [agenciaDestino, setAgenciaDestino] = useState("");
  const [montoPago, setMontoPago] = useState(0);

  useEffect(() => {
    // Calcular monto si hay peso
    if (paqueteForm.pesoKg) {
      const peso = parseFloat(paqueteForm.pesoKg);
      let calc = 15.00; // Base
      if (peso > 2) {
        calc += (peso - 2) * 5; // S/5 por cada kg extra
      }
      setMontoPago(calc);
    }
  }, [paqueteForm.pesoKg]);

  useEffect(() => {
    // Cargar agencias al montar
    const fetchAgencias = async () => {
      try {
        console.log("Cargando agencias desde /agencias...");
        const { data } = await api.get("/agencias");
        console.log("Respuesta de agencias:", data);
        if (data.success) {
          setAgencias(data.data || []);
        }
      } catch (err) {
        console.error("Error al cargar agencias", err);
        setError("No se pudieron cargar las agencias disponibles.");
      }
    };
    fetchAgencias();
  }, []);

  const nextStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const steps = [
    { id: 1, label: "Clientes", icon: Users },
    { id: 2, label: "Paquete", icon: Package },
    { id: 3, label: "Envío & Pago", icon: Truck },
    { id: 4, label: "Confirmación", icon: CheckCircle },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Nuevo Envío</h1>
        <p>Registra un paquete y procesa el envío paso a paso.</p>
      </div>

      {/* Stepper */}
      <div className={styles.stepperContainer}>
        <div className={styles.stepperLine} />
        <div 
          className={styles.stepperProgress} 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} 
        />
        
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div 
              key={step.id} 
              className={`${styles.step} ${currentStep === step.id ? styles.active : ""} ${currentStep > step.id ? styles.completed : ""}`}
            >
              <div className={styles.stepIcon}>
                <Icon size={24} />
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className={styles.card}>
        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <StepClientes 
              key="step1" 
              remitente={remitente} setRemitente={setRemitente} 
              destinatario={destinatario} setDestinatario={setDestinatario}
              dniRemitente={dniRemitente} setDniRemitente={setDniRemitente}
              dniDestinatario={dniDestinatario} setDniDestinatario={setDniDestinatario}
              showRegisterRemitente={showRegisterRemitente} setShowRegisterRemitente={setShowRegisterRemitente}
              emailRemitente={emailRemitente} setEmailRemitente={setEmailRemitente}
              telRemitente={telRemitente} setTelRemitente={setTelRemitente}
              onNext={nextStep}
              setError={setError}
            />
          )}
          
          {currentStep === 2 && (
            <StepPaquete 
              key="step2" 
              remitente={remitente!} 
              destinatario={destinatario!}
              setPaqueteId={setPaqueteId}
              formData={paqueteForm} setFormData={setPaqueteForm}
              categorias={categorias} setCategorias={setCategorias}
              onNext={nextStep}
              onBack={prevStep}
              setError={setError}
            />
          )}

          {currentStep === 3 && (
            <StepEnvioPago 
              key="step3" 
              paqueteId={paqueteId!}
              agencias={agencias}
              setEnvioData={setEnvioData}
              pinRecojo={pinRecojo} setPinRecojo={setPinRecojo}
              agenciaOrigen={agenciaOrigen} setAgenciaOrigen={setAgenciaOrigen}
              agenciaDestino={agenciaDestino} setAgenciaDestino={setAgenciaDestino}
              montoPago={montoPago}
              onNext={nextStep}
              onBack={prevStep}
              setError={setError}
            />
          )}

          {currentStep === 4 && (
            <StepConfirmacion 
              key="step4" 
              envioData={envioData}
              pinRecojo={pinRecojo}
              montoPago={montoPago}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 1: CLIENTES
// ============================================================================
function StepClientes({ 
  remitente, setRemitente, destinatario, setDestinatario,
  dniRemitente, setDniRemitente, dniDestinatario, setDniDestinatario,
  showRegisterRemitente, setShowRegisterRemitente,
  emailRemitente, setEmailRemitente, telRemitente, setTelRemitente,
  onNext, setError 
}: any) {
  
  const [isLoadingSearch, setIsLoadingSearch] = useState({ r: false, d: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nombreReniec, setNombreReniec] = useState<string | null>(null);

  const searchCliente = async (dni: string, type: 'r' | 'd') => {
    if (dni.length !== 8) {
      setError("El DNI debe tener 8 dígitos");
      return;
    }
    
    setError(null);
    setIsLoadingSearch(prev => ({ ...prev, [type]: true }));
    
    try {
      const { data } = await api.get(`/clientes/dni/${dni}`);
      if (data.success && data.data) {
        if (type === 'r') {
          setRemitente(data.data);
          const isMockEmail = data.data.email?.endsWith('@receptor');
          setEmailRemitente(isMockEmail ? "" : (data.data.email || ""));
          setTelRemitente(data.data.telefono || "+51 ");
          setShowRegisterRemitente(false);
        } else {
          setDestinatario(data.data);
        }
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        if (type === 'r') {
          setShowRegisterRemitente(true);
          try {
            const reniecRes = await api.get(`/clientes/reniec/${dni}`);
            if (reniecRes.data?.success) setNombreReniec(reniecRes.data.data);
          } catch(e) {
            setNombreReniec("No se pudo obtener el nombre");
          }
          setRemitente(null);
        } else {
          try {
            const createRes = await api.post(`/clientes/receptor?dni=${dni}`);
            if (createRes.data?.success) {
              setDestinatario(createRes.data.data);
              setError(null);
            }
          } catch (e) {
            setError("No se pudo verificar el DNI del destinatario en RENIEC.");
            setDestinatario(null);
          }
        }
      } else {
        setError(err.response?.data?.message || "Error al buscar cliente");
      }
    } finally {
      setIsLoadingSearch(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleNext = async () => {
    setError(null);

    // Validación: Remitente y destinatario no pueden ser la misma persona
    if (dniRemitente === dniDestinatario && dniRemitente.length === 8) {
      setError("El remitente y el destinatario no pueden ser la misma persona.");
      return;
    }

    if (!remitente && dniRemitente) {
      if (!emailRemitente || !telRemitente) {
        setError("Debe completar el correo y teléfono del nuevo remitente.");
        return;
      }
      setIsSubmitting(true);
      try {
        const res = await api.post("/clientes", {
          dni: dniRemitente,
          email: emailRemitente,
          telefono: telRemitente
        });
        if (res.data.success) {
          setRemitente(res.data.data);
        }
      } catch (e: any) {
        setError(e.response?.data?.message || "Error al registrar el remitente.");
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
    } else if (remitente && (remitente.email !== emailRemitente || remitente.telefono !== telRemitente)) {
      // Actualizar remitente si modificaron su correo o teléfono
      setIsSubmitting(true);
      try {
        await api.put(`/clientes/${remitente.id}/contacto`, {
          email: emailRemitente,
          telefono: telRemitente
        });
        // Actualizamos estado local
        setRemitente({ ...remitente, email: emailRemitente, telefono: telRemitente });
      } catch (e: any) {
        setError(e.response?.data?.message || "Error al actualizar los datos de contacto del remitente.");
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
    }
    
    if (!destinatario && dniDestinatario) {
        try {
            const { data } = await api.post(`/clientes/receptor?dni=${dniDestinatario}`);
            if (data.success) {
                setDestinatario(data.data);
            }
        } catch (e: any) {
            setError("Error al crear el destinatario.");
            return;
        }
    }

    if (remitente || showRegisterRemitente) {
      onNext();
    }
  };

  const resetRemitente = () => {
    setRemitente(null);
    setShowRegisterRemitente(false);
  };

  const resetDestinatario = () => {
    setDestinatario(null);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className={styles.cardTitle}><Users size={24} /> Información de Clientes</h2>
      
      <div className={styles.formGrid}>
        {/* Buscador Remitente */}
        <div>
          {!remitente && !showRegisterRemitente ? (
            <div className={styles.inputGroup}>
              <label>DNI Remitente</label>
              <div className={styles.inputWrapper}>
                <Search size={16} className={styles.inputIcon} />
                <input 
                  type="text" 
                  value={dniRemitente} 
                  onChange={(e) => setDniRemitente(e.target.value.replace(/\D/g, '').slice(0,8))}
                  placeholder="Ingrese DNI" 
                />
              </div>
              <button 
                className={styles.btnSearch} 
                onClick={() => searchCliente(dniRemitente, 'r')}
                disabled={dniRemitente.length !== 8 || isLoadingSearch.r}
              >
                {isLoadingSearch.r ? "Buscando..." : "Buscar Remitente"}
              </button>
            </div>
          ) : remitente ? (
            <div className={styles.clientFound} style={{ alignItems: 'flex-start' }}>
              <div className={styles.clientFoundIcon} style={{ marginTop: '4px' }}><CheckCircle size={20} /></div>
              <div className={styles.clientFoundInfo} style={{ flex: 1, minWidth: 0 }}>
                <h4>{remitente.nombreCompleto}</h4>
                <p>Remitente • DNI: {remitente.dni}</p>
                
                {/* Edición de contacto para remitente existente */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '10px' }}>
                  <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px' }}>Email</label>
                    <input 
                      type="email" 
                      value={emailRemitente} 
                      onChange={e => setEmailRemitente(e.target.value)} 
                      style={{ padding: '6px', fontSize: '12px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }} 
                    />
                  </div>
                  <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '11px' }}>Teléfono</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        value={telRemitente.startsWith('+') ? telRemitente.split(' ')[0] + ' ' : '+51 '}
                        onChange={e => {
                          const num = telRemitente.startsWith('+') ? telRemitente.substring(telRemitente.split(' ')[0].length + 1) : telRemitente;
                          setTelRemitente(e.target.value + num);
                        }}
                        style={{ padding: '6px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ccc', width: '70px', background: 'var(--bg-primary)' }}
                      >
                        <option value="+51 ">+51</option>
                        <option value="+1 ">+1</option>
                        <option value="+34 ">+34</option>
                      </select>
                      <input 
                        type="tel" 
                        value={telRemitente.startsWith('+') ? telRemitente.substring(telRemitente.split(' ')[0].length + 1) : telRemitente} 
                        onChange={e => {
                          const pref = telRemitente.startsWith('+') ? telRemitente.split(' ')[0] + ' ' : '+51 ';
                          setTelRemitente(pref + e.target.value);
                        }}
                        style={{ flex: 1, padding: '6px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ccc', background: 'var(--bg-primary)' }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              <button className={styles.btnBack} style={{ padding: '8px 12px', marginTop: '4px', flexShrink: 0 }} onClick={resetRemitente}>
                <RefreshCw size={16} /> Cambiar
              </button>
            </div>
          ) : (
            <div className={styles.summaryBox} style={{ marginTop: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ margin: 0 }}>Registrar Nuevo Remitente</h4>
                <button className={styles.btnBack} style={{ padding: '4px 8px', fontSize: 12 }} onClick={resetRemitente}>Cancelar</button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>DNI: {dniRemitente}</p>
              {nombreReniec && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}><strong>Nombre:</strong> {nombreReniec}</p>}
                <div className={styles.inputGroup} style={{marginBottom: 12}}>
                  <label>Email</label>
                  <div className={styles.inputWrapper}>
                    <input type="email" value={emailRemitente} onChange={e=>setEmailRemitente(e.target.value)} placeholder="Ingrese su correo" />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label>Teléfono</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select 
                      value={telRemitente.startsWith('+') ? telRemitente.split(' ')[0] + ' ' : '+51 '}
                      onChange={e => {
                        const num = telRemitente.startsWith('+') ? telRemitente.substring(telRemitente.split(' ')[0].length + 1) : telRemitente;
                        setTelRemitente(e.target.value + num);
                      }}
                      style={{ padding: '12px 8px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', outline: 'none', width: '80px', color: 'var(--text-primary)' }}
                    >
                      <option value="+51 ">+51</option>
                      <option value="+1 ">+1</option>
                      <option value="+34 ">+34</option>
                    </select>
                    <input 
                      type="tel" 
                      value={telRemitente.startsWith('+') ? telRemitente.substring(telRemitente.split(' ')[0].length + 1) : telRemitente} 
                      onChange={e => {
                        const pref = telRemitente.startsWith('+') ? telRemitente.split(' ')[0] + ' ' : '+51 ';
                        setTelRemitente(pref + e.target.value);
                      }}
                      placeholder="999888777"
                      style={{ flex: 1, padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', outline: 'none', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
            </div>
          )}
        </div>

        {/* Buscador Destinatario */}
        <div>
          {!destinatario ? (
            <div className={styles.inputGroup}>
              <label>DNI Destinatario</label>
              <div className={styles.inputWrapper}>
                <Search size={16} className={styles.inputIcon} />
                <input 
                  type="text" 
                  value={dniDestinatario} 
                  onChange={(e) => setDniDestinatario(e.target.value.replace(/\D/g, '').slice(0,8))}
                  placeholder="Ingrese DNI" 
                />
              </div>
              <button 
                className={styles.btnSearch} 
                onClick={() => searchCliente(dniDestinatario, 'd')}
                disabled={dniDestinatario.length !== 8 || isLoadingSearch.d}
              >
                {isLoadingSearch.d ? "Buscando..." : "Buscar Destinatario"}
              </button>
            </div>
          ) : (
            <div className={styles.clientFound} style={{ alignItems: 'flex-start' }}>
              <div className={styles.clientFoundIcon} style={{ marginTop: '4px' }}><CheckCircle size={20} /></div>
              <div className={styles.clientFoundInfo} style={{ flex: 1, minWidth: 0 }}>
                <h4>{destinatario.nombreCompleto}</h4>
                <p>Destinatario • DNI: {destinatario.dni}</p>
              </div>
              <button className={styles.btnBack} style={{ padding: '8px 12px', marginTop: '4px', flexShrink: 0 }} onClick={resetDestinatario}>
                <RefreshCw size={16} /> Cambiar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnNext} onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting ? "Procesando..." : "Siguiente Paso"}
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// STEP 2: PAQUETE
// ============================================================================
function StepPaquete({ remitente, destinatario, setPaqueteId, formData, setFormData, categorias, setCategorias, onNext, onBack, setError }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const predefinedCategories = ["FRAGIL", "ELECTRONICA", "DOCUMENTOS", "ROPA", "MEDICAMENTOS", "OTROS"];

  const handleToggleCategoria = (cat: string) => {
    setCategorias((prev: string[]) => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleNext = async () => {
    setError(null);
    if (!formData.pesoKg || !formData.valorDeclarado || !formData.altoCm || !formData.anchoCm || !formData.largoCm) {
      setError("Todos los campos dimensionales y de valor son obligatorios.");
      return;
    }
    if (categorias.length === 0) {
      setError("Debe seleccionar al menos una categoría.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        dniRemitente: remitente.dni,
        dniDestinatario: destinatario.dni,
        pesoKg: parseFloat(formData.pesoKg),
        valorDeclarado: parseFloat(formData.valorDeclarado),
        altoCm: parseFloat(formData.altoCm),
        anchoCm: parseFloat(formData.anchoCm),
        largoCm: parseFloat(formData.largoCm),
        categorias
      };

      const { data } = await api.post("/paquetes", payload);
      if (data.success && data.data?.id) {
        setPaqueteId(data.data.id);
        onNext();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al registrar el paquete.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className={styles.cardTitle}><Package size={24} /> Detalles del Paquete</h2>
      
      <div className={styles.formGrid}>
        <div className={styles.inputGroup}>
          <label>Peso (Kg)</label>
          <div className={styles.inputWrapper}>
            <input type="number" step="0.1" min="0.1" value={formData.pesoKg} onChange={e=>setFormData({...formData, pesoKg: e.target.value})} placeholder="Ej. 1.5" />
          </div>
        </div>
        <div className={styles.inputGroup}>
          <label>Valor Declarado (S/)</label>
          <div className={styles.inputWrapper}>
            <input type="number" step="1" min="1" value={formData.valorDeclarado} onChange={e=>setFormData({...formData, valorDeclarado: e.target.value})} placeholder="Ej. 100" />
          </div>
        </div>
      </div>

      <div className={styles.inputGroup} style={{marginBottom: 24}}>
        <label>Dimensiones (cm)</label>
        <div className={styles.dimensionsRow}>
          <div className={styles.inputWrapper}>
            <input type="number" placeholder="Largo" value={formData.largoCm} onChange={e=>setFormData({...formData, largoCm: e.target.value})} />
          </div>
          <div className={styles.inputWrapper}>
            <input type="number" placeholder="Ancho" value={formData.anchoCm} onChange={e=>setFormData({...formData, anchoCm: e.target.value})} />
          </div>
          <div className={styles.inputWrapper}>
            <input type="number" placeholder="Alto" value={formData.altoCm} onChange={e=>setFormData({...formData, altoCm: e.target.value})} />
          </div>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>Categorías</label>
        <div className={styles.checkboxGroup}>
          {predefinedCategories.map(cat => (
            <label key={cat} className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                hidden
                checked={categorias.includes(cat)}
                onChange={() => handleToggleCategoria(cat)}
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnBack} onClick={onBack} disabled={isSubmitting}>Atrás</button>
        <button className={styles.btnNext} onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting ? "Registrando..." : "Siguiente Paso"}
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// STEP 3: ENVIO & PAGO
// ============================================================================
function StepEnvioPago({ paqueteId, agencias, setEnvioData, pinRecojo, setPinRecojo, agenciaOrigen, setAgenciaOrigen, agenciaDestino, setAgenciaDestino, montoPago, onNext, onBack, setError }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipoPago, setTipoPago] = useState<"ORIGEN" | "DESTINO">("ORIGEN");
  const [envioPendientePago, setEnvioPendientePago] = useState<any>(null); // Guarda el envo temporalmente si paga en origen

  const handleProcesar = async () => {
    setError(null);
    if (!agenciaOrigen || !agenciaDestino) {
      setError("Debe seleccionar las agencias de origen y destino.");
      return;
    }
    if (agenciaOrigen === agenciaDestino) {
      setError("La agencia de origen y destino no pueden ser la misma.");
      return;
    }

    if (!/^\d{6}$/.test(pinRecojo)) {
      setError("El PIN de seguridad debe ser exactamente 6 números.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Crear el Envío
      const envioPayload = {
        paqueteId,
        agenciaOrigenId: agenciaOrigen,
        agenciaDestinoId: agenciaDestino,
        claveRecojo: pinRecojo,
        tipoPago: tipoPago
      };
      const resEnvio = await api.post("/envios", envioPayload);
      
      if (!resEnvio.data.success) {
        throw new Error("Error al crear el envío.");
      }

      const envioResult = resEnvio.data.data;
      
      if (tipoPago === "ORIGEN") {
        // En vez de pasar al success, abrimos la pasarela
        setEnvioPendientePago(envioResult);
      } else {
        // Pago en destino: pasamos a success de frente
        setEnvioData(envioResult);
        onNext();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Error al procesar el envío.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPagoCancelado = () => {
    // Si cierra el modal sin pagar, igual consideramos que se creó el envío
    setEnvioData(envioPendientePago);
    setEnvioPendientePago(null);
    onNext(); // Muestra el mensaje de éxito con la Guía y quedará pendiente.
  };

  const onPagoExitoso = (urlBoleta?: string) => {
    // Si paga, pasamos al success igual
    const envioConBoleta = { ...envioPendientePago, urlBoleta };
    setEnvioData(envioConBoleta);
    setEnvioPendientePago(null);
    onNext();
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className={styles.cardTitle}><MapPin size={24} /> Origen y Destino</h2>
      
      {agencias.length === 0 && (
        <div className={styles.errorAlert} style={{ marginBottom: '1rem' }}>
          <AlertCircle size={20} />
          <span>No hay agencias registradas en el sistema. Por favor, registre agencias en el módulo de "Agencias" primero.</span>
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.inputGroup}>
          <label>Agencia Origen</label>
          <div className={styles.inputWrapper}>
            <select value={agenciaOrigen} onChange={e=>setAgenciaOrigen(e.target.value)}>
              <option value="">Seleccione origen...</option>
              {agencias.map((a: any) => (
                <option key={a.id} value={a.id}>{a.nombre} - {a.direccion}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Agencia Destino</label>
          <div className={styles.inputWrapper}>
            <select value={agenciaDestino} onChange={e=>setAgenciaDestino(e.target.value)}>
              <option value="">Seleccione destino...</option>
              {agencias.map((a: any) => (
                <option key={a.id} value={a.id}>{a.nombre} - {a.direccion}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.summaryBox}>
        <h2 className={styles.cardTitle} style={{marginBottom: 16}}><CreditCard size={20} /> Modalidad de Pago</h2>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1, padding: '16px', border: tipoPago === 'ORIGEN' ? '2px solid var(--color-primary-500)' : '2px solid var(--border-color)', borderRadius: '12px', background: tipoPago === 'ORIGEN' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-glass)', transition: 'all 0.2s ease' }}>
            <input type="radio" name="tipoPago" value="ORIGEN" checked={tipoPago === 'ORIGEN'} onChange={() => setTipoPago('ORIGEN')} style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-500)' }} />
            <div>
              <strong style={{ display: 'block', color: tipoPago === 'ORIGEN' ? 'var(--color-primary-400)' : 'var(--text-primary)', fontSize: '15px', marginBottom: '4px' }}>Pago en Origen</strong>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Paga el remitente al registrar el envío.</span>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1, padding: '16px', border: tipoPago === 'DESTINO' ? '2px solid var(--color-primary-500)' : '2px solid var(--border-color)', borderRadius: '12px', background: tipoPago === 'DESTINO' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-glass)', transition: 'all 0.2s ease' }}>
            <input type="radio" name="tipoPago" value="DESTINO" checked={tipoPago === 'DESTINO'} onChange={() => setTipoPago('DESTINO')} style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-500)' }} />
            <div>
              <strong style={{ display: 'block', color: tipoPago === 'DESTINO' ? 'var(--color-primary-400)' : 'var(--text-primary)', fontSize: '15px', marginBottom: '4px' }}>Pago en Destino</strong>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Paga el destinatario al recoger el paquete.</span>
            </div>
          </label>
        </div>

        <h2 className={styles.cardTitle} style={{marginBottom: 16, marginTop: 24}}><CreditCard size={20} /> Resumen de Pago</h2>
        <div className={styles.summaryRow}>
          <span>Costo Base</span>
          <span>S/ 15.00</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Exceso de Peso</span>
          <span>S/ {(montoPago - 15).toFixed(2)}</span>
        </div>
        <div className={`${styles.summaryRow} ${styles.total}`}>
          <span>Total a Pagar</span>
          <span>S/ {montoPago.toFixed(2)}</span>
        </div>
      </div>

      <div className={styles.pinDisplay}>
        <div className={styles.pinLabel}>PIN Seguro de Recojo (Creado por el remitente)</div>
        <div className={styles.inputWrapper} style={{ marginTop: 8 }}>
          <input 
            type="text" 
            value={pinRecojo} 
            onChange={(e) => setPinRecojo(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            placeholder="Ej. 123456" 
            style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '4px', fontWeight: 'bold' }}
          />
        </div>
        <div className={styles.pinWarning} style={{ marginTop: 8 }}>
          <AlertCircle size={16} /> Este PIN debe ser inventado y resguardado por el cliente.
        </div>
      </div>

      <div className={styles.stepActions}>
        <button onClick={onBack} disabled={isSubmitting} className={styles.btnBack}>Volver</button>
        <button onClick={handleProcesar} disabled={isSubmitting} className={styles.btnNext}>
          {isSubmitting ? "Procesando..." : (tipoPago === 'ORIGEN' ? `Ir a Pagar (S/ ${montoPago.toFixed(2)})` : "Generar Guía")}
        </button>
      </div>

      <PagoModal
        isOpen={!!envioPendientePago}
        onClose={onPagoCancelado}
        onSuccess={onPagoExitoso}
        envio={envioPendientePago}
        montoAPagar={montoPago}
      />
    </motion.div>
  );
}

// ============================================================================
// STEP 4: CONFIRMACION
// ============================================================================
function StepConfirmacion({ envioData, pinRecojo, montoPago }: any) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [guiaUrl, setGuiaUrl] = useState<string | null>(null);

  const generarYSubirGuia = async () => {
    setIsUploading(true);
    try {
      // 1. Obtener datos ricos para la guía (usamos el mismo endpoint de boleta-datos por simplicidad de información)
      const guiaDatos = await envioService.getBoletaDatos(envioData.numeroOrden, envioData.codigoRastreo);
      
      // 2. Crear documento PDF
      const doc = <GuiaEnvioPDF data={guiaDatos} />;
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      const file = new File([blob], `guia-${envioData?.numeroOrden}.pdf`, { type: 'application/pdf' });
      
      // 3. Subir a R2 a través del endpoint de guía
      const guiaUrlData = await envioService.subirGuiaPdf(envioData?.id, file);
      
      if (guiaUrlData) {
        setGuiaUrl(guiaUrlData);
      }
    } catch (err) {
      console.error("Error al generar o subir guía", err);
      alert("Hubo un problema al subir la guía, pero el envío está confirmado.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (envioData && !guiaUrl && !isUploading) {
      generarYSubirGuia();
    }
  }, []);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <div className={styles.successScreen}>
        <div className={styles.successIcon}><CheckCircle size={40} /></div>
        <h2>¡Envío Registrado Exitosamente!</h2>
        <p>El paquete ha sido procesado correctamente.</p>
        
        <div className={styles.trackingBox}>
          <div className={styles.trackingBoxItem}>
            <span>Número de Orden</span>
            <strong>{envioData?.numeroOrden || "---"}</strong>
          </div>
          <div className={styles.trackingBoxItem}>
            <span>Código de Rastreo</span>
            <strong style={{ color: "var(--color-primary-600)" }}>{envioData?.codigoRastreo || "---"}</strong>
          </div>
          <div className={styles.trackingBoxItem}>
            <span>PIN de Recojo (Dar al cliente)</span>
            <strong style={{ letterSpacing: '4px' }}>{pinRecojo}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          <button 
            onClick={generarYSubirGuia} 
            disabled={isUploading || !!guiaUrl}
            className={styles.btnNext}
            style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {isUploading ? (
              <><Loader2 className={styles.spinner} size={20} /> Generando...</>
            ) : guiaUrl ? (
              <><CheckCircle size={20} /> Guía Subida</>
            ) : (
              <><Printer size={20} /> Generar Guía de Envío</>
            )}
          </button>
  
          {guiaUrl && (
            <a 
              href={guiaUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.btnDownload}
              style={{ width: '100%', padding: '12px', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Download size={20} /> Descargar Guía
            </a>
          )}
          
          {envioData?.urlBoleta && (
            <a 
              href={envioData.urlBoleta} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ width: '100%', padding: '12px', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '8px', fontWeight: 'bold' }}
            >
              <Download size={20} /> Descargar Boleta
            </a>
          )}
  
          <button 
            onClick={() => {
              router.push("/envios");
            }}
            className={styles.btnSecondary}
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
          >
            Ir a mis envíos
          </button>
        </div>
      </div>
    </motion.div>
  );
}
