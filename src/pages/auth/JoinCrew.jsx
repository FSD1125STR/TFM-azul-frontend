import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./components/Header.jsx";
import styles from "./JoinCrew.module.css";
import CrewToast from "../crews/components/CrewToast.jsx";
import {
    ACTIVITY_STYLES,
    DEFAULT_ACTIVITY_STYLE,
} from "../crews/constants/crewActivities.js";
import { getCrewImageUrl } from "../../services/apiCrews.js";
import {
    joinCrewWithInvitation,
    validateInvitation,
} from "../../services/apiInvitations.js";

export default function JoinCrew() {
    //Extraemos el token de la URL
    const { token } = useParams();
    const navigate = useNavigate();

    // //Construimos el next query param y la función para redirigir al login con el next query param
    // const nextPath = token ? `/invite/${token}` : "/invite";
    // const redirectToLogin = useCallback(() => {
    //     navigate(`/login?next=${encodeURIComponent(nextPath)}`, { replace: true });
    // }, [navigate, nextPath]);

    const [loading, setLoading] = useState(true); //Para renderizar mientras carga la peticion
    const [error, setError] = useState(""); //Maneja errores globales
    const [invitation, setInvitation] = useState(null); //Datos de la invitacion (Crew)
    const [isJoining, setIsJoining] = useState(false);
    const [notification, setNotification] = useState(null);

    //Use effect para hacer peticion al back, que validará la invitación por si ha caducado o ha sido revocada
    useEffect(() => {
        let isMounted = true;

        const fetchInvitation = async () => {
            if (!token) {
                if (isMounted) {
                    setError("Token de invitacion invalido.");
                    setLoading(false);
                }
                return;
            }

            try {
                setLoading(true);
                setError("");

                //Hacemos la peticion al backend
                const data = await validateInvitation(token);
                if (isMounted) {
                    setInvitation(data);
                }

            } catch (err) {

                if (isMounted) {
                    setError(err.message || "No se pudo validar la invitacion.");
                }
                // //Si no esta autorizado redirigir al usuario
                // if (err?.status === 401) {
                //     redirectToLogin();
                // }

            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchInvitation();

        return () => {
            isMounted = false;
        };

    }, [token]);

    //Extraemos la crew de la invitación
    const crew = invitation?.crew ?? {};
    //Extraemos los estilos que tiene asignada la actividad de la crew
    const activityStyle = useMemo(
        () => ACTIVITY_STYLES[crew.activity] || DEFAULT_ACTIVITY_STYLE,
        [crew.activity],
    );
    //Extraemos la imagen de la crew
    const coverImage = crew?.imageUrl ? getCrewImageUrl(crew.imageUrl) : "";

    //Maneja el click para unirse
    const handleJoin = async () => {
        if (!token) return;
        try {
            setIsJoining(true);
            //Pedimos a la API 
            await joinCrewWithInvitation(token);

            //si no hay error, notificación exitosa y vamos a la crew
            setNotification({ type: "success", message: "Te has unido a la crew." });

            const crewId = crew?._id;
            setTimeout(() => {
                if (crewId) {
                    navigate(`/crews/${crewId}`);
                } else {
                    navigate("/crews");
                }
            }, 1200);

        } catch (err) {
            // //Si no esta autorizado redirigir al usuario
            // if (err?.status === 401) {
            //     redirectToLogin();
            //     return;
            // }
            setNotification({
                type: "error",
                message: err.message || "No se pudo unir a la crew.",
            });
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <main className={styles["join-page"]}>
            <Header />

            {/* Toast, solo se renderiza si hay alguna notificación */}
            {notification && (
                <CrewToast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            {/* Contenedor principal */}
            <div className={styles["join-content"]}>
                <div className={styles["join-container"]}>
                    <h1 className={styles.title}>Unete a una crew</h1>
                    <p className={styles.subtitle}>
                        Valida la invitacion y confirma tu acceso.
                    </p>

                    {loading && (
                        <div className={styles.state}>Cargando invitacion...</div>
                    )}
                    
                    {/* Si hay un error lo mostramos, si es un 401, renderizamos el login */}
                    {!loading && error && (
                        <div className={styles.state}>
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Si no hay error ni invitacion, mostramos estado de no encontrado */}
                    {!loading && !error && !invitation && (
                        <div className={styles.state}>
                            <p>La invitacion no existe o ha expirado.</p>
                        </div>
                    )}

                    {/* Si NO hay un error y hay invitacion la renderizamos */}
                    {!loading && !error && invitation && (
                        <article className={styles.card}>
                            <div
                                className={styles.cover}
                                style={{
                                    background: coverImage
                                        ? `url(${coverImage}) center/cover`
                                        : `linear-gradient(135deg, ${activityStyle.bg} 0%, #e0e0e0 100%)`,
                                }}
                            >
                                {crew?.activity && (
                                    <span
                                        className={styles.activityTag}
                                        style={{ background: activityStyle.dot }}
                                    >
                                        {crew.activity}
                                    </span>
                                )}
                                {crew?.subactivity && (
                                    <span className={styles.subactivityTag}>
                                        {crew.subactivity}
                                    </span>
                                )}
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.cardContent}>
                                    <h2>{crew?.name || "Crew"}</h2>
                                    <p>{crew?.description || "Sin descripcion disponible."}</p>
                                </div>

                                <div className={styles.cardActions}>
                                    <button
                                        type="button"
                                        className={styles.primaryButton}
                                        onClick={handleJoin}
                                        disabled={isJoining}
                                    >
                                        {isJoining ? "Uniendote..." : "Unirse"}
                                    </button>
                                </div>
                            </div>
                        </article>
                    )}
                </div>
            </div>
        </main>
    );
}
