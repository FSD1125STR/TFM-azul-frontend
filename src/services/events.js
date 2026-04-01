import axios from "axios";
import { API_BASE_URL } from "./config.js";

const normalizeError = (error, fallbackMessage) => {
    const status = error.response?.status ?? 0;
    const message = error.response?.data?.message || fallbackMessage;
    const normalized = new Error(message);
    normalized.status = status;
    throw normalized;
};


//Devuelve un evento por su id, junto con info de asistencia del usuario
export const getEventById = async (crewId, eventId) => {
    try{
        const {data} = await axios.get(`${API_BASE_URL}/api/crews/${crewId}/events/${eventId}`,
            {withCredentials: true}
        );
        return data.event;

    } catch (error) {
        normalizeError(error, "Error al cargar evento");
    }
}

//Devuelve los eventos de una crew
export const getCrewEvents = async (crewId) => {
    try {
        const { data } = await axios.get(
            `${API_BASE_URL}/api/crews/${crewId}/events`,
            { withCredentials: true },
        );
        return data.events ?? [];
    } catch (error) {
        normalizeError(error, "Error al cargar eventos");
    }
};

//Devuelve los eventos de un usuario
export const getMyEvents = async (userId) => {
    try {
        const { data } = await axios.get(`${API_BASE_URL}/api/events`, {
            params: { userId },
            withCredentials: true,
        });
        return data;
    } catch (error) {
        normalizeError(error, "Error al cargar eventos");
    }
};

//Crea un evento dentro de una crew. Solo para admins de la crew
export const createCrewEvent = async (crewId, payload) => {
    try {
        const { data } = await axios.post(
            `${API_BASE_URL}/api/crews/${crewId}/events`,
            payload,
            { withCredentials: true },
        );
        return data;
    } catch (error) {
        normalizeError(error, "Error al crear evento");
    }
};


export const createEvent = async (payload) => {
    try {
        const { data } = await axios.post(`${API_BASE_URL}/api/events`, payload, {
            withCredentials: true,
        });
        return data;
    } catch (error) {
        normalizeError(error, "Error al crear evento");
    }
};

//Actualiza info de un evento
export const updateEvent = async (crewId, eventId, payload) => {
    try {
        const { data } = await axios.put(
            `${API_BASE_URL}/api/crews/${crewId}/events/${eventId}`,
            payload,
            { withCredentials: true },
        );
        return data;
    } catch (error) {
        normalizeError(error, "Error al actualizar evento");
    }
};

//Borra un evento
export const deleteEvent = async (crewId, eventId) => {
    try {
        const { data } = await axios.delete(
            `${API_BASE_URL}/api/crews/${crewId}/events/${eventId}`,
            { withCredentials: true },
        );
        return data;
    } catch (error) {
        normalizeError(error, "Error al eliminar evento");
    }
};

//Registra la asistencia de un usuario a un evento
export const attendEvent = async (crewId, eventId) => {
    try {
        const { data } = await axios.post(
            `${API_BASE_URL}/api/crews/${crewId}/events/${eventId}/attendance`,
            {},
            { withCredentials: true },
        );
        return data;
    } catch (error) {
        normalizeError(error, "Error al registrar asistencia");
    }
};

//Devuelve la lista de asistentes a un evento
export const getEventAttendees = async (crewId, eventId) => {
    try {
        const { data } = await axios.get(
            `${API_BASE_URL}/api/crews/${crewId}/events/${eventId}/attendees`,
            { withCredentials: true },
        );
        return data.attendees ?? [];
    } catch (error) {
        normalizeError(error, "Error al cargar participantes");
    }
};

//Quita la asistencia de un usuario a un evento
export const unattendEvent = async (crewId, eventId) => {
    try {
        const { data } = await axios.delete(
            `${API_BASE_URL}/api/crews/${crewId}/events/${eventId}/attendance`,
            { withCredentials: true },
        );
        return data;
    } catch (error) {
        normalizeError(error, "Error al quitar asistencia");
    }
};
