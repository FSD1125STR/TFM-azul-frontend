import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../hooks/context/AuthContext";

//Este componente se encargará de proteger las rutas que requieran autenticación, redirigiendo a los usuarios no autenticados a la página de login.
export const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, user, loading } = useContext(AuthContext);
    const location = useLocation();

    if(loading) return <div style={{ visibility: "hidden" }} />;

    if(!user || !isLoggedIn) {
        //Guardamos la url original para saber a donde redireccionar despues del login y la metemos como parametro next
        const next = `${location.pathname}${location.search}`;
        return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
    }

    return children;
}
