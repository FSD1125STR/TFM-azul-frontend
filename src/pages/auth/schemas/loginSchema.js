import { z } from "zod";

export const loginSchema = z.object({
    username: z
        .string()
        .min(1, "El campo usuario es obligatorio"),

    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres"),
});
