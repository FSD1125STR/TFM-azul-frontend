import { createContext, useEffect, useMemo, useState } from "react";
import { getGroupById } from "../../services/apiGroups.js";

const GroupContext = createContext({ group: null, groupId: null, loading: false, error: "" });

const GroupProvider = ({ crewId, groupId, children }) => {
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(Boolean(groupId));
    const [error, setError] = useState("");

    // Cargamos la info del grupo cada vez que cambie el groupId o crewId
    useEffect(() => {
        let isMounted = true;

        const fetchGroup = async () => {
            if (!crewId || !groupId) {
                if (isMounted) {
                    setGroup(null);
                    setLoading(false);
                    setError("");
                }
                return;
            }

            try {
                setLoading(true);
                setError("");
                const data = await getGroupById(crewId, groupId);
                if (isMounted) {
                    setGroup(data);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message || "No se pudo cargar el grupo.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchGroup();
        return () => {
            isMounted = false;
        };
    }, [crewId, groupId]);

    // Memorizar los valores del contexto para evitar renders innecesarios
    const groupValues = useMemo(
        () => ({ groupId, group, setGroup, loading, error }),
        [groupId, group, loading, error],
    );

    return <GroupContext.Provider value={groupValues}>{children}</GroupContext.Provider>;
};

export { GroupContext, GroupProvider };
