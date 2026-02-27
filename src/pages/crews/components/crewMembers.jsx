import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CrewToast from "./CrewToast.jsx";
import styles from "./crewMember.module.css";
import { CrewContext } from "../../../hooks/context/CrewContext.jsx";
import {
    addCrewMember,
    getCrewMembers,
    removeCrewMember,
    editCrewMember,
} from "../../../services/apiMembers.js";

export default function CrewMembers() {
    // Extraemos la info de la crew desde el context
    const { crew, crewId, loading, error } = useContext(CrewContext);
    const roles = crew?.roles || [];
    

    const navigate = useNavigate();

    const [members, setMembers] = useState([]);
    const [membersLoading, setMembersLoading] = useState(true);
    const [membersError, setMembersError] = useState(null);
    const [notification, setNotification] = useState(null);

    // Filtros
    const [roleFilter, setRoleFilter] = useState("");
    const [groupFilter, setGroupFilter] = useState("");
    const [search, setSearch] = useState("");

    // Modal de añadir miembro
    const [showAddModal, setShowAddModal] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    // Modal de confirmación de borrado
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Modal de editar miembro
    const [memberToEdit, setMemberToEdit] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Cargamos los miembros de la crew cuando el crewId esté disponible
    useEffect(() => {
        if (!crewId) return;
        setMembersLoading(true);
        getCrewMembers(crewId)
            .then((data) => {
                // Handle both array response and object with members/data property
                const membersList = Array.isArray(data)
                    ? data
                    : data?.members || data?.data || [];
                setMembers(Array.isArray(membersList) ? membersList : []);
            })
            .catch((err) =>
                setMembersError(err.message || "Error al cargar miembros"),
            )
            .finally(() => setMembersLoading(false));
    }, [crewId]);

    // Añade un nuevo miembro por email
    const handleAddMember = async () => {
        if (!newMemberEmail.trim()) return;
        try {
            setIsAdding(true);
            const added = await addCrewMember(crewId, {
                email: newMemberEmail.trim(),
            });
            setMembers((prev) => [...prev, added]);
            setNewMemberEmail("");
            setShowAddModal(false);
            setNotification({
                type: "success",
                message: "Miembro añadido correctamente",
            });
        } catch (err) {
            setNotification({
                type: "error",
                message: err.message || "No se pudo añadir al miembro",
            });
        } finally {
            setIsAdding(false);
        }
    };

    // Elimina un miembro de la crew confirmando primero
    const handleDeleteMember = async () => {
        if (!memberToDelete) return;
        try {
            setIsDeleting(true);
            await removeCrewMember(crewId, memberToDelete.id);
            setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
            setNotification({
                type: "success",
                message: "Miembro eliminado correctamente",
            });
            setMemberToDelete(null);
        } catch (err) {
            setNotification({
                type: "error",
                message: err.message || "No se pudo eliminar al miembro",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditMember = async () => {
        if (!memberToEdit) return;
        try {
            setIsEditing(true);
            await editCrewMember(crewId, memberToEdit.id, memberToEdit);
            setMembers((prev) =>
                prev.map((m) => (m.id === memberToEdit.id ? memberToEdit : m)),
            );
            setNotification({
                type: "success",
                message: "Miembro editado correctamente",
            });
            setMemberToEdit(null);
        } catch (err) {
            setNotification({
                type: "error",
                message: err.message || "No se pudo editar al miembro",
            });
        } finally {
            setIsEditing(false);
        }
    };

    // Filtramos los miembros según los filtros activos
    const filteredMembers = members.filter((m) => {
        const matchRole = !roleFilter || m.role === roleFilter;
        const matchGroup = !groupFilter || m.grupo === groupFilter;
        const matchSearch =
      !search ||
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase());
        return matchRole && matchGroup && matchSearch;
    });

    // Grupos únicos extraídos de los miembros para el filtro
    const uniqueGroups = [
        ...new Set(members.map((m) => m.grupo).filter(Boolean)),
    ];

    // --- Estados globales ---

    if (loading || membersLoading) {
        return <div className={styles.state}>Cargando miembros...</div>;
    }

    if (error || membersError) {
        return (
            <div className={styles.state}>
                <p>{error || membersError}</p>
                <button
                    type="button"
                    onClick={() => navigate("/crews")}
                    className={styles.primaryButton}
                >
          Volver a mis crews
                </button>
            </div>
        );
    }

    if (!crew) return null;

    return (
        <div className={styles.page}>
            {/* Toast de notificaciones */}
            {notification && (
                <CrewToast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            {/* Modal de confirmación de borrado */}
            {memberToDelete && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <h3>Eliminar miembro</h3>
                        <p>
              ¿Seguro que quieres eliminar a{" "}
                            <strong>{memberToDelete.name}</strong> de la crew? Esta acción no
              se puede deshacer.
                        </p>
                        <div className={styles.modalActions}>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={() => setMemberToDelete(null)}
                            >
                Cancelar
                            </button>
                            <button
                                type="button"
                                className={styles.dangerButton}
                                onClick={handleDeleteMember}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de editar miembro */}
            {memberToEdit && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <h3>
              Editar miembro - {memberToEdit.name || memberToEdit.username}
                        </h3>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                                marginBottom: "16px",
                            }}
                        >
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "4px",
                                        fontWeight: "600",
                                    }}
                                >
                  Role
                                </label>
                                <select
                                    className={styles.input}
                                    value={memberToEdit.role || "member"}
                                    onChange={(e) =>
                                        setMemberToEdit({ ...memberToEdit, role: e.target.value })
                                    }
                                >
                                    <option value="member">Member</option>
                                    <option value="leader">Leader</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "4px",
                                        fontWeight: "600",
                                    }}
                                >
                  Grupo
                                </label>
                                <input
                                    className={styles.input}
                                    type="text"
                                    placeholder="Grupo"
                                    value={memberToEdit.grupo || ""}
                                    onChange={(e) =>
                                        setMemberToEdit({ ...memberToEdit, grupo: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={() => setMemberToEdit(null)}
                            >
                Cancelar
                            </button>
                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={handleEditMember}
                                disabled={isEditing}
                            >
                                {isEditing ? "Guardando..." : "Guardar cambios"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de añadir miembro */}
            {showAddModal && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <h3>Añadir miembro</h3>
                        <p>Introduce el email del usuario que quieres añadir a la crew.</p>
                        <input
                            className={styles.input}
                            type="email"
                            placeholder="usuario@email.com"
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
                        />
                        <div className={styles.modalActions}>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewMemberEmail("");
                                }}
                            >
                Cancelar
                            </button>
                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={handleAddMember}
                                disabled={isAdding || !newMemberEmail.trim()}
                            >
                                {isAdding ? "Añadiendo..." : "Añadir"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.container}>
                {/* Breadcrumb */}
                <nav className={styles.breadcrumb} aria-label="breadcrumb">
                    <span onClick={() => navigate("/crews")}>/ Mis Crews</span>
                    <span className={styles.sep}>/</span>
                    <span onClick={() => navigate(`/crews/${crewId}`)}>{crew.name}</span>
                    <span className={styles.sep}>/</span>
                    <span onClick={() => navigate(`/crews/${crewId}/groups`)}>
            Groups
                    </span>
                    <span className={styles.sep}>/</span>
                    <span className={styles.current}>Miembros</span>
                </nav>

                {/* Título */}
                <h1 className={styles.title}>
                    {crew.name} <span>Miembros</span>
                </h1>

                {/* Stat cards + botón de añadir */}
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Miembros totales</span>
                        <strong className={styles.statValue}>{members.length}</strong>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Sub grupos</span>
                        <strong className={styles.statValue}>{uniqueGroups.length}</strong>
                    </div>
                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() => setShowAddModal(true)}
                    >
            + Añadir miembro
                    </button>
                </div>

                {/* Filtros */}
                <div className={styles.filters}>
                    <select
                        className={styles.filterSelect}
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">Role</option>
                        <option value="admin">Admin</option>
                        <option value="leader">Leader</option>
                        <option value="member">Member</option>
                    </select>

                    <select
                        className={styles.filterSelect}
                        value={groupFilter}
                        onChange={(e) => setGroupFilter(e.target.value)}
                    >
                        <option value="">Grupo</option>
                        {uniqueGroups.map((g) => (
                            <option key={g} value={g}>
                                {g}
                            </option>
                        ))}
                    </select>

                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="Buscar miembro..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Tabla de miembros */}
                <div className={styles.tableWrap}>
                    {filteredMembers.length === 0 ? (
                        <p className={styles.empty}>No se encontraron miembros.</p>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Miembro</th>
                                    <th>Role</th>
                                    <th>Mail</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.map((member) => (
                                    <tr key={member.id}>
                                        <td>{member.name || member.username}</td>
                                        <td>
                                            <span
                                                className={`${styles.roleBadge} ${styles[member.role] || styles.member}`}
                                            >
                                                {member.role || "member"}
                                            </span>
                                        </td>
                                        <td>
                                            <a
                                                className={styles.mailLink}
                                                href={`mailto:${member.email}`}
                                            >
                                                {member.email}
                                            </a>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className={styles.dangerButton}
                                                onClick={() => setMemberToDelete(member)}
                                            >
                        Borrar
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.dangerButton}
                                                onClick={() => setMemberToEdit(member)}
                                            >
                        Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
