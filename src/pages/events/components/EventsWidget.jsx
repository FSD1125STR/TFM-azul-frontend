import { Link } from "react-router-dom";
import { IconMapPin, IconUsers } from "@tabler/icons-react";
import { formatEventDateParts } from "../utils/eventDateUtils.js";
import WidgetCard from "../../../components/ui/WidgetCard.jsx";
import styles from "./EventsWidget.module.css";

export default function EventsWidget({ events, emptyMessage = "No hay eventos próximos." }) {
    return (
        <WidgetCard
            title="Próximos eventos"
            linkTo="events"
            linkLabel="Ver todos"
            isEmpty={events.length === 0}
            emptyMessage={emptyMessage}
        >
            <ol className={styles.timeline}>
                {events.map((event) => {
                    const { day, month, time } = formatEventDateParts(event.date);
                    return (
                        <li key={event._id} className={styles.item}>
                            <span className={styles.dot} />
                            <div className={styles.card}>
                                <div className={styles.topRow}>
                                    <p className={styles.title}>{event.title}</p>
                                    <span className={styles.date}>{day} {month} · {time}</span>
                                </div>
                                <div className={styles.bottomRow}>
                                    <div className={styles.meta}>
                                        {event.location && (
                                            <span className={styles.metaItem}>
                                                <IconMapPin size={11} stroke={2} />
                                                {event.location}
                                            </span>
                                        )}
                                        <span className={styles.metaItem}>
                                            <IconUsers size={11} stroke={2} />
                                            {event.attendanceCount || 0} asistentes
                                        </span>
                                    </div>
                                    <Link to={event.group ? `/crews/${event.crew._id}/groups/${event.group._id}/events/${event._id}` : `/crews/${event.crew._id}/events/${event._id}`} className={styles.detailLink}>
                                        Ver detalles →
                                    </Link>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </WidgetCard>
    );
}
