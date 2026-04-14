import { useContext, useEffect, useState } from "react";

import { AuthContext } from "../../hooks/context/AuthContext.jsx";
import { useAllNotifications } from "../../hooks/useAllNotifications.js";
import { getCrews } from "../../services/apiCrews.js";
import { getMyEvents } from "../../services/events.js";

import { Button } from "../../components/ui/Button.jsx";
import { Link } from "react-router-dom";
import { DASHBOARD_MAX_EVENTS } from "../../constants/dashboard.js";
import RecentCrewsWidget from "../../components/common/RecentCrewsWidget.jsx";
import EventsWidget from "../events/components/EventsWidget.jsx";
import ActivityWidget from "../../components/common/ActivityWidget.jsx";

import styles from "./dashboard.module.css";

export default function Dashboard() {
    //
    const { user } = useContext(AuthContext);

    //Estado de datos
    const [crews, setCrews] = useState([]);
    const [crewsLoading, setCrewsLoading] = useState(true);

    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);

    //Custom hook para notificaciones de usuario
    const { notifications, loading: notifLoading, error: notifError } = useAllNotifications();

    // Fetch crews del usuario
    useEffect(() => {
        getCrews()
            .then(setCrews)
            .catch(() => setCrews([]))
            .finally(() => setCrewsLoading(false));
    }, []);

    // Fetch eventos del usuario, de su crew y de su grupo (todos si es admin)
    useEffect(() => {
        getMyEvents()
            .then((data) => setEvents(data?.events ?? data ?? []))
            .catch(() => setEvents([]))
            .finally(() => setEventsLoading(false));
    }, []);

    return (
        <div className={styles.page}>
            {/* ── Banner de bienvenida ────────────────────────────────── */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>¡Hola de nuevo <span className={styles.remarked}>{user?.username ?? ""}</span>!</h1>
                    <p className={styles.subtitle}>Aquí tienes un resumen de tu actividad reciente.</p>
                </div>
                <Link to="/crews/create" className={styles.primaryButton}>
                    Nueva Crew
                </Link>
            </header>


            {/* ── Crews recientes ─────────────────────────────────────── */}
            <RecentCrewsWidget crews={crews} loading={crewsLoading} />

            {/* ── Eventos + Actividad ─────────────────────────────────── */}
            <div className={styles.bottomGrid}>
                <EventsWidget
                    events={eventsLoading ? [] : events
                        .filter((e) => new Date(e.date) >= new Date())
                        .slice(0, DASHBOARD_MAX_EVENTS)}
                    emptyMessage="No tienes eventos próximos."
                />
                <ActivityWidget
                    notifications={notifications}
                    loading={notifLoading}
                    error={notifError}
                    showCrew={true}
                />
            </div>
        </div>
    );
}
