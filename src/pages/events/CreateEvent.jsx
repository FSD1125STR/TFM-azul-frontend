import { useContext, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../hooks/context/AuthContext.jsx";
import { CrewContext } from "../../hooks/context/CrewContext";
import { createCrewEvent } from "../../services/events.js";
import styles from "./events.module.css";

const initialForm = {
  title: "",
  date: "",
  description: "",
  location: "",
};

export default function CreateEvent() {
  const { crew } = useContext(CrewContext);
  const { idCrew } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const userId = useMemo(() => user?._id, [user]);
  const crewName = crew?.name || "la crew";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idCrew || !userId) return;

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
      await createCrewEvent(idCrew, payload);
      navigate(`/crews/${idCrew}/events`);
    } catch (err) {
      setError(err.message || "No se pudo crear el evento");
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Nuevo evento</h1>
          <p className={styles.subtitle}>
            Completa la información del nuevo evento para {crewName}.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <form className={styles.eventForm} onSubmit={handleSubmit}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Información básica</h2>
              <p>
                Define el título, la fecha y los datos principales del evento.
              </p>
            </div>

            <div className={styles.field}>
              <label htmlFor="event-title">Título</label>
              <input
                id="event-title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ej. Entreno del sábado"
                required
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="event-date">Fecha y hora</label>
                <input
                  id="event-date"
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="event-location">Lugar</label>
                <input
                  id="event-location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ej. Parque Central"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="event-description">Descripción</label>
              <textarea
                id="event-description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe los detalles importantes del evento"
              />
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => navigate(`/crews/${idCrew}/events`)}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button className={styles.primaryButton} disabled={submitting}>
              Crear evento
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
