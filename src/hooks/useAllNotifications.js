import { useState, useEffect } from "react";
import { useSocket } from "./context/SocketContext.jsx";
import { getAllNotifications } from "../services/apiNotifications.js";

// Hook que combina el fetch inicial por HTTP con las actualizaciones en tiempo real por WS.
// A diferencia de useNotifications(crewId), este hook opera sobre TODAS las crews del usuario.
// El filtrado por grupos ya lo aplica el backend: admins ven todo, members solo sus grupos.
export const useAllNotifications = () => {
    const { socket } = useSocket();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch de todas las notificaciones del usuario
    useEffect(() => {
        getAllNotifications()
            .then((data) => setNotifications(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);


    // El socket ya está unido a los rooms crew:, group: y crew-admin: del usuario (gestionado en socketManager.js), por lo que las notificaciones de todos los
    // grupos y crews llegarán aquí automáticamente.
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification) => {
            setNotifications((prev) =>
                // Evitar duplicados si ya existe el mismo _id
                prev.some((n) => n._id === notification._id)
                    ? prev
                    : [notification, ...prev]
            );
        };

        socket.on("notification:new", handleNewNotification);

        return () => {
            socket.off("notification:new", handleNewNotification);
        };

    }, [socket]);

    //El hook devuelve un array de notificaciones ordenadas por fecha (la más reciente primero), junto con estados de carga y error
    return { notifications, loading, error };
};
