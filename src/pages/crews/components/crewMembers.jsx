import { useContext, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import CrewToast from "./CrewToast.jsx";
import styles from "./crewMember.module.css";
import { CrewContext } from "../../../hooks/context/CrewContext.jsx";
import RoleManagement from "../../users/RoleManagement.jsx";
import {
    getCrewMembers,
    removeCrewMember,
    editCrewMember,
} from "../../../services/apiMembers.js";

export default function CrewMembers() {
    // Extraemos la info de la crew desde el context
    const { crew, crewId, loading, error } = useContext(CrewContext);
    const roles = crew?.roles || [];
    const canManageMembers = crew?.userRole?.permission === "admin";

    const navigate = useNavigate();

    const [showRoleManagement, setShowRoleManagement] = useState(false);
    const [members, setMembers] = useState([]);
    const [membersLoading, setMembersLoading] = useState(true);
    const [membersError, setMembersError] = useState(null);
    const [notification, setNotification] = useState(null);

    // Filtros
    const [roleFilter, setRoleFilter] = useState("");
    const [groupFilter, setGroupFilter] = useState("");
    const [search, setSearch] = useState("");

    // Modal de confirmación de borrado
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Modal de editar miembro
    const [memberToEdit, setMemberToEdit] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const roleByName = useMemo(
        () =>
            new Map(
                (roles || []).map((role) => [
                    role?.name,
                    role,
                ]),
            ),
        [roles],
    );

    const roleById = useMemo(
        () =>
            new Map(
                (roles || []).map((role) => [
                    String(role?._id),
                    role,
                ]),
            ),
        [roles],
    );

    // Cargamos los miembros de la crew cuando el crewId esté disponible
    useEffect(() => {
        if (!crewId) return;
        setMembersLoading(true);
        getCrewMembers(crewId)
            .then((data) => {
                setMembers(Array.isArray(data) ? data : []);
            })
            .catch((err) =>
                setMembersError(err.message || "Error al cargar miembros"),
            )
            .finally(() => setMembersLoading(false));
    }, [crewId]);

    // Elimina un miembro de la crew confirmando primero
    const handleDeleteMember = async () => {
        if (!canManageMembers) return;
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
        if (!canManageMembers) return;
        if (!memberToEdit) return;
        if (!memberToEdit.roleId) {
            setNotification({
                type: "error",
                message: "Selecciona un rol válido.",
            });
            return;
        }
        try {
            setIsEditing(true);
            await editCrewMember(crewId, memberToEdit.id, {
                roleId: memberToEdit.roleId,
            });
            const selectedRole = roleById.get(String(memberToEdit.roleId));
            const updatedMember = {
                ...memberToEdit,
                role: selectedRole?.name ?? memberToEdit.role,
            };
            setMembers((prev) =>
                prev.map((m) => (m.id === memberToEdit.id ? updatedMember : m)),
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

    if (showRoleManagement) {
        return <RoleManagement onBack={() => setShowRoleManagement(false)} />;
    }

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
            {canManageMembers && memberToDelete && (
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
            {canManageMembers && memberToEdit && (
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
                                    value={memberToEdit.roleId || ""}
                                    onChange={(e) =>
                                        setMemberToEdit({
                                            ...memberToEdit,
                                            roleId: e.target.value,
                                        })
                                    }
                                >
                                    <option value="" disabled>
                                        Selecciona un rol
                                    </option>
                                    {roles.map((rol) => (
                                        <option key={rol._id} value={rol._id}>
                                            {rol.name}
                                        </option>
                                    ))}
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

            {/* Render principal */}
            <div className={styles.container}>
                
                {/* Breadcrumb */}
                <nav className={styles.breadcrumb} aria-label="breadcrumb">
                    <span onClick={() => navigate("/crews")}>/ Mis Crews</span>
                    <span className={styles.sep}>/</span>
                    <span onClick={() => navigate(`/crews/${crewId}`)}>{crew.name}</span>
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
                    {canManageMembers && (
                        <div className={styles.actionRow}>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={() => setShowRoleManagement(true)}
                            >
                                Gestionar roles
                            </button>
                        </div>
                    )}
                </div>

                {/* Filtros */}
                <div className={styles.filters}>
                    <select
                        className={styles.filterSelect}
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">Role</option>
                        {roles.map((rol) => (
                            <option key={rol._id || rol.name} value={rol.name}>
                                {rol.name}
                            </option>
                        ))}
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
                                    {canManageMembers && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.map((member) => {
                                    const memberRole = roleByName.get(member.role);
                                    const rolePermission =
                                        memberRole?.permission ?? "member";
                                    return (
                                        <tr key={member.id}>
                                            <td>{member.name || member.username}</td>
                                            <td>
                                                <span
                                                    className={`${styles.roleBadge} ${styles[rolePermission] || styles.member}`}
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
                                            {canManageMembers && (
                                                <td>
                                                    <div className={styles.actionButtons}>
                                                        <button
                                                            type="button"
                                                            className={styles.iconButton}
                                                            aria-label="Editar miembro"
                                                            onClick={() => {
                                                                const role = roleByName.get(
                                                                    member.role,
                                                                );
                                                                setMemberToEdit({
                                                                    ...member,
                                                                    roleId: role?._id ?? "",
                                                                });
                                                            }}
                                                        >
                                                            <IconPencil size={16} stroke={2} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={`${styles.iconButton} ${styles.iconDanger}`}
                                                            aria-label="Eliminar miembro"
                                                            onClick={() => setMemberToDelete(member)}
                                                        >
                                                            <IconTrash size={16} stroke={2} />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
