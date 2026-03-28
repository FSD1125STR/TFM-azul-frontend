import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../hooks/context/AuthContext.jsx";
import { getMyEvents } from "../../services/events.js";
import EventCalendar from "../../components/common/EventCalendar.jsx";
import EventCard from "./components/EventCard.jsx";
import EventFilters from "./components/EventFilters.jsx";
import styles from "./events.module.css";

export default function Events() {
    //Recuperamos el usuario logeado
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    //Estados
    const [events, setEvents] = useState([]); //Lista de eventos del usuario
    const [loading, setLoading] = useState(false); //Renderizar loading
    const [error, setError] = useState(""); //Muestra error
    const [searchTerm, setSearchTerm] = useState(""); //Busqueda de texto
    const [timeFilter, setTimeFilter] = useState("all"); //Filtro de tiempo

    //Guarda el userId
    const userId = useMemo(() => user?._id, [user]);

    //Devuelve los eventos filtrados, SOLOS E CALCULA SI CAMBIAN LOS EVENTOS O ALGUNO DE LOS FILTROS
    const filteredEvents = useMemo(() => {
        //Guardamos la fecha actual y normalizamos la busqueda (eliminando espacios en los extremos y pasando todo a minusculas)
        const now = Date.now();
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return events.filter((event) => {
            //Extraemos la fecha del evento
            const eventDate = new Date(event.date).getTime();

            //Comprobamos si el campo de busqueda está en alguno de los campos (titulo, descripcion y localización)
            const matchesSearch =
                !normalizedSearch ||
                event.title?.toLowerCase().includes(normalizedSearch) ||
                event.description?.toLowerCase().includes(normalizedSearch) ||
                event.location?.toLowerCase().includes(normalizedSearch);

            //Comprobamos si la fecha del evento cuadra con el filtro de fecha
            const matchesTime =
                timeFilter === "all" ||
                (timeFilter === "upcoming" && eventDate >= now) ||
                (timeFilter === "past" && eventDate < now);

            //Si los dos son true, pasa el filtro
            return matchesSearch && matchesTime;
        });

    }, [events, searchTerm, timeFilter]);


    //Carga los eventos del usuario
    useEffect(() => {
        if (!userId) return;

        const fetchEvents = async () => {
            setLoading(true);
            setError("");
            try {
                //Solicitamos los eventos del usuario y guardamos en el state
                const data = await getMyEvents(userId);
                setEvents(data.events || []);
            } catch (err) {
                setError(err.message || "Error al cargar eventos");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [userId]);


    return (
        <section className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Mis eventos</h1>
                    <p className={styles.subtitle}>
                        Vista general de todos tus eventos.
                    </p>
                </div>
            </header>

            {/**Layout de dos columnas: calendario a la izquierda, lista a la derecha */}
            <div className={styles.content}>

                {/**Columna izquierda: calendario con todos los eventos (sin filtrar) */}
                <div className={styles.calendarSection}>
                    <EventCalendar
                        events={events}
                        loading={loading}
                        onEventClick={(event) =>
                            navigate(`/crews/${event.crew?._id}/events/${event._id}`)
                        }
                    />
                </div>

                {/**Columna derecha: filtros y lista de eventos */}
                <section className={styles.section}>

                    <EventFilters
                        search={searchTerm} //Se le pasa el parametro que se esta buscando para rellenar el input
                        onSearchChange={setSearchTerm} //Setter para cambiar el texto de búsqueda
                        timeFilter={timeFilter} //Permite saber el filtro de tiempo aplicado
                        onTimeFilterChange={setTimeFilter} //Permite cambiar el filtro de tiempo
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
