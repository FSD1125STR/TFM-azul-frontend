import axios from "axios";

const { VITE_BACK_HOST, VITE_BACK_PORT } = import.meta.env;
const API_BASE_URL = `http://${VITE_BACK_HOST}:${VITE_BACK_PORT}`;
const INVITATION_BASE_URL = `${API_BASE_URL}/api/invitations`;

const normalizeError = (error, fallbackMessage) => {
    const status = error.response?.status ?? 0;
    const message = error.response?.data?.message || fallbackMessage;
    const normalized = new Error(message);
    normalized.status = status;
    normalized.originalError = error;
    return normalized;
};

//Metodo para normalizar la extraccion de info de una invitacion
const extractInvitation = (payload) => {
    if (!payload) return null;
    return payload.invitation ?? payload.data?.invitation ?? payload.data ?? payload;
};

//Llamada a la API para validar la invitacions
export const validateInvitation = async (token) => {
    try {
        const { data } = await axios.get(`${INVITATION_BASE_URL}/${token}`, {
            withCredentials: true,
        });

        return extractInvitation(data);
    } catch (error) {
        throw normalizeError(error, "No se pudo validar la invitacion.");
    }
};

export const joinCrewWithInvitation = async (token) => {
    try {
        const { data } = await axios.post(
            `${INVITATION_BASE_URL}/${token}/join`,
            null,
            { withCredentials: true },
        );

        return data;
    } catch (error) {
        throw normalizeError(error, "No se pudo unir a la crew.");
    }
};

//Llama a la API para que devuelva la ultima invitación de una crew
export const getLatestInvitation = async (crewId) => {
    try {
        const { data } = await axios.get(
            `${API_BASE_URL}/api/crews/${crewId}/invitation`,
            { withCredentials: true },
        );

        return extractInvitation(data);

    } catch (error) {
        throw normalizeError(error, "No se pudo cargar la invitacion.");
    }
};

//Llama a la API para crear una nueva invitación
export const createInvitation = async (crewId) => {
    try {
        const { data } = await axios.post(
            `${API_BASE_URL}/api/crews/${crewId}/invitation`,
            null,
            { withCredentials: true },
        );

        return extractInvitation(data);
    } catch (error) {
        throw normalizeError(error, "No se pudo crear la invitacion.");
    }
};

export const updateInvitationStatus = async (invitationId, status) => {
    try {
        const { data } = await axios.patch(
            `${API_BASE_URL}/api/invitations/${invitationId}`,
            { status },
            { withCredentials: true },
        );

        return extractInvitation(data);
    } catch (error) {
        throw normalizeError(error, "No se pudo actualizar la invitacion.");
    }
};
