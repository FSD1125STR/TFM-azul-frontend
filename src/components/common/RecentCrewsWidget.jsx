import { useNavigate } from "react-router-dom";
import WidgetCard from "../ui/WidgetCard.jsx";
import CrewCard from "../../pages/crews/components/CrewCard.jsx";
import { DASHBOARD_MAX_CREWS } from "../../constants/dashboard.js";
import styles from "./RecentCrewsWidget.module.css";

export default function RecentCrewsWidget({ crews, loading }) {
    const navigate = useNavigate();

    const recent = [...(crews ?? [])]
        .sort((a, b) => new Date(b.updatedAt ?? 0) - new Date(a.updatedAt ?? 0))
        .slice(0, DASHBOARD_MAX_CREWS);

    return (
        <WidgetCard
            title="Tus crews"
            linkTo="/crews"
            linkLabel="Ver todas"
            isEmpty={!loading && recent.length === 0}
            emptyMessage="Aún no perteneces a ninguna crew."
        >
            {loading && <p className={styles.loading}>Cargando crews...</p>}

            {!loading && recent.length > 0 && (
                <div className={styles.grid}>
                    {recent.map((crew) => (
                        <CrewCard
                            key={crew._id}
                            crew={crew}
                            onView={(c) => navigate(`/crews/${c._id}`)}
                        />
                    ))}
                </div>
            )}
        </WidgetCard>
    );
}
