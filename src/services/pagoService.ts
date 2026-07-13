import api, { type ApiResponse } from "@/lib/axios";

export interface PagoResponse {
  id: string;
  paqueteId: string;
  monto: number;
  estadoPago: string;
  fechaPago: string;
}

export interface PagoRequest {
  paqueteId: string;
  monto: number;
}

export const pagoService = {
  // Procesar un pago
  procesar: async (payload: PagoRequest) => {
    const { data } = await api.post<ApiResponse<PagoResponse>>('/pagos/procesar', payload);
    return data.data;
  },
  
  // Verificar estado de pago de un paquete
  verificar: async (paqueteId: string) => {
    const { data } = await api.get<ApiResponse<PagoResponse>>(`/pagos/verificar?paqueteId=${paqueteId}`);
    return data.data;
  }
};
