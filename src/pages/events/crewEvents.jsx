
import React, { useContext } from "react";
import { CrewContext } from "../../hooks/context/CrewContext";
export default function CrewEvents() {
    const { crew } = useContext(CrewContext);

    return (
        <div className="crew-groups-container">
            <h1>Grupos de {crew?.name || "la Crew"}</h1>
        </div>
    );
}