import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./MyCrews.module.css";
import { ACTIVITY_OPTIONS } from "./constants/crewActivities.js";

// Componentes visuales
import CrewCard from "./components/CrewCard.jsx";
import CrewFilters from "./components/CrewFilters.jsx";
import CrewToast from "./components/CrewToast.jsx";

// Servicios de API
import { getCrews } from "../../services/apiCrews.js";

// Página principal de gestión de crews del usuario. Aquí se listan todas las crews del usuario
export default function MyCrews() {
    const navigate = useNavigate();
    const [crews, setCrews] = useState([]);
    const [search, setSearch] = useState("");
    const [activityFilter, setActivityFilter] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Use Effect para solicitar al backend las crews 
    useEffect(() => {
        let isMounted = true;

        const fetchCrews = async () => {
            try {
                setLoading(true);

                // Llamada a getCrews por api wrapper de crews
                const data = await getCrews();

                if (isMounted) {
                    setCrews(data);
                    setError("");
                }

            } catch (err) {
                if (isMounted) {
                    setError(err.message || "No se pudieron cargar las crews.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchCrews();
        return () => {
            isMounted = false;
        };
    }, []);

    // Guarda en memoria las crews filtradas, solo se ejecuta la funcion cuando cambian sus dependencias (filtros, busqueda o las crews)
    const filteredCrews = useMemo(() => {
        return crews
            .filter(Boolean)
            .filter((crew) => {
                const matchSearch = crew.name
                    ?.toLowerCase()
                    .includes(search.toLowerCase());
                const matchActivity = activityFilter
                    ? crew.activity === activityFilter
                    : true;
                const matchRole = roleFilter
                    ? crew.userRolePermission === roleFilter
                    : true;
                return matchSearch && matchActivity && matchRole;
            });
    }, [activityFilter, crews, roleFilter, search]);

    const handleViewCrew = (crew) => {
        navigate(`/crews/${crew._id}`);
    };

    return (
        <>
            {/* Pagina principal de Crews del usuario */}
            <div className={styles.page}>
                {/* Toast para mostrar un error */}
                <CrewToast
                    message={error}
                    type="error"
                    onClose={() => setError("")}
                />
                
                {/* Seccion principal de contenido */}
                <div className={styles.container}>
                    {/* Header con titulo, subtitulo y boton para crear crew */}
                    <header className={styles.header}>
                        <div>
                            <h1 className={styles.title}>Mis crews</h1>
                            <p className={styles.subtitle}>Gestiona y crea tus propias crews para organizar a tu gente.</p>
                        </div>
                        <Link to="/crews/create" className={styles.primaryButton}>
                            Crear crew
                        </Link>
                    </header>

                    {/* Sección para manejar los filtos con su propio componente y estados */}
                    <CrewFilters
                        search={search}
                        onSearchChange={setSearch}
                        activity={activityFilter}
                        onActivityChange={setActivityFilter}
                        role={roleFilter}
                        onRoleChange={setRoleFilter}
                        activities={ACTIVITY_OPTIONS}
                    />

                    {/* Renderizado condicional por si tardase en responder el servidor */}
                    {loading && (
                        <div className={styles.state}>Cargando crews...</div>
                    )}

                    {/* Texto por si no hay crews */}
                    {!loading && filteredCrews.length === 0 && (
                        <div className={styles.emptyState}>
                            <h3>No hay crews disponibles</h3>
                            <p>Prueba a ajustar los filtros o crea una nueva crew.</p>
                            <Link to="/crews/create" className={styles.secondaryButton}>Crear crew</Link>
                        </div>
                    )}

                    {/* Listar las crews*/}
                    {!loading && filteredCrews.length > 0 && (
                        <div className={styles.grid}>
                            {/* Mapeamos las crews en el componente Crew Card */}
                            {filteredCrews.map((crew) => (
                                <CrewCard key={crew._id} crew={crew} onView={handleViewCrew} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
