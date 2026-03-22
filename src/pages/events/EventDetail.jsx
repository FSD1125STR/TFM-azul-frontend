import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../hooks/context/AuthContext.jsx";
import { CrewContext } from "../../hooks/context/CrewContext";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import {
    deleteEvent,
    getCrewEventDetail,
    setCrewEventAttendance,
    updateEvent,
} from "../../services/events.js";
import EventForm from "./components/EventForm.jsx";
import { formatDateInput } from "./utils/eventDateUtils.js";
import styles from "./EventDetail.module.css";

const initialEditForm = {
    title: "",
    date: "",
    description: "",
    location: "",
};

export default function EventDetail() {
    const { crew } = useContext(CrewContext);
    const { idCrew, eventId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [myAttendance, setMyAttendance] = useState(null);
    const [attendanceSummary, setAttendanceSummary] = useState({ yes: 0, no: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(initialEditForm);
    const [submitting, setSubmitting] = useState(false);
    const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const userId = useMemo(() => user?._id, [user]);

    useEffect(() => {
        const loadEvent = async () => {
            if (!idCrew) return;
            setLoading(true);
            setError("");

            try {
                const detail = await getCrewEventDetail(idCrew, eventId);
                setEvent(detail.event);
                setMyAttendance(detail.myAttendance);
                setAttendanceSummary(detail.attendance ?? { yes: 0, no: 0 });
            } catch (err) {
                setError(err.message || "Error al cargar el evento");
            } finally {
                setLoading(false);
            }
        };

        loadEvent();
    }, [idCrew, eventId]);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const startEdit = () => {
        if (event) {
            setEditForm({
                title: event.title || "",
                date: formatDateInput(event.date),
                description: event.description || "",
                location: event.location || "",
            });
            setIsEditing(true);
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditForm(initialEditForm);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!userId) return;

        setSubmitting(true);
        setError("");

        const payload = {
            title: editForm.title.trim(),
            date: editForm.date ? new Date(editForm.date).toISOString() : "",
            description: editForm.description.trim(),
            location: editForm.location.trim(),
            userId,
        };

        try {
            const data = await updateEvent(eventId, payload);
            setEvent(data.event);
            setIsEditing(false);
            setEditForm(initialEditForm);
        } catch (err) {
            setError(err.message || "No se pudo guardar el evento");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteConfirmed = async () => {
        if (!userId) return;

        setSubmitting(true);
        setError("");

        try {
            await deleteEvent(eventId, userId);
            navigate(`/crews/${idCrew}/events`);
        } catch (err) {
            setError(err.message || "No se pudo eliminar el evento");
            setSubmitting(false);
        }
    };

    const handleRsvp = async (attending) => {
        if (!userId || !idCrew || !eventId) return;

        setRsvpSubmitting(true);
        setError("");

        try {
            const detail = await setCrewEventAttendance(idCrew, eventId, attending);
            setEvent(detail.event);
            setMyAttendance(detail.myAttendance);
            setAttendanceSummary(detail.attendance ?? { yes: 0, no: 0 });
        } catch (err) {
            setError(err.message || "No se pudo actualizar tu asistencia");
        } finally {
            setRsvpSubmitting(false);
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
                    <div>
                        <h1 className={styles.title}>Evento no encontrado</h1>
                    </div>
                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() => navigate(`/crews/${idCrew}/events`)}
                    >
                        Volver
                    </button>
                </header>
            </section>
        );
    }

    return (
        <section className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Detalle del evento {event.title}</h1>
                    <p className={styles.subtitle}>{crew?.name || "la crew"}</p>
                </div>
                <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => navigate(`/crews/${idCrew}/events`)}
                >
                    Volver
                </button>
            </header>

            <div className={styles.content}>
                {!isEditing && (
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Asistencia</h2>
                            <p>Marca si vas a asistir al evento.</p>
                        </div>

                        <div className={styles.rsvpRow}>
                            <div className={styles.rsvpButtons}>
                                <button
                                    type="button"
                                    className={`${styles.rsvpButton} ${myAttendance === true ? styles.rsvpYesActive : styles.rsvpYes}`}
                                    onClick={() => handleRsvp(true)}
                                    disabled={rsvpSubmitting || submitting}
                                >
                                    Sí
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.rsvpButton} ${myAttendance === false ? styles.rsvpNoActive : styles.rsvpNo}`}
                                    onClick={() => handleRsvp(false)}
                                    disabled={rsvpSubmitting || submitting}
                                >
                                    No
                                </button>
                            </div>

                            <div className={styles.rsvpStats}>
                                <span>Asisten: {attendanceSummary?.yes ?? 0}</span>
                                <span>No asisten: {attendanceSummary?.no ?? 0}</span>
                            </div>
                        </div>
                    </div>
                )}
                {isEditing ? (
                    <form className={styles.eventForm} onSubmit={handleEditSubmit}>
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2>Editar evento</h2>
                                <p>Modifica los datos del evento.</p>
                            </div>

                            <EventForm
                                values={editForm}
                                onChange={handleEditChange}
                                disabled={submitting}
                                idPrefix="edit"
                            />
                        </div>

                        {error && <p className={styles.error}>{error}</p>}

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={cancelEdit}
                                disabled={submitting}
                            >
                                Cancelar
                            </button>
                            <button className={styles.primaryButton} disabled={submitting}>
                                Guardar cambios
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className={styles.section}>
                        <div className={styles.eventDetail}>
                            <div className={styles.detailField}>
                                <label>Fecha</label>
                                <p>
                                    {new Date(event.date).toLocaleDateString("es-ES", {
                                        weekday: "long",
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>

                            <div className={styles.detailField}>
                                <label>Hora</label>
                                <p>
                                    {new Date(event.date).toLocaleTimeString("es-ES", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>

                            {event.location && (
                                <div className={styles.detailField}>
                                    <label>Lugar</label>
                                    <p>{event.location}</p>
                                </div>
                            )}

                            {event.description && (
                                <div className={styles.detailField}>
                                    <label>Descripción</label>
                                    <p>{event.description}</p>
                                </div>
                            )}
                        </div>

                        {error && <p className={styles.error}>{error}</p>}

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={startEdit}
                                disabled={submitting}
                            >
                                Editar evento
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
                    </div>
                )}
            </div>

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
