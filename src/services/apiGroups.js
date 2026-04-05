import axios from "axios";
import { API_BASE_URL } from "./config.js";

const CREW_BASE_URL = `${API_BASE_URL}/api/crews`;

const normalizeError = (error, fallbackMessage) => {
    const status = error.response?.status ?? 0;
    const message = error.response?.data?.message || fallbackMessage;
    const normalized = new Error(message);
    normalized.status = status;
    normalized.originalError = error;
    throw normalized;
};

// Devuelve los grupos de una crew (admins ven todos, members solo los suyos)
export const getGroupsInCrew = async (crewId) => {
    try {
        const { data } = await axios.get(`${CREW_BASE_URL}/${crewId}/groups`, {
            withCredentials: true,
        });
        return data.groups ?? [];
    } catch (error) {
        normalizeError(error, "No se pudieron cargar los grupos");
    }
};

// Crea un grupo dentro de una crew (solo admin)
export const createGroup = async (crewId, payload) => {
    try {
        const { data } = await axios.post(`${CREW_BASE_URL}/${crewId}/groups`, payload, {
            withCredentials: true,
        });
        return data.group;
    } catch (error) {
        normalizeError(error, "No se pudo crear el grupo");
    }
};

// Devuelve los detalles de un grupo (solo miembros del grupo o administradores)
export const getGroupById = async (crewId, groupId) => {
    try {
        const { data } = await axios.get(`${CREW_BASE_URL}/${crewId}/groups/${groupId}`, {
            withCredentials: true,
        });
        return data.group;
    } catch (error) {
        normalizeError(error, "No se pudo cargar el grupo");
    }
};

// Actualiza un grupo (solo admin)
export const updateGroup = async (crewId, groupId, payload) => {
    try {
        const { data } = await axios.put(
            `${CREW_BASE_URL}/${crewId}/groups/${groupId}`,
            payload,
            { withCredentials: true },
        );
        return data.group;
    } catch (error) {
        normalizeError(error, "No se pudo actualizar el grupo");
    }
};

// Elimina un grupo (solo admin)
export const deleteGroup = async (crewId, groupId) => {
    try {
        const { data } = await axios.delete(`${CREW_BASE_URL}/${crewId}/groups/${groupId}`, {
            withCredentials: true,
        });
        return data;
    } catch (error) {
        normalizeError(error, "No se pudo eliminar el grupo");
    }
};

// Devuelve los miembros de un grupo (solo miembros del grupo o administradores)
export const getGroupMembers = async (crewId, groupId) => {
    try {
        const { data } = await axios.get(
            `${CREW_BASE_URL}/${crewId}/groups/${groupId}/members`,
            { withCredentials: true },
        );
        return data.members ?? [];
    } catch (error) {
        normalizeError(error, "No se pudieron cargar los miembros del grupo");
    }
};

// Añade un miembro al grupo (solo admin)
export const addGroupMember = async (crewId, groupId, userId) => {
    try {
        const { data } = await axios.post(
            `${CREW_BASE_URL}/${crewId}/groups/${groupId}/members`,
            { userId },
            { withCredentials: true },
        );
        return data.member;
    } catch (error) {
        normalizeError(error, "No se pudo añadir el miembro al grupo");
    }
};

// Elimina un miembro del grupo (solo admin)
export const removeGroupMember = async (crewId, groupId, userId) => {
    try {
        const { data } = await axios.delete(
            `${CREW_BASE_URL}/${crewId}/groups/${groupId}/members/${userId}`,
            { withCredentials: true },
        );
        return data;
    } catch (error) {
        normalizeError(error, "No se pudo eliminar el miembro del grupo");
    }
};
