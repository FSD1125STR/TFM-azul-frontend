import React, { useContext, useState } from "react";
import { CrewContext } from "../../hooks/context/CrewContext";
import RoleManagement from "./RoleManagement";

export default function CrewMembers() {
    const { crew } = useContext(CrewContext);
    const [manageRole, setManageRole] = useState(false);

    return (
        <>
            {manageRole ? (
                <RoleManagement />
            ) : (
                <div className="crew-members-container">
                    <h1>Miembros de {crew?.name || "la Crew"}</h1>
                    <button type="button" onClick={() => setManageRole(true)}>
                        Gestionar roles
                    </button>
                </div>
            )}
        </>
    );
}
