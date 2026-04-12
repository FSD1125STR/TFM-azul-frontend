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
    const [selected, setSelected] = useState(poll.userVoteOptionId ?? null);
    const [confirmedVote, setConfirmedVote] = useState(poll.userVoteOptionId ?? null);
    const [isVoting, setIsVoting] = useState(false);
    const [voteError, setVoteError] = useState(null);
    const [voteSuccess, setVoteSuccess] = useState(null);
    const [voteCounts, setVoteCounts] = useState({});

    // Sincroniza contadores y voto del usuario cuando el poll cambia (ej. tras refresh)
    useEffect(() => {
        if (poll?.options) {
            setVoteCounts(
                poll.options.reduce((acc, o) => ({ ...acc, [o.id]: o.votes ?? 0 }), {})
            );
        }
        //Si el usuario tiene un voto registrado, se muestra seleccionado
        setSelected(poll.userVoteOptionId ?? null);
        setConfirmedVote(poll.userVoteOptionId ?? null);
        setVoteSuccess(null);

    }, [poll]);

    // Handler para registrar el voto del usuario
    const handleVote = async () => {
        if (!selected || isVoting) return;

        setIsVoting(true);
        setVoteError(null);

        try {
            await votePoll(idCrew, poll._id, selected);

            // Actualización optimista: decrementa voto anterior, incrementa el nuevo
            setVoteCounts((prev) => {
                const next = { ...prev };
                if (confirmedVote && confirmedVote !== selected) {
                    next[confirmedVote] = Math.max(0, (next[confirmedVote] || 0) - 1);
                }
                if (!confirmedVote || confirmedVote !== selected) {
                    next[selected] = (next[selected] || 0) + 1;
                }
                return next;
            });

            const wasVoted = confirmedVote !== null;
            setConfirmedVote(selected);
            setVoteSuccess(wasVoted ? "actualizado" : "registrado");
            setTimeout(() => setVoteSuccess(null), 2000);

            // Refresca la lista tras un breve delay para que el servidor procese el voto
            if (onVoteSuccess) setTimeout(() => onVoteSuccess(), 500);
            
        } catch (err) {
            setVoteError(err.message || "Error al votar");
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
                            className={`${styles.optionRow} ${selected === opt.id ? styles.selected : ""}`}
                            onClick={() => setSelected(opt.id)}
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

            {/* Confirmación breve tras votar */}
            {voteSuccess && (
                <p className={styles.votedMsg}>
                    <IconCheck size={14} stroke={2.5} />
                    Voto {voteSuccess}
                </p>
            )}

            {/* Botón de votar (siempre visible) */}
            <button
                className={`${styles.voteBtn} ${selected ? styles.active : ""}`}
                onClick={handleVote}
                disabled={isVoting || !selected}
            >
                {isVoting ? "Votando..." : confirmedVote ? "Cambiar voto" : "Votar"}
            </button>
        </div>
    );
}
