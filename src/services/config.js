// URL base del backend.
// En producción: definir VITE_API_URL con la URL completa (ej: https://xxx.onrender.com).
// En desarrollo: se construye automáticamente desde VITE_BACK_HOST + VITE_BACK_PORT.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  `http://${import.meta.env.VITE_BACK_HOST}:${import.meta.env.VITE_BACK_PORT}`;
