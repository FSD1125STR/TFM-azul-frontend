import { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { GroupContext } from "../../hooks/context/GroupContext.jsx";
import { getGroupMembers } from "../../services/apiGroups.js";
import { getCrewEvents } from "../../services/events.js";
import { getCrewPolls } from "../../services/apiPolls.js";
import GroupHeader from "./components/GroupHeader.jsx";
import MembersWidget from "./components/MembersWidget.jsx";
import EventsWidget from "../events/components/EventsWidget.jsx";
import PollsWidget from "../polls/components/PollsWidget.jsx";
import styles from "./GroupOverview.module.css";

const MAX_EVENTS = 3;
const MAX_POLLS = 5;

export default function GroupOverview() {
    // Contexto global de grupo
    const { idCrew } = useParams();
    const { group, groupId, loading: groupLoading, error: groupError } = useContext(GroupContext);

    // Estados locales de datos
    const [members, setMembers] = useState([]); //Miembros del grupo
    const [events, setEvents] = useState([]); //Eventos del grupo
    const [polls, setPolls] = useState([]); //Encuestas del grupo
    const [dataLoading, setDataLoading] = useState(true);

    // Filtramos eventos futuros y encuestas activas, limitando la cantidad mostrada
    const upcomingEvents = useMemo(() => {
        const now = new Date();
        return events
            .filter((e) => new Date(e.date) >= now)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, MAX_EVENTS);
    }, [events]);

    const activePolls = useMemo(() => {
        return polls.filter((p) => p.isActive).slice(0, MAX_POLLS);
    }, [polls]);

    //Cargamos los datos de miembros, eventos y encuestas del grupo al montar el componente o cambiar de grupo
    useEffect(() => {
        if (!idCrew || !groupId) return;
        setDataLoading(true);

        Promise.all([
            getGroupMembers(idCrew, groupId), //Devuelve los miembros del grupo
            getCrewEvents(idCrew, { groupId }), //DEvuelve los eventos de la crew filtrando por grupo
            getCrewPolls(idCrew, { groupId }), //Devuelve las encuestas de la crew filtrando por grupo
        ])  
            //Actualizamos estados con las respuestas, asegurándonos de que sean arrays válidos
            .then(([members, events, polls]) => {
                setMembers(Array.isArray(members) ? members : []);
                setEvents(Array.isArray(events) ? events : []);
                setPolls(Array.isArray(polls) ? polls : []);
            })
            .catch(() => {})
            .finally(() => setDataLoading(false));
    }, [idCrew, groupId]);

    // Renderizamos estados de carga o error del grupo
    if (groupLoading) return <div className={styles.state}>Cargando grupo...</div>;
    if (groupError) return <div className={styles.state}>{groupError}</div>;
    if (!group) return null;

    return (
        <div className={styles.page}>
            {/** Encabezado del grupo */}
            <GroupHeader
                group={group}
                memberCount={members.length}
                eventCount={events.length}
                activePollCount={activePolls.length}
                loading={dataLoading}
            />

            {dataLoading ? (
                <p className={styles.loading}>Cargando datos del grupo...</p>
            ) : (
                <div className={styles.content}>
                    {/** Widget de miembros y eventos */}
                    <div className={styles.grid}>
                        <MembersWidget members={members} />
                        <EventsWidget events={upcomingEvents} />
                    </div>
                    {/** Widget de encuestas */}
                    <PollsWidget polls={activePolls} />
                </div>
            )}
        </div>
    );
}
