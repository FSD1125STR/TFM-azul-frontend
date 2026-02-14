import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import './header.css';


export default function Header() {
    const navigate = useNavigate();

    return (
        <header className="login-header">
            <p>CrewGO</p>
            <div className="register-button">
                <Button
                    className="register-btn"
                    onClick={() => navigate("/register")}
                >
                    Register
                </Button>
            </div>
        </header> 
    );
};
