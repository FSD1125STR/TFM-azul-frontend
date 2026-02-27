import { createContext, useEffect, useMemo, useState } from "react";
import { getCrewById } from "../../services/apiCrews.js";

// Contexto para almacenar la crew actual 
const CrewContext = createContext(null);

// Se pide la crew al backend y se gestiona si hay un error o si está cargando
const CrewProvider = ({ crewId, children }) => {
    const [crew, setCrew] = useState(null);
    const [loading, setLoading] = useState(Boolean(crewId));
    const [error, setError] = useState("");

    // Use effect para peticion al backend de la crew a partir de su id
    useEffect(() => {
        let isMounted = true;

        const fetchCrew = async () => {
            if (!crewId) {
                if (isMounted) {
                    setCrew(null);
                    setLoading(false);
                    setError("");
                }
                return;
            }

            try {
                setLoading(true);
                setError("");
                const data = await getCrewById(crewId);
                if (isMounted) {
                    setCrew(data); //Guardamos la crew actual
                }
                
            } catch (err) {
                if (isMounted) {
                    setError(err.message || "No se pudo cargar la crew.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchCrew();
        return () => {
            isMounted = false;
        };
    }, [crewId]);


    // Guardamos los valores de la crew, que no se volveran a renderizar si no cambia alguna de las variables
    const crewValues = useMemo(
        () => ({
            crewId,
            crew,
            setCrew,
            loading,
            error,
        }),
        [crewId, crew, loading, error],
    );

    // Devolvemos el provider con los valores de la crew (crewValues)
    return <CrewContext.Provider value={crewValues}>{children}</CrewContext.Provider>;
};


export { CrewContext, CrewProvider };
