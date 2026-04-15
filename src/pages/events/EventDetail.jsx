import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../hooks/context/AuthContext.jsx";
import { CrewContext } from "../../hooks/context/CrewContext";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import {
    addEventComment,
    attendEvent,
    deleteEvent,
    deleteEventComment,
    getEventAttendees,
    getEventById,
    unattendEvent,
    updateEventComment,
} from "../../services/events.js";
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
    const [commentText, setCommentText] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState("");
    const [commentActionId, setCommentActionId] = useState("");
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

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const trimmedComment = commentText.trim();

        if (!event?._id || !trimmedComment) {
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const newComment = await addEventComment(idCrew, event._id, trimmedComment);
            setEvent((prev) => ({
                ...prev,
                comments: [...(prev?.comments ?? []), newComment],
            }));
            setCommentText("");
        } catch (err) {
            setError(err.message || "No se pudo agregar el comentario");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCommentEditStart = (comment) => {
        setEditingCommentId(comment._id);
        setEditingCommentText(comment.content);
        setError("");
    };

    const handleCommentEditCancel = () => {
        setEditingCommentId(null);
        setEditingCommentText("");
    };

    const handleCommentEditSave = async (commentId) => {
        const trimmedComment = editingCommentText.trim();

        if (!trimmedComment) {
            return;
        }

        setCommentActionId(commentId);
        setError("");

        try {
            const updatedComment = await updateEventComment(idCrew, event._id, commentId, trimmedComment);
            setEvent((prev) => ({
                ...prev,
                comments: (prev?.comments ?? []).map((comment) =>
                    comment._id === commentId ? updatedComment : comment,
                ),
            }));
            handleCommentEditCancel();
        } catch (err) {
            setError(err.message || "No se pudo actualizar el comentario");
        } finally {
            setCommentActionId("");
        }
    };

    const handleCommentDelete = async (commentId) => {
        if (!window.confirm("Quieres eliminar este comentario?")) {
            return;
        }

        setCommentActionId(commentId);
        setError("");

        try {
            await deleteEventComment(idCrew, event._id, commentId);
            setEvent((prev) => ({
                ...prev,
                comments: (prev?.comments ?? []).filter((comment) => comment._id !== commentId),
            }));

            if (editingCommentId === commentId) {
                handleCommentEditCancel();
            }
        } catch (err) {
            setError(err.message || "No se pudo eliminar el comentario");
        } finally {
            setCommentActionId("");
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

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Comentarios</h2>
                        <p>Comparte tu opinion sobre este evento con el resto del equipo.</p>
                    </div>

                    <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
                        <textarea
                            className={styles.commentInput}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Escribe tu comentario..."
                            maxLength={500}
                            rows={4}
                            disabled={submitting}
                        />
                        <div className={styles.commentFormFooter}>
                            <span className={styles.commentCounter}>{commentText.trim().length}/500</span>
                            <button
                                type="submit"
                                className={styles.primaryButton}
                                disabled={submitting || !commentText.trim()}
                            >
                                Publicar comentario
                            </button>
                        </div>
                    </form>

                    <div className={styles.commentList}>
                        {event.comments?.length ? (
                            event.comments.map((comment) => {
                                const commentAuthor = comment.user ?? {};
                                const authorName = commentAuthor.name || commentAuthor.username || "Usuario";
                                const isOwnComment = commentAuthor._id === userId;
                                const isEditing = editingCommentId === comment._id;
                                const isCommentBusy = commentActionId === comment._id;
                                const postedAt = comment.createdAt
                                    ? new Date(comment.createdAt).toLocaleString("es-ES", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    })
                                    : "";

                                return (
                                    <article key={comment._id} className={styles.commentCard}>
                                        <div className={styles.commentHeader}>
                                            <div className={styles.commentAuthor}>
                                                {commentAuthor.image ? (
                                                    <img
                                                        src={commentAuthor.image}
                                                        alt={authorName}
                                                        className={styles.commentAvatar}
                                                    />
                                                ) : (
                                                    <div className={styles.commentAvatarFallback}>
                                                        {authorName.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className={styles.commentAuthorName}>{authorName}</p>
                                                    <p className={styles.commentAuthorMeta}>
                                                        {commentAuthor.username ? `@${commentAuthor.username}` : ""}
                                                        {commentAuthor.email ? ` · ${commentAuthor.email}` : ""}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={styles.commentHeaderMeta}>
                                                {postedAt && <time className={styles.commentDate}>{postedAt}</time>}
                                                {isOwnComment && (
                                                    <div className={styles.commentActions}>
                                                        <button
                                                            type="button"
                                                            className={styles.commentActionButton}
                                                            onClick={() => handleCommentEditStart(comment)}
                                                            disabled={isCommentBusy}
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={styles.commentDeleteButton}
                                                            onClick={() => handleCommentDelete(comment._id)}
                                                            disabled={isCommentBusy}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {isEditing ? (
                                            <div className={styles.commentEditor}>
                                                <textarea
                                                    className={styles.commentInput}
                                                    value={editingCommentText}
                                                    onChange={(e) => setEditingCommentText(e.target.value)}
                                                    maxLength={500}
                                                    rows={4}
                                                    disabled={isCommentBusy}
                                                />
                                                <div className={styles.commentEditorFooter}>
                                                    <span className={styles.commentCounter}>
                                                        {editingCommentText.trim().length}/500
                                                    </span>
                                                    <div className={styles.commentEditorActions}>
                                                        <button
                                                            type="button"
                                                            className={styles.secondaryButton}
                                                            onClick={handleCommentEditCancel}
                                                            disabled={isCommentBusy}
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={styles.primaryButton}
                                                            onClick={() => handleCommentEditSave(comment._id)}
                                                            disabled={isCommentBusy || !editingCommentText.trim()}
                                                        >
                                                            Guardar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className={styles.commentContent}>{comment.content}</p>
                                        )}
                                    </article>
                                );
                            })
                        ) : (
                            <p className={styles.empty}>Todavia no hay comentarios en este evento.</p>
                        )}
                    </div>
                </section>
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
