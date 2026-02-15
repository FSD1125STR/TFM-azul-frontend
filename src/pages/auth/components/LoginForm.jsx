import styles from "./loginform.module.css";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/loginSchema";
import { Button } from "../../../components/ui/Button";
import { login } from "../../../services/auth";
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  //React router 
  const navigate = useNavigate();

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
      navigate('/');

    } catch (error) {
      // Mostrar el error al usuario
      setServerError(error.message);
      console.error("login error:", error);
    }
  };

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Username</label>
          <input {...register("username")} />
          {errors.username && <p>{errors.username.message}</p>}
        </div>

        <div>
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
