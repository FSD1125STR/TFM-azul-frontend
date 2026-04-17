import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "El nombre es obligatorio"),

    username: z
        .string()
        .trim()
        .min(1, "El nombre de usuario es obligatorio"),

    email: z
        .string()
        .trim()
        .min(1, "El correo electrónico es obligatorio")
        .email("Dirección de correo electrónico inválida"),

    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres"),
    
    repeatPassword: z
        .string()
        .min(1, "La contraseña de confirmación es obligatoria")

}).refine((data) => data.password === data.repeatPassword, {
    path: ["repeatPassword"],
    message: "Las contraseñas no coinciden",
});
