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

export default function CrewEvents() {
  const { crew } = useContext(CrewContext);
  const { idCrew } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [submitting, setSubmitting] = useState(false);

  const userId = useMemo(() => user?._id, [user]);
  const crewName = crew?.name || "la crew";

  const loadEvents = async () => {
    if (!idCrew) return;
    setLoading(true);
    setError("");

    try {
      const data = await getCrewEvents(idCrew);
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message || "Error al cargar eventos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [idCrew]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetEdit = () => {
    setEditingEvent(null);
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
      const data = await updateEvent(editingEvent._id, payload);
      setEvents((prev) =>
        prev.map((item) => (item._id === editingEvent._id ? data.event : item)),
      );
      resetEdit();
    } catch (err) {
      setError(err.message || "No se pudo guardar el evento");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setEditForm({
      title: event.title || "",
      date: formatDateInput(event.date),
      description: event.description || "",
      location: event.location || "",
    });
  };

  const handleDelete = async (eventId) => {
    if (!userId) return;
    setSubmitting(true);
    setError("");

    try {
      await deleteEvent(eventId, userId);
      setEvents((prev) => prev.filter((item) => item._id !== eventId));
    } catch (err) {
      setError(err.message || "No se pudo eliminar el evento");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Eventos de {crewName}</h1>
          <p className={styles.subtitle}>
            Gestiona los eventos asociados a esta crew.
          </p>
        </div>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => navigate(`/crews/${idCrew}/events/create`)}
        >
          Crear evento
        </button>
      </header>

      <div className={styles.content}>
        {editingEvent && (
          <form className={styles.eventForm} onSubmit={handleEditSubmit}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Editar evento</h2>
                <p>Modifica los datos del evento seleccionado.</p>
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
                onClick={resetEdit}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button className={styles.primaryButton} disabled={submitting}>
                Guardar cambios
              </button>
            </div>
          </form>
        )}

        <section className={styles.section}>
          <div className={styles.listHeader}>
            <h2>Eventos programados</h2>
            <button
              type="button"
              className={styles.ghostButton}
              onClick={loadEvents}
              disabled={loading}
            >
              Actualizar
            </button>
          </div>

          {!editingEvent && error && <p className={styles.error}>{error}</p>}

          {loading ? (
            <p className={styles.empty}>Cargando eventos...</p>
          ) : events.length === 0 ? (
            <p className={styles.empty}>No hay eventos todavía.</p>
          ) : (
            <div className={styles.grid}>
              {events.map((event) => (
                <article key={event._id} className={styles.card}>
                  <div>
                    <p className={styles.date}>
                      {new Date(event.date).toLocaleString()}
                    </p>
                    <h3>{event.title}</h3>
                    {event.location && (
                      <p className={styles.meta}>{event.location}</p>
                    )}
                    {event.description && (
                      <p className={styles.description}>{event.description}</p>
                    )}
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => handleEdit(event)}
                      disabled={submitting}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={styles.dangerButton}
                      onClick={() => handleDelete(event._id)}
                      disabled={submitting}
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
