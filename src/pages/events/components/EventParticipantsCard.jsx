import { Container } from "../../../components/ui/Container.jsx";
import styles from "./EventParticipantsCard.module.css";

export default function EventParticipantsCard({ attendees }) {
    return (
        <Container className={styles.card}>
            <h2 className={styles.cardTitle}>Participantes</h2>

            <div className={styles.divider} />

            {attendees.length === 0 ? (
                <p className={styles.empty}>Aun no hay participantes.</p>
            ) : (
                <ul className={styles.list}>
                    {attendees.map((user) => (
                        <li key={user._id} className={styles.item}>
                            <div className={styles.avatar}>
                                {user.image ? (
                                    <img src={user.image} alt={user.username} className={styles.avatarImg} />
                                ) : (
                                    user.username?.[0]?.toUpperCase() ?? "?"
                                )}
                            </div>
                            <span className={styles.username}>{user.username}</span>
                        </li>
                    ))}
                </ul>
            )}
        </Container>
    );
}
