import { Link } from "react-router-dom";
import WidgetCard from "../../../components/ui/WidgetCard.jsx";
import styles from "./PollsWidget.module.css";

export default function PollsWidget({ polls, emptyMessage = "No hay encuestas activas en este momento." }) {
    return (
        <WidgetCard
            title="Encuestas activas"
            linkTo="polls"
            linkLabel="Ver todas"
            isEmpty={polls.length === 0}
            emptyMessage={emptyMessage}
        >
            <ul className={styles.list}>
                {polls.map((poll) => (
                    <li key={poll._id} className={styles.item}>
                        <div className={styles.info}>
                            <div className={styles.topRow}>
                                <span className={styles.badge}>Activa</span>
                                {poll.expiresAt && (
                                    <span className={styles.expiry}>
                                        Cierra el{" "}
                                        {new Date(poll.expiresAt).toLocaleDateString("es-ES", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </span>
                                )}
                            </div>
                            <p className={styles.question}>{poll.question}</p>
                        </div>
                        <Link to="polls" className={styles.voteBtn}>
                            Votar
                        </Link>
                    </li>
                ))}
            </ul>
        </WidgetCard>
    );
}
