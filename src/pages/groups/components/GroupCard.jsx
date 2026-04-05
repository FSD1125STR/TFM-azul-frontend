import styles from "./GroupCard.module.css";

export default function GroupCard({ group, onView, onEdit, onDelete, isAdmin }) {
    return (
        <article className={styles.card}>
            <div className={styles.body}>
                <div className={styles.content}>
                    <div className={styles.titleHeader}>
                        <h3 className={styles.title}>{group.name}</h3>
                    </div>                    
                    {group.description && (
                        <p className={styles.description}>{group.description}</p>
                    )}
                    <div className={styles.meta}>
                        <span>{group.memberCount ?? 0} miembros</span>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.primaryAction}
                        onClick={() => onView(group)}
                    >
                        Ver grupo
                    </button>

                    {isAdmin && (
                        <div className={styles.adminActions}>
                            <button
                                type="button"
                                className={styles.editAction}
                                onClick={() => onEdit(group)}
                                aria-label="Editar grupo"
                            >
                                Editar
                            </button>
                            <button
                                type="button"
                                className={styles.deleteAction}
                                onClick={() => onDelete(group)}
                                aria-label="Eliminar grupo"
                            >
                                Eliminar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
