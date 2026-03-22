import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button.jsx";
import { CrewContext } from "../../hooks/context/CrewContext";
import { getCrewEvents } from "../../services/events.js";
import EventCard from "./components/EventCard.jsx";
import EventFilters from "./components/EventFilters.jsx";
import styles from "./crewEvents.module.css";

export default function CrewEvents() {
    const { crew } = useContext(CrewContext);
    const { idCrew } = useParams();
    const navigate = useNavigate();
    const canManageCrew = crew?.userRole?.permission === "admin";

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [timeFilter, setTimeFilter] = useState("all");
    const crewName = crew?.name || "la crew";

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
        if (!idCrew) return;
        setLoading(true);
        setError("");

        try {
            const data = await getCrewEvents(idCrew);
            setEvents(data || []);
        } catch (err) {
            setError(err.message || "Error al cargar eventos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, [idCrew]);

    return (
        <section className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Eventos de {crewName}</h1>
                    <p className={styles.subtitle}>
                        Gestiona los eventos asociados a esta crew.
                    </p>
                </div>
                {/**Solo los admins pueden crear eventos */}
                {canManageCrew && (
                    <Button
                        className={styles.headerButton}
                        onClick={() => navigate(`/crews/${idCrew}/events/create`)}
                    >
                        Crear evento
                    </Button>
                )}
            </header>

            <div className={styles.content}>
                <section className={styles.section}>

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
                                    onClick={() =>
                                        navigate(`/crews/${idCrew}/events/${event._id}`)
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
