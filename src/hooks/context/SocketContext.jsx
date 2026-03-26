import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext.jsx";
import { API_BASE_URL } from "../../services/config.js";

const SOCKET_URL = API_BASE_URL;

const SocketContext = createContext(null);

const SocketProvider = ({ children }) => {
    // Leemos isLoggedIn desde AuthContext para conectar/desconectar
    // el socket según el estado de sesión del usuario
    const { isLoggedIn } = useContext(AuthContext);

    // useRef en lugar de useState para no provocar re-renders cuando
    // cambia el objeto socket (los componentes se suscriben a eventos,
    // no necesitan que el socket cambie como estado)
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);

    // Conectamos el socket al iniciar sesion
    useEffect(() => {
        if (!isLoggedIn) {
            // Si el usuario cierra sesión, desconectamos el socket
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setConnected(false);
            }
            return;
        }

        // withCredentials: true hace que el navegador envíe la cookie 'auth'
        // en el handshake de WebSocket, igual que axios la envía en HTTP
        const socket = io(SOCKET_URL, {
            withCredentials: true,
        });

        socket.on("connect", () => {
            console.log("Socket conectado:", socket.id);
            setConnected(true);
        });

        socket.on("disconnect", () => {
            console.log("Socket desconectado");
            setConnected(false);
        });

        socket.on("connect_error", (err) => {
            console.error("Error de conexión socket:", err.message);
        });

        socketRef.current = socket;

        // Cleanup: desconectar al desmontar el provider (cambio de ruta, logout, etc.)
        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [isLoggedIn]); // Solo reconectar si cambia el estado de autenticación

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
            {children}
        </SocketContext.Provider>
    );
};

// Hook de conveniencia para consumir el contexto sin importar SocketContext directamente
const useSocket = () => useContext(SocketContext);

export { SocketContext, SocketProvider, useSocket };
