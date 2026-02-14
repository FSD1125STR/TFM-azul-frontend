import styles from "./login.module.css";
import Header from "./components/Header.jsx";
import LoginForm from "./components/LoginForm.jsx";


export default function Login() {

    return (
        <main className={styles["login-page"]}>
            <Header />
            <div className={styles["login-content"]}>
                <div className={styles["login-container"]}>
                    <h1 className={styles.title}>Bienvenido de nuevo</h1>
                    <p className={styles.subtitle}>Inicia sesión para manejar tus crews</p>
                    <LoginForm/>
                </div>
            </div>
            
        </main>
    );
};

