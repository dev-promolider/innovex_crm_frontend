import apiClient from "../../../app/apiClient";

export interface Resp {
  status: number | boolean;
  data?: any;
  message?: string;
}

export const getListSolicitudesInventario = async (
  current_membresia: any,
): Promise<Resp> => {
  try {
    const response = await apiClient.get(
      "/auth/mis-solicitudes/demo",
      current_membresia,
    );

     console.log("Respuesta de la API:", response); // Verifica la respuesta completa
     console.log("Solicitud:", "/auth/mis-solicitudes/demo -", current_membresia); // Verifica los datos específicos
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    throw new Error("Error al obtener la lista de solicitudes de inventario");
  }
};
