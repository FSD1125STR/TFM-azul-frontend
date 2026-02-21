import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CrewForm from "./components/CrewForm.jsx";
import CrewToast from "./components/CrewToast.jsx";
import { createCrew } from "../../services/apiCrews.js";
import styles from "./CreateCrew.module.css";

// Componente para renderizar la pagina de crear Crew
export default function CreateCrew() {
    const navigate = useNavigate();
    const [notification, setNotification] = useState(null);

    // Maneja el submit del formulario, usa la api para crear una crew, si tiene exito navega a la ventana de crews
    const handleCreate = async (payload) => {
        const created = await createCrew(payload);
        
        setNotification({ type: "success", message: "Crew creada con exito" });
        setTimeout(() => navigate(`/crews/${created._id}`), 1200);
    };

    // Renderizamos el componente
    return (
        <>
            <div className={styles.page}>
                {/** Creamos un Toast si se produce algun evento al enviar el formulario */}
                {notification && (
                    <CrewToast
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification(null)}
                    />
                )}

                {/** Seccion del formulario */}
                <div className={styles.container}>
                    <header className={styles.header}>
                        <h1>Nueva crew</h1>
                        <p>Crea y configura una nueva crew.</p>
                    </header>

                    <CrewForm
                        onSubmit={handleCreate}
                        submitLabel="Crear crew"
                        onCancel={() => navigate("/crews")}
                    />
                </div>
            </div>
        </>
    );
}
