import axios from "axios";

const { VITE_BACK_HOST, VITE_BACK_PORT } = import.meta.env;
const API_BASE_URL = `http://${VITE_BACK_HOST}:${VITE_BACK_PORT}`;

const normalizeError = (error, fallbackMessage) => {
    const status = error.response?.status ?? 0;
    const message = error.response?.data?.message || fallbackMessage;
    const normalized = new Error(message);
    normalized.status = status;
    throw normalized;
};

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

export const getMyEvents = async (userId) => {
    try {
        const { data } = await axios.get(
            `${API_BASE_URL}/api/events`,
            { params: { userId }, withCredentials: true },
        );
        return data;
    } catch (error) {
        normalizeError(error, "Error al cargar eventos");
    }
};

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
        const { data } = await axios.post(
            `${API_BASE_URL}/api/events`,
            payload,
            { withCredentials: true },
        );
        return data;
    } catch (error) {
        normalizeError(error, "Error al crear evento");
    }
};

export const updateEvent = async (eventId, payload) => {
    try {
        const { data } = await axios.put(
            `${API_BASE_URL}/api/events/${eventId}`,
            payload,
            { withCredentials: true },
        );
        return data;
    } catch (error) {
        normalizeError(error, "Error al actualizar evento");
    }
};

export const deleteEvent = async (eventId, userId) => {
    try {
        const { data } = await axios.delete(
            `${API_BASE_URL}/api/events/${eventId}`,
            { data: { userId }, withCredentials: true },
        );
        return data;
    } catch (error) {
        normalizeError(error, "Error al eliminar evento");
    }
};
