import styles from "./form.module.css";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/loginSchema";
import { Button } from "../../../components/ui/Button";
import { login } from "../../../services/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../../hooks/context/AuthContext";
import { getLoggedUser } from "../../../services/auth";

export default function LoginForm() {
    //React router 
    const navigate = useNavigate();
    const location = useLocation();

    //Contexto de autenticación
    const { setIsLoggedIn, setUser } = useContext(AuthContext);

    // Configuración de react-hook-form con validación de Zod
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    // Estado para mostrar errores del servidor
    const [serverError, setServerError] = useState("");

    // Envio del formulario para logearse
    const onSubmit = async (data) => {
        setServerError(""); // Limpiar errores anteriores

        try {
            const response = await login(data.username, data.password);
            console.log("login response:", response);

            // Actualizar el contexto de autenticación
            const me = await getLoggedUser();
            setUser(me.user);
            setIsLoggedIn(true);

            //Extraemos el next param para saber la url que renderizar despues de registrarnos
            const nextParam = new URLSearchParams(location.search).get("next");
            const nextSafe = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") && !nextParam.startsWith("/\\")
                ? nextParam
                : "/";
            navigate(nextSafe); // Redirigir al usuario a la página de destino después de logearse

        } catch (error) {
            // Mostrar el error al usuario
            setServerError(error.message);
            console.error("login error:", error);
        }
    };

    return (
        <>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.formItem}>
                    <label>Username</label>
                    <input {...register("username")} />
                    {errors.username && <p>{errors.username.message}</p>}
                </div>

                <div className={styles.formItem}>
                    <label>Password</label>
                    <input type="password" {...register("password")} />
                    {errors.password && <p>{errors.password.message}</p>}
                </div>

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Log in"}
                </Button>
            </form>

            {serverError && <p className={styles.serverError}>{serverError}</p>}
        </>
    );
}
