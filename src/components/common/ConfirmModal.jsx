import { useState } from "react";
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
    const [isPending, setIsPending] = useState(false);

    if (!open) return null;

    const loading = isLoading || isPending;

    const handleConfirm = async () => {
        const result = onConfirm();
        if (result instanceof Promise) {
            setIsPending(true);
            try {
                await result;
            } finally {
                setIsPending(false);
            }
        }
    };

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
                        disabled={loading}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        className={styles.dangerButton}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? "Eliminando..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
