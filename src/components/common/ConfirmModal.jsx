import styles from "./ConfirmModal.module.css";

export default function ConfirmModal({
    open,
    title,
    description,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    onConfirm,
    onCancel,
    isLoading = false,
}) {
    if (!open) return null;

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true">
            <div className={styles.modal}>
                <h3>{title}</h3>
                {description && <p>{description}</p>}
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        className={styles.dangerButton}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Eliminando..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
