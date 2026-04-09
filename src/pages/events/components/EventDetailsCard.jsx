import { Container } from "../../../components/ui/Container.jsx";
import styles from "./EventDetailsCard.module.css";

export default function EventDetailsCard({ event, statusLabel }) {
    const date = new Date(event.date);

    const formattedDate = date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <Container className={styles.card}>
            <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Detalles del evento</h2>
                <span className={`${styles.statusBadge} ${styles[statusLabel === "Pasado" ? "past" : "upcoming"]}`}>
                    {statusLabel}
                </span>
            </div>

            <div className={styles.divider} />

            <div className={styles.fields}>
                <div className={styles.field}>
                    <span className={styles.fieldLabel}>Fecha</span>
                    <span className={styles.fieldValue}>{formattedDate}</span>
                </div>

                <div className={styles.field}>
                    <span className={styles.fieldLabel}>Hora</span>
                    <span className={styles.fieldValue}>{formattedTime}</span>
                </div>

                {event.location && (
                    <div className={styles.field}>
                        <span className={styles.fieldLabel}>Lugar</span>
                        <span className={styles.fieldValue}>{event.location}</span>
                    </div>
                )}

                {event.description && (
                    <div className={styles.field}>
                        <span className={styles.fieldLabel}>Descripcion</span>
                        <span className={styles.fieldValue}>{event.description}</span>
                    </div>
                )}
            </div>
        </Container>
    );
}
