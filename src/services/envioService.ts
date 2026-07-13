import api, { type ApiResponse } from "@/lib/axios";

export interface AgenciaResponse {
  id: string;
  nombre: string;
  direccion: string;
}

export interface EnvioResponse {
  id: string;
  codigoRastreo: string;
  numeroOrden?: string; // Phase 5
  paqueteId: string;
  agenciaOrigen: string;
  agenciaDestino: string;
  estadoActual: string;
  tipoPago?: string; // DESTINO, ORIGEN
  urlBoleta?: string;
  urlGuia?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HistorialEstadoEnvioResponse {
  id: string;
  estado: string;
  fechaCambio: string;
  usuarioResponsable: string;
}

export interface EstadisticasEnvioResponse {
  totalEnviosHoy: number;
  enviosPorEstado: Record<string, number>;
}

export interface ClienteDetalle {
  nombreCompleto: string;
  dni: string;
  telefono: string;
}

export interface BoletaDetalleResponse {
  numeroOrden: string;
  codigoRastreo: string;
  fechaEmision: string;
  agenciaOrigen: string;
  direccionOrigen: string;
  agenciaDestino: string;
  direccionDestino: string;
  remitente: ClienteDetalle;
  destinatario: ClienteDetalle;
  pesoKg: number;
  descripcionPaquete: string;
  montoTotal: number;
  estadoPago: string;
  urlBoleta?: string;
  urlGuia?: string;
}

export interface EnvioRequest {
  paqueteId: string;
  agenciaOrigenId: string;
  agenciaDestinoId: string;
  claveRecojo: string; // Phase 5: PIN de seguridad
}

export const envioService = {
  // Obtener todas las agencias
  getAgencias: async () => {
    const { data } = await api.get<ApiResponse<AgenciaResponse[]>>('/envios/agencias'); // Ajustar si es necesario, antes usabamos /agencias
    return data.data || [];
  },

  // Listar todos los envíos
  getAll: async () => {
    const { data } = await api.get<ApiResponse<EnvioResponse[]>>("/envios");
    return data.data || [];
  },

  actualizarEstado: async (id: string, nuevoEstado: string) => {
    const { data } = await api.put<ApiResponse<EnvioResponse>>(`/envios/${id}/estado?nuevoEstado=${nuevoEstado}`, {});
    return data.data;
  },

  // Crear un nuevo envío
  create: async (payload: EnvioRequest) => {
    const { data } = await api.post<ApiResponse<EnvioResponse>>('/envios', payload);
    return data.data;
  },
  
  // Buscar envío por número de orden y código de rastreo (Phase 5)
  getByRastreo: async (numeroOrden: string, codigoRastreo: string) => {
    const { data } = await api.get<ApiResponse<EnvioResponse>>(`/envios/rastreo/${numeroOrden}/${codigoRastreo}`);
    return data.data;
  },

  // Obtener historial de estados de un envío
  getHistorial: async (id: string) => {
    const { data } = await api.get<ApiResponse<HistorialEstadoEnvioResponse[]>>(`/envios/${id}/historial`);
    return data.data || [];
  },

  // Estadísticas diarias
  getEstadisticasDiarias: async () => {
    const { data } = await api.get<ApiResponse<EstadisticasEnvioResponse>>('/envios/estadisticas/resumen-diario');
    return data.data;
  },

  // Obtener detalles de la boleta
  getBoletaDatos: async (numeroOrden: string, codigoRastreo: string) => {
    const { data } = await api.get<ApiResponse<BoletaDetalleResponse>>(`/envios/rastreo/${numeroOrden}/${codigoRastreo}/boleta-datos`);
    return data.data;
  },

  // Subir el PDF generado de boleta
  subirBoletaPdf: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<ApiResponse<any>>(`/envios/${id}/boleta`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data.data;
  },

  // Subir el PDF generado de guía
  subirGuiaPdf: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<ApiResponse<any>>(`/envios/${id}/guia`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data.data;
  },

  // Entregar envío (con PIN y DNI)
  entregar: async (id: string, pin: string, dniDestinatario: string) => {
    const { data } = await api.post<ApiResponse<VoidFunction>>(`/envios/${id}/entregar?pin=${pin}&dniDestinatario=${dniDestinatario}`);
    return data.data;
  },

  // Solicitar desbloqueo
  solicitarDesbloqueo: async (id: string) => {
    const { data } = await api.post<ApiResponse<VoidFunction>>(`/envios/${id}/solicitar-desbloqueo`);
    return data.data;
  },

  // Desbloquear envío
  desbloquear: async (id: string, request: { otp: string; nuevaClaveRecojo: string }): Promise<void> => {
    await api.post(`/envios/${id}/desbloquear`, request);
  },

  getByDniDestinatario: async (dni: string): Promise<EnvioResponse[]> => {
    const response = await api.get<ApiResponse<EnvioResponse[]>>(`/envios/destinatario/dni/${dni}`);
    return response.data.data;
  },

  getBoletaDatos: async (numeroOrden: string, codigoRastreo: string): Promise<BoletaDetalleResponse> => {
    const response = await api.get<ApiResponse<BoletaDetalleResponse>>(`/envios/rastreo/${numeroOrden}/${codigoRastreo}/boleta-datos`);
    return response.data.data;
  },

  // Obtener envíos paginados y filtrados
  getPaginados: async (page: number, size: number, busqueda?: string, fechaInicio?: string, fechaFin?: string, estado?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (busqueda) params.append('busqueda', busqueda);
    if (fechaInicio) params.append('fechaInicio', fechaInicio);
    if (fechaFin) params.append('fechaFin', fechaFin);
    if (estado) params.append('estado', estado);
    
    const { data } = await api.get<ApiResponse<PaginaResponse<EnvioResponse>>>(`/envios/paginado?${params.toString()}`);
    return data.data;
  },
};

export interface PaginaResponse<T> {
  contenido: T[];
  pagina: number;
  tamano: number;
  totalElementos: number;
  totalPaginas: number;
  ultima: boolean;
}
