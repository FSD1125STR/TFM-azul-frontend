import { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../hooks/context/AuthContext.jsx";
import {
  createEvent,
  createCrewEvent,
  deleteEvent,
  getCrewEvents,
  getMyEvents,
  updateEvent,
} from "../../services/events.js";
import styles from "./events.module.css";

const initialForm = {
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

export default function Events() {
  const { crewId } = useParams();
  const { user } = useContext(AuthContext);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(initialForm);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const userId = useMemo(() => user?._id, [user]);

  const loadEvents = async () => {
    if (!crewId && !userId) return;
    setLoading(true);
    setError("");

    try {
      const data = crewId ? await getCrewEvents(crewId) : await getMyEvents(userId);
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message || "Error al cargar eventos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [crewId, userId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingEvent(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userId) return;

    setSubmitting(true);
    setError("");

    const payload = {
      title: formData.title.trim(),
      date: formData.date ? new Date(formData.date).toISOString() : "",
      description: formData.description.trim(),
      location: formData.location.trim(),
      createdBy: userId,
    };

    try {
      if (editingEvent) {
        const data = await updateEvent(editingEvent._id, {
          ...payload,
          userId,
        });
        setEvents((prev) =>
          prev.map((item) =>
            item._id === editingEvent._id ? data.event : item,
          ),
        );
      } else {
        const data = crewId
          ? await createCrewEvent(crewId, payload)
          : await createEvent(payload);
        setEvents((prev) => [data.event, ...prev]);
      }
      resetForm();
    } catch (err) {
      setError(err.message || "No se pudo guardar el evento");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
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
          <p className={styles.kicker}>Crew Events</p>
          <h1 className={styles.title}>Agenda de la crew</h1>
          <p className={styles.subtitle}>
            Crea, ajusta y elimina eventos sin salir de la vista principal.
          </p>
        </div>
      </header>

      <div className={styles.layout}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <h2>{editingEvent ? "Editar evento" : "Nuevo evento"}</h2>
            {editingEvent && (
              <button
                type="button"
                className={styles.ghostButton}
                onClick={resetForm}
                disabled={submitting}
              >
                Cancelar
              </button>
            )}
          </div>

          <label className={styles.label}>
            Titulo
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Entreno del sabado"
              required
            />
          </label>

          <label className={styles.label}>
            Fecha y hora
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </label>

          <label className={styles.label}>
            Lugar
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Parque Central"
            />
          </label>

          <label className={styles.label}>
            Descripcion
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detalles importantes del evento"
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.primaryButton} disabled={submitting}>
            {editingEvent ? "Guardar cambios" : "Crear evento"}
          </button>
        </form>

        <div className={styles.list}>
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

          {loading ? (
            <p className={styles.empty}>Cargando eventos...</p>
          ) : events.length === 0 ? (
            <p className={styles.empty}>No hay eventos todavia.</p>
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
        </div>
      </div>
    </section>
  );
}
