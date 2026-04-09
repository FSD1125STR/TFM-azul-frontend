import { useEffect } from "react";
import { useForm } from "react-hook-form";
import styles from "./GroupFormModal.module.css";

const DEFAULT_VALUES = {
    name: "",
    description: "",
};

export default function GroupFormModal({ open, group, onSave, onCancel, isLoading }) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues: DEFAULT_VALUES });

    // Cuando el modal se abre, se resetean los campos del formulario con los datos del grupo (si se está editando) o con los valores por defecto (si se está creando)
    useEffect(() => {
        if (open) {
            reset({
                name: group?.name ?? "",
                description: group?.description ?? "",
            });
        }
    }, [open, group, reset]);

    //Si no es open no se renderiza
    if (!open) return null;

    const isEditing = Boolean(group);
    const isBusy = isSubmitting || isLoading;

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true">
            <div className={styles.modal}>
                <h3 className={styles.title}>
                    {isEditing ? "Editar grupo" : "Crear grupo"}
                </h3>

                <form onSubmit={handleSubmit(onSave)} className={styles.form}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="group-name">
                            Nombre
                        </label>
                        <input
                            id="group-name"
                            type="text"
                            placeholder="Nombre del grupo"
                            className={errors.name ? styles.inputError : styles.input}
                            disabled={isBusy}
                            {...register("name", {
                                required: "El nombre es obligatorio",
                                minLength: { value: 2, message: "Mínimo 2 caracteres" },
                            })}
                        />
                        {errors.name && (
                            <span className={styles.errorText}>{errors.name.message}</span>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="group-description">
                            Descripción
                        </label>
                        <textarea
                            id="group-description"
                            placeholder="Descripción opcional"
                            rows={3}
                            className={styles.input}
                            disabled={isBusy}
                            {...register("description")}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={onCancel}
                            disabled={isBusy}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.primaryButton}
                            disabled={isBusy}
                        >
                            {isBusy
                                ? isEditing ? "Guardando..." : "Creando..."
                                : isEditing ? "Guardar cambios" : "Crear grupo"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
