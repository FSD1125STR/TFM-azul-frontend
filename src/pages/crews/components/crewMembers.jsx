import { useContext, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import CrewToast from "./CrewToast.jsx";
import ConfirmModal from "../../../components/common/ConfirmModal.jsx";
import styles from "./crewMember.module.css";
import { CrewContext } from "../../../hooks/context/CrewContext.jsx";
import RoleManagement from "../../users/RoleManagement.jsx";
import DataTable from "../../../components/common/DataTable.jsx";
import {
    getCrewMembers,
    removeCrewMember,
    editCrewMember,
    getMemberGroups,
} from "../../../services/apiMembers.js";
import { Title, Subtitle } from "../../../components/ui/Title.jsx";
import { getGroupsInCrew, addGroupMember, removeGroupMember } from "../../../services/apiGroups.js";

export default function CrewMembers() {
    // Extraemos la info de la crew desde el context
    const { crew, crewId, loading, error } = useContext(CrewContext);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Grupos en el modal de editar
    const [allGroups, setAllGroups] = useState([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState(new Set()); //Grupos seleccionados
    const [initialGroupIds, setInitialGroupIds] = useState(new Set()); //Grupos que tenia el miembro
    const [groupsLoading, setGroupsLoading] = useState(false);

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

    // Abre el modal de editar miembro cargando los grupos para mostrar en el modal y cuáles tenía el miembro para marcarlos como seleccionados
    const handleOpenEditModal = async (member) => {
        const role = roleByName.get(member.role);
        setMemberToEdit({ ...member, roleId: role?._id ?? "" });
        setGroupsLoading(true);
        setAllGroups([]);
        setSelectedGroupIds(new Set());
        setInitialGroupIds(new Set());

        try {
            // Cargamos todos los grupos de la crew y los grupos a los que pertenece el miembro en paralelo
            const [groups, memberGroups] = await Promise.all([
                getGroupsInCrew(crewId),
                getMemberGroups(crewId, member.id),
            ]);
            setAllGroups(groups);
            const ids = new Set(memberGroups.map((g) => String(g._id)));
            setSelectedGroupIds(ids);
            setInitialGroupIds(ids);

        } catch {
            // grupos no críticos, el modal abre igualmente sin la sección
        } finally {
            setGroupsLoading(false);
        }
    };

    // Maneja el toggle de selección de grupos en el modal de editar miembro
    const handleToggleGroup = (groupId) => {
        setSelectedGroupIds((prev) => {
            const next = new Set(prev);
            if (next.has(groupId)) next.delete(groupId);
            else next.add(groupId);
            return next;
        });
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

            // Calculamos qué grupos se han añadido o quitado comparando el estado inicial con el actual
            const groupsAdded = [...selectedGroupIds].filter((id) => !initialGroupIds.has(id));
            const groupsRemoved = [...initialGroupIds].filter((id) => !selectedGroupIds.has(id));

            await Promise.all([
                editCrewMember(crewId, memberToEdit.id, { roleId: memberToEdit.roleId }),
                ...groupsAdded.map((gId) => addGroupMember(crewId, gId, memberToEdit.id)), // Añadimos a los nuevos grupos uno a uno
                ...groupsRemoved.map((gId) => removeGroupMember(crewId, gId, memberToEdit.id)), // Quitamos de los grupos eliminados uno a uno
            ]);

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
    const filteredMembers = useMemo(
        () =>
            members.filter((m) => {
                const matchRole = !roleFilter || m.role === roleFilter;
                const matchGroup = !groupFilter || m.grupo === groupFilter;
                const matchSearch =
                    !search ||
                    m.name?.toLowerCase().includes(search.toLowerCase()) ||
                    m.email?.toLowerCase().includes(search.toLowerCase());
                return matchRole && matchGroup && matchSearch;
            }),
        [members, roleFilter, groupFilter, search]
    );

    // Grupos únicos extraídos de los miembros para el filtro
    const uniqueGroups = useMemo(() => {
        const groupsSet = new Set();
        crew?.groups.forEach((group) => {
            groupsSet.add(group.name);
        });
        return Array.from(groupsSet);
        
    }, [crew?.groups]);

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

            <ConfirmModal
                open={canManageMembers && !!memberToDelete}
                title="Eliminar miembro"
                description={`¿Seguro que quieres eliminar a ${memberToDelete?.name} de la crew? Esta acción no se puede deshacer.`}
                confirmLabel="Sí, eliminar"
                onConfirm={handleDeleteMember}
                onCancel={() => setMemberToDelete(null)}
                isLoading={isDeleting}
            />

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

                            {!groupsLoading && allGroups.length > 0 && (
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontWeight: "600",
                                        }}
                                    >
                                        Grupos
                                    </label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        {allGroups.map((g) => (
                                            <label
                                                key={g._id}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                    fontSize: "0.875rem",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedGroupIds.has(String(g._id))}
                                                    onChange={() => handleToggleGroup(String(g._id))}
                                                    disabled={isEditing}
                                                />
                                                {g.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {groupsLoading && (
                                <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", margin: 0 }}>
                                    Cargando grupos...
                                </p>
                            )}
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

                {/* Título */}
                <Title>Miembros de <span>{crew.name}</span></Title>
                <Subtitle>Gestiona los miembros de tu crew y sus roles.</Subtitle>

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

                {/* Tabla de miembros usando el componente DataTable común */}
                {filteredMembers.length === 0 ? (
                    <p className={styles.empty}>No se encontraron miembros.</p>
                ) : (
                    <DataTable
                        columns={[
                            { label: "Miembro" },
                            { label: "Role", center: true },
                            { label: "Mail" },
                            ...(canManageMembers ? [{ label: "Acciones", center: true }] : []),
                        ]}
                    >
                        {filteredMembers.map((member) => {
                            const memberRole = roleByName.get(member.role);
                            const rolePermission = memberRole?.permission ?? "member";
                            return (
                                <tr key={member.id}>
                                    {/* Avatar (foto si existe, sino inicial) + nombre */}
                                    <td>
                                        <div className={styles.memberCell}>
                                            {member.image ? (
                                                <img
                                                    src={member.image}
                                                    alt={member.username}
                                                    className={styles.memberAvatar}
                                                />
                                            ) : (
                                                <span className={styles.memberAvatar}>
                                                    {(member.name || member.username)?.[0]?.toUpperCase() ?? "?"}
                                                </span>
                                            )}
                                            <span>{member.name || member.username}</span>
                                        </div>
                                    </td>
                                    <td className={styles.tdCenter}>
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
                                        <td className={styles.tdCenter}>
                                            <div className={styles.actionButtons}>
                                                <button
                                                    type="button"
                                                    className={styles.actionButton}
                                                    aria-label="Editar miembro"
                                                    onClick={() => handleOpenEditModal(member)}
                                                >
                                                    <IconPencil size={14} stroke={2} />
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                                                    aria-label="Eliminar miembro"
                                                    onClick={() => setMemberToDelete(member)}
                                                >
                                                    <IconTrash size={14} stroke={2} />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </DataTable>
                )}
            </div>
        </div>
    );
}
