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
    const [searchTerm, setSearchTerm] = useState("");
    const [timeFilter, setTimeFilter] = useState("all");
    const [locationFilter, setLocationFilter] = useState("all");

    const userId = useMemo(() => user?._id, [user]);
    const crewName = crew?.name || "la crew";

    const filteredEvents = useMemo(() => {
        const now = Date.now();
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return events.filter((event) => {
            const eventDate = new Date(event.date).getTime();
            const hasLocation = Boolean(event.location?.trim());
            const matchesSearch =
        !normalizedSearch ||
        event.title?.toLowerCase().includes(normalizedSearch) ||
        event.description?.toLowerCase().includes(normalizedSearch) ||
        event.location?.toLowerCase().includes(normalizedSearch);

            const matchesTime =
        timeFilter === "all" ||
        (timeFilter === "upcoming" && eventDate >= now) ||
        (timeFilter === "past" && eventDate < now);

            const matchesLocation =
        locationFilter === "all" ||
        (locationFilter === "with-location" && hasLocation) ||
        (locationFilter === "without-location" && !hasLocation);

            return matchesSearch && matchesTime && matchesLocation;
        });
    }, [events, searchTerm, timeFilter, locationFilter]);

    const formatEventDateParts = (value) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return {
                day: "--",
                month: "---",
                time: "--:--",
                fullDate: "Fecha no disponible",
            };
        }

        return {
            day: date.toLocaleDateString("es-ES", { day: "2-digit" }),
            month: date
                .toLocaleDateString("es-ES", { month: "short" })
                .replace(".", "")
                .toUpperCase(),
            time: date.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            fullDate: date.toLocaleDateString("es-ES", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
            }),
        };
    };

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

                {!editingEvent && (
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

                        <div className={styles.filters}>
                            <div className={styles.filterField}>
                                <label htmlFor="event-search">Buscar</label>
                                <input
                                    id="event-search"
                                    type="search"
                                    placeholder="Buscar evento..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className={styles.filterField}>
                                <label htmlFor="event-time-filter">Fecha</label>
                                <select
                                    id="event-time-filter"
                                    value={timeFilter}
                                    onChange={(e) => setTimeFilter(e.target.value)}
                                >
                                    <option value="all">Todas</option>
                                    <option value="upcoming">Proximas</option>
                                    <option value="past">Pasadas</option>
                                </select>
                            </div>

                            <div className={styles.filterField}>
                                <label htmlFor="event-location-filter">Lugar</label>
                                <select
                                    id="event-location-filter"
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                >
                                    <option value="all">Todos</option>
                                    <option value="with-location">Con lugar</option>
                                    <option value="without-location">Sin lugar</option>
                                </select>
                            </div>
                        </div>

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
                            <div className={styles.grid}>
                                {filteredEvents.map((event) => {
                                    const eventDate = formatEventDateParts(event.date);

                                    return (
                                        <article key={event._id} className={styles.card}>
                                            <div className={styles.cardBadges}>
                                                <span className={styles.datePill}>
                                                    {eventDate.day} {eventDate.month}
                                                </span>
                                                <span className={styles.timePill}>
                                                    {eventDate.time}
                                                </span>
                                            </div>

                                            <div className={styles.cardContent}>
                                                <h3>{event.title}</h3>
                                                {event.location && (
                                                    <p className={styles.meta}>{event.location}</p>
                                                )}
                                                {event.description && (
                                                    <p className={styles.description}>
                                                        {event.description}
                                                    </p>
                                                )}
                                                <p className={styles.dateLabel}>{eventDate.fullDate}</p>
                                            </div>

                                            <div className={styles.cardFooter}>
                                                <button
                                                    type="button"
                                                    className={styles.cardActionPrimary}
                                                    onClick={() =>
                                                        navigate(`/crews/${idCrew}/events/${event._id}`)
                                                    }
                                                    disabled={submitting}
                                                >
                          Detalles
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </section>
    );
}
