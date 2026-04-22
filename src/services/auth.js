import axios from "axios";
import { API_BASE_URL } from "./config.js";

const AUTH_BASE_URL = `${API_BASE_URL}/api/auth`;

// Llamada a la API para iniciar sesion
export const login = async (username, password) => {
    try {
        const { data } = await axios.post(
            `${AUTH_BASE_URL}/login`,
            {
                username,
                password,
            },
            { withCredentials: true },
        );

        return data;
    } catch (error) {
    //Fallo de login
        const status = error.response?.status ?? 0;
        const message =
      error.response?.data?.message ||
      (status === 404
          ? "Usuario no existe"
          : status === 401
              ? "Credenciales inválidas"
              : "Error al iniciar sesión");

        // Normalizamos el error para que tenga un formato consistente
        const normalized = new Error(message);
        normalized.status = status;

        throw normalized;
    }
};

//Llamada a la API para saber el usuario logeado
export const getLoggedUser = async () => {
    try {
        const { data } = await axios.get(`${AUTH_BASE_URL}/me`, {
            withCredentials: true,
        });

        return data;
    } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        // Normalizamos el error para que tenga un formato consistente
        const normalized = new Error(message);
        normalized.status = status;

        throw normalized;
    }
};

// Llamada a la API para registar un nuevo usuario
export const registerUser = async (userData) => {
    try {
    //Extraemos los campos necesarios para el body (se quita el repeatPassword porque no lo necesita el backend)
        const { name, username, email, password } = userData;

        const { data } = await axios.post(
            `${AUTH_BASE_URL}/register`,
            { name, username, email, password },
            { withCredentials: true },
        );

        return data;
    } catch (error) {
        const status = error.response?.status ?? 0;
        const message =
      error.response?.data?.message ||
      (status === 409
          ? "El usuario ya existe"
          : "Error al registrar el usuario");

        // Normalizamos el error para que tenga un formato consistente
        const normalized = new Error(message);
        normalized.status = status;

        throw normalized;
    }
};

// Llamada a la API para actualizar el avatar del usuario
export const updateAvatar = async (imageUrl) => {
    try {
        const { data } = await axios.patch(
            `${AUTH_BASE_URL}/me/avatar`,
            { imageUrl },
            { withCredentials: true }
        );
        return data.user;
    } catch (error) {
        const status = error.response?.status ?? 0;
        const message = error.response?.data?.message || "No se pudo actualizar el avatar";
        const normalized = new Error(message);
        normalized.status = status;
        throw normalized;
    }
};

// Llamada a la API para cerrar sesión
export const logout = async () => {
    try {
        const { data } = await axios.post(`${AUTH_BASE_URL}/logout`, null, {
            withCredentials: true,
        });

        return data;
    } catch (error) {
        let status = 0;
        let message = "No se pudo cerrar sesión";

        if (axios.isAxiosError(error)) {
            status = error.response?.status ?? 0;

            if (!error.response) {
                message = "No hay conexión con el servidor";
            } else {
                switch (status) {
                    case 401:
                        message = "Sesión ya expirada";
                        break;
                    case 403:
                        message = "No autorizado para cerrar sesión";
                        break;
                    case 500:
                        message = "Error interno del servidor";
                        break;
                    default:
                        message = error.response.data?.message || message;
                }
            }
        } else {
            message = "Error inesperado";
        }

        const normalized = new Error(message);
        normalized.status = status;
        normalized.originalError = error;

        throw normalized;
    }
};

//Llama a la API para restablecer la contraseña con el token recibido por email
export const resetPassword = async (token, password) => {
    try {
        const { data } = await axios.post(`${AUTH_BASE_URL}/reset-password`, { token, password }, { withCredentials: true });
        return data;
    } catch (error) {
        const status = error.response?.status ?? 0;
        const message = error.response?.data?.message || "Error al restablecer la contraseña";
        const normalized = new Error(message);
        normalized.status = status;
        normalized.originalError = error;
        throw normalized;
    }
};

//Llama a la API para enviar el email de recuperación de contraseña
export const sendForgotPasswordEmail = async (email) => {
    try{
        const {data} = await axios.post(`${AUTH_BASE_URL}/forgot-password`, {email}, {withCredentials: true});
        
        return data;

    } catch (error) {
        const status = error.response?.status ?? 0;
        const message = error.response?.data?.message || "Error al enviar el email de recuperación";

        const normalized = new Error(message);
        normalized.status = status;
        normalized.originalError = error;

        throw normalized;

    }
}