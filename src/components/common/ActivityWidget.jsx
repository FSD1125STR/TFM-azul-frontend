// Widget de actividad reciente (feed de notificaciones).
// Recibe las notificaciones ya resueltas por el padre (props-driven), por lo que
// no depende de ningún contexto ni hook de datos. El padre es responsable de
// llamar a useNotifications(crewId) y pasarle el resultado.
//
// Esto permite reutilizarlo con cualquier fuente de notificaciones
// (crew, grupo, etc.) sin modificar el componente.

import {
    IconCalendar,
    IconFile,
    IconChartBar,
    IconUserPlus,
    IconMessage,
    IconBell,
} from "@tabler/icons-react";
import WidgetCard from "../../components/ui/WidgetCard.jsx";
import styles from "./ActivityWidget.module.css";

// ── Mapeo tipo de notificación → icono ──────────────────────────────────────
// Cada tipo de evento del backend tiene su icono representativo.
const ICON_MAP = {
    EVENT_CREATED:            IconCalendar,
    EVENT_UPDATED:            IconCalendar,
    EVENT_ATTENDANCE_UPDATED: IconCalendar,
    FILE_UPLOADED:            IconFile,
    POLL_CREATED:             IconChartBar,
    POLL_VOTED:               IconChartBar,
    USER_JOINED:              IconUserPlus,
    COMMENT_POSTED:           IconMessage,
};

// ── Helpers de texto ─────────────────────────────────────────────────────────

// Extrae el nombre de la entidad relacionada con la notificación (poll, archivo o evento)
function extractEntityName(notification) {
    const entity = notification.entityId;
    if (!entity || typeof entity !== "object") return null;
    // Intentamos los tres campos posibles según el tipo de entidad
    return entity.question ?? entity.originalName ?? entity.title ?? null;
}

// Construye el mensaje completo de la notificación con actor y entidad resaltados
function buildMessage(notification) {
    const actorName = notification.actor?.username ?? "Alguien";
    const entityName = extractEntityName(notification);

    // Plantillas de texto por tipo; prefix puede ser string o función si necesita contexto (meta)
    const TEMPLATES = {
        POLL_CREATED:             { prefix: " ha creado una nueva encuesta: " },
        FILE_UPLOADED:            { prefix: " ha subido el archivo " },
        EVENT_CREATED:            { prefix: " ha creado un evento: " },
        EVENT_UPDATED:            { prefix: " ha actualizado el evento: " },
        EVENT_ATTENDANCE_UPDATED: { prefix: (n) => ` ha indicado que ${n.meta?.attending ? "sí" : "no"} asistirá al evento: ` },
        USER_JOINED:              { prefix: " se ha unido a la crew", noEntity: true },
        COMMENT_POSTED:           { prefix: " ha comentado en " },
        POLL_VOTED:               { prefix: " ha votado en la encuesta: " },
    };

    const template = TEMPLATES[notification.type];
    if (!template) return <span>{actorName}</span>;

    const prefix = typeof template.prefix === "function"
        ? template.prefix(notification)
        : template.prefix;

    return (
        <>
            <span className={styles.actor}>{actorName}</span>
            {prefix}
            {/* Solo mostramos la entidad si la plantilla la requiere y existe */}
            {!template.noEntity && entityName && (
                <span className={styles.entityName}>{entityName}</span>
            )}
        </>
    );
}

// Convierte un timestamp en texto relativo legible ("hace 5 min", "hace 2 d", etc.)
function formatRelativeTime(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();

    const minutes = Math.floor(diff / 60000);
    if (minutes < 1)  return "ahora mismo";
    if (minutes < 60) return `hace ${minutes} min`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24)   return `hace ${hours} h`;

    const days = Math.floor(hours / 24);
    if (days < 7)     return `hace ${days} d`;

    return new Date(dateStr).toLocaleDateString("es-ES");
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function ActivityWidget({ notifications, loading, error }) {
    return (
        // WidgetCard proporciona el título "Actividad reciente" y el contenedor visual.
        // Gestionamos los estados internamente (loading/error/empty/list) en lugar de
        // usar el isEmpty de WidgetCard, porque necesitamos UI específica para cada estado.
        <WidgetCard title="Actividad reciente">
            {/* Estado: cargando */}
            {loading && (
                <p className={styles.loading}>Cargando última actividad...</p>
            )}

            {/* Estado: error al cargar */}
            {!loading && error && (
                <p className={styles.error}>{error}</p>
            )}

            {/* Estado: sin notificaciones */}
            {!loading && !error && notifications.length === 0 && (
                <div className={styles.empty}>
                    <IconBell size={36} className={styles.emptyIcon} />
                    <p>No hay actividad reciente</p>
                </div>
            )}

            {/* Estado: lista de notificaciones */}
            {!loading && !error && notifications.length > 0 && (
                <ul className={styles.list}>
                    {notifications.map((n) => {
                        // Usamos el icono del tipo de notificación o IconBell como fallback
                        const Icon = ICON_MAP[n.type] ?? IconBell;
                        return (
                            <li key={n._id} className={styles.item}>
                                <span className={styles.icon}>
                                    <Icon size={18} />
                                </span>
                                <div className={styles.content}>
                                    <span className={styles.message}>{buildMessage(n)}</span>
                                    {n.group?.name && (
                                        <span className={styles.groupBadge}>{n.group.name}</span>
                                    )}
                                    <span className={styles.time}>{formatRelativeTime(n.createdAt)}</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </WidgetCard>
    );
}
