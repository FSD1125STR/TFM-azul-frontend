import { useState, useEffect } from "react";
import { useSocket } from "./context/SocketContext.jsx";
import { getCrewNotifications } from "../services/apiNotifications.js";

// Hook que combina el fetch inicial por HTTP con las actualizaciones en tiempo real por WS.
// Devuelve siempre la lista completa, ordenada de más reciente a más antigua.
export const useNotifications = (crewId) => {
    const { socket } = useSocket();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Fetch inicial ────────────────────────────────────────────────────────
    // Se ejecuta al montar el hook o al cambiar de crew.
    // Carga el historial completo de notificaciones desde la API REST.
    useEffect(() => {
        if (!crewId) return;

        getCrewNotifications(crewId)
            .then((data) => setNotifications(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [crewId]);

    // ── Tiempo real ──────────────────────────────────────────────────────────
    // Escucha el evento 'notification:new' emitido por el backend cuando alguien
    // sube un archivo o crea una encuesta en esta crew.
    // El payload tiene el mismo formato que los objetos del fetch inicial
    // (actor con username, entityId con campos del modelo), por lo que el
    // componente puede renderizarlos con la misma lógica.
    useEffect(() => {
        if (!socket || !crewId) return;

        const handleNewNotification = (notification) => {
            // Añadimos al principio del array para mantener orden desc (más reciente primero)
            setNotifications((prev) => [notification, ...prev]);
        };

        socket.on("notification:new", handleNewNotification);

        // Cleanup: eliminamos el listener al cambiar de crew o desmontar el componente.
        // Sin este cleanup se acumularían listeners y cada notificación se añadiría
        // múltiples veces (una por cada vez que el hook se montó).
        return () => {
            socket.off("notification:new", handleNewNotification);
        };
    }, [socket, crewId]);

    return { notifications, loading, error };
};
