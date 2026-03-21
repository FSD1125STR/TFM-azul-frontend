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

//Llama a la api para modificar la info del usuario logeado
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

//Llama a la api para pedir la firma para subir al imagen del usuario a cloudinary
export const getUserImageUploadSignature = async () => {
    try {
        const { data } = await axios.post(
            `${API_BASE_URL}/api/upload/user-image-signature`,
            {},
            { withCredentials: true },
        );
        return data;
    } catch (error) {
        throw normalizeError(error, "No se pudo generar la firma para la imagen de perfil");
    }
};

//Llama a la API para actualizar la url de la imagen del usuario
export const updateUserImage = async (payload) => {
    try {
        const { data } = await axios.patch(`${API_BASE_URL}/api/users/me/image`, payload, {
            withCredentials: true,
        });
        return data;
    } catch (error) {
        throw normalizeError(error, "No se pudo actualizar la imagen de perfil");
    }
};

//Llama a la API para borrar el usuario autenticado de la BD
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
