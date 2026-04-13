import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconPlus } from "@tabler/icons-react";

import { AuthContext } from "../../hooks/context/AuthContext.jsx";
import { useAllNotifications } from "../../hooks/useAllNotifications.js";
import { getCrews } from "../../services/apiCrews.js";
import { getMyEvents } from "../../services/events.js";

import { Button } from "../../components/ui/Button.jsx";
import { DASHBOARD_MAX_EVENTS } from "../../constants/dashboard.js";
import RecentCrewsWidget from "../../components/common/RecentCrewsWidget.jsx";
import EventsWidget from "../events/components/EventsWidget.jsx";
import ActivityWidget from "../../components/common/ActivityWidget.jsx";

import styles from "./Dashboard.module.css";

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [crews, setCrews] = useState([]);
    const [crewsLoading, setCrewsLoading] = useState(true);

    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);

    const { notifications, loading: notifLoading, error: notifError } = useAllNotifications();

    // Fetch crews
    useEffect(() => {
        getCrews()
            .then(setCrews)
            .catch(() => setCrews([]))
            .finally(() => setCrewsLoading(false));
    }, []);

    // Fetch user events
    useEffect(() => {
        getMyEvents()
            .then((data) => setEvents(data?.events ?? data ?? []))
            .catch(() => setEvents([]))
            .finally(() => setEventsLoading(false));
    }, []);

    return (
        <div className={styles.page}>
            {/* ── Banner de bienvenida ────────────────────────────────── */}
            <div className={styles.welcome}>
                <div>
                    <h1 className={styles.welcomeTitle}>
                        ¡Hola, {user?.username ?? ""}!
                    </h1>
                    <p className={styles.welcomeSubtitle}>
                        Aquí tienes un resumen de tu actividad reciente.
                    </p>
                </div>
                <Button onClick={() => navigate("/crews/create")} className={styles.createBtn}>
                    Nueva crew
                </Button>
            </div>

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
                />
            </div>
        </div>
    );
}
