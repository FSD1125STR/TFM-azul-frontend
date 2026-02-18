import styles from "./register.module.css";
import Header from "./components/Header.jsx";
import RegisterForm from "./components/RegisterForm.jsx";


export default function Register() {

    return (
        <main className={styles["register-page"]}>
            <Header />
            <div className={styles["register-content"]}>
                <div className={styles["register-container"]}>
                    <h1 className={styles.title}>Regístrate</h1>
                    <p className={styles.subtitle}>Crea una cuenta y únete a CrewGO</p>
                    <RegisterForm/>
                </div>
            </div>            
        </main>
    );
};