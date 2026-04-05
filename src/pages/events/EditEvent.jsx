import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthContext } from "../../hooks/context/AuthContext.jsx";
import { CrewContext } from "../../hooks/context/CrewContext";
import { getEventById, updateEvent } from "../../services/events.js";
import EventForm from "./components/EventForm.jsx";
import { formatDateInput } from "./utils/eventDateUtils.js";
import styles from "./CreateEvent.module.css";

// Esquema de validación para el formulario de evento
const schema = z.object({
    title: z.string().min(1, "El título es obligatorio"),
    date: z.string().min(1, "La fecha es obligatoria"),
    location: z.string().optional(),
    description: z.string().optional(),
});

export default function EditEvent() {
    // Obtener datos de contexto y parámetros de URL
    const { crew } = useContext(CrewContext);
    const { idCrew, eventId, groupId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    //Detecta si estamos viendo los eventos de un grupo para mantener las rutas dentro o fuera del grupo
    const eventsBase = groupId
        ? `/crews/${idCrew}/groups/${groupId}/events`
        : `/crews/${idCrew}/events`;

    const [loadingEvent, setLoadingEvent] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const userId = useMemo(() => user?._id, [user]);
    const crewName = crew?.name || "la crew";

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    //Cargamos el evento y pre-rellenamos el formulario con sus datos
    useEffect(() => {
        const loadEvent = async () => {
            setLoadingEvent(true);

            try {
                const eventData = await getEventById(idCrew, eventId);
                reset({
                    title: eventData.title ?? "",
                    date: formatDateInput(eventData.date),
                    location: eventData.location ?? "",
                    description: eventData.description ?? "",
                });

            } catch (err) {
                setError(err.message || "No se pudo cargar el evento");
            } finally {
                setLoadingEvent(false);
            }
        };

        loadEvent();
    }, [eventId, reset]);

    //Maneja el envío del formulario para actualizar el evento
    const onSubmit = async (data) => {
        if (!userId) return;

        setSubmitting(true);
        setError("");

        const payload = {
            title: data.title.trim(),
            date: new Date(data.date).toISOString(),
            description: data.description?.trim() ?? "",
            location: data.location?.trim() ?? "",
            userId,
        };

        try {
            await updateEvent(idCrew, eventId, payload);
            navigate(`${eventsBase}/${eventId}`);
        } catch (err) {
            setError(err.message || "No se pudo guardar el evento");
            setSubmitting(false);
        }
    };

    // Mostrar mensaje de carga mientras se obtiene el evento
    if (loadingEvent) {
        return (
            <section className={styles.page}>
                <p className={styles.subtitle} style={{ padding: "32px 24px" }}>Cargando evento...</p>
            </section>
        );
    }

    return (
        <section className={styles.page}>
            {/** Encabezado de la página */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Editar evento</h1>
                    <p className={styles.subtitle}>
                        Modifica la información del evento en {crewName}.
                    </p>
                </div>
            </header>

            {/** Formulario de edición del evento */}
            <div className={styles.content}>
                <form className={styles.eventForm} onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Información básica</h2>
                            <p>
                                Actualiza el título, la fecha y los datos principales del evento.
                            </p>
                        </div>

                        {/** Renderiza el formulario de evento con los campos correspondientes */}
                        <EventForm register={register} errors={errors} disabled={submitting} />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    {/** Botones de acción */}
                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => navigate(`${eventsBase}/${eventId}`)}
                            disabled={submitting}
                        >
                            Cancelar
                        </button>
                        <button className={styles.primaryButton} disabled={submitting}>
                            Guardar cambios
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
