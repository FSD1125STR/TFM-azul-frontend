import axios from "axios";
import { API_BASE_URL } from "./config.js";

// Todos los endpoints de polls viven bajo /api/crews/:crewId/polls
const CREW_BASE_URL = `${API_BASE_URL}/api/crews`;

// Extrae status y mensaje de un error de axios
const normalizeError = (error, fallbackMessage) => {
    const status = error.response?.status ?? 0;
    const message = error.response?.data?.message || fallbackMessage;
    const normalized = new Error(message);
    normalized.status = status;
    return normalized;
};

// Normaliza un poll del backend al formato esperado por el frontend:
// - Mapea `value` → `label` en las opciones
// - Garantiza compatibilidad de `id` / `_id`
const normalizePoll = (poll) => {
    if (!poll?.options) return poll;
    return {
        ...poll,
        _id: poll.id || poll._id,
        options: poll.options.map((opt) => ({
            ...opt,
            label: opt.label || opt.value,
            id: opt.id || opt._id,
        })),
    };
};

// Crea una nueva encuesta en una crew (o en un grupo si se pasa groupId)
export const createPoll = async (crewId, { question, options, expiresAt, groupId }) => {
    try {
        const { data } = await axios.post(
            `${CREW_BASE_URL}/${crewId}/polls`,
            { question, options, expiresAt, groupId },
            { withCredentials: true }
        );
        const poll = data?.poll ?? data;
        return normalizePoll(poll);
    } catch (error) {
        throw normalizeError(error, "No se pudo crear la encuesta");
    }
};

// Registra el voto de un usuario en una opción concreta
export const votePoll = async (crewId, pollId, optionId) => {
    try {
        const { data } = await axios.post(
            `${CREW_BASE_URL}/${crewId}/polls/${pollId}/vote`,
            { optionId },
            { withCredentials: true }
        );
        return data;
    } catch (error) {
        if (error.response?.status === 409) {
            throw Object.assign(new Error("Ya has votado en esta encuesta"), {
                code: "ALREADY_VOTED",
            });
        }
        throw normalizeError(error, "No se pudo votar en la encuesta");
    }
};

// Devuelve todas las encuestas de una crew (o de un grupo si se pasa groupId)
export const getCrewPolls = async (crewId, { groupId } = {}) => {
    try {
        const { data } = await axios.get(
            `${CREW_BASE_URL}/${crewId}/polls`,
            { withCredentials: true, params: groupId ? { groupId } : {} }
        );
        const polls = data.polls ?? [];
        return Array.isArray(polls) ? polls.map(normalizePoll) : [];
    } catch (error) {
        throw normalizeError(error, "No se pudo obtener las encuestas");
    }
};

// Devuelve una encuesta concreta por su ID
export const getPollById = async (crewId, pollId) => {
    try {
        const { data } = await axios.get(
            `${CREW_BASE_URL}/${crewId}/polls/${pollId}`,
            { withCredentials: true }
        );
        const poll = data?.poll ?? data;
        return normalizePoll(poll);
    } catch (error) {
        throw normalizeError(error, "No se pudo obtener la encuesta");
    }
};

// Elimina una encuesta y todas sus opciones y votos asociados
export const deletePoll = async (crewId, pollId) => {
    try {
        const { data } = await axios.delete(
            `${CREW_BASE_URL}/${crewId}/polls/${pollId}`,
            { withCredentials: true }
        );
        return data;
    } catch (error) {
        throw normalizeError(error, "No se pudo eliminar la encuesta");
    }
};
