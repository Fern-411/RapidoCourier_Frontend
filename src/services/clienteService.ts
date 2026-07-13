import api, { type ApiResponse } from "@/lib/axios";

export interface ClienteResponse {
  id: string;
  dni: string;
  nombreCompleto: string;
  email: string;
  telefono: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClienteRequest {
  dni: string;
  email: string;
  telefono: string;
}

export const clienteService = {
  // Buscar un cliente por DNI
  getByDni: async (dni: string) => {
    const { data } = await api.get<ApiResponse<ClienteResponse>>(`/clientes/dni/${dni}`);
    return data.data;
  },

  // Registrar o actualizar un cliente
  createOrUpdate: async (payload: ClienteRequest) => {
    const { data } = await api.post<ApiResponse<ClienteResponse>>('/clientes', payload);
    return data.data;
  },

  // Actualizar contacto del cliente
  updateContacto: async (id: string, payload: { email: string; telefono: string }) => {
    const { data } = await api.put<ApiResponse<ClienteResponse>>(`/clientes/${id}/contacto`, payload);
    return data.data;
  }
};
