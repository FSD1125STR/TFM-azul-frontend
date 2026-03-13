import { useContext, useState } from "react";
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
} from "../../services/apiCrews.js";
import { CrewContext } from "../../hooks/context/CrewContext.jsx";
import { Container } from "../../components/ui/Container.jsx";
import { Button } from "../../components/ui/Button.jsx";


export default function CrewDetails() {
    //Extraemos toda la info de la crew a partir del context
    const { crew, crewId, setCrew, loading, error } = useContext(CrewContext);
    const navigate = useNavigate();
    const [notification, setNotification] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    

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

            {/* Sección principal con la info de la crew */}
            <div className={styles.container}>
                {/* Boton para volver atrás */}
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => (isEditing ? setIsEditing(false) : navigate("/crews"))}
                >
                    {isEditing ? "Volver a detalles" : "Volver a mis crews"}
                </button>

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
                        <div className={styles.card}>
                            {/**Header con nombre, descripcion y boton de editar y eliminar*/}
                            <div className={styles.cardHeader}>
                                <div>
                                    <h1>{crew.name}</h1>
                                    <p>{crew.description}</p>
                                </div>
                                {canManageCrew && (
                                    <div className={styles.actions}>
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
                                    </div>
                                )}
                            </div>

                            {/**Mostramos infomacion adicional de la crew, miembros, eventos y tu rol */}
                            <div className={styles.stats}>
                                <div>
                                    <strong>{crew.members?.length || 0}</strong>
                                    <span>Miembros</span>
                                </div>
                                <div>
                                    <strong>{crew.events || 0}</strong>
                                    <span>Eventos</span>
                                </div>
                                <div>
                                    <strong>{crew.userRole?.name || "Member"}</strong>
                                    <span>Tu rol</span>
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
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
