import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Name is required"),

    username: z
        .string()
        .trim()
        .min(1, "Username is required"),

    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Invalid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
    
    repeatPassword: z
        .string()
        .min(1, "Repeat password is required")

}).refine((data) => data.password === data.repeatPassword, {
    path: ["repeatPassword"],
    message: "Passwords don't match",
});
