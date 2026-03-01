import styles from "./CrewCard.module.css";
import {
    ACTIVITY_STYLES,
    DEFAULT_ACTIVITY_STYLE,
} from "../constants/crewActivities.js";
import { getCrewImageUrl } from "../../../services/apiCrews.js";

// Componente para renderizar una CrewCard, con los datos de la crew y un handler para el boton de acceder a la crew
export default function CrewCard({ crew, onView }) {
    const colors = ACTIVITY_STYLES[crew.activity] || DEFAULT_ACTIVITY_STYLE; //Definimos los colores de la actividad
    const coverImage = crew.imageUrl ? getCrewImageUrl(crew.imageUrl) : "";
    const isAdmin = crew.userRole?.permission === "admin";

    return (
        <>
            {/** Render de la card de Crew */}
            <article className={styles.card}>
                {/* Imagen de la crew en la Card, sino un gradient */}
                <div
                    className={styles.cover}
                    style={{
                        background: coverImage
                            ? `url(${coverImage}) center/cover`
                            : `linear-gradient(135deg, ${colors.bg} 0%, #e0e0e0 100%)`,
                    }}
                >
                    {/* Tags de actividad y de rol */}
                    <span className={styles.activityTag} style={{ background: colors.dot }}>
                        {crew.activity}
                    </span>
                    <span
                        className={styles.roleTag}
                        data-variant={isAdmin ? "primary" : "neutral"}
                    >
                        {crew.userRole?.name || "Member"}
                    </span>
                </div>

                {/* Cuerpo de la Card, con la info de la Crew */}
                <div className={styles.body}>
                    <div className={styles.content}>
                        <h3 className={styles.title}>{crew.name}</h3>
                        <p className={styles.description}>{crew.description}</p>
                        <div className={styles.meta}>
                            <span>{crew.members || 0} miembros</span>
                            <span>{crew.events || 0} eventos</span>
                        </div>
                    </div>

                    {/* Boton para acceder a la crew */}
                    <button type="button" className={styles.action} onClick={() => onView(crew)}>Ver crew</button>
                </div>
                
            </article>
        </>
    );
}
