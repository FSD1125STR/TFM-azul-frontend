import axios from "axios";

const { VITE_BACK_HOST, VITE_BACK_PORT } = import.meta.env;
const API_BASE_URL = `http://${VITE_BACK_HOST}:${VITE_BACK_PORT}`;

const normalizeError = (error, fallbackMessage) => {
    const status = error.response?.status ?? 0;
    const message = error.response?.data?.message || fallbackMessage;
    const normalized = new Error(message);
    normalized.status = status;
    return normalized;
};

export const updateUser = async (payload) => {
    try {
        const { data } = await axios.put(`${API_BASE_URL}/api/users/me`, payload, {
            withCredentials: true,
        });
        return data;
    } catch (error) {
        throw normalizeError(error, "No se pudo actualizar el usuario");
    }
};

export const updateUserImage = async (payload) => {
    try {
        const { data } = await axios.put(`${API_BASE_URL}/api/users/me/image`, payload, {
            withCredentials: true,
        });
        return data;
    } catch (error) {
        throw normalizeError(error, "No se pudo actualizar la imagen de perfil");
    }
};

export const deleteUser = async () => {
    try {
        const { data } = await axios.delete(`${API_BASE_URL}/api/users/me`, {
            withCredentials: true,
        });
        return data;
    } catch (error) {
        throw normalizeError(error, "No se pudo eliminar el usuario");
    }
};
