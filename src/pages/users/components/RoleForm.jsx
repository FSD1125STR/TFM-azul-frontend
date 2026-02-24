import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import styles from "../RoleManagement.module.css";
import { PERMISSION_ENUM } from "../constants/permission.js";

const buildSchema = (existingRoles) =>
    z.object({
        name: z
            .string()
            .trim()
            .min(3, "El nombre debe tener al menos 3 caracteres.")
            .refine(
                (value) =>
                    !existingRoles.some(
                        (role) =>
                            role.name?.toLowerCase() === value.toLowerCase(),
                    ),
                "Ya existe un rol con ese nombre.",
            ),
        isAdmin: z.boolean().default(false),
    });

export default function RoleForm({
    roles,
    onCreateRole,
    isSaving = false,
    submitError = "",
}) {
    const existingRoles = Array.isArray(roles) ? roles : [];
    const schema = useMemo(() => buildSchema(existingRoles), [existingRoles]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            isAdmin: false,
        },
    });

    const onSubmit = async (values) => {
        const trimmed = values.name.trim();
        const newRole = {
            name: trimmed,
            permission: values.isAdmin
                ? PERMISSION_ENUM.ADMIN
                : PERMISSION_ENUM.MEMBER,
        };

        const success = await onCreateRole?.(newRole);
        if (success !== false) {
            reset();
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.field}>
                <label htmlFor="role-name">Nombre del rol</label>
                <input
                    id="role-name"
                    type="text"
                    placeholder="Ej. Coordinador"
                    disabled={isSubmitting || isSaving}
                    {...register("name")}
                />
                {errors.name && (
                    <div className={styles.errorText}>{errors.name.message}</div>
                )}
            </div>

            <label className={styles.checkboxField}>
                <input
                    type="checkbox"
                    disabled={isSubmitting || isSaving}
                    {...register("isAdmin")}
                />
                <span>
                    Permisos de administrador
                    <span className={styles.checkboxHint}>
                        Acceso total a configuraciones y gestión.
                    </span>
                </span>
            </label>

            {submitError && (
                <div className={styles.errorText}>{submitError}</div>
            )}

            <button
                type="submit"
                className={styles.primaryButton}
                disabled={isSubmitting || isSaving}
            >
                {isSaving ? "Guardando..." : "Crear rol"}
            </button>
        </form>
    );
}
