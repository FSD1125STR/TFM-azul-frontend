import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../hooks/context/AuthContext";

//Este componente se encargará de proteger las rutas que requieran autenticación, redirigiendo a los usuarios no autenticados a la página de login.
export const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, user, loading } = useContext(AuthContext);

    if(loading) return null;

    if(!user || !isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return children;
}