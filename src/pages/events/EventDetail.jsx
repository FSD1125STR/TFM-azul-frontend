import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../hooks/context/AuthContext.jsx";
import { CrewContext } from "../../hooks/context/CrewContext";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import {
    attendEvent,
    deleteEvent,
    getEventById,
    getEventAttendees,
    unattendEvent,
} from "../../services/events.js";
import EventDetailsCard from "./components/EventDetailsCard.jsx";
import EventStatusCard from "./components/EventStatusCard.jsx";
import EventParticipantsCard from "./components/EventParticipantsCard.jsx";
import styles from "./EventDetail.module.css";

// Función para determinar el estado del evento (pasado o programado) y el texto de días
function getEventStatus(date) {
    const now = new Date();
    const eventDate = new Date(date);
    const isPast = eventDate < now;
    const diffDays = Math.abs(Math.round((eventDate - now) / (1000 * 60 * 60 * 24)));
    return {
        statusLabel: isPast ? "Pasado" : "Programado",
        daysText: isPast
            ? diffDays === 0 ? "Hoy" : `Hace ${diffDays} día${diffDays !== 1 ? "s" : ""}`
            : diffDays === 0 ? "Hoy" : `Faltan ${diffDays} día${diffDays !== 1 ? "s" : ""}`,
    };
}

export default function EventDetail() {
    // Obtener datos de contexto y parámetros de URL
    const { crew } = useContext(CrewContext);
    const { idCrew, eventId, groupId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    //Detecta si estamos viendo los eventos de un grupo para mantener las rutas dentro o fuera del grupo
    const eventsBase = groupId
        ? `/crews/${idCrew}/groups/${groupId}/events`
        : `/crews/${idCrew}/events`;

    const [event, setEvent] = useState(null); //Guarda info del evento
    const [attendees, setAttendees] = useState([]); //Guarda lista de usuarios que asisten al evento
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); //Controla la visibilidad del modal de confirmación para eliminar el evento

    const userId = useMemo(() => user?._id, [user]);

    //Cargamos el evento y sus asistentes llamando a la api
    useEffect(() => {
        const loadEvent = async () => {
            if (!idCrew) return;
            setLoading(true);
            setError("");

            try {
                const [eventData, attendeesData] = await Promise.all([
                    getEventById(idCrew, eventId),
                    getEventAttendees(idCrew, eventId),
                ]);
                if (eventData) {
                    setEvent(eventData);
                } else {
                    setError("Evento no encontrado");
                }
                setAttendees(attendeesData ?? []);
            } catch (err) {
                setError(err.message || "Error al cargar el evento");
            } finally {
                setLoading(false);
            }
        };

        loadEvent();
    }, [idCrew, eventId]);

    //Maneja la confirmación para eliminar el evento
    const handleDeleteConfirmed = async () => {
        if (!userId) return;

        setSubmitting(true);
        setError("");

        try {
            await deleteEvent(idCrew, eventId);
            navigate(eventsBase);
        } catch (err) {
            setError(err.message || "No se pudo eliminar el evento");
            setSubmitting(false);
        }
    };

    //Maneja el boton para asistir al evento
    const handleAttend = async () => {
        if (!event?._id || event.userAttending) return;
        setSubmitting(true);
        setError("");

        try {
            const data = await attendEvent(idCrew, event._id);

            //Actualizamos el evento y la lista de asistentes con la nueva asistencia
            setEvent((prev) => ({ ...prev, attendanceCount: data.attendanceCount, userAttending: data.userAttending }));
            setAttendees((prev) => [...prev, data.attendance.user]);
        } catch (err) {
            setError(err.message || "No se pudo registrar la asistencia");
        } finally {
            setSubmitting(false);
        }
    };

    //Maneja el boton para quitar la asistencia al evento
    const handleUnattend = async () => {
        if (!event?._id || !event.userAttending) return;
        setSubmitting(true);
        setError("");

        try {
            //Llamamos a la api para quitar la asistencia y actualizamos el evento y la lista de asistentes
            const data = await unattendEvent(idCrew, event._id);
            setEvent((prev) => ({ ...prev, attendanceCount: data.attendanceCount, userAttending: data.userAttending }));
            setAttendees((prev) => prev.filter((a) => a._id !== userId));
        } catch (err) {
            setError(err.message || "No se pudo quitar la asistencia");
        } finally {
            setSubmitting(false);
        }
    };

    // Renderizamos un loading si esta cargando el evento
    if (loading) {
        return (
            <section className={styles.page}>
                <p className={styles.empty}>Cargando evento...</p>
            </section>
        );
    }

    // Si no hay evento, mostramos un mensaje
    if (!event) {
        return (
            <section className={styles.page}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Evento no encontrado</h1>
                </header>
            </section>
        );
    }

    // Obtenemos el estado del evento y el texto de días
    const { statusLabel, daysText } = getEventStatus(event.date);
    // Comprobamos si el usuario es admin para mostrar las acciones de editar y eliminar
    const isAdmin = crew?.userRole?.permission === "admin";

    return (
        <section className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>{event.title}</h1>
                    <p className={styles.subtitle}>{crew?.name || "la crew"}</p>
                </div>
                {isAdmin && (
                    <div className={styles.headerActions}>
                        {/** Botón de editar navega a la página de edición del evento */}
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => navigate(`${eventsBase}/${eventId}/edit`)}
                            disabled={submitting}
                        >
                          Editar
                        </button>
                        <button
                            type="button"
                            className={styles.dangerButton}
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={submitting}
                        >
                          Eliminar
                        </button>
                    </div>
                )}
            </header>

            <div className={styles.content}>
                {/** Mostramos mensaje de error si existe */}
                {error && <p className={styles.error}>{error}</p>}

                {/** Detalles del evento */}
                <div className={styles.viewGrid}>
                    <EventDetailsCard event={event} statusLabel={statusLabel} />

                    <div className={styles.rightColumn}>
                        <EventStatusCard
                            event={event}
                            statusLabel={statusLabel}
                            daysText={daysText}
                            onAttend={handleAttend}
                            onUnattend={handleUnattend}
                            submitting={submitting}
                        />
                        <EventParticipantsCard attendees={attendees} />
                    </div>
                </div>
            </div>
            
            {/** Modal de confirmación para eliminar el evento */}
            <ConfirmModal
                open={showDeleteConfirm}
                title="¿Eliminar evento?"
                description="Esta acción no se puede deshacer."
                confirmLabel="Eliminar"
                onConfirm={handleDeleteConfirmed}
                onCancel={() => setShowDeleteConfirm(false)}
                isLoading={submitting}
            />
        </section>
    );
}
