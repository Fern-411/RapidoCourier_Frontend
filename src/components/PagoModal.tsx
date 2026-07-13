import React, { useState } from 'react';
import { X, CreditCard, Banknote, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import { pdf } from '@react-pdf/renderer';
import { BoletaPDF } from '@/components/BoletaPDF';
import { envioService } from '@/services/envioService';

interface PagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (urlBoleta?: string) => void;
  envio: any; // EnvioResponse
  montoAPagar?: number;
}

export function PagoModal({ isOpen, onClose, onSuccess, envio, montoAPagar }: PagoModalProps) {
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TARJETA'>('EFECTIVO');
  const [monto, setMonto] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1); // 1: Pagar, 2: Exito
  const [urlBoletaGenerada, setUrlBoletaGenerada] = useState<string | undefined>(undefined);
  const [precioCalculado, setPrecioCalculado] = useState<number>(montoAPagar || 0);
  const [isLoadingPaquete, setIsLoadingPaquete] = useState(false);

  React.useEffect(() => {
    if (isOpen && envio?.paqueteId && !montoAPagar) {
      const fetchPaquete = async () => {
        setIsLoadingPaquete(true);
        try {
          const { data } = await api.get(`/paquetes/${envio.paqueteId}`);
          if (data.success && data.data) {
            const peso = data.data.pesoKg;
            let calc = 15.00;
            if (peso > 2) {
              calc += Math.ceil(peso - 2) * 5;
            }
            setPrecioCalculado(calc);
          }
        } catch (err) {
          console.error("Error al obtener el paquete para calcular el precio:", err);
          setError("No se pudo calcular el precio automáticamente.");
        } finally {
          setIsLoadingPaquete(false);
        }
      };
      fetchPaquete();
    } else if (montoAPagar) {
      setPrecioCalculado(montoAPagar);
    }
  }, [isOpen, envio, montoAPagar]);
  
  const procesarPago = async () => {
    if (monto < precioCalculado) {
      setError(`El monto recibido (S/ ${monto}) debe ser mayor o igual al total a pagar (S/ ${precioCalculado}).`);
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      // 1. Procesar el pago en el backend
      const pagoPayload = {
        paqueteId: envio.paqueteId,
        monto: precioCalculado, // SIEMPRE enviamos el costo real
        metodo: metodoPago
      };
      await api.post("/pagos/procesar", pagoPayload);

      // 2. Obtener datos para la boleta
      const boletaDatos = await envioService.getBoletaDatos(envio.numeroOrden, envio.codigoRastreo);
      
      // 3. Crear documento PDF
      const doc = <BoletaPDF data={boletaDatos} montoPago={precioCalculado} montoRecibido={monto} />;
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      const file = new File([blob], `boleta-${envio.numeroOrden}.pdf`, { type: 'application/pdf' });
      
      // 4. Subir a R2 a través del endpoint de boleta
      const uploadedUrl = await envioService.subirBoletaPdf(envio.id, file);
      setUrlBoletaGenerada(uploadedUrl);

      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Error al procesar el pago");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccessClose = () => {
    setStep(1);
    setMonto(0);
    onSuccess(urlBoletaGenerada);
    // El onClose lo dispara el padre al hacer null envioPendientePago.
  };

  if (!isOpen || !envio) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          style={{
            background: 'white', borderRadius: '12px', width: '90%', maxWidth: '450px',
            overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            color: '#111827'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Procesar Pago</h3>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ padding: '24px' }}>
            {step === 1 ? (
              <>
                <div style={{ marginBottom: '20px', background: '#f3f4f6', padding: '12px', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>Envío: <strong>{envio.numeroOrden}</strong></p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#4b5563' }}>Rastreo: <strong>{envio.codigoRastreo}</strong></p>
                </div>

                {error && (
                  <div style={{ padding: '12px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                    {error}
                  </div>
                )}

                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e0e7ff', padding: '16px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '500', color: '#3730a3' }}>Total a Pagar:</span>
                  {isLoadingPaquete ? (
                    <Loader2 className="animate-spin" size={20} color="#3730a3" style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#312e81' }}>S/ {precioCalculado.toFixed(2)}</span>
                  )}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#111827' }}>Monto Recibido (S/)</label>
                  <input 
                    type="number" 
                    value={monto} 
                    onChange={e => setMonto(parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '18px', color: '#111827', background: '#ffffff', fontWeight: 'bold' }}
                    placeholder="0.00"
                    min="0"
                    step="0.1"
                  />
                  {monto >= precioCalculado && precioCalculado > 0 && (
                    <p style={{ marginTop: '8px', fontSize: '14px', color: '#059669', fontWeight: '500' }}>
                      Vuelto: S/ {(monto - precioCalculado).toFixed(2)}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#111827' }}>Método de Pago</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => setMetodoPago('EFECTIVO')}
                      style={{ 
                        flex: 1, padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                        border: metodoPago === 'EFECTIVO' ? '2px solid #2563eb' : '1px solid #d1d5db',
                        background: metodoPago === 'EFECTIVO' ? '#eff6ff' : '#f9fafb', color: '#111827', cursor: 'pointer'
                      }}
                    >
                      <Banknote size={24} color={metodoPago === 'EFECTIVO' ? '#2563eb' : '#6b7280'} />
                      <span style={{ fontSize: '14px', fontWeight: metodoPago === 'EFECTIVO' ? 'bold' : 'normal' }}>Efectivo</span>
                    </button>
                    <button 
                      onClick={() => setMetodoPago('TARJETA')}
                      style={{ 
                        flex: 1, padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                        border: metodoPago === 'TARJETA' ? '2px solid #2563eb' : '1px solid #d1d5db',
                        background: metodoPago === 'TARJETA' ? '#eff6ff' : '#f9fafb', color: '#111827', cursor: 'pointer'
                      }}
                    >
                      <CreditCard size={24} color={metodoPago === 'TARJETA' ? '#2563eb' : '#6b7280'} />
                      <span style={{ fontSize: '14px', fontWeight: metodoPago === 'TARJETA' ? 'bold' : 'normal' }}>Tarjeta / POS</span>
                    </button>
                  </div>
                </div>

                <button 
                  onClick={procesarPago}
                  disabled={isProcessing}
                  style={{ 
                    width: '100%', padding: '14px', borderRadius: '8px', background: '#2563eb', color: 'white', 
                    border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: isProcessing ? 0.7 : 1
                  }}
                >
                  {isProcessing ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Procesando...</> : 'Confirmar Pago'}
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle size={60} color="#10b981" style={{ margin: '0 auto 16px' }} />
                <h2 style={{ color: '#111827', marginBottom: '8px' }}>¡Pago Exitoso!</h2>
                <p style={{ color: '#4b5563', marginBottom: '24px' }}>La Boleta de Venta ha sido generada y enlazada al envío.</p>
                <button 
                  onClick={handleSuccessClose}
                  style={{ 
                    width: '100%', padding: '14px', borderRadius: '8px', background: '#10b981', color: 'white', 
                    border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer'
                  }}
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
