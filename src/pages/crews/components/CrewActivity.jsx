import { useContext } from "react";
import {
    IconCalendar,
    IconFile,
    IconChartBar,
    IconUserPlus,
    IconMessage,
    IconBell,
} from "@tabler/icons-react";
import { CrewContext } from "../../../hooks/context/CrewContext";
import { useNotifications } from "../../../hooks/useNotifications.js";
import styles from "./CrewActivity.module.css";

// Extrae el nombre de la entidad objeto de la notificacion
function extractEntityName(notification) {
    const entity = notification.entityId;
    if (!entity || typeof entity !== "object") return null;

    // Devolvemos uno de esos tres campos posibles (poll, file, event), si es otra acción no devolvemos nada
    return entity.question ?? entity.originalName ?? entity.title ?? null;
}

// Contruye el mensaje de la notificacion resaltando el actor y la entidad
function buildMessage(notification) {
    const actorName = notification.actor?.username ?? "Alguien";
    const entityName = extractEntityName(notification);

    const TEMPLATES = {
        POLL_CREATED:   { prefix: " ha creado una nueva encuesta: " },
        FILE_UPLOADED:  { prefix: " ha subido el archivo " },
        EVENT_CREATED:  { prefix: " ha creado un evento: " },
        EVENT_UPDATED:  { prefix: " ha actualizado el evento: " },
        USER_JOINED:    { prefix: " se ha unido a la crew", noEntity: true },
        COMMENT_POSTED: { prefix: " ha comentado en " },
    };

    const template = TEMPLATES[notification.type];
    if (!template) return <span>{actorName}</span>;

    return (
        <>
            <span className={styles.actor}>{actorName}</span>
            {template.prefix}
            {/** Si no necesita entidad no se muestra */}
            {!template.noEntity && entityName && (
                <span className={styles.entityName}>{entityName}</span>
            )}
        </>
    );
}

const ICON_MAP = {
    EVENT_CREATED: IconCalendar,
    EVENT_UPDATED: IconCalendar,
    FILE_UPLOADED: IconFile,
    POLL_CREATED: IconChartBar,
    USER_JOINED: IconUserPlus,
    COMMENT_POSTED: IconMessage,
};

// Calcula la diferencia entre la fecha actual y la de created at, devuelve un string relativo
function formatRelativeTime(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();

    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "ahora mismo";
    if (minutes < 60) return `hace ${minutes} min`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours} h`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `hace ${days} d`;
    
    return new Date(dateStr).toLocaleDateString();
}

export default function CrewActivity() {
    const { crewId } = useContext(CrewContext);
    // useNotifications gestiona el fetch inicial y las actualizaciones en tiempo real via WebSocket
    const { notifications, loading, error } = useNotifications(crewId);

    return (
        <div className={styles.container}>
            <h3 className={styles.heading}>Actividad</h3>

            {loading && <p className={styles.loading}>Cargando última actividad...</p>}

            {error && <p className={styles.error}>{error}</p>}

            {!loading && !error && notifications.length === 0 && (
                <div className={styles.empty}>
                    <IconBell size={36} className={styles.emptyIcon} />
                    <p>No hay actividad reciente</p>
                </div>
            )}

            {!loading && !error && notifications.length > 0 && (
                <ul className={styles.list}>
                    {notifications.map((n) => {
                        const Icon = ICON_MAP[n.type] ?? IconBell;
                        return (
                            <li key={n._id} className={styles.item}>
                                <span className={styles.icon}>
                                    <Icon size={18} />
                                </span>
                                <div className={styles.content}>
                                    <span className={styles.message}>{buildMessage(n)}</span>
                                    <span className={styles.time}>{formatRelativeTime(n.createdAt)}</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
