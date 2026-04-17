import { useContext, useEffect, useMemo, useState } from "react";
import { IconTrash } from "@tabler/icons-react";
import { CrewContext } from "../../hooks/context/CrewContext.jsx";
import { GroupContext } from "../../hooks/context/GroupContext.jsx";
import { Title, Subtitle, GroupTitle } from "../../components/ui/Title.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import CrewToast from "../crews/components/CrewToast.jsx";
import AddMemberModal from "./components/AddMemberModal.jsx";
import { getGroupMembers, removeGroupMember } from "../../services/apiGroups.js";
import styles from "./GroupMembers.module.css";

export default function GroupMembers() {
    // Contextos de crew y grupo para obtener los IDs necesarios y el rol del usuario
    const { crew, crewId } = useContext(CrewContext);
    const { groupId, group } = useContext(GroupContext);
    const isAdmin = crew?.userRole?.permission === "admin";
    const roles = crew?.roles || [];

    // Mapa de nombre de rol → objeto rol, para obtener el permission al renderizar el badge
    const roleByName = useMemo(
        () => new Map(roles.map((role) => [role?.name, role])),
        [roles]
    );

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    // Modal eliminar
    const [memberToRemove, setMemberToRemove] = useState(null);
    const [isRemoving, setIsRemoving] = useState(false);

    // Modal añadir
    const [showAddModal, setShowAddModal] = useState(false);

    // Cargar miembros del grupo al montar el componente o cuando cambien crewId/groupId
    useEffect(() => {
        if (!crewId || !groupId) return;
        setLoading(true);
        //Llamada a la api para obtener los miembros del grupo
        getGroupMembers(crewId, groupId)
            .then((data) => setMembers(Array.isArray(data) ? data : []))
            .catch((err) =>
                setNotification({ type: "error", message: err.message || "Error al cargar miembros" })
            )
            .finally(() => setLoading(false));
    }, [crewId, groupId]);

    // Ids de los miembros ya en el grupo, para que AddMemberModal pueda filtrarlos
    const memberIds = useMemo(() => new Set(members.map((m) => String(m.id))), [members]);

    // Filtros: búsqueda por nombre/email y filtro por rol
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");

    // Filtra los miembros del grupo según los filtros activos
    const filteredMembers = useMemo(() => {
        const term = search.trim().toLowerCase();
        return members.filter((m) => {
            const matchRole = !roleFilter || m.role === roleFilter;
            const matchSearch =
                !term ||
                m.name?.toLowerCase().includes(term) ||
                m.email?.toLowerCase().includes(term);
            return matchRole && matchSearch;
        });
    }, [members, search, roleFilter]);

    //Se ejecuta al confirmar que se quiere eliminar un miembro del grupo
    const handleRemove = async () => {
        if (!memberToRemove) return;
        setIsRemoving(true);
        try {
            // Llamada a la API para eliminar el miembro del grupo
            await removeGroupMember(crewId, groupId, memberToRemove.id);
            //Actualizamos los estados
            setMembers((prev) => prev.filter((m) => m.id !== memberToRemove.id));
            setNotification({ type: "success", message: "Miembro eliminado del grupo" });
            setMemberToRemove(null);
        } catch (err) {
            setNotification({ type: "error", message: err.message || "No se pudo eliminar el miembro" });
        } finally {
            setIsRemoving(false);
        }
    };

    if (loading) return <div className={styles.state}>Cargando miembros...</div>;

    return (
        <div className={styles.page}>
            {notification && (
                <CrewToast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            {/* Modal confirmación de eliminación */}
            <ConfirmModal
                open={!!memberToRemove}
                title="Eliminar miembro"
                description={
                    memberToRemove
                        ? `¿Seguro que quieres eliminar a ${memberToRemove.name} del grupo? Esta acción no se puede deshacer.`
                        : ""
                }
                confirmLabel="Sí, eliminar"
                onConfirm={handleRemove}
                onCancel={() => setMemberToRemove(null)}
                isLoading={isRemoving}
            />

            {/* Modal para añadir un miembro de la crew al grupo */}
            <AddMemberModal
                open={showAddModal}
                crewId={crewId}
                groupId={groupId}
                memberIds={memberIds}
                onAddSuccess={(added, memberName) => {
                    // Añadimos el nuevo miembro a la lista y mostramos notificación
                    setMembers((prev) => [...prev, added]);
                    setNotification({ type: "success", message: `${memberName} añadido al grupo` });
                }}
                onClose={() => setShowAddModal(false)}
                onError={(message) => setNotification({ type: "error", message })}
            />

            <div className={styles.container}>
                {/** Titulo de la pagina */}
                <GroupTitle>
                    Eventos de <span>{group?.name || "el grupo"}</span>
                </GroupTitle>
                <Subtitle>
                    Gestiona los eventos asociados este grupo dentro de <span>{crew?.name || "la crew"}</span>.
                </Subtitle>

                <div className={styles.statsRow}>
                    {/** Carta con info de miembros totales  */}
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Miembros totales</span>
                        <strong className={styles.statValue}>{members.length}</strong>
                    </div>

                    {/** Boton para añadir usuario solo visible para administradores */}
                    {isAdmin && (
                        <div className={styles.actionRow}>
                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={() => setShowAddModal(true)}
                            >
                                Añadir miembro
                            </button>
                        </div>
                    )}
                </div>

                {/** Filtros: rol y búsqueda por nombre/email */}
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
                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="Buscar miembro..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Mostramos los miembros filtrados en la tabla */}
                {filteredMembers.length === 0 ? (
                    <p className={styles.empty}>
                        {search ? "Sin resultados para tu búsqueda." : "No hay miembros en este grupo todavía."}
                    </p>
                ) : (
                    <DataTable
                        //Definimos las columnas de la tabla, añadiendo la columna de acciones solo si el usuario es admin
                        columns={[
                            { label: "Miembro" },
                            { label: "Role", center: true },
                            { label: "Mail" },
                            ...(isAdmin ? [{ label: "Acciones", center: true }] : []),
                        ]}
                    >
                        {/** Filas de la tabla listando los miembros filtrados */}
                        {filteredMembers.map((member) => {
                            // Obtenemos el objeto rol para determinar el permission y aplicar el estilo del badge
                            const memberRole = roleByName.get(member.role);
                            const rolePermission = memberRole?.permission ?? "member";
                            return (
                                <tr key={member.id}>
                                    {/* Celda con avatar e info del miembro */}
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
                                    {/** Celda con el badge del rol del miembro */}
                                    <td className={styles.tdCenter}>
                                        <span className={`${styles.roleBadge} ${styles[rolePermission] || styles.member}`}>
                                            {member.role || "member"}
                                        </span>
                                    </td>
                                    {/** Celda con el correo del miembro */}
                                    <td>
                                        <a className={styles.mailLink} href={`mailto:${member.email}`}>
                                            {member.email}
                                        </a>
                                    </td>

                                    {/** Celda con botón de eliminar, solo visible para admins */}
                                    {isAdmin && (
                                        <td className={styles.tdCenter}>
                                            <div className={styles.actionButtons}>
                                                <button
                                                    type="button"
                                                    className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                                                    aria-label="Eliminar miembro del grupo"
                                                    onClick={() => setMemberToRemove(member)}
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
