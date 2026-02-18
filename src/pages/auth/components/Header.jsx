import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { useLocation } from "react-router-dom";
import './header.css';


export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();

     return (
        <header className="login-header">
            <p>CrewGO</p>

            {/**Si estamos en login renderizamos boton de registro */}
            {location.pathname === "/login" && (
                <div className="register-button">
                    <Button
                        className="register-btn"
                        onClick={() => navigate("/register")}
                    >
                        Register
                    </Button>
                </div>
            )}

            {/**Si estamos en registro renderizamos boton de login */}
            {location.pathname === "/register" && (
                <div className="login-button">
                    <Button
                        className="login-btn"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </Button>
                </div>
            )}

        </header>
    );
};
