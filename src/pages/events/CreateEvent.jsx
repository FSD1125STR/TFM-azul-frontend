import { useContext, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthContext } from "../../hooks/context/AuthContext.jsx";
import { CrewContext } from "../../hooks/context/CrewContext";
import { createCrewEvent } from "../../services/events.js";
import EventForm from "./components/EventForm.jsx";
import styles from "./CreateEvent.module.css";

const schema = z.object({
    title: z.string().min(1, "El título es obligatorio"),
    date: z.string().min(1, "La fecha es obligatoria"),
    location: z.string().optional(),
    description: z.string().optional(),
});

export default function CreateEvent() {
    const { crew } = useContext(CrewContext);
    const { idCrew, groupId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const eventsBase = groupId
        ? `/crews/${idCrew}/groups/${groupId}/events`
        : `/crews/${idCrew}/events`;

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const userId = useMemo(() => user?._id, [user]);
    const crewName = crew?.name || "la crew";

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data) => {
        if (!idCrew || !userId) return;

        setSubmitting(true);
        setError("");

        const payload = {
            title: data.title.trim(),
            date: new Date(data.date).toISOString(),
            description: data.description?.trim() ?? "",
            location: data.location?.trim() ?? "",
            createdBy: userId,
            ...(groupId && { groupId }),
        };

        try {
            await createCrewEvent(idCrew, payload);
            navigate(eventsBase);
        } catch (err) {
            setError(err.message || "No se pudo crear el evento");
            setSubmitting(false);
        }
    };

    return (
        <section className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Nuevo evento</h1>
                    <p className={styles.subtitle}>
                        Completa la información del nuevo evento para {crewName}.
                    </p>
                </div>
            </header>

            <div className={styles.content}>
                <form className={styles.eventForm} onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Información básica</h2>
                            <p>
                                Define el título, la fecha y los datos principales del evento.
                            </p>
                        </div>

                        <EventForm register={register} errors={errors} disabled={submitting} />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => navigate(eventsBase)}
                            disabled={submitting}
                        >
                            Cancelar
                        </button>
                        <button className={styles.primaryButton} disabled={submitting}>
                            Crear evento
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
