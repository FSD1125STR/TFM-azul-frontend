import axios from "axios";

const { VITE_BACK_HOST, VITE_BACK_PORT } = import.meta.env;
const API_BASE_URL = `http://${VITE_BACK_HOST}:${VITE_BACK_PORT}`;
const AUTH_BASE_URL = `${API_BASE_URL}/api/users`;

// Llamada a la API para iniciar sesion
export const login = async (username, password) => {
  try {
    const { data } = await axios.post(`${AUTH_BASE_URL}/login`, {
      username,
      password,
    });

    return data;

  } catch (error) { //Fallo de login
    const status = error.response?.status ?? 0;
    const message = error.response?.data?.message ||
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
