import React, { useContext } from "react";
import { CrewContext } from "../../hooks/context/CrewContext";
export default function CrewFiles() {
    const { crew } = useContext(CrewContext);

    return (
        <div className="crew-files-container">
            <h1>Archivos de {crew?.name || "la Crew"}</h1>
        </div>
    );
}