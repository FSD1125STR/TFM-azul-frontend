import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { IconCheck, IconAlertCircle, IconTrash } from "@tabler/icons-react";
import { votePoll } from "../../../services/apiPolls";
import styles from "./ActivePollCard.module.css";

/**
 * Tarjeta de encuesta activa. Permite seleccionar una opción y votar.
 * Muestra los contadores actualizados de forma optimista tras votar.
 *
 * @param {Object}   poll           - Objeto de encuesta con question, options, expiresAt
 * @param {Function} onVoteSuccess  - Callback para refrescar la lista tras votar
 * @param {boolean}  canDelete      - Si el usuario es admin y puede eliminar la encuesta
 * @param {Function} onDelete       - Callback para eliminar la encuesta (recibe poll._id)
 */
export default function ActivePollCard({ poll, onVoteSuccess, canDelete, onDelete }) {
    const { idCrew } = useParams();
    const [selected, setSelected] = useState(null);
    const [voted, setVoted] = useState(false);
    const [isVoting, setIsVoting] = useState(false);
    const [voteError, setVoteError] = useState(null);
    const [voteCounts, setVoteCounts] = useState({});

    // Sincroniza los contadores de votos cuando el poll cambia (ej. tras refresh)
    useEffect(() => {
        if (poll?.options) {
            setVoteCounts(
                poll.options.reduce((acc, o) => ({ ...acc, [o.id]: o.votes ?? 0 }), {})
            );
        }
    }, [poll]);

    const handleVote = async () => {
        if (!selected || isVoting) return;

        setIsVoting(true);
        setVoteError(null);

        try {
            await votePoll(idCrew, poll._id, selected);
            // Actualización optimista del contador sin esperar re-fetch
            setVoteCounts((prev) => ({
                ...prev,
                [selected]: (prev[selected] || 0) + 1,
            }));
            setVoted(true);
            // Refresca la lista tras un breve delay para que el servidor procese el voto
            if (onVoteSuccess) setTimeout(() => onVoteSuccess(), 500);
        } catch (err) {
            if (err.code === "ALREADY_VOTED") {
                setVoteError("Ya has votado en esta encuesta");
            } else {
                setVoteError(err.message || "Error al votar");
            }
        } finally {
            setIsVoting(false);
        }
    };

    // Formatea la fecha de cierre en formato legible
    const expiryLabel = poll.expiresAt
        ? new Date(poll.expiresAt).toLocaleString("es-ES", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : null;

    return (
        <div className={styles.card}>
            {/* Cabecera: pregunta + botón eliminar para admins */}
            <div className={styles.cardHeader}>
                <h3 className={styles.question}>{poll.question}</h3>
                {canDelete && (
                    <button
                        className={styles.deleteBtn}
                        onClick={() => onDelete(poll._id)}
                        title="Eliminar encuesta"
                        aria-label="Eliminar encuesta"
                    >
                        <IconTrash size={15} stroke={1.8} />
                    </button>
                )}
            </div>

            {/* Fecha de cierre */}
            {expiryLabel && (
                <p className={styles.expiryLabel}>Cierra el {expiryLabel}</p>
            )}

            {/* Opciones de voto */}
            <div className={styles.optionsList}>
                {poll.options?.length > 0 ? (
                    poll.options.map((opt) => (
                        <label
                            key={opt.id}
                            className={`${styles.optionRow} ${selected === opt.id ? styles.selected : ""} ${voted ? styles.disabled : ""}`}
                            onClick={() => !voted && setSelected(opt.id)}
                        >
                            <div className={styles.radioCircle}>
                                {selected === opt.id && <div className={styles.radioDot} />}
                            </div>
                            <span className={styles.optionLabel}>{opt.label}</span>
                            <span className={styles.voteCount}>{voteCounts[opt.id]}</span>
                        </label>
                    ))
                ) : (
                    <p className={styles.emptyOptions}>Sin opciones disponibles</p>
                )}
            </div>

            {/* Mensaje de error */}
            {voteError && (
                <p className={styles.voteError}>
                    <IconAlertCircle size={14} stroke={2} />
                    {voteError}
                </p>
            )}

            {/* Botón de votar o confirmación */}
            {!voted ? (
                <button
                    className={`${styles.voteBtn} ${selected ? styles.active : ""}`}
                    onClick={handleVote}
                    disabled={isVoting || !selected}
                >
                    {isVoting ? "Votando..." : "Votar"}
                </button>
            ) : (
                <p className={styles.votedMsg}>
                    <IconCheck size={14} stroke={2.5} />
                    Voto registrado
                </p>
            )}
        </div>
    );
}
