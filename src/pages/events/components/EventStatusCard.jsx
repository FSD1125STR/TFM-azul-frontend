import { Container } from "../../../components/ui/Container.jsx";
import styles from "./EventStatusCard.module.css";

export default function EventStatusCard({ event, statusLabel, daysText, onAttend, onUnattend, submitting }) {
    return (
        <Container className={styles.card}>
            <h2 className={styles.cardTitle}>Estado</h2>

            <div className={styles.divider} />

            <div className={styles.statusRow}>
                <span className={`${styles.dot} ${statusLabel === "Pasado" ? styles.dotPast : styles.dotUpcoming}`} />
                <span className={styles.statusLabel}>{statusLabel}</span>
            </div>

            <p className={styles.daysText}>{daysText}</p>

            <div className={styles.attendButtons}>
                <button
                    type="button"
                    className={`${styles.attendBtn} ${event.userAttending ? styles.attendBtnActive : ""}`}
                    onClick={onAttend}
                    disabled={submitting || event.userAttending}
                >
          Asisto
                </button>
                <button
                    type="button"
                    className={`${styles.attendBtn} ${!event.userAttending ? styles.notAttendBtnActive : ""}`}
                    onClick={onUnattend}
                    disabled={submitting || !event.userAttending}
                >
          No asisto
                </button>
            </div>
        </Container>
    );
}
