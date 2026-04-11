import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/Button.jsx";
import styles from "./CreatePollModal.module.css";

const INITIAL_OPTIONS = 3;
const MAX_OPTIONS = 5;
const MIN_OPTIONS = 2;

/**
 * Modal para crear una nueva encuesta.
 * Gestiona su propio estado de formulario y lo resetea tras un submit exitoso.
 *
 * @param {boolean}  isOpen       - Controla la visibilidad del modal
 * @param {Function} onClose      - Callback para cerrar el modal sin guardar
 * @param {Function} onSubmit     - Callback async que recibe { question, options, expiresAt }
 * @param {boolean}  isSubmitting - Indica si la petición al API está en curso
 */
export default function CreatePollModal({ isOpen, onClose, onSubmit, isSubmitting }) {
    const [question, setQuestion] = useState("");
    const [expiresAt, setExpiresAt] = useState("");
    const [options, setOptions] = useState(Array.from({ length: INITIAL_OPTIONS }, () => ""));
    const [touched, setTouched] = useState(false);

    // Cierra el modal al pulsar Escape
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    // Resetea el formulario cuando el modal se cierra
    useEffect(() => {
        if (!isOpen) {
            setQuestion("");
            setExpiresAt("");
            setOptions(Array.from({ length: INITIAL_OPTIONS }, () => ""));
            setTouched(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filledOptions = options.filter((o) => o.trim());
    const minDatetime = new Date(Date.now() + 60_000).toISOString().slice(0, 16); // mín. 1 min en el futuro

    const isValid =
        question.trim() &&
        expiresAt &&
        new Date(expiresAt).getTime() > Date.now() &&
        filledOptions.length >= MIN_OPTIONS;

    const handleSubmit = async () => {
        setTouched(true);
        if (!isValid) return;
        await onSubmit({
            question: question.trim(),
            options: filledOptions,
            expiresAt: new Date(expiresAt).toISOString(),
        });
    };

    const updateOption = (index, value) => {
        setOptions((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.title}>Nueva encuesta</h2>

                {/* Pregunta */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Pregunta</label>
                    <input
                        className={`${styles.input} ${touched && !question.trim() ? styles.inputError : ""}`}
                        placeholder="¿Cuál es tu pregunta?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        autoFocus
                    />
                    {touched && !question.trim() && (
                        <span className={styles.errorMsg}>La pregunta es obligatoria</span>
                    )}
                </div>

                {/* Fecha de cierre */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Fecha de cierre</label>
                    <input
                        type="datetime-local"
                        className={`${styles.input} ${touched && !expiresAt ? styles.inputError : ""}`}
                        min={minDatetime}
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                    />
                    {touched && !expiresAt && (
                        <span className={styles.errorMsg}>Indica cuándo se cierra la votación</span>
                    )}
                </div>

                {/* Opciones */}
                <div className={styles.formGroup}>
                    <div className={styles.optionsHeader}>
                        <label className={styles.label}>Opciones</label>
                        <div className={styles.optionActions}>
                            <button
                                type="button"
                                className={styles.optionActionBtn}
                                onClick={() => setOptions((prev) => prev.length < MAX_OPTIONS ? [...prev, ""] : prev)}
                                disabled={options.length >= MAX_OPTIONS}
                                aria-label="Añadir opción"
                                title="Añadir opción"
                            >
                                +
                            </button>
                            <button
                                type="button"
                                className={styles.optionActionBtn}
                                onClick={() => setOptions((prev) => prev.length > MIN_OPTIONS ? prev.slice(0, -1) : prev)}
                                disabled={options.length <= MIN_OPTIONS}
                                aria-label="Eliminar última opción"
                                title="Eliminar última opción"
                            >
                                −
                            </button>
                        </div>
                    </div>

                    {options.map((opt, i) => (
                        <input
                            key={i}
                            className={`${styles.input} ${styles.optionInput}`}
                            placeholder={`Opción ${i + 1}`}
                            value={opt}
                            onChange={(e) => updateOption(i, e.target.value)}
                        />
                    ))}

                    {touched && filledOptions.length < MIN_OPTIONS && (
                        <span className={styles.errorMsg}>
                            Rellena al menos {MIN_OPTIONS} opciones
                        </span>
                    )}
                </div>

                {/* Acciones */}
                <div className={styles.actions}>
                    <Button variant="secondary" className={styles.actionBtn} onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button className={styles.actionBtn} onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Creando..." : "Crear encuesta"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
