import { createContext, useEffect, useMemo, useState } from "react";
import { getCrewMembers } from "../../services/apiMembers.js";

// Context for managing crew members and member count
const MemberContext = createContext(null);

const MemberProvider = ({ crewId, children }) => {
    const [members, setMembers] = useState([]);
    const [memberCount, setMemberCount] = useState(0);
    const [loading, setLoading] = useState(Boolean(crewId));
    const [error, setError] = useState("");

    // Fetch members from backend when crewId changes
    useEffect(() => {
        let isMounted = true;

        const fetchMembers = async () => {
            if (!crewId) {
                if (isMounted) {
                    setMembers([]);
                    setMemberCount(0);
                    setLoading(false);
                    setError("");
                }
                return;
            }

            try {
                setLoading(true);
                setError("");
                const data = await getCrewMembers(crewId);
                if (isMounted) {
                    const membersList = Array.isArray(data) ? data : [];
                    setMembers(membersList);
                    setMemberCount(membersList.length);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message || "No se pudieron cargar los miembros.");
                    setMembers([]);
                    setMemberCount(0);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchMembers();
        return () => {
            isMounted = false;
        };
    }, [crewId]);

    // Add a member to the local state
    const addMember = (newMember) => {
        setMembers((prev) => [...prev, newMember]);
        setMemberCount((prev) => prev + 1);
    };

    // Remove a member from the local state
    const removeMember = (memberId) => {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        setMemberCount((prev) => Math.max(0, prev - 1));
    };

    // Refresh members from the server
    const refreshMembers = async () => {
        if (!crewId) return;
        try {
            setLoading(true);
            setError("");
            const data = await getCrewMembers(crewId);
            const membersList = Array.isArray(data) ? data : [];
            setMembers(membersList);
            setMemberCount(membersList.length);
        } catch (err) {
            setError(err.message || "No se pudieron actualizar los miembros.");
        } finally {
            setLoading(false);
        }
    };

    // Memoize the context value to prevent unnecessary re-renders
    const memberValues = useMemo(
        () => ({
            crewId,
            members,
            setMembers,
            memberCount,
            setMemberCount,
            loading,
            error,
            addMember,
            removeMember,
            refreshMembers,
        }),
        [crewId, members, memberCount, loading, error],
    );

    return (
        <MemberContext.Provider value={memberValues}>
            {children}
        </MemberContext.Provider>
    );
};

export { MemberContext, MemberProvider };
