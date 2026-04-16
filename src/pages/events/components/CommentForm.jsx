import { useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./EventCommentsSection.module.css";

// Formulario reutilizable para crear y editar comentarios.
// - Sin onCancel: modo "nuevo comentario" (botón "Publicar", limpia el campo al enviar)
// - Con onCancel: modo "edición" (botones "Cancelar" + "Guardar", defaultValue pre-rellena el campo)
export default function CommentForm({ onSubmit, defaultValue = "", onCancel }) {
    // Error devuelto por el servidor al intentar guardar
    const [serverError, setServerError] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: { content: defaultValue },
    });

    // Observamos el valor en tiempo real para el contador y para deshabilitar el botón
    const content = watch("content");

    // Callback que recibe los datos validados del formulario (data.content)
    const onFormSubmit = async (data) => {
        setServerError("");
        try {
            await onSubmit(data.content.trim());
            reset(); // limpia el campo solo en modo "nuevo comentario"; en edición el form se desmonta
        } catch (err) {
            setServerError(err.message || "No se pudo guardar el comentario");
        }
    };

    return (
        <form className={styles.commentForm} onSubmit={handleSubmit(onFormSubmit)}>
            <textarea
                className={styles.commentInput}
                {...register("content", { required: true, maxLength: 500 })}
                placeholder="Escribe tu comentario..."
                maxLength={500}
                rows={4}
                disabled={isSubmitting}
            />

            {/* Errores de validación del campo */}
            {errors.content?.type === "required" && (
                <p className={styles.validationError}>El comentario no puede estar vacío.</p>
            )}
            {errors.content?.type === "maxLength" && (
                <p className={styles.validationError}>El comentario no puede exceder los 500 caracteres.</p>
            )}

            {/* Error devuelto por el servidor */}
            {serverError && <p className={styles.error}>{serverError}</p>}

            <div className={onCancel ? styles.commentEditorFooter : styles.commentFormFooter}>
                {/* Contador de caracteres */}
                <span className={styles.commentCounter}>{content.trim().length}/500</span>

                <div className={styles.commentEditorActions}>
                    {/* Botón cancelar: solo visible en modo edición */}
                    {onCancel && (
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                    )}

                    <button
                        type="submit"
                        className={styles.primaryButton}
                        disabled={isSubmitting || !content.trim()}
                    >
                        {onCancel ? "Guardar" : "Publicar comentario"}
                    </button>
                </div>
            </div>
        </form>
    );
}
