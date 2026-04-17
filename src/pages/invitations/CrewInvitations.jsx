import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CrewContext } from "../../hooks/context/CrewContext.jsx";
import CrewToast from "../crews/components/CrewToast.jsx";
import styles from "./CrewInvitations.module.css";
import {
    createInvitation,
    getLatestInvitation,
    sendInvitationEmail,
    updateInvitationStatus,
} from "../../services/apiInvitations.js";

//Cosntruye el link a partir del token de la innvitación y teniendo en cuenta el host actual
const buildInvitationUrl = (token) => {
    if (!token) return "";
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/invite/${token}`;
};

export default function CrewInvitations() {
    //Obtenemos info de la crew a partir del contexto
    const {
        crew,
        crewId,
        loading: crewLoading,
        error: crewError,
    } = useContext(CrewContext);
    const navigate = useNavigate();

    const [invitation, setInvitation] = useState(null); //Estado de la invitacion
    const [loading, setLoading] = useState(true); //Para renderizar mientras carga la peticion
    const [error, setError] = useState(""); //Para renderizar errores
    const [isEmpty, setIsEmpty] = useState(false); //Para diferenciar error cuando no hay invitaciones
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [email, setEmail] = useState("");
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [notification, setNotification] = useState(null); //Para mostrar una notificacion Toast

    // Al cargar la pagina, solicitamos al backend la ultima invitacióncreada en esa crew
    useEffect(() => {
        let isMounted = true;

        const fetchLatest = async () => {
            if (!crewId) return;

            try {
                setLoading(true);
                setError("");
                setIsEmpty(false);

                //Llamamos a la API
                const latest = await getLatestInvitation(crewId);
                if (isMounted) {
                    setInvitation(latest); //Actualizamos el estado con la ultima invitacion
                }
            } catch (err) {
                //Manejamos diferentes tipos de errores
                if (!isMounted) return;

                //Si no existe invitaciones cambiamos el estado Empty
                if (err.status === 404) {
                    setInvitation(null);
                    setIsEmpty(true);
                } else {
                    setError(err.message || "No se pudo cargar la invitacion.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchLatest();

        return () => {
            isMounted = false;
        };
    }, [crewId]);

    //Generamos un link con el token de la invitacion, solo se calcula si cambia el token
    const invitationUrl = useMemo(() => {
        return buildInvitationUrl(invitation?.token);
    }, [invitation?.token]);

    //Maneja la acción para crear una nueva invitacion
    const handleCreate = async () => {
        if (!crewId) return;

        try {
            setIsCreating(true);

            //Llamamos a la API para crear una nueva invitación
            const created = await createInvitation(crewId);
            setInvitation(created); //Actualizamos el estado con la nueva invitación
            setIsEmpty(false);

            const url = buildInvitationUrl(created?.token);

            //Al crear la invitacion se copia automaticamente el link
            if (url && navigator.clipboard?.writeText) {
                try {
                    //Copiamos el link en el portapapeles
                    await navigator.clipboard.writeText(url);
                    //Generamos notificacion
                    setNotification({
                        type: "success",
                        message: "Invitacion creada y enlace copiado.",
                    });
                } catch (copyError) {
                    console.log("Error al copiar en portapapeles: ", copyError);
                    setNotification({
                        type: "error",
                        message: "Invitacion creada, pero no se pudo copiar el enlace.",
                    });
                }
            } else {
                //Si no se puede copiar porque no está habilitada la opcion, simplemente notificamos que se creo la invitacion
                setNotification({
                    type: "success",
                    message: "Invitacion creada correctamente.",
                });
            }
        } catch (err) {
            //Si hay error notificamos con Toast
            setNotification({
                type: "error",
                message: err.message || "No se pudo crear la invitacion.",
            });
        } finally {
            setIsCreating(false);
        }
    };

    //Maneja la acción para desativar la invitación
    const handleDeactivate = async () => {
        if (!invitation?._id) return;

        try {
            setIsUpdating(true);

            //Llama a la API para actualizar el estado a False
            const updated = await updateInvitationStatus(invitation._id, invitation.crew._id, false);
            setInvitation(updated); //Actualizamos el estado con la nueva invitacion
            //Generamos notificacion Toast
            setNotification({
                type: "success",
                message: "Invitacion desactivada.",
            });
        } catch (err) {
            setNotification({
                type: "error",
                message: err.message || "No se pudo desactivar la invitacion.",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    //Maneja la accion para copiar el link en el portapapeles
    const handleCopy = async () => {
        if (!invitationUrl) return;

        //Comprobamos que el navegador soporte la acción
        if (!navigator?.clipboard?.writeText) {
            setNotification({
                type: "error",
                message: "No se puede copiar el enlace en este navegador.",
            });
            return;
        }

        //Intentamos copiar el link en el portapapeles
        try {
            await navigator.clipboard.writeText(invitationUrl);
            setNotification({
                type: "success",
                message: "Enlace copiado al portapapeles.",
            });
        } catch (copyError) {
            console.log("Error al copiar en portapapeles: ", copyError);
            setNotification({
                type: "error",
                message: "No se pudo copiar el enlace.",
            });
        }
    };

    const handleToggleEmailForm = () => {
        setShowEmailForm((prev) => !prev);
        setEmail("");
    };

    //Maneja la accion para enviar la invitacion por email
    const handleSendEmail = async () => {
        if (!crewId) return;

        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) {
            setNotification({
                type: "error",
                message: "Introduce un email.",
            });
            return;
        }

        try {
            setIsSendingEmail(true);

            //Llamamos a la API para enviar la invitacion por email
            await sendInvitationEmail(crewId, normalizedEmail);
            setNotification({
                type: "success",
                message: `Invitacion enviada a ${normalizedEmail}.`,
            });
            setEmail("");
            setShowEmailForm(false);

        } catch (err) {
            setNotification({
                type: "error",
                message: err.message || "No se pudo enviar la invitacion por email.",
            });
            
        } finally {
            setIsSendingEmail(false);
        }
    };

    // Si esta cargando la crew
    if (crewLoading || loading) {
        return <div className={styles.state}>Cargando invitaciones...</div>;
    }

    // Si hay algun error, renderizar botón de volver
    if (crewError || error) {
        return (
            <div className={styles.state}>
                <p>{crewError || error}</p>
                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => navigate("/crews")}
                >
          Volver a mis crews
                </button>
            </div>
        );
    }

    //Si no hya crew
    if (!crew) return null;

    //Componente principal
    return (
        <div className={styles.page}>
            {/**Toast, solo se muestra si hay alguna notificacion */}
            {notification && (
                <CrewToast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className={styles.container}>
                {/** Sección de invitaciones */}
                <header className={styles.header}>
                    <h1>Invitaciones</h1>
                    <p>Genera un enlace para invitar nuevos miembros a tu crew.</p>
                </header>

                <section className={styles.card}>
                    {/* si no hay invitaciones, renderizar boton para crear una invitacion */}
                    {isEmpty ? (
                        <div className={styles.empty}>
                            <h2>Aun no hay invitaciones</h2>
                            <p>Genera una invitacion para compartir el enlace.</p>
                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={handleCreate}
                                disabled={isCreating}
                            >
                                {isCreating ? "Generando..." : "Generar invitacion"}
                            </button>
                        </div>
                    ) : (
                    //Si hay invitaciones (solo puede haber una), renderizamos la invitacion actual con opcion a cambiar el estado y a crear una nueva
                        <>
                            <div className={styles.cardHeader}>
                                {/* Header con info de la invitacion y boton para crear una nueva */}
                                <div className={styles.cardTitleBlock}>
                                    <h2>Invitacion actual</h2>
                                    <div className={styles.metaRow}>
                                        <span className={styles.metaLabel}>Estado:</span>
                                        <span
                                            className={`${styles.status} ${
                                                invitation?.isActive
                                                    ? styles.statusActive
                                                    : styles.statusInactive
                                            }`}
                                        >
                                            {invitation?.isActive ? "Activa" : "Desactivada"}
                                        </span>
                                        {invitation?.createdAt && (
                                            <span className={styles.metaDot}>
                        Creada:{" "}
                                                {new Date(invitation.createdAt).toLocaleDateString(
                                                    "es-ES",
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Boton para generar una nueva invitación */}
                                <div className={styles.cardHeaderActions}>
                                    <button
                                        type="button"
                                        className={styles.primaryButton}
                                        onClick={handleCreate}
                                        disabled={isCreating}
                                    >
                                        {isCreating ? "Generando..." : "Generar nueva"}
                                    </button>
                                </div>
                            </div>

                            <p className={styles.helperText}>
                                La anterior se desactivara si generas una nueva.
                            </p>

                            <div className={styles.divider} />

                            {/* Body con el link de la invitación */}
                            <div className={styles.section}>
                                <h3>Enlace de invitacion</h3>
                                <div className={styles.linkRow}>
                                    <input
                                        className={styles.linkInput}
                                        value={invitationUrl}
                                        readOnly
                                    />
                                    {/* Boton para copiar enlace */}
                                    <button
                                        type="button"
                                        className={styles.copyButton}
                                        onClick={handleCopy}
                                        disabled={!invitationUrl}
                                    >
                                        <span className={styles.copyIcon} aria-hidden="true">
                                            <svg
                                                viewBox="0 0 24 24"
                                                width="18"
                                                height="18"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <rect x="9" y="9" width="13" height="13" rx="2" />
                                                <rect x="2" y="2" width="13" height="13" rx="2" />
                                            </svg>
                                        </span>
                                      Copiar
                                    </button>
                                </div>
                            </div>

                            {/* footer con boton para desactivar la invitación */}
                            <div className={styles.bottomRow}>
                                <p className={styles.helperText}>
                                  Comparte este enlace para invitar nuevos miembros.
                                </p>

                                <div className={styles.bottomActions}>
                                    <button
                                        type="button"
                                        className={styles.emailOutlineButton}
                                        onClick={handleToggleEmailForm}
                                        disabled={!invitation?.isActive || isSendingEmail}
                                    >
                                      Enviar por email
                                    </button>

                                    <button
                                        type="button"
                                        className={styles.dangerOutlineButton}
                                        onClick={handleDeactivate}
                                        disabled={isUpdating || !invitation?.isActive}
                                    >
                                        {isUpdating ? "Desactivando..." : "Desactivar invitacion"}
                                    </button>
                                </div>
                            </div>

                            {showEmailForm && (
                                <>
                                    <div className={styles.divider} />
                                    <div className={styles.emailForm}>
                                        <h3>Enviar invitacion por email</h3>
                                        <div className={styles.emailRow}>
                                            <input
                                                type="email"
                                                className={styles.emailInput}
                                                placeholder="example@gmail.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />

                                            <button
                                                type="button"
                                                className={styles.primaryButton}
                                                onClick={handleSendEmail}
                                                disabled={isSendingEmail}
                                            >
                                                {isSendingEmail ? "Enviando..." : "Enviar invitacion"}
                                            </button>

                                            <button
                                                type="button"
                                                className={styles.secondaryButton}
                                                onClick={handleToggleEmailForm}
                                                disabled={isSendingEmail}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
