"use client";

import { useState } from "react";
import { Package, Search, CheckCircle, AlertCircle, KeyRound, ShieldAlert, Lock, Unlock, List } from "lucide-react";
import { envioService, EnvioResponse, BoletaDetalleResponse } from "@/services/envioService";
import api from "@/lib/axios";
import styles from "./entregar.module.css";
import Swal from "sweetalert2";
import { PagoModal } from "@/components/PagoModal";

export default function EntregarPage() {
  // Buscador por DNI
  const [dniBusqueda, setDniBusqueda] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Lista de envíos encontrados para ese DNI
  const [enviosList, setEnviosList] = useState<EnvioResponse[]>([]);
  const [envioData, setEnvioData] = useState<EnvioResponse | null>(null);
  const [boletaData, setBoletaData] = useState<BoletaDetalleResponse | null>(null);
  
  // Estado del paquete seleccionado
  const [isLocked, setIsLocked] = useState(false); // Estado 423
  const [showPagoModal, setShowPagoModal] = useState(false);
  
  // Formulario Entrega
  const [pin, setPin] = useState("");
  const [isDelivering, setIsDelivering] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Formulario OTP
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPin, setNewPin] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleSearchDni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dniBusqueda || dniBusqueda.length < 8) {
      setSearchError("Ingrese un DNI válido (8 dígitos).");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setEnviosList([]);
    setEnvioData(null);
    setIsLocked(false);
    setIsSuccess(false);

    try {
      const data = await envioService.getByDniDestinatario(dniBusqueda.trim());
      if (!data || data.length === 0) {
        setSearchError("No se encontraron envíos para este DNI.");
      } else {
        setEnviosList(data);
      }
    } catch (err: any) {
      setSearchError(err.response?.data?.message || "Error al buscar envíos por DNI.");
    } finally {
      setIsSearching(false);
    }
  };

  const selectEnvio = async (envio: EnvioResponse) => {
    setEnvioData(envio);
    setIsLocked(false);
    setDeliveryError(null);
    setPin("");
    
    // Obtener detalles extendidos
    if (envio.numeroOrden && envio.codigoRastreo) {
      try {
        const details = await envioService.getBoletaDatos(envio.numeroOrden, envio.codigoRastreo);
        setBoletaData(details);
      } catch (e) {
        console.error("No se pudo cargar el detalle del paquete.");
      }
    }
  };

  const handleDeliver = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) {
      setDeliveryError("Ingrese el PIN secreto.");
      return;
    }
    if (!envioData || !boletaData) return;

    // 1. Verificar si hay que pagar
    if (boletaData.estadoPago === 'PENDIENTE') {
      setShowPagoModal(true);
      return; // Detenemos la entrega, debe pagar primero
    }

    ejecutarEntregaFinal();
  };

  const ejecutarEntregaFinal = async () => {
    setIsDelivering(true);
    setDeliveryError(null);

    try {
      // 2. Usamos el DNI con el que buscamos como DNI de confirmación
      await envioService.entregar(envioData!.id, pin, dniBusqueda);
      setIsSuccess(true);
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message || "Error al procesar la entrega o pago.";
      
      if (status === 423) {
        setIsLocked(true);
        setDeliveryError(message);
      } else {
        setDeliveryError(message);
      }
    } finally {
      setIsDelivering(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!envioData) return;
    try {
      Swal.fire({
        title: 'Enviando código...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading() }
      });
      await envioService.solicitarDesbloqueo(envioData.id);
      setIsOtpSent(true);
      Swal.fire("Código Enviado", "Se envió el código OTP al remitente.", "success");
    } catch (err: any) {
      Swal.fire("Error", err.response?.data?.message || "Error al enviar OTP", "error");
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPin || !envioData) return;

    setIsUnlocking(true);
    try {
      await envioService.desbloquear(envioData.id, { otp, nuevaClaveRecojo: newPin });
      Swal.fire("Desbloqueado", "Paquete desbloqueado con nueva clave.", "success");
      setIsLocked(false);
      setIsOtpSent(false);
      setPin(newPin); // autocompletar para la entrega
      setOtp("");
      setNewPin("");
      setDeliveryError(null);
    } catch (err: any) {
      Swal.fire("Error OTP", err.response?.data?.message || "Código incorrecto.", "error");
    } finally {
      setIsUnlocking(false);
    }
  };

  const resetAll = () => {
    setDniBusqueda("");
    setEnviosList([]);
    setEnvioData(null);
    setBoletaData(null);
    setIsLocked(false);
    setIsSuccess(false);
    setPin("");
    setDeliveryError(null);
    setSearchError(null);
    setIsOtpSent(false);
  };

  const goBackToList = () => {
    setEnvioData(null);
    setBoletaData(null);
    setIsLocked(false);
    setPin("");
    setDeliveryError(null);
    setIsOtpSent(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1><Package size={28} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> POS Entregas (Búsqueda por DNI)</h1>
          <p>Busca los paquetes del cliente mediante su DNI físico.</p>
        </div>
      </div>

      {!isSuccess ? (
        <>
          {/* Si no hemos seleccionado un paquete, mostramos el buscador y la lista */}
          {!envioData ? (
            <>
              {/* Buscador */}
              <div className={styles.searchBox}>
                <form onSubmit={handleSearchDni}>
                  <div className={styles.inputGrid} style={{ gridTemplateColumns: '1fr' }}>
                    <div className={styles.inputGroup}>
                      <label>DNI del Destinatario (Físico)</label>
                      <div className={styles.inputWrapper}>
                        <Search className={styles.inputIcon} size={20} />
                        <input 
                          type="text" 
                          value={dniBusqueda} 
                          onChange={(e) => setDniBusqueda(e.target.value.replace(/\D/g, ''))}
                          placeholder="Ingrese los 8 dígitos del DNI..."
                          maxLength={8}
                          autoFocus
                        />
                      </div>
                    </div>
                  </div>
                  
                  {searchError && (
                    <div className={styles.errorAlert} style={{ marginTop: '1.5rem', marginBottom: 0 }}>
                      <AlertCircle size={20} /> {searchError}
                    </div>
                  )}

                  <div style={{ marginTop: '1.5rem' }}>
                    <button type="submit" className={styles.btnSearch} disabled={isSearching || dniBusqueda.length < 8}>
                      {isSearching ? "Buscando..." : "Buscar Paquetes"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista de Resultados */}
              {enviosList.length > 0 && (
                <div className={styles.resultCard} style={{ marginTop: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <List size={24} /> Paquetes Encontrados ({enviosList.length})
                  </h3>
                  <div className={styles.enviosListGrid}>
                    {enviosList.map(envio => (
                      <div 
                        key={envio.id} 
                        className={styles.envioListItem}
                        onClick={() => selectEnvio(envio)}
                      >
                        <div className={styles.envioListInfo}>
                          <h4>{envio.numeroOrden}</h4>
                          <span className={styles.dateLabel}>{new Date(envio.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className={`${styles.statusBadge} ${envio.estadoActual === 'EN_AGENCIA_DESTINO' ? styles['status-EN_AGENCIA_DESTINO'] : styles['status-OTROS']}`}>
                          {envio.estadoActual.replace(/_/g, ' ')}
                        </div>
                        {envio.estadoActual !== 'EN_AGENCIA_DESTINO' && (
                          <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem' }}>
                            * No disponible para entrega
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Pantalla de Entrega de Paquete Específico */
            <div className={styles.resultCard}>
              <button className={styles.btnOutline} onClick={goBackToList} style={{ marginBottom: '1.5rem', width: 'auto', padding: '0.5rem 1rem' }}>
                &larr; Volver a la Lista
              </button>

              <div className={styles.resultHeader}>
                <div>
                  <div className={styles.resultTitle}>Paquete: {envioData.numeroOrden}</div>
                  <div className={styles.resultSubtitle}>Destino: {envioData.agenciaDestino}</div>
                </div>
                <div className={`${styles.statusBadge} ${envioData.estadoActual === 'EN_AGENCIA_DESTINO' ? styles['status-EN_AGENCIA_DESTINO'] : styles['status-OTROS']}`}>
                  {envioData.estadoActual.replace(/_/g, ' ')}
                </div>
              </div>

              {boletaData && (
                <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e5e7eb' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>Detalles del Paquete</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem', color: '#4b5563' }}>
                    <div><strong>Remitente:</strong> {boletaData.remitente.nombreCompleto}</div>
                    <div><strong>Peso:</strong> {boletaData.pesoKg} Kg</div>
                    <div><strong>Descripción:</strong> {boletaData.descripcionPaquete}</div>
                    <div><strong>Total Pagado:</strong> S/ {boletaData.montoTotal.toFixed(2)}</div>
                  </div>
                  {envioData.urlBoleta && (
                    <div style={{ marginTop: '1rem' }}>
                      <a href={envioData.urlBoleta} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline', fontSize: '0.9rem' }}>
                        Descargar Boleta de Venta
                      </a>
                    </div>
                  )}
                </div>
              )}

              {envioData.estadoActual !== "EN_AGENCIA_DESTINO" ? (
                <div className={styles.errorAlert}>
                  <AlertCircle size={20} />
                  El paquete no está listo para entrega. Estado actual: {envioData.estadoActual.replace(/_/g, ' ')}
                </div>
              ) : (
                <>
                  {!isLocked ? (
                    <div className={styles.deliveryBox}>
                      <h3><ShieldAlert size={24} color="#10b981" /> Validación de Seguridad</h3>
                      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                        Entregando al DNI: <strong>{dniBusqueda}</strong>
                      </p>
                      
                      {deliveryError && (
                        <div className={styles.errorAlert}>
                          <AlertCircle size={20} /> {deliveryError}
                        </div>
                      )}

                      <form onSubmit={handleDeliver}>
                        <div className={styles.inputGrid} style={{ gridTemplateColumns: '1fr' }}>
                          <div className={styles.inputGroup}>
                            <label>PIN Secreto (Dictado por cliente)</label>
                            <div className={styles.inputWrapper}>
                              <input 
                                type="password" 
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                placeholder="Escriba el PIN numérico de 6 dígitos..."
                                maxLength={6}
                                autoFocus
                              />
                            </div>
                          </div>
                        </div>
                        <button 
                          type="submit" 
                          className={styles.btnDeliver} 
                          disabled={isDelivering || pin.length < 6}
                          style={boletaData?.estadoPago === 'PENDIENTE' ? { backgroundColor: '#ef4444' } : {}}
                        >
                          {isDelivering ? "Procesando Entrega..." : 
                           boletaData?.estadoPago === 'PENDIENTE' ? `Cobrar (S/ ${boletaData.montoTotal.toFixed(2)}) y Confirmar Entrega` : 
                           "Confirmar Entrega"}
                        </button>
                      </form>
                    </div>
                  ) : (
                    // Bloqueado State
                    <div className={styles.lockedBox}>
                      <h3><Lock size={28} /> PAQUETE BLOQUEADO</h3>
                      <p>{deliveryError || "Se superaron los intentos fallidos de PIN."}</p>
                      
                      {!isOtpSent ? (
                        <button onClick={handleRequestOtp} className={styles.btnWarning}>
                          Solicitar Desbloqueo (Enviar OTP al Remitente)
                        </button>
                      ) : (
                        <form onSubmit={handleUnlock} style={{ marginTop: '1.5rem', textAlign: 'left', background: 'white', padding: '1.5rem', borderRadius: '12px' }}>
                          <h4 style={{ marginBottom: '1rem', color: '#111827' }}>Validar OTP y Cambiar PIN</h4>
                          <div className={styles.inputGrid}>
                            <div className={styles.inputGroup}>
                              <label>Código OTP (Enviado al correo del remitente)</label>
                              <div className={styles.inputWrapper}>
                                <input type="text" value={otp} onChange={e => setOtp(e.target.value.toUpperCase())} placeholder="XXXXXX" />
                              </div>
                            </div>
                            <div className={styles.inputGroup}>
                              <label>Nuevo PIN Seguro (6 dígitos)</label>
                              <div className={styles.inputWrapper}>
                                <input type="password" value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} placeholder="000000" maxLength={6} />
                              </div>
                            </div>
                          </div>
                          <button type="submit" className={styles.btnDeliver} style={{ background: '#3b82f6' }} disabled={isUnlocking || newPin.length < 6}>
                            {isUnlocking ? "Validando..." : <><Unlock size={20}/> Desbloquear Paquete</>}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <div className={styles.resultCard} style={{ display: 'flex', justifyContent: 'center' }}>
          <div className={styles.successCard}>
            <CheckCircle size={80} className={styles.successIcon} />
            <h2>¡Entrega Exitosa!</h2>
            <p>El paquete {envioData?.numeroOrden} ha sido entregado correctamente al DNI {dniBusqueda}.</p>
            <button className={styles.btnOutline} onClick={resetAll}>
              Realizar Otra Entrega
            </button>
          </div>
        </div>
      )}

      {showPagoModal && envioData && boletaData && (
        <PagoModal
          isOpen={showPagoModal}
          onClose={() => setShowPagoModal(false)}
          onSuccess={(urlBoleta) => {
            setShowPagoModal(false);
            setBoletaData({ ...boletaData, estadoPago: 'COMPLETADO', urlBoleta });
            ejecutarEntregaFinal();
          }}
          envio={envioData}
          montoAPagar={boletaData.montoTotal}
        />
      )}
    </div>
  );
}
