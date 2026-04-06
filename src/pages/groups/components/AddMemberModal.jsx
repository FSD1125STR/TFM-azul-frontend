import { useEffect, useMemo, useState } from "react";
import { getCrewMembers } from "../../../services/apiMembers.js";
import { addGroupMember } from "../../../services/apiGroups.js";
import styles from "./AddMemberModal.module.css";

// Modal para añadir un miembro de la crew al grupo.
// Gestiona internamente la carga de miembros, la búsqueda y el estado de la petición.
// Props externas: identifiers de contexto, el Set de miembros ya en el grupo, y callbacks de resultado.
export default function AddMemberModal({
    open,
    crewId,
    groupId,
    memberIds, // Set<string> con los ids de los miembros ya en el grupo
    onAddSuccess, // (added, memberName) => void — actualiza el estado del padre
    onClose,
    onError, // (message) => void — muestra la notificación de error en el padre
}) {
    
    const [crewMembers, setCrewMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addSearch, setAddSearch] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    // Cargar miembros de la crew al abrir la modal y resetear la búsqueda
    useEffect(() => {
        if (!open) return;
        setAddSearch("");
        setLoading(true);
        getCrewMembers(crewId)
            .then((data) => setCrewMembers(Array.isArray(data) ? data : []))
            .catch((err) => {
                onError(err.message || "Error al cargar miembros de la crew");
                onClose();
            })
            .finally(() => setLoading(false));
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    // Filtra los miembros que aún no están en el grupo y que coinciden con la búsqueda
    const availableToAdd = useMemo(() => {
        const term = addSearch.trim().toLowerCase();
        return crewMembers.filter((m) => {
            const notInGroup = !memberIds.has(String(m.id));
            const matchSearch =
                !term ||
                m.name?.toLowerCase().includes(term) ||
                m.email?.toLowerCase().includes(term);
            return notInGroup && matchSearch;
        });
    }, [crewMembers, memberIds, addSearch]);

    // Maneja la acción de añadir un miembro al grupo
    const handleAdd = async (m) => {
        setIsAdding(true);
        try {
            // Llamada a la API para añadir el miembro al grupo
            const added = await addGroupMember(crewId, groupId, m.id);
            onAddSuccess(added, m.name || m.username);
            onClose();
        } catch (err) {
            onError(err.message || "No se pudo añadir el miembro");
        } finally {
            setIsAdding(false);
        }
    };

    if (!open) return null;

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true">
            <div className={styles.modal}>
                <h3>Añadir miembro al grupo</h3>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={addSearch}
                    onChange={(e) => setAddSearch(e.target.value)}
                    autoFocus
                />
                <div className={styles.memberList}>
                    {loading ? (
                        <p className={styles.listEmpty}>Cargando...</p>
                    ) : availableToAdd.length === 0 ? (
                        <p className={styles.listEmpty}>
                            {addSearch ? "Sin resultados." : "Todos los miembros ya están en el grupo."}
                        </p>
                    ) : (
                        availableToAdd.map((m) => (
                            <button
                                key={m.id}
                                type="button"
                                className={styles.memberListItem}
                                onClick={() => handleAdd(m)}
                                disabled={isAdding}
                            >
                                {/* Avatar con inicial del nombre o username */}
                                <span className={styles.memberAvatar}>
                                    {(m.name || m.username)?.[0]?.toUpperCase() ?? "?"}
                                </span>
                                <span className={styles.memberListInfo}>
                                    <span className={styles.memberListName}>{m.name || m.username}</span>
                                    <span className={styles.memberListEmail}>{m.email}</span>
                                </span>
                            </button>
                        ))
                    )}
                </div>
                <div className={styles.modalActions}>
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={onClose}
                        disabled={isAdding}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
