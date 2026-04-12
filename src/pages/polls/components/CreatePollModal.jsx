import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "../../../components/ui/Button.jsx";
import { createPoll } from "../../../services/apiPolls.js";
import styles from "./CreatePollModal.module.css";

const MAX_OPTIONS = 5;
const MIN_OPTIONS = 2;

const DEFAULT_VALUES = {
    question: "",
    expiresAt: "",
    options: [{ value: "" }, { value: "" }, { value: "" }],
};

/**
 * Modal para crear una nueva encuesta.
 * Gestiona su propio estado de formulario, la llamada API y el estado de carga.
 *
 * @param {boolean}  isOpen     - Controla la visibilidad del modal
 * @param {Function} onClose    - Callback para cerrar el modal sin guardar
 * @param {Function} onCreated  - Callback que recibe el poll creado tras éxito
 */
export default function CreatePollModal({ isOpen, onClose, onCreated }) {
    const { idCrew, groupId } = useParams();
    const [createError, setCreateError] = useState(null);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues: DEFAULT_VALUES });

    //Hook para manejar las opciones dinámicas del formulario (añadir/eliminar)
    const { fields, append, remove } = useFieldArray({ control, name: "options" });

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
            reset(DEFAULT_VALUES);
            setCreateError(null);
        }
    }, [isOpen, reset]);

    if (!isOpen) return null;

    const minDatetime = new Date(Date.now() + 60_000).toISOString().slice(0, 16);

    // Handler para enviar el formulario y crear la encuesta
    const onSubmit = async (data) => {
        const filledOptions = data.options.map((o) => o.value.trim()).filter(Boolean);
        //Valida el numero minimo de opciones
        if (filledOptions.length < MIN_OPTIONS) {
            setError("options", { message: `Rellena al menos ${MIN_OPTIONS} opciones` });
            return;
        }

        setCreateError(null);
        try {
            //Llamamos a la API para crear la encuesta y pasamos el resultado al callback onCreated del padre
            const poll = await createPoll(idCrew, {
                question: data.question.trim(),
                options: filledOptions,
                expiresAt: new Date(data.expiresAt).toISOString(),
                groupId,
            });
            onCreated(poll);
            onClose();
        } catch (err) {
            setCreateError(err.message || "No se pudo crear la encuesta");
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.title}>Nueva encuesta</h2>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* Pregunta */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Pregunta</label>
                        <input
                            className={`${styles.input} ${errors.question ? styles.inputError : ""}`}
                            placeholder="¿Cuál es tu pregunta?"
                            autoFocus
                            {...register("question", { required: "La pregunta es obligatoria" })}
                        />
                        {errors.question && (
                            <span className={styles.errorMsg}>{errors.question.message}</span>
                        )}
                    </div>

                    {/* Fecha de cierre */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Fecha de cierre</label>
                        <input
                            type="datetime-local"
                            min={minDatetime}
                            className={`${styles.input} ${errors.expiresAt ? styles.inputError : ""}`}
                            {...register("expiresAt", {
                                required: "Indica cuándo se cierra la votación",
                                validate: (v) =>
                                    new Date(v).getTime() > Date.now() || "La fecha debe ser futura",
                            })}
                        />
                        {errors.expiresAt && (
                            <span className={styles.errorMsg}>{errors.expiresAt.message}</span>
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
                                    onClick={() => append({ value: "" })}
                                    disabled={fields.length >= MAX_OPTIONS}
                                    aria-label="Añadir opción"
                                    title="Añadir opción"
                                >
                                    +
                                </button>
                                <button
                                    type="button"
                                    className={styles.optionActionBtn}
                                    onClick={() => remove(fields.length - 1)}
                                    disabled={fields.length <= MIN_OPTIONS}
                                    aria-label="Eliminar última opción"
                                    title="Eliminar última opción"
                                >
                                    −
                                </button>
                            </div>
                        </div>

                        {fields.map((field, i) => (
                            <input
                                key={field.id}
                                className={`${styles.input} ${styles.optionInput}`}
                                placeholder={`Opción ${i + 1}`}
                                {...register(`options.${i}.value`)}
                            />
                        ))}

                        {errors.options?.message && (
                            <span className={styles.errorMsg}>{errors.options.message}</span>
                        )}
                    </div>

                    {/* Error de creación */}
                    {createError && (
                        <p className={styles.errorMsg}>{createError}</p>
                    )}

                    {/* Acciones */}
                    <div className={styles.actions}>
                        <Button
                            type="button"
                            variant="secondary"
                            className={styles.actionBtn}
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className={styles.actionBtn}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creando..." : "Crear encuesta"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
