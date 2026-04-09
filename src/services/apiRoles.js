//API WRAPPER DE ROLES

import axios from "axios";
import { API_BASE_URL } from "./config.js";

const CREW_BASE_URL = `${API_BASE_URL}/api/roles`;


// Metodo para gestionar los errores de la api de forma centralizada
const normalizeError = (error, fallbackMessage) => {
    const status = error.response?.status ?? 0;
    const message = error.response?.data?.message || fallbackMessage;
    const normalized = new Error(message);
    normalized.status = status;
    normalized.originalError = error;
    return normalized;
};


// Eliminar rol
export const deleteRole = async (roleId) => {
    try {
        const { data } = await axios.delete(
            `${CREW_BASE_URL}/${roleId}`,
            { withCredentials: true },
        );

        return data.role;
    } catch (error) {
        throw normalizeError(error, "No se pudo eliminar el rol");
    }
};