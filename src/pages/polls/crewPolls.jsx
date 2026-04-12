import { useState, useContext, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { CrewContext } from "../../hooks/context/CrewContext";
import { getCrewPolls, deletePoll } from "../../services/apiPolls";
import { Button } from "../../components/ui/Button.jsx";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import CrewToast from "../crews/components/CrewToast.jsx";
import ActivePollCard from "./components/ActivePollCard.jsx";
import PastPollCard from "./components/PastPollCard.jsx";
import CreatePollModal from "./components/CreatePollModal.jsx";
import styles from "./CrewPolls.module.css";

/**
 * Página principal de encuestas de una crew.
 * Orquesta el fetch de datos, el estado global y delega el render
 * a los componentes especializados: ActivePollCard, PastPollCard y CreatePollModal.
 */
export default function CrewPolls() {
    const { idCrew, groupId } = useParams();
    const { crew } = useContext(CrewContext) || { crew: null };

    //Estado de datos
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    //Estado de UI
    const [tab, setTab] = useState("active");
    const [showModal, setShowModal] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null); // poll._id pendiente de confirmar
    const [notification, setNotification] = useState(null);

    // El usuario puede administrar la sección si su rol en la crew es admin
    const canManage = crew?.userRole?.permission === "admin";

    //Fetch de encuestas 
    const loadPolls = useCallback(async () => {
        setFetchError(null);
        setLoading(true);
        try {
            const data = await getCrewPolls(idCrew, { groupId });
            setPolls(Array.isArray(data) ? data : []);
            
        } catch (err) {
            setFetchError(err.message || "No se pudieron cargar las encuestas");
        } finally {
            setLoading(false);
        }
    }, [idCrew, groupId]);

    useEffect(() => {
        loadPolls();
    }, [loadPolls]);

    // ── Derivados ────────────────────────────────────────────────────────────
    const activePolls = polls.filter((p) => p.isActive === true);
    const pastPolls = polls.filter((p) => p.isActive === false);

    // ── Handlers ─────────────────────────────────────────────────────────────

    // Recibe el poll recién creado desde CreatePollModal y lo añade a la lista
    const handlePollCreated = (poll) => {
        setPolls((prev) => [...prev, poll]);
        setNotification({ type: "success", message: "Encuesta creada correctamente" });
    };

    // Solicita confirmación antes de eliminar (abre el ConfirmModal)
    const handleDeletePoll = (pollId) => setPendingDelete(pollId);

    // Ejecuta el borrado tras confirmación del usuario
    // ConfirmModal gestiona el estado de carga detectando la Promise devuelta
    const handleConfirmDelete = async () => {
        try {
            await deletePoll(idCrew, pendingDelete);
            setPolls((prev) => prev.filter((p) => p._id !== pendingDelete));
            setNotification({ type: "success", message: "Encuesta eliminada" });
            setPendingDelete(null);
        } catch (err) {
            setNotification({ type: "error", message: err.message || "No se pudo eliminar la encuesta" });
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            {/* Toast de notificaciones */}
            {notification && (
                <CrewToast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <section className={styles.page}>
                {/* Cabecera: título + botón de acción */}
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Encuestas</h1>
                        <p className={styles.subtitle}>
                            {groupId
                                ? "Encuestas de este grupo."
                                : "Crea y vota en encuestas de la crew."}
                        </p>
                    </div>
                    {canManage && (
                        <Button className={styles.headerButton} onClick={() => setShowModal(true)}>
                            Nueva encuesta
                        </Button>
                    )}
                </header>

                <div className={styles.content}>
                    {/* Pestañas Activas / Cerradas */}
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tabBtn} ${tab === "active" ? styles.active : ""}`}
                            onClick={() => setTab("active")}
                        >
                            Activas
                        </button>
                        <button
                            className={`${styles.tabBtn} ${tab === "past" ? styles.active : ""}`}
                            onClick={() => setTab("past")}
                        >
                            Cerradas
                        </button>
                    </div>

                    {/* Contenido principal */}
                    {loading ? (
                        <p className={styles.empty}>Cargando encuestas...</p>
                    ) : fetchError ? (
                        <div className={styles.errorState}>
                            <p>{fetchError}</p>
                            <Button variant="secondary" className={styles.retryButton} onClick={loadPolls}>
                                Reintentar
                            </Button>
                        </div>
                    ) : (
                        <div className={styles.pollsGrid}>
                            {tab === "active" ? (
                                activePolls.length > 0 ? (
                                    activePolls.map((p) => (
                                        <ActivePollCard
                                            key={p._id}
                                            poll={p}
                                            onVoteSuccess={loadPolls}
                                            canDelete={canManage}
                                            onDelete={handleDeletePoll}
                                        />
                                    ))
                                ) : (
                                    <p className={styles.empty}>No hay encuestas activas todavía.</p>
                                )
                            ) : (
                                pastPolls.length > 0 ? (
                                    pastPolls.map((p) => (
                                        <PastPollCard
                                            key={p._id}
                                            poll={p}
                                            canDelete={canManage}
                                            onDelete={handleDeletePoll}
                                        />
                                    ))
                                ) : (
                                    <p className={styles.empty}>No hay encuestas cerradas.</p>
                                )
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Modal de creación de encuesta (sólo accesible para admins) */}
            <CreatePollModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onCreated={handlePollCreated}
            />

            {/* Modal de confirmación de borrado */}
            <ConfirmModal
                open={!!pendingDelete}
                title="Eliminar encuesta"
                description="¿Seguro que quieres eliminar esta encuesta? Se borrarán también todos los votos. Esta acción no se puede deshacer."
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                onConfirm={handleConfirmDelete}
                onCancel={() => setPendingDelete(null)}
            />
        </>
    );
}
