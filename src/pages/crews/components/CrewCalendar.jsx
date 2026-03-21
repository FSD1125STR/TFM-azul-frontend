import { useContext, useEffect, useState } from "react";
import { CrewContext } from "../../../hooks/context/CrewContext";
import { getCrewEvents } from "../../../services/events";
import EventCalendar from "../../../components/common/EventCalendar";

//Wrapper que carga los eventos de la crew actual y los pasa al calendario genérico
export default function CrewCalendar() {
    const { crewId } = useContext(CrewContext);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    //Al renderizar o cambiar la crew, se cargan todos los eventos de la crew
    useEffect(() => {
        if (!crewId) return;
        getCrewEvents(crewId)
            .then((data) => setEvents(data ?? []))
            .catch(() => setEvents([]))
            .finally(() => setLoading(false));
    }, [crewId]);

    return <EventCalendar events={events} loading={loading} />;
}
