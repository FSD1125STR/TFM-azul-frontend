import axios from "axios";


const { VITE_BACK_HOST, VITE_BACK_PORT } = import.meta.env;
const API_BASE_URL = `http://${VITE_BACK_HOST}:${VITE_BACK_PORT}`;
const CREW_BASE_URL = `${API_BASE_URL}/api/crews`;
const POLL_BASE_URL = `${API_BASE_URL}/api/polls`;


const normalizeError = (error, fallbackMessage) => {
    const status = error.response?.status ?? 0;
    const message = error.response?.data?.message || fallbackMessage;
    const normalized = new Error(message);
    normalized.status = status;
    return normalized;
};

// Normalize poll options to match UI expectations
const normalizePoll = (poll) => {
    if (!poll?.options) return poll;
    return {
        ...poll,
        _id: poll.id || poll._id,
        options: poll.options.map((opt) => ({
            ...opt,
            // Map `value` from DB to `label` for UI, and ensure `id`
            label: opt.label || opt.value,
            id: opt.id || opt._id,
        })) ?? [],
    };
};

// Create a new poll
export const createPoll = async (crewId, { question, options, expiresAt }) => {
    try { 
        const { data: roledata } = await axios.get(
            `${CREW_BASE_URL}/${crewId}/roles`,
            { withCredentials: true }
        );

        const roles = roledata.roles;

        // Verify user is a crew member
        if (!roles.includes("crewMember")) {
            const err = new Error("User is not a crew member");
            err.status = 403;
            throw err;
        }

        // Only admins can create polls for groups
        if (crewId && !roles.includes("admin")) {
            const err = new Error("User is not an admin");
            err.status = 403;
            throw err;
        }


    
        const { data } = await axios.post(
            `${CREW_BASE_URL}/${crewId}/polls`,
            {
                question,
                options,
                expiresAt,
            },
            { withCredentials: true }
        );
        const poll = data?.poll ?? data;
        return normalizePoll(poll);
    } catch (error) {
        throw normalizeError(error, "No se pudo crear la encuesta");
    }
};

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
// Get all polls for a crew
export const getCrewPolls = async (crewId) => {
    try {
        const { data } = await axios.get(
            `${POLL_BASE_URL}/${crewId}/polls`,
            { withCredentials: true }
        );
        const polls = data.polls ?? [];
        return Array.isArray(polls) ? polls.map(normalizePoll) : [];
    } catch (error) {
        throw normalizeError(error, "No se pudo obtener las encuestas");
    }
};

// Get a specific poll by ID
export const getPollById = async (pollId, crewId) => {
    try {
        const { data } = await axios.get(
            `${POLL_BASE_URL}/${crewId}/polls/${pollId}`,
            { withCredentials: true }
        );
        const poll = data?.poll ?? data;
        return normalizePoll(poll);
    } catch (error) {
        throw normalizeError(error, "No se pudo obtener la encuesta");
    }
};

// Delete a poll
export const deletePoll = async (pollId) => {
    try {
        const { data } = await axios.delete(
            `${POLL_BASE_URL}/${pollId}`,
            { withCredentials: true }
        );
        return data;
    } catch (error) {
        throw normalizeError(error, "No se pudo eliminar la encuesta");
    }
};
