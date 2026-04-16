import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../hooks/context/AuthContext.jsx";
import { CrewContext } from "../../hooks/context/CrewContext";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import {
    attendEvent,
    deleteEvent,
    getEventAttendees,
    getEventById,
    unattendEvent,
} from "../../services/events.js";
import EventCommentsSection from "./components/EventCommentsSection.jsx";
import EventDetailsCard from "./components/EventDetailsCard.jsx";
import EventParticipantsCard from "./components/EventParticipantsCard.jsx";
import EventStatusCard from "./components/EventStatusCard.jsx";
import styles from "./EventDetail.module.css";

function getEventStatus(date) {
    const now = new Date();
    const eventDate = new Date(date);
    const isPast = eventDate < now;
    const diffDays = Math.abs(Math.round((eventDate - now) / (1000 * 60 * 60 * 24)));

    return {
        statusLabel: isPast ? "Pasado" : "Programado",
        daysText: isPast
            ? diffDays === 0 ? "Hoy" : `Hace ${diffDays} dia${diffDays !== 1 ? "s" : ""}`
            : diffDays === 0 ? "Hoy" : `Faltan ${diffDays} dia${diffDays !== 1 ? "s" : ""}`,
    };
}

export default function EventDetail() {
    const { crew } = useContext(CrewContext);
    const { idCrew, eventId, groupId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const eventsBase = groupId
        ? `/crews/${idCrew}/groups/${groupId}/events`
        : `/crews/${idCrew}/events`;

    const [event, setEvent] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const userId = useMemo(() => user?._id, [user]);

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

    const handleAttend = async () => {
        if (!event?._id || event.userAttending) return;

        setSubmitting(true);
        setError("");

        try {
            const data = await attendEvent(idCrew, event._id);
            setEvent((prev) => ({ ...prev, attendanceCount: data.attendanceCount, userAttending: data.userAttending }));
            setAttendees((prev) => [...prev, data.attendance.user]);
        } catch (err) {
            setError(err.message || "No se pudo registrar la asistencia");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUnattend = async () => {
        if (!event?._id || !event.userAttending) return;

        setSubmitting(true);
        setError("");

        try {
            const data = await unattendEvent(idCrew, event._id);
            setEvent((prev) => ({ ...prev, attendanceCount: data.attendanceCount, userAttending: data.userAttending }));
            setAttendees((prev) => prev.filter((attendee) => attendee._id !== userId));
        } catch (err) {
            setError(err.message || "No se pudo quitar la asistencia");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <section className={styles.page}>
                <p className={styles.empty}>Cargando evento...</p>
            </section>
        );
    }

    if (!event) {
        return (
            <section className={styles.page}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Evento no encontrado</h1>
                </header>
            </section>
        );
    }

    const { statusLabel, daysText } = getEventStatus(event.date);
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
                {error && <p className={styles.error}>{error}</p>}

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

                {/** Sección de comentarios */}
                <EventCommentsSection
                    comments={event.comments ?? []}
                    eventId={event._id}
                    crewId={idCrew}
                    userId={userId}
                />
            </div>

            <ConfirmModal
                open={showDeleteConfirm}
                title="Eliminar evento?"
                description="Esta accion no se puede deshacer."
                confirmLabel="Eliminar"
                onConfirm={handleDeleteConfirmed}
                onCancel={() => setShowDeleteConfirm(false)}
                isLoading={submitting}
            />
        </section>
    );
}
