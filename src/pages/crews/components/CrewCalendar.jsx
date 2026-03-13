import { useContext, useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CrewContext } from "../../../hooks/context/CrewContext";
import { getCrewEvents } from "../../../services/events";
import styles from "./CrewCalendar.module.css";

function toDateKey(date) {
    return date.toISOString().slice(0, 10);
}

export default function CrewCalendar() {
    const { crewId } = useContext(CrewContext);
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date()); //Fecha seleccionada al pulsar un dia
    const [loading, setLoading] = useState(false);

    // Al renderizar o cambiar la crew, se cargan todos los eventos de la crew
    useEffect(() => {
        if (!crewId) return;
        setLoading(true);
        getCrewEvents(crewId)
            .then((data) => setEvents(data ?? []))
            .catch(() => setEvents([]))
            .finally(() => setLoading(false));
    }, [crewId]);

    // Extraemos las fechas de los eventos
    const eventDateKeys = new Set(
        events.map((event) => toDateKey(new Date(event.date)))
    );

    // Eventos de la fecha seleccionada, por defecto la actual
    const selectedKey = toDateKey(selectedDate);
    const selectedEvents = events.filter(
        (e) => toDateKey(new Date(e.date)) === selectedKey
    );

    // Permite modificar un dia si hay eventos ese dia (añadimos un dot)
    function tileContent({ date, view }) {
        if (view === "month" && eventDateKeys.has(toDateKey(date))) {
            return <span className={styles.dot} />;
        }
        return null;
    }

    // Permite cambiar la clase de un dia 
    function tileClassName({ date, view }) {
        if (view === "month" && eventDateKeys.has(toDateKey(date))) {
            return styles.hasEvent;
        }
        return null;
    }

    return (
        <div className={styles.wrapper}>
            {loading ? (
                <p className={styles.loading}>Cargando calendario de eventos…</p>
            ) : (
                <>  
                    {/** Renderiza el calendario de la libreria de componentes */}
                    <div className={styles.calendarWrapper}>
                        <Calendar
                            value={selectedDate}
                            onChange={setSelectedDate}
                            tileContent={tileContent}
                            tileClassName={tileClassName}
                            locale="es-ES"
                        />
                    </div>

                    {/** Renderiza la lista de eventos de la fecha seleccionada */}
                    <div className={styles.eventList}>
                        {selectedEvents.length === 0 ? (
                            <p className={styles.empty}>
                                No hay eventos este día.
                            </p>
                        ) : (
                            selectedEvents.map((event) => (
                                <div key={event._id} className={styles.eventItem}>
                                    <div className={styles.eventHeader}>
                                        <span className={styles.eventTitle}>
                                            {event.title}
                                        </span>
                                        <span className={styles.eventTime}>
                                            {new Date(event.date).toLocaleTimeString("es-ES", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    {event.description && (
                                        <p className={styles.eventDescription}>
                                            {event.description}
                                        </p>
                                    )}
                                    {event.location && (
                                        <p className={styles.eventLocation}>
                                            {event.location}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
