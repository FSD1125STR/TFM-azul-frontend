import pageStyles from "./forgotPassword.module.css";
import formStyles from "../auth/components/form.module.css";
import Header from "./components/Header.jsx";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { sendForgotPasswordEmail } from "../../services/auth.js";

export default function ForgotPassword() {

    const [serverError, setServerError] = useState("");
    //const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const emailSchema = z.object({
        email: z
            .string()
            .email("El campo email no es válido")
    });
    
    // Configuración de react-hook-form con validación de Zod
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm( {resolver: zodResolver(emailSchema) });

    // Envio del formulario para recuperar contraseña
    const sendEmailToResetPassword = async (data) => {
        setServerError(""); // Limpiar errores anteriores
        setSuccessMessage(""); // Limpiar mensajes de éxito anteriores

        try{

            await sendForgotPasswordEmail(data.email);
            setSuccessMessage("Se ha enviado el email de recuperación. Por favor, revisa tu bandeja de entrada.");

        } catch (error) {

            setServerError(error.message);
            console.error("Error al enviar el email de recuperación:", error);
        }
    }

    return (
        <main className={pageStyles["forgot-password-page"]}>
            <Header />
            <div className={pageStyles["forgot-password-content"]}>
                <div className={pageStyles["forgot-password-container"]}>
                    <h1 className={pageStyles.title}>Recuperación de contraseña</h1>
                    <p className={pageStyles.subtitle}>Ingresa tu correo electrónico para recuperar tu contraseña</p>

                    {/* Formulario de recuperación de contraseña */}
                    <form className={formStyles.form} onSubmit={handleSubmit(sendEmailToResetPassword)}>
                        <div className={formStyles.formItem}>
                            <label>Email</label>
                            <input {...register("email")} />
                            {errors.email && <p>{errors.email.message}</p>}
                        </div>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Enviando enlace..." : "Enviar enlace de recuperación"}
                        </Button>
                    </form>

                    {/* Mostrar mensajes de error o éxito */}
                    {serverError && <p className={formStyles.serverError}>{serverError}</p>}
                    {successMessage && <p className={formStyles.successMessage}>{successMessage}</p>}
                </div>
            </div>            
        </main>
    );
};