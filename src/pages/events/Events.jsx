import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../hooks/context/AuthContext.jsx";
import { getMyEvents } from "../../services/events.js";
import EventCard from "./components/EventCard.jsx";
import EventFilters from "./components/EventFilters.jsx";
import styles from "./Events.module.css";

export default function Events() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [timeFilter, setTimeFilter] = useState("all");
    const userId = useMemo(() => user?._id, [user]);

    const filteredEvents = useMemo(() => {
        const now = Date.now();
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return events.filter((event) => {
            const eventDate = new Date(event.date).getTime();
            const matchesSearch =
                !normalizedSearch ||
                event.title?.toLowerCase().includes(normalizedSearch) ||
                event.description?.toLowerCase().includes(normalizedSearch) ||
                event.location?.toLowerCase().includes(normalizedSearch);

            const matchesTime =
                timeFilter === "all" ||
                (timeFilter === "upcoming" && eventDate >= now) ||
                (timeFilter === "past" && eventDate < now);

            return matchesSearch && matchesTime;
        });
    }, [events, searchTerm, timeFilter]);

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
                    <h1 className={styles.title}>Eventos totales</h1>
                    <p className={styles.subtitle}>
                        Vista general de todos tus eventos (solo lectura).
                    </p>
                </div>
            </header>

            <div className={styles.content}>
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

                    <EventFilters
                        search={searchTerm}
                        onSearchChange={setSearchTerm}
                        timeFilter={timeFilter}
                        onTimeFilterChange={setTimeFilter}
                    />

                    {error && <p className={styles.error}>{error}</p>}

                    {loading ? (
                        <p className={styles.empty}>Cargando eventos...</p>
                    ) : events.length === 0 ? (
                        <p className={styles.empty}>No hay eventos todavía.</p>
                    ) : filteredEvents.length === 0 ? (
                        <p className={styles.empty}>
                            No hay eventos que coincidan con los filtros.
                        </p>
                    ) : (
                        <div className={styles.list}>
                            {filteredEvents.map((event) => (
                                <EventCard
                                    key={event._id}
                                    event={event}
                                    crewName={event.crew?.name}
                                    onClick={() =>
                                        navigate(
                                            `/crews/${event.crew?._id}/events/${event._id}`,
                                        )
                                    }
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </section>
    );
}
