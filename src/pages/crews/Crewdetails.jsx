import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CrewForm from "./components/CrewForm.jsx";
import CrewToast from "./components/CrewToast.jsx";
import styles from "./CrewDetails.module.css";
import {
    ACTIVITY_STYLES,
    DEFAULT_ACTIVITY_STYLE,
} from "./constants/crewActivities.js";
import {
    deleteCrew,
    getCrewImageUrl,
    updateCrew,
    leaveCrew
} from "../../services/apiCrews.js";
import { CrewContext } from "../../hooks/context/CrewContext.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { IconUserCircle, IconUsersGroup  } from "@tabler/icons-react";
// Widgets de resumen — todos props-driven, sin dependencia de contexto
import CalendarWidget from "../events/components/CalendarWidget.jsx";
import ActivityWidget from "../../components/common/ActivityWidget.jsx";
import EventsWidget from "../events/components/EventsWidget.jsx";
import PollsWidget from "../polls/components/PollsWidget.jsx";
// Servicios de datos
import { getCrewEvents } from "../../services/events.js";
import { getCrewPolls } from "../../services/apiPolls.js";
import { useNotifications } from "../../hooks/useNotifications.js";

export default function CrewDetails() {
    //Extraemos toda la info de la crew a partir del context
    const { crew, crewId, setCrew, loading, error } = useContext(CrewContext);
    const navigate = useNavigate();
    const [notification, setNotification] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    // ── Datos de eventos y encuestas ──────────────────────────────────────────
    // Un único fetch sirve a CalendarWidget (todos los eventos) y a EventsWidget
    // (eventos próximos filtrados), eliminando la petición duplicada que hacía CrewCalendar.
    const [events, setEvents] = useState([]);
    const [polls, setPolls] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true); // para el estado de carga del calendario

    // Filtramos eventos futuros (max 3) y encuestas activas (max 3) para los widgets de resumen
    const upcomingEvents = useMemo(() => {
        const now = new Date();
        return events
            .filter((e) => new Date(e.date) >= now)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3);
    }, [events]);

    const activePolls = useMemo(() => {
        return polls.filter((p) => p.isActive).slice(0, 3);
    }, [polls]);

    // Cargamos eventos y encuestas en paralelo al montar o cambiar de crew
    useEffect(() => {
        if (!crewId) return;
        setEventsLoading(true);

        Promise.all([getCrewEvents(crewId), getCrewPolls(crewId)])
            .then(([e, p]) => {
                setEvents(Array.isArray(e) ? e : []);
                setPolls(Array.isArray(p) ? p : []);
            })
            .catch(() => {})
            .finally(() => setEventsLoading(false));
    }, [crewId]);

    // ── Notificaciones en tiempo real ─────────────────────────────────────────
    // useNotifications gestiona el fetch inicial + actualizaciones por WebSocket.
    // Se llama aquí (antes de los early returns) para cumplir las reglas de hooks,
    // y se pasa como props a ActivityWidget.
    const { notifications, loading: notifLoading, error: notifError } = useNotifications(crewId);
    

    const handleUpdate = async (payload) => {
        const updated = await updateCrew(crewId, payload);
        setCrew(updated);
        setIsEditing(false);
        setNotification({ type: "success", message: "Crew actualizada" });
    };



    //Maneja la accion al confirmar que se quiere eliminar la crew, confirmando con notificación
    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            //Eliminamos la crew llamando a la api (api wrapper)
            await deleteCrew(crewId);
            setNotification({ type: "success", message: "Crew eliminada" });
            setTimeout(() => navigate("/crews"), 1200);

        } catch (err) {
            setNotification({ type: "error", message: err.message || "No se pudo eliminar" });
            setIsDeleting(false);
        }
    };

    const handleLeaveCrew = async () => {
        try {
            setIsLeaving(true);
            const result = await leaveCrew(crewId);
            setNotification({
                type: "success",
                message: result?.reassignedAdminUserId
                    ? "Has abandonado la crew. Se asigno un nuevo administrador al azar."
                    : "Has abandonado la crew.",
            });
            setTimeout(() => navigate("/crews"), 1200);
        } catch (err) {
            setNotification({
                type: "error",
                message: err.message || "No se pudo abandonar la crew",
            });
            setIsLeaving(false);
        }
    };

    // Miembras este cargando, se devuelve un div informando de ello
    if (loading) {
        return <div className={styles.state}>Cargando crew...</div>;
    }

    // Si ocurre un error se renderiza por pantalla, con link para vovler al menu principal de crews (DEBERIAMOS CARGAR PAGINA 404 POR DEFECTO)
    if (error) {
        return (
            <div className={styles.state}>
                <p>{error}</p>
                <button type="button" onClick={() => navigate("/crews")} className={styles.primaryButton}>Volver a mis crews</button>
            </div>
        );
    }

    // Si no hay crew en parametros se devuelve nada
    if (!crew) {
        return null;
    }

    // Algunas variables necesarias para estructurar la info
    const colors = ACTIVITY_STYLES[crew.activity] || DEFAULT_ACTIVITY_STYLE;
    const coverImage = crew.imageUrl ? getCrewImageUrl(crew.imageUrl) : "";
    const subactivityLabel = crew.subactivity ?? "";
    const canManageCrew = crew.userRole?.permission === "admin";


    // Renderizamos el componente principal si no hay errores globales y si hay crew en los parametros
    return (
        <div className={styles.page}>
            {/* Si hay alguna notificacion renderizamos el toast */}
            {notification && (
                <CrewToast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            
            {/* Mostramos la modal para confirmar la eliminación, solo si showDeleteConfirm es true */}
            {showDeleteConfirm && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <h3>Eliminar crew</h3>
                        <p>Seguro que quieres eliminar <strong>{crew.name}</strong>? Esta acción no se puede deshacer.</p>
                        <div className={styles.modalActions}>
                            {/** Boton para cancelar - cambia el estado y se cierra la modal */}
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancelar
                            </button>

                            {/** Boton para confirmar la eliminacion */}
                            <button
                                type="button"
                                className={styles.dangerButton}
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {showLeaveConfirm && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <h3>Abandonar crew</h3>
                        <p>
                          Seguro que quieres abandonar <strong>{crew.name}</strong>? Si eres
                          el unico admin, se asignara uno nuevo al azar.
                        </p>
                        <div className={styles.modalActions}>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={() => setShowLeaveConfirm(false)}
                            >
                              Cancelar
                            </button>
                            <button
                                type="button"
                                className={styles.warningButton}
                                onClick={handleLeaveCrew}
                                disabled={isLeaving}
                            >
                                {isLeaving ? "Abandonando..." : "Sí, abandonar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Sección principal con la info de la crew */}
            <div className={styles.container}>
                {/* Si se esta editando se renderiza el formulario con los valores iniciales de la crew */}
                {isEditing ? (
                    <CrewForm
                        initialValues={crew}
                        crewId={crewId}
                        onSubmit={handleUpdate}
                        submitLabel="Guardar cambios"
                        onCancel={() => setIsEditing(false)}
                    />
                ) : (
                    //Si no se esta editando se muestra la info de la crew
                    <>
                        {/**Mostramos un header con la imagen y la actividad de la crew */}
                        <div
                            className={styles.hero}
                            style={{
                                background: coverImage
                                    ? `url(${coverImage}) center/cover`
                                    : `linear-gradient(135deg, ${colors.bg} 0%, #e0e0e0 100%)`,
                            }}
                        >
                            <div className={styles.tags}>
                                <span className={styles.activityTag} style={{ background: colors.dot }}>
                                    {crew.activity}
                                </span>
                                <span className={styles.subactivityTag}>{subactivityLabel}</span>
                            </div>
                        </div>

                        {/**Mostramos una card con la info de la crew */}
                        <div className={styles.info}>
                            {/**Header con nombre, descripcion y boton de editar y eliminar*/}
                            <div className={styles.cardHeader}>
                                <div>
                                    <h1>{crew.name}</h1>
                                    <p>{crew.description}</p>
                                </div>
                                <div className={styles.actions}>
                                    {canManageCrew && (
                                        <>
                                            <button
                                                type="button"
                                                className={styles.secondaryButton}
                                                onClick={() => setIsEditing(true)}
                                            >
                                            Editar
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.dangerButton}
                                                onClick={() => setShowDeleteConfirm(true)}
                                            >
                                            Eliminar
                                            </button>
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        className={styles.leaveButton}
                                        onClick={() => setShowLeaveConfirm(true)}
                                    >
                                        Abandonar
                                    </button>
                                </div>
                            </div>

                            {/**Mostramos footer de la card con info de la cuando se creo la crew */}
                            {crew.createdAt && (
                                <p className={styles.meta}>Creada el {new Date(crew.createdAt).toLocaleDateString("es-ES", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                                </p>
                            )}

                            {/**Mostramos infomacion adicional de la crew, miembros, eventos y tu rol */}
                            <div className={styles.stats}>
                                <div>
                                    <strong>{crew.memberships?.length || 0}</strong>
                                    <span>Miembros</span>
                                </div>
                                <span className={styles.separator}></span>
                                <div>
                                    <strong>{crew.events?.length || 0}</strong>
                                    <span>Eventos</span>
                                </div>
                                <span className={styles.separator}></span>
                                <div>
                                    <IconUserCircle stroke={1} />
                                    <strong>{crew.userRole?.name || "Member"}</strong>
                                </div>
                            </div>
                            
                            {/**Grid con calendario y actividad reciente.
                              * Ambos reciben datos del padre (props-driven) — sin fetches internos. */}
                            <div className={styles.mainInfo}>
                                {/* Calendario con todos los eventos de la crew */}
                                <CalendarWidget events={events} loading={eventsLoading} />

                                {/* Feed de actividad reciente con notificaciones en tiempo real */}
                                <ActivityWidget
                                    notifications={notifications}
                                    loading={notifLoading}
                                    error={notifError}
                                />
                            </div>

                            {/**Widgets de resumen: próximos eventos y encuestas activas */}
                            <div className={styles.widgets}>
                                <EventsWidget
                                    events={upcomingEvents}
                                    emptyMessage="No hay eventos próximos en esta crew."
                                />
                                <PollsWidget
                                    polls={activePolls}
                                    emptyMessage="No hay encuestas activas en esta crew."
                                />
                            </div>
                            
                            
                            
                        </div>


                    </>
                )}
            </div>
        </div>
    );
}