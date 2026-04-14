import { IconUsers, IconCalendar, IconChartBar } from "@tabler/icons-react";
import { Container } from "../../../components/ui/Container.jsx";
import styles from "./GroupHeader.module.css";

export default function GroupHeader({ group, memberCount, eventCount, activePollCount, loading }) {

    // Formateamos la fecha de creación del grupo para mostrarla de forma legible
    const createdAt = group.createdAt
        ? new Date(group.createdAt).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        })
        : null;

    return (
        <Container className={styles.header}>
            <div>
                <h1 className={styles.name}>{group.name}</h1>
                {group.description && (
                    <p className={styles.description}>{group.description}</p>
                )}
                {createdAt && (
                    <p className={styles.meta}>Creado el {createdAt}</p>
                )}
            </div>

            {!loading && (
                <div className={styles.stats}>
                    {/* label de miembros */}
                    <div className={styles.stat}>
                        <IconUsers size={16} stroke={1.8} />
                        <strong>{memberCount}</strong>
                        <span>Miembros</span>
                    </div>

                    <span className={styles.separator} />

                    {/* label de eventos */}
                    <div className={styles.stat}>
                        <IconCalendar size={16} stroke={1.8} />
                        <strong>{eventCount}</strong>
                        <span>Eventos</span>
                    </div>

                    <span className={styles.separator} />

                    {/* label de encuestas activas */}
                    <div className={styles.stat}>
                        <IconChartBar size={16} stroke={1.8} />
                        <strong>{activePollCount}</strong>
                        <span>Encuestas activas</span>
                    </div>
                </div>
            )}
        </Container>
    );
}
