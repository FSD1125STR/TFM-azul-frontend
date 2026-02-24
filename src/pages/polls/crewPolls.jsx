import React, { useContext } from "react";
import { CrewContext } from "../../hooks/context/CrewContext";
export default function CrewPolls() {
    const { crew } = useContext(CrewContext);

    return (
        <div className="crew-polls-container">
            <h1>Encuestas de {crew?.name || "la Crew"}</h1>
        </div>
    );
}