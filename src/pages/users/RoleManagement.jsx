import { useContext, useMemo, useState } from "react";
import styles from "./RoleManagement.module.css";
import { CrewContext } from "../../hooks/context/CrewContext";
import { PERMISSION_ENUM } from "./constants/permission.js";
import { createRoleInCrew } from "../../services/apiCrews.js";
import { deleteRole } from "../../services/apiRoles.js";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import RoleForm from "./components/RoleForm.jsx";
import RoleRow from "./components/RoleRow.jsx";

export default function RoleManagement() {
    const { crew, crewId, setCrew } = useContext(CrewContext);
    const [isSavingRole, setIsSavingRole] = useState(false);
    const [createError, setCreateError] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [deletingRoleId, setDeletingRoleId] = useState("");
    const [roleToDelete, setRoleToDelete] = useState(null);

    // Guardamos los roles de la crew
    const roles = crew?.roles ?? [];

    // Guardamos los administradores totales 
    const totalAdmins = useMemo(
        () =>
            roles.filter((role) => role.permission === PERMISSION_ENUM.ADMIN)
                .length,
        [roles],
    );

    // Maneja la creacion del rol
    const handleCreateRole = async (newRole) => {
        if (!crewId) {
            setCreateError("No se pudo identificar la crew.");
            return false;
        }

        setCreateError("");
        setIsSavingRole(true);

        try {
            //Añadimos el rol a la base de datos
            const savedRole = await createRoleInCrew(crewId, newRole);

            //Actualizamos la crew del contexto
            setCrew((prev) => {
                if (!prev) return prev;
                const prevRoles = prev.roles ?? [];
                return {
                    ...prev,
                    roles: [...prevRoles, savedRole],
                };
            });
            return true;

        } catch (error) {
            setCreateError(error.message || "No se pudo crear el rol.");
            return false;
        } finally {
            setIsSavingRole(false);
        }
    };

    //Manejador de borrar rol para que se muestre la modal
    const handleDeleteRole = (role) => {
        setDeleteError("");
        setRoleToDelete(role);
    };

    // Manejador de confirmacion de eliminar de la modal - Borra el rol
    const handleConfirmDelete = async () => {
        if (!crewId) {
            setDeleteError("No se pudo identificar la crew.");
            return;
        }

        //Identificamos el rol seleccionado
        const roleId = roleToDelete?._id || roleToDelete?.id;
        if (!roleId) {
            setDeleteError("No se pudo identificar el rol.");
            return;
        }

        setDeleteError("");
        setDeletingRoleId(roleId);

        try {
            // Eliminamos el rol de la base de datos
            await deleteRole(roleId);

            //Actualizamos el contexto
            setCrew((prev) => {
                if (!prev) return prev;
                const nextRoles = (prev.roles ?? []).filter((item) => {
                    const itemId = item?._id || item?.id;
                    return itemId !== roleId;
                });
                return {
                    ...prev,
                    roles: nextRoles,
                };
            });
            setRoleToDelete(null);

        } catch (error) {
            setDeleteError(error.message || "No se pudo eliminar el rol.");
        } finally {
            setDeletingRoleId("");
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.headerText}>
                        <p className={styles.eyebrow}>Roles de la crew</p>
                        <h1 className={styles.title}>
                            {crew?.name ? `Roles de ${crew.name}` : "Roles de la crew"}
                        </h1>
                        <p className={styles.subtitle}>
                            Organiza permisos y crea nuevos roles para tu equipo.
                        </p>
                    </div>

                    <div className={styles.statsRow}>
                        <div className={styles.statCard}>
                            <span className={styles.statValue}>{roles.length}</span>
                            <span className={styles.statLabel}>Roles totales</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statValue}>{totalAdmins}</span>
                            <span className={styles.statLabel}>Con permisos de administrador
                            </span>
                        </div>
                    </div>
                </header>

                <div className={styles.content}>
                    <ConfirmModal
                        open={Boolean(roleToDelete)}
                        title="Eliminar rol"
                        description={
                            roleToDelete
                                ? `Seguro que quieres eliminar "${roleToDelete.name}"? Esta acción no se puede deshacer.`
                                : ""
                        }
                        confirmLabel="Eliminar"
                        cancelLabel="Cancelar"
                        onConfirm={handleConfirmDelete}
                        onCancel={() => setRoleToDelete(null)}
                        isLoading={Boolean(deletingRoleId)}
                    />

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <h2>Roles actuales</h2>
                            <p>Define que puede hacer cada miembro en la crew.</p>
                        </div>

                        {deleteError && (
                            <div className={styles.errorText}>{deleteError}</div>
                        )}

                        {roles.length === 0 ? (
                            <div className={styles.emptyState}>
                                <h3>No hay roles todavía</h3>
                                <p>Crea el primer rol para organizar permisos.</p>
                            </div>
                        ) : (
                            <div className={styles.roleList}>
                                {roles.map((role) => {
                                    const roleId = role._id || role.id || role.name;
                                    return (
                                        <RoleRow
                                            key={roleId}
                                            role={role}
                                            isDeleting={
                                                deletingRoleId ===
                                                    (role._id || role.id) ||
                                                isSavingRole
                                            }
                                            onDelete={() => handleDeleteRole(role)}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <h2>Crear nuevo rol</h2>
                            <p>Añade un rol con nombre y permisos de administrador.</p>
                        </div>

                        <RoleForm
                            roles={roles}
                            onCreateRole={handleCreateRole}
                            isSaving={isSavingRole}
                            submitError={createError}
                        />
                    </section>
                </div>
            </div>
        </div>
    );
}
