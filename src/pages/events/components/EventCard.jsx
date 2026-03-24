import { IconClock, IconMapPin, IconUsers } from "@tabler/icons-react";
import { formatEventDateParts } from "../utils/eventDateUtils";
import styles from "./EventCard.module.css";

export default function EventCard({ event, onClick, crewName }) {
  //Extramos datos de la fecha con una funcion auxiliar
  const { day, month, time } = formatEventDateParts(event.date);

  return (
    <article className={styles.row}>
      {/**Mostramos cuadro de fecha */}
      <div className={styles.dateBadge}>
        <span className={styles.dateDay}>{day}</span>
        <span className={styles.dateMonth}>{month}</span>
      </div>

      {/**Mostramos la info del evento */}
      <div className={styles.info}>
        <h3 className={styles.title}>{event.title}</h3>
        <div className={styles.meta}>
          {/** Hora */}
          <span className={styles.metaItem}>
            <IconClock size={13} stroke={2} />
            {time}
          </span>

          {/** Lugar */}
          {event.location && (
            <span className={styles.metaItem}>
              <IconMapPin size={13} stroke={2} />
              {event.location}
            </span>
          )}

          <span className={styles.metaItem}>
            <IconUsers size={13} stroke={2} />
            {event.attendanceCount ?? 0}
          </span>

          {/** Crew */}
          {crewName && <span className={styles.crewPill}>{crewName}</span>}
        </div>
      </div>

      {/** Boton para ir al evento */}
      <div className={styles.actions}>
        <button type="button" className={styles.detailButton} onClick={onClick}>
          Detalles
        </button>
      </div>
    </article>
  );
}
