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
