// Widget del calendario de eventos.
// Recibe los eventos ya cargados por el padre (props-driven) y los pasa
// al componente genérico EventCalendar. Al no hacer fetch internamente,
// el padre puede reutilizar el mismo array para otros widgets (p. ej. EventsWidget)
// evitando peticiones duplicadas.

import EventCalendar from "../../../components/common/EventCalendar.jsx";
import WidgetCard from "../../../components/ui/WidgetCard.jsx";
import styles from "./CalendarWidget.module.css";

export default function CalendarWidget({ events, loading }) {
    return (
        // WidgetCard aporta el título, el link "Ver todos" y el contenedor visual.
        // isEmpty nunca es true: el calendario siempre se muestra (muestra internamente
        // "No hay eventos este día" cuando la fecha seleccionada no tiene eventos).
        <WidgetCard
            title="Calendario"
            linkTo="events"
            linkLabel="Ver todos"
        >
            {/* EventCalendar es completamente presentacional: solo recibe props */}
            <div className={styles.calendarWrapper}>
                <EventCalendar events={events} loading={loading} />
            </div>
        </WidgetCard>
    );
}
