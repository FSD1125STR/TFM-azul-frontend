import { useEffect } from "react";
import styles from "./CrewToast.module.css";

// Toast para mostrar una notificacion
export default function CrewToast({ message, type = "error", onClose, duration = 4000 }) {
    useEffect(() => {
        if (!onClose) return undefined;
        const timer = setTimeout(() => onClose(), duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!message) return null;

    return (
        <div className={`${styles.toast} ${styles[type]}`} role="status">
            <span>{message}</span>
            {onClose && (
                <button type="button" className={styles.close} onClick={onClose}>
          x
                </button>
            )}
        </div>
    );
}
