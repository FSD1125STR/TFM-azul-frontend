import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CrewForm from "./components/CrewForm.jsx";
import CrewToast from "./components/CrewToast.jsx";
import styles from "./CrewDetails.module.css";
import {
  ACTIVITY_STYLES,
  DEFAULT_ACTIVITY_STYLE,
} from "./constants/crewActivities.js";
import {
  deleteCrew,
  getCrewById,
  getCrewImageUrl,
  updateCrew,
} from "../../services/apiCrews.js";

export default function CrewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [crew, setCrew] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCrew = async () => {
      try {
        setLoading(true);
        const data = await getCrewById(id);
        if (isMounted) {
          setCrew(data);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "No se pudo cargar la crew.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCrew();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleUpdate = async (payload) => {
    const updated = await updateCrew(id, payload);
    setCrew(updated);
    setIsEditing(false);
    setNotification({ type: "success", message: "Crew actualizada" });
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteCrew(id);
      setNotification({ type: "success", message: "Crew eliminada" });
      setTimeout(() => navigate("/crews"), 1200);
    } catch (err) {
      setNotification({ type: "error", message: err.message || "No se pudo eliminar" });
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className={styles.state}>Cargando crew...</div>;
  }

  if (error) {
    return (
      <div className={styles.state}>
        <p>{error}</p>
        <button type="button" onClick={() => navigate("/crews")} className={styles.primaryButton}>
          Volver a mis crews
        </button>
      </div>
    );
  }

  if (!crew) {
    return null;
  }

  const colors = ACTIVITY_STYLES[crew.activity] || DEFAULT_ACTIVITY_STYLE;
  const coverImage = crew.imageUrl ? getCrewImageUrl(crew.imageUrl) : "";
  const subactivityLabel = crew.subactivity ?? crew.SubActivity ?? "";

  return (
    <div className={styles.page}>
      {notification && (
        <CrewToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {showDeleteConfirm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Eliminar crew</h3>
            <p>
              ¿Seguro que quieres eliminar <strong>{crew.name}</strong>? Esta acción
              no se puede deshacer.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.dangerButton}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.container}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => (isEditing ? setIsEditing(false) : navigate("/crews"))}
        >
          {isEditing ? "Volver a detalles" : "Volver a mis crews"}
        </button>

        {isEditing ? (
          <CrewForm
            initialValues={crew}
            onSubmit={handleUpdate}
            submitLabel="Guardar cambios"
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <div
              className={styles.hero}
              style={{
                background: coverImage
                  ? `url(${coverImage}) center/cover`
                  : `linear-gradient(135deg, ${colors.bg} 0%, #e0e0e0 100%)`,
              }}
            >
              <div className={styles.tags}>
                <span className={styles.activityTag} style={{ background: colors.dot }}>
                  {crew.activity}
                </span>
                <span className={styles.subactivityTag}>{subactivityLabel}</span>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h1>{crew.name}</h1>
                  <p>{crew.description}</p>
                </div>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className={styles.dangerButton}
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <div className={styles.stats}>
                <div>
                  <strong>{crew.members || 0}</strong>
                  <span>Miembros</span>
                </div>
                <div>
                  <strong>{crew.events || 0}</strong>
                  <span>Eventos</span>
                </div>
                <div>
                  <strong>{crew.role || "Member"}</strong>
                  <span>Tu rol</span>
                </div>
              </div>

              {crew.createdAt && (
                <p className={styles.meta}>
                  Creada el {new Date(crew.createdAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
