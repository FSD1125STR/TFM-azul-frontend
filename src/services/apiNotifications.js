import axios from "axios";
import { API_BASE_URL } from "./config.js";

const normalizeError = (error, fallbackMessage) => {
    const status = error.response?.status ?? 0;
    const message = error.response?.data?.message || fallbackMessage;
    const normalized = new Error(message);
    normalized.status = status;
    normalized.originalError = error;
    return normalized;
};

// Llamamos a la api para que devuelva las notificaciones/actividades de la crew
export const getCrewNotifications = async (crewId) => {
    try {
        const { data } = await axios.get(`${API_BASE_URL}/api/crews/${crewId}/notifications`, {
            withCredentials: true,
        });
        return data.data;
    } catch (error) {
        throw normalizeError(error, "No se pudieron cargar las notificaciones");
    }
};
