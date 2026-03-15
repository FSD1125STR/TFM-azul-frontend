import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../hooks/context/AuthContext.jsx";
import { getMyEvents } from "../../services/events.js";
import styles from "./events.module.css";

export default function Events() {
  const { user } = useContext(AuthContext);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = useMemo(() => user?._id, [user]);

  const loadEvents = async () => {
    if (!userId) return;
    setLoading(true);
    setError("");

    try {
      const data = await getMyEvents(userId);
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message || "Error al cargar eventos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [userId]);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>All Events</p>
          <h1 className={styles.title}>Eventos totales</h1>
          <p className={styles.subtitle}>
            Vista general de todos tus eventos (solo lectura).
          </p>
        </div>
      </header>

      <div className={styles.layout}>
        <div className={`${styles.list} ${styles.fullWidth}`}>
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
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
