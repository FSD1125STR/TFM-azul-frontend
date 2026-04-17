import styles from "./form.module.css";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../schemas/registerSchema";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../../hooks/context/AuthContext";
import { registerUser, login, getLoggedUser } from "../../../services/auth";

export default function RegisterForm() {
    // Configuración de react-hook-form con validación de Zod
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({ resolver: zodResolver(registerSchema) });

    //React router 
    const navigate = useNavigate();
    const location = useLocation();

    //Contexto de autenticación
    const { setIsLoggedIn, setUser } = useContext(AuthContext);

    // Estado para mostrar errores del servidor
    const [serverError, setServerError] = useState("");

    // Envio del formulario para registrarse
    const onSubmit = async (data) => {
        setServerError(""); // Limpiar errores anteriores
    
        try {
            const response = await registerUser(data);
            console.log("register response:", response);
    
            // Logeo automatico
            const login_response = await login(data.username, data.password);
            console.log("login response:", login_response);

            // Actualizar el contexto de autenticación
            const me = await getLoggedUser();
            setUser(me.user);
            setIsLoggedIn(true);

            //Extraemos el next param para saber la url que renderizar despues de registrarnos
            const nextParam = new URLSearchParams(location.search).get("next");
            const nextSafe = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") && !nextParam.startsWith("/\\")
                ? nextParam
                : "/";
            navigate(nextSafe); // Redirigir al usuario a la página de destino después de registrarse y logearse
    
        } catch (error) {
            // Mostrar el error al usuario
            setServerError(error.message);
            console.error("login error:", error);
        }
    };

    return (
        <>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.formRow}>
                    <div className={styles.formItem}>
                        <label>Nombre</label>
                        <input {...register("name")} />
                        {errors.name && <p>{errors.name.message}</p>}
                    </div>

                    <div className={styles.formItem}>
                        <label>Usuario</label>
                        <input {...register("username")} />
                        {errors.username && <p>{errors.username.message}</p>}
                    </div>
                </div>

                <div className={styles.formItem}>
                    <label>Email</label>
                    <input type="email" {...register("email")} />
                    {errors.email && <p>{errors.email.message}</p>}
                </div>

                <div className={styles.formItem}>
                    <label>Contraseña</label>
                    <input type="password" {...register("password")} />
                    {errors.password && <p>{errors.password.message}</p>}
                </div>

                <div className={styles.formItem}>
                    <label>Confirmar contraseña</label>
                    <input type="password" {...register("repeatPassword")} />
                    {errors.repeatPassword && <p>{errors.repeatPassword.message}</p>}
                </div>

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Registrándose..." : "Registrarse"}
                </Button>

                {serverError && <p className={styles.serverError}>{serverError}</p>}
            </form>
        </>
    );
}
