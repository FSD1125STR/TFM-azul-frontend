
//API WRAPPER DE CREWS

import axios from "axios";
import { uploadToCloudinary, API_BASE_URL } from "./cloudinaryUpload.js";

const CREW_BASE_URL = `${API_BASE_URL}/api/crews`;

export const getCrewImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${API_BASE_URL}${path}`;
};

// Metodo auxiliar para asegurarse de devolver una lista de crews
const normalizeCrewList = (data) => {
    if (Array.isArray(data)) {
        return data.filter(Boolean);
    }

    if (Array.isArray(data?.crews)) {
        return data.crews.filter(Boolean);
    }

    return [];
};

// Extrae el campo crew de data para asegurarse de devolver la crew
const normalizeCrew = (data) => data?.crew ?? data;

// Metodo para gestionar los errores de la api de forma centralizada
const normalizeError = (error, fallbackMessage) => {
    const status = error.response?.status ?? 0;
    const message = error.response?.data?.message || fallbackMessage;
    const normalized = new Error(message);
    normalized.status = status;
    normalized.originalError = error;
    return normalized;
};

//Llama a la API para que le devuelva la lista de crews del usuario
export const getCrews = async () => {
    try {
        const { data } = await axios.get(CREW_BASE_URL, { withCredentials: true });
        return normalizeCrewList(data);
    } catch (error) {
        throw normalizeError(error, "No se pudieron cargar las crews");
    }
};

export const getCrewById = async (crewId) => {
    try {
        const { data } = await axios.get(`${CREW_BASE_URL}/${crewId}`, {
            withCredentials: true,
        });

        return normalizeCrew(data);
    } catch (error) {
        throw normalizeError(error, "No se pudo cargar la crew");
    }
};

// Llama a la API para crear una nueva Crew
export const createCrew = async (payload) => {
    try {
        const { data } = await axios.post(CREW_BASE_URL, payload, {
            withCredentials: true,
        });

        return normalizeCrew(data);
    } catch (error) {
        throw normalizeError(error, "No se pudo crear la crew");
    }
};

//Crear role en una crew
export const createRoleInCrew = async (crewId, role) => {
    try {
        const { data } = await axios.post(`${CREW_BASE_URL}/${crewId}/roles`, 
            {
                name: role.name,
                permission: role.permission
            },
            {
                withCredentials: true,
            });

        return data.role;

    } catch (error) {
        throw normalizeError(error, "No se pudo crear el rol");
    }
}

//Llama a la API para actualiza una crew
export const updateCrew = async (crewId, payload) => {
    try {
        const { data } = await axios.put(`${CREW_BASE_URL}/${crewId}`, payload, {
            withCredentials: true,
        });

        return normalizeCrew(data);
    } catch (error) {
        throw normalizeError(error, "No se pudo actualizar la crew");
    }
};

export const deleteCrew = async (crewId) => {
    try {
        const { data } = await axios.delete(`${CREW_BASE_URL}/${crewId}`, {
            withCredentials: true,
        });

        return data;
    } catch (error) {
        throw normalizeError(error, "No se pudo eliminar la crew");
    }
};

//Sube la imagen a cloudinary, firmando con el endpoint adecuado
export const uploadCrewImage = async (file, crewId) => {
    try {
        const { secureUrl } = await uploadToCloudinary({
            file,
            signatureEndpoint: `${CREW_BASE_URL}/${crewId}/upload-cover-signature`,
        });
        return secureUrl;
        
    } catch (error) {
        throw normalizeError(error, "No se pudo subir la imagen");
    }
};
