import { IconTrash } from "@tabler/icons-react";
import styles from "./PastPollCard.module.css";

/**
 * Tarjeta de encuesta cerrada. Muestra los resultados con barras de progreso
 * y resalta la opción ganadora.
 *
 * @param {Object}   poll       - Objeto de encuesta con question, options
 * @param {boolean}  canDelete  - Si el usuario es admin y puede eliminar la encuesta
 * @param {Function} onDelete   - Callback para eliminar la encuesta (recibe poll._id)
 */
export default function PastPollCard({ poll, canDelete, onDelete }) {
    const totalVotes = (poll.options ?? []).reduce((sum, o) => sum + (o.votes ?? 0), 0);

    const optionsWithPercent = (poll.options ?? []).map((o) => ({
        ...o,
        percent: totalVotes > 0 ? Math.round(((o.votes ?? 0) / totalVotes) * 100) : 0,
    }));

    // Porcentaje máximo para resaltar la opción ganadora
    const maxPercent = optionsWithPercent.reduce((max, o) => Math.max(max, o.percent), 0);

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

            {/* Total de votos */}
            <p className={styles.totalVotes}>
                {totalVotes} {totalVotes === 1 ? "voto" : "votos"} en total
            </p>

            {/* Resultados */}
            {totalVotes === 0 ? (
                <p className={styles.emptyResults}>Sin votos registrados</p>
            ) : (
                <div className={styles.resultsList}>
                    {optionsWithPercent.map((opt) => (
                        <div key={opt.id} className={styles.resultRow}>
                            <div className={styles.resultHeader}>
                                <span className={styles.optionLabel}>{opt.label}</span>
                                <span className={styles.resultMeta}>
                                    {opt.votes ?? 0} votos ({opt.percent}%)
                                </span>
                            </div>
                            <div className={styles.barTrack}>
                                <div
                                    className={`${styles.barFill} ${opt.percent === maxPercent && maxPercent > 0 ? styles.barWinner : ""}`}
                                    style={{ width: `${opt.percent}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
