import React, { useContext } from "react";
import { CrewContext } from "../../hooks/context/CrewContext";

export default function CrewMembers() {
    const { crew } = useContext(CrewContext);

    return (
        <div className="crew-members-container">
            <h1>Miembros de {crew?.name || "la Crew"}</h1>
        </div>
    );
}