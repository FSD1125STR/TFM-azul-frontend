import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../hooks/context/AuthContext.jsx";
import { CrewContext } from "../../hooks/context/CrewContext";
import {
  deleteEvent,
  getCrewEvents,
  updateEvent,
} from "../../services/events.js";
import styles from "./events.module.css";

const initialEditForm = {
  title: "",
  date: "",
  description: "",
  location: "",
};

const formatDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (num) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function EventDetail() {
  const { crew } = useContext(CrewContext);
  const { idCrew, eventId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [submitting, setSubmitting] = useState(false);

  const userId = useMemo(() => user?._id, [user]);

  useEffect(() => {
    const loadEvent = async () => {
      if (!idCrew) return;
      setLoading(true);
      setError("");

      try {
        const data = await getCrewEvents(idCrew);
        const foundEvent = data.events?.find((e) => e._id === eventId);
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

  const handleDelete = async () => {
    if (!userId || !window.confirm("¿Eliminar este evento?")) return;

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
        {isEditing ? (
          <form className={styles.eventForm} onSubmit={handleEditSubmit}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Editar evento</h2>
                <p>Modifica los datos del evento.</p>
              </div>

              <div className={styles.field}>
                <label htmlFor="edit-title">Título</label>
                <input
                  id="edit-title"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="edit-date">Fecha y hora</label>
                  <input
                    id="edit-date"
                    type="datetime-local"
                    name="date"
                    value={editForm.date}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="edit-location">Lugar</label>
                  <input
                    id="edit-location"
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="edit-description">Descripción</label>
                <textarea
                  id="edit-description"
                  name="description"
                  rows={4}
                  value={editForm.description}
                  onChange={handleEditChange}
                />
              </div>
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
                onClick={handleDelete}
                disabled={submitting}
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
