import pageStyles from "./resetPassword.module.css";
import formStyles from "../auth/components/form.module.css";
import Header from "./components/Header.jsx";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { resetPassword } from "../../services/auth.js";

const passwordSchema = z.object({
    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

export default function ResetPassword() {

    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm({ resolver: zodResolver(passwordSchema) });

    // Función para manejar el envío del formulario de restablecimiento de contraseña
    const handleResetPassword = async (data) => {
        setServerError("");
        setSuccessMessage("");

        try {
            await resetPassword(token, data.password);
            setSuccessMessage("Contraseña restablecida correctamente. Ya puedes iniciar sesión.");
            
        } catch (error) {
            setServerError(error.message);
            console.error("Error al restablecer la contraseña:", error);
        }
    };

    return (
        <main className={pageStyles["reset-password-page"]}>
            <Header />
            <div className={pageStyles["reset-password-content"]}>
                <div className={pageStyles["reset-password-container"]}>
                    <h1 className={pageStyles.title}>Restablecer contraseña</h1>

                    {!token ? (
                        <p className={formStyles.serverError}>Enlace inválido o expirado.</p>
                    ) : (
                        <>
                            <p className={pageStyles.subtitle}>Introduce tu nueva contraseña</p>

                            <form className={formStyles.form} onSubmit={handleSubmit(handleResetPassword)}>
                                <div className={formStyles.formItem}>
                                    <label>Nueva contraseña</label>
                                    <input type="password" {...register("password")} />
                                    {errors.password && <p>{errors.password.message}</p>}
                                </div>

                                <div className={formStyles.formItem}>
                                    <label>Confirmar contraseña</label>
                                    <input type="password" {...register("confirmPassword")} />
                                    {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}
                                </div>

                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Guardando..." : "Restablecer contraseña"}
                                </Button>
                            </form>

                            {serverError && <p className={formStyles.serverError}>{serverError}</p>}
                            {successMessage && <p className={formStyles.successMessage}>{successMessage}</p>}
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
