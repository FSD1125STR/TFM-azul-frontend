const { VITE_BACK_HOST, VITE_BACK_PORT } = import.meta.env;
const API_BASE_URL = `http://${VITE_BACK_HOST}:${VITE_BACK_PORT}`;
const CREW_BASE_URL = `${API_BASE_URL}/api/crews`;

async function handleResponse(res) {
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Error ${res.status}`);
    }
    return res.json();
}

/**
 * Returns the list of members for a given crew.
 * Expected shape per member:
 *   { id, name, username, email, role, grupo }
 */
export async function getCrewMembers(crewId) {
    console.log("Fetching members for crew:", {
        crewId,
    });
    const res = await fetch(`${CREW_BASE_URL}/${crewId}/members`, {
        credentials: "include",
    });
    const data = await handleResponse(res);
    return data?.members ?? data ?? [];
}

/**
 * Adds a member to a crew by email.
 * @param {string} crewId
 * @param {{ email: string }} payload
 * @returns {Promise<object>} The newly added member object
 */
export async function addCrewMember(crewId, payload) {
    const res = await fetch(`${CREW_BASE_URL}/${crewId}/members`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await handleResponse(res);
    return data?.member ?? data;
}

/**
 * Removes a member from a crew.
 * @param {string} crewId
 * @param {string} memberId
 */
export async function removeCrewMember(crewId, memberId) {
    const res = await fetch(`${CREW_BASE_URL}/${crewId}/members/${memberId}`, {
        method: "DELETE",
        credentials: "include",
    });
    return handleResponse(res);
}

export async function editCrewMember(crewId, memberId, payload) {
    const res = await fetch(`${CREW_BASE_URL}/${crewId}/members/${memberId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}
