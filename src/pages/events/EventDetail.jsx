import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../hooks/context/AuthContext.jsx";
import { CrewContext } from "../../hooks/context/CrewContext";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import {
  attendEvent,
  deleteEvent,
  getCrewEvents,
  getEventAttendees,
  unattendEvent,
  updateEvent,
} from "../../services/events.js";
import EventForm from "./components/EventForm.jsx";
import EventDetailsCard from "./components/EventDetailsCard.jsx";
import EventStatusCard from "./components/EventStatusCard.jsx";
import EventParticipantsCard from "./components/EventParticipantsCard.jsx";
import { formatDateInput } from "./utils/eventDateUtils.js";
import styles from "./EventDetail.module.css";

const initialEditForm = {
  title: "",
  date: "",
  description: "",
  location: "",
};

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
  const { crew } = useContext(CrewContext);
  const { idCrew, eventId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const userId = useMemo(() => user?._id, [user]);

  useEffect(() => {
    const loadEvent = async () => {
      if (!idCrew) return;
      setLoading(true);
      setError("");

      try {
        const events = await getCrewEvents(idCrew);
        const foundEvent = events?.find((e) => e._id === eventId);
        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          setError("Evento no encontrado");
        }
      } catch (err) {
        setError(err.message || "Error al cargar el evento");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [idCrew, eventId]);

  useEffect(() => {
    if (!eventId) return;
    getEventAttendees(eventId)
      .then((data) => setAttendees(data ?? []))
      .catch(() => setAttendees([]));
  }, [eventId]);

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

  const handleAttend = async () => {
    if (!event?._id || event.userAttending) return;
    setSubmitting(true);
    setError("");
    try {
      const data = await attendEvent(event._id);
      setEvent((prev) => ({ ...prev, attendanceCount: data.attendanceCount, userAttending: data.userAttending }));
      const updated = await getEventAttendees(eventId);
      setAttendees(updated ?? []);
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
      const data = await unattendEvent(event._id);
      setEvent((prev) => ({ ...prev, attendanceCount: data.attendanceCount, userAttending: data.userAttending }));
      const updated = await getEventAttendees(eventId);
      setAttendees(updated ?? []);
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
              onClick={startEdit}
              disabled={submitting || isEditing}
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
          <>
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
          </>
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
