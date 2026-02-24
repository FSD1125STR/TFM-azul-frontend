import styles from "../RoleManagement.module.css";
import { PERMISSION_ENUM } from "../constants/permission.js";

export default function RoleRow({
    role,
    isDeleting,
    onDelete,
}) {
    return (
        <article className={styles.roleCard}>
            <div className={styles.roleHeader}>
                <div className={styles.roleMeta}>
                    <h3>{role.name}</h3>
                    {role.permission === PERMISSION_ENUM.ADMIN ? (
                        <span className={styles.adminBadge}>Administrador</span>
                    ) : (
                        <span className={styles.memberBadge}>Miembro</span>
                    )}
                </div>
                <div className={styles.roleActions}>
                    <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={onDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Eliminando..." : "Eliminar"}
                    </button>
                </div>
            </div>
        </article>
    );
}
