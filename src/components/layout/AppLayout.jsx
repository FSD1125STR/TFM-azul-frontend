import { useContext, useEffect, useRef, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import styles from "./AppLayout.module.css";
import { AuthContext } from "../../hooks/context/AuthContext.jsx";
import { logout } from "../../services/auth.js";
import { useNavigate } from "react-router-dom";

export default function AppLayout({ children }) {
    const { user } = useContext(AuthContext);
    const username = user?.username ?? user?.name ?? "Username";
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null); //Referencia al boton del usuario en el html

    //Navegacion
    const navigate = useNavigate();

    // Efecto para detectar clicks fuera del menu de usuario y cerrarlo
    useEffect(() => {
    // Comprueba si el click fue fuera del menu para cerrarlo
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        //Deteccion de clicks
        document.addEventListener("mousedown", handleClickOutside); 
        // Limpieza del event listener al desmontar el componente
        return () => document.removeEventListener("mousedown", handleClickOutside); 
    }, []);

    // Muestra u oculta el menú de usuario al hacer clic en el botón del avatar
    const handleToggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    // Maneja el clic en la opción de logout del menú de usuario
    const handleLogout = async () => {
        try {
            await logout();
            setIsMenuOpen(false);

            // Redirige al usuario a la página de login después de cerrar sesión
            navigate("/login");

        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <div className={styles.appLayout}>
            {/* Header con navegación y menú de usuario */}
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    {/* Enlace al dashboards en el logo */}
                    <Link to="/" className={styles.brand}>
                        <img
                            src="/crewgo_logo.svg"
                            alt="CrewGO logo"
                            className={styles.logoIcon}
                        />
                        <span className={styles.brandText}>CrewGO</span>
                    </Link>

                    {/* Menu de navegacion entre las paginas principales del usuario */}
                    <nav className={styles.nav} aria-label="Primary">
                        <Link className={styles.navLink} to="/">
                        Dashboards
                        </Link>
                        <Link className={styles.navLink} to="/crews">
                        MyCrews
                        </Link>
                        <Link className={styles.navLink} to="/events">
                        Events
                        </Link>
                    </nav>

                    {/* Area clickable del usuario para acceder a su perfil o cerrar sesion */}
                    <div className={styles.userArea} ref={menuRef}>
                        <button
                            type="button"
                            className={styles.userButton}
                            onClick={handleToggleMenu}
                            aria-expanded={isMenuOpen}
                            aria-controls="user-menu"
                        >
                            <span className={styles.username}>{username}</span>
                            <span className={styles.avatar} aria-hidden="true" />
                        </button>

                        {/* Menu de usuario que se muestra solo cuando isMenuOpen es true */}
                        {isMenuOpen && (
                            <div className={styles.userMenu} id="user-menu" role="menu">
                                {/* Link para ver el perfil del usuario */}
                                <button type="button" className={styles.menuItem} role="menuitem">
                                  Ver Perfil
                                </button>
                                {/* Boton para cerrar sesion */}
                                <button
                                    type="button"
                                    className={styles.menuItem}
                                    role="menuitem"
                                    onClick={handleLogout}
                                >
                                  Logout
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </header>

            <main className={styles.main}>{children ?? <Outlet />}</main>
        </div>
    );
}
