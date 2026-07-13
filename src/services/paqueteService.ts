import api, { type ApiResponse } from "@/lib/axios";

export interface CategoriaResponse {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface PaqueteResponse {
  id: string;
  pesoKg: number;
  valorDeclarado: number;
  altoCm: number;
  anchoCm: number;
  largoCm: number;
  fechaRegistro: string;
  nombreRemitente: string;
  nombreDestinatario: string;
}

export interface PaqueteRequest {
  dniRemitente: string;
  dniDestinatario: string;
  pesoKg: number;
  valorDeclarado: number;
  altoCm: number;
  anchoCm: number;
  largoCm: number;
  categorias: string[]; // Nombres de las categorías
}

export const paqueteService = {
  // Obtener todas las categorías disponibles
  getCategorias: async () => {
    // Asumiendo que existe este endpoint según el documento de arquitectura
    const { data } = await api.get<ApiResponse<CategoriaResponse[]>>('/categorias');
    return data.data || [];
  },

  // Listar todos los paquetes (para la vista principal)
  getAll: async () => {
    const { data } = await api.get<ApiResponse<PaqueteResponse[]>>('/paquetes');
    return data.data || [];
  },

  // Crear un nuevo paquete
  create: async (payload: PaqueteRequest) => {
    const { data } = await api.post<ApiResponse<PaqueteResponse>>('/paquetes', payload);
    return data.data;
  }
};
