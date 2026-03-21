import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "./EventCalendar.module.css";

//Convierte una fecha a clave YYYY-MM-DD usando hora local (evita desfase por timezone)
function toDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

//Componente presentacional genérico de calendario de eventos.
//Acepta events[] y loading como props, sin fetch interno.
//onEventClick(event) es opcional; si se pasa, los items del día son clicables.
export default function EventCalendar({ events = [], loading = false, onEventClick }) {
    //Fecha seleccionada al pulsar un día
    const [selectedDate, setSelectedDate] = useState(new Date());

    //Extraemos las fechas de los eventos como claves para marcar el calendario
    const eventDateKeys = new Set(
        events.map((event) => toDateKey(new Date(event.date)))
    );

    //Eventos del día seleccionado
    const selectedKey = toDateKey(selectedDate);
    const selectedEvents = events.filter(
        (e) => toDateKey(new Date(e.date)) === selectedKey
    );

    //Añade un dot en los días que tienen eventos
    function tileContent({ date, view }) {
        if (view === "month" && eventDateKeys.has(toDateKey(date))) {
            return <span className={styles.dot} />;
        }
        return null;
    }

    //Aplica clase especial a los días con eventos
    function tileClassName({ date, view }) {
        if (view === "month" && eventDateKeys.has(toDateKey(date))) {
            return styles.hasEvent;
        }
        return null;
    }

    if (loading) {
        return <p className={styles.loading}>Cargando calendario de eventos…</p>;
    }

    return (
        <div className={styles.wrapper}>
            {/**Renderiza el calendario de la libreria de componentes */}
            <div className={styles.calendarWrapper}>
                <Calendar
                    value={selectedDate}
                    onChange={setSelectedDate}
                    tileContent={tileContent}
                    tileClassName={tileClassName}
                    locale="es-ES"
                />
            </div>

            {/**Renderiza la lista de eventos del día seleccionado */}
            <div className={styles.eventList}>
                {selectedEvents.length === 0 ? (
                    <p className={styles.empty}>
                        No hay eventos este día.
                    </p>
                ) : (
                    selectedEvents.map((event) => (
                        <div
                            key={event._id}
                            className={`${styles.eventItem} ${onEventClick ? styles.eventItemClickable : ""}`}
                            onClick={() => onEventClick?.(event)}
                        >
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
                            {/**Nombre de la crew: útil cuando los eventos abarcan múltiples crews */}
                            {event.crew?.name && (
                                <span className={styles.crewName}>
                                    {event.crew.name}
                                </span>
                            )}
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
        </div>
    );
}
