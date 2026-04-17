import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { useLocation } from "react-router-dom";
import "./header.css";


export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <header className="login-header">
            <div className="login-brand">
                <img src="/crewgo_logo.svg" alt="CrewGO logo" className="login-logo" />
                <p>CrewGO</p>
            </div>

            {/**Si estamos en login renderizamos boton de registro */}
            {location.pathname === "/login" && (
                <div className="register-button">
                    <Button
                        className="register-btn"
                        //Navegamos a register conservando la query string que puede tener info de la proxima ruta despues de registarse
                        onClick={() => navigate(`/register${location.search}`)}
                    >
                        Registrarse
                    </Button>
                </div>
            )}

            {/**Si estamos en registro renderizamos boton de login */}
            {location.pathname === "/register" && (
                <div className="login-button">
                    <Button
                        className="login-btn"
                        //Navegamos a register conservando la query string que puede tener info de la proxima ruta despues de logearse
                        onClick={() => navigate(`/login${location.search}`)}
                    >
                        Iniciar sesión
                    </Button>
                </div>
            )}

        </header>
    );
};
