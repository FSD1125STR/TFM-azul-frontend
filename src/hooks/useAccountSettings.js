/**
 * useAccountSettings
 *
 * Encapsulates all state, derived values, effects, and handlers for the
 * AccountSettings page. Accepts `{ navigate }` so the page component keeps
 * ownership of routing while this hook owns all data concerns.
 *
 * Returns a flat object consumed by AccountSettings.jsx and its sub-components.
 */

import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./context/AuthContext.jsx";
import {
    updateUser,
    getUserImageUploadSignature,
    updateUserImage,
    deleteUser,
} from "../services/apiUser.js";
import { fileToOptimizedBlob, uploadToCloudinary } from "../utils/imageProcessing.js";

export function useAccountSettings({ navigate }) {

    //---- States ----

    // Extraemos el usuario a partir del conexto
    const { user, setUser } = useContext(AuthContext);

    //Extraemos el nombre y el username en useMemo para guardar el valor sin renderizar
    const displayName = useMemo(
        () => user?.name ?? user?.username ?? "Nombre usuario",
        [user],
    );
    const displayUsername = useMemo(() => user?.username ?? "username", [user]);

    //Calculamos las iniciales del usuario, en useMemo para guardar el valor y no calcularlo entre renders
    const initials = useMemo(() => {
        const base = (user?.name ?? user?.username ?? "").trim();
        if (!base) return "U";
        const parts = base.split(/\s+/).filter(Boolean);
        const first = parts[0]?.[0] ?? "U";
        const second = (parts[1]?.[0] ?? parts[0]?.[1] ?? "").trim();
        return (first + second).toUpperCase();
    }, [user]);

    //Estados para los campos del formulario de perfil de usuario
    const [profile, setProfile] = useState({ name: "", username: "", email: "" });

    //Estados para los campos del formulario de seguridad y contraseñas
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    //Si hay info en newPassword o currentPassword habilitamos el currentPassword
    const passwordChangeActive = Boolean(passwords.newPassword || passwords.confirmPassword);

    //Estados para la imagen del usuario / avatar
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
    const [avatarRemove, setAvatarRemove] = useState(false);
    const [avatarBusy, setAvatarBusy] = useState(false); //True cuandos e esta subiendo la imagen

    //Estados de errores, notificasciones y para mostrar modal de confirmación
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    //---- Use Effects ----

    //Actualiza el estado del perfil si cambia el usuario
    useEffect(() => {
        setProfile({
            name: user?.name ?? "",
            username: user?.username ?? "",
            email: user?.email ?? "",
        });
    }, [user]);

    
    useEffect(() => {
        if (!passwordChangeActive && passwords.currentPassword) {
            setPasswords((p) => ({ ...p, currentPassword: "" }));
        }
    }, [passwordChangeActive, passwords.currentPassword]);

    useEffect(() => {
        return () => {
            if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
        };
    }, [avatarPreviewUrl]);

    // ── Derived avatar preview ───────────────────────────────────────────────
    const avatarPreview = avatarRemove ? "" : (avatarPreviewUrl || user?.image || "");

    //
    const resetAvatarDraft = () => {
        if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
        setAvatarPreviewUrl("");
        setAvatarFile(null);
        setAvatarRemove(false);
    };

    //Maneja cuando el usuario inserta una nueva imagen para el usuario, m ostrandola en el preview
    const handleAvatarChange = async (event) => {
        //Extraemos el archivo seleccionado
        const file = event.target.files?.[0];
        if (!file) return;

        setError("");
        setNotice("");

        // Validamos el tipo y tamaño de archivo
        if (!file.type?.startsWith("image/")) {
            setError("Selecciona un archivo de imagen válido.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("La imagen es demasiado grande (máximo 5MB).");
            return;
        }

        //Marcamos como ocupado, para que no pueda seleccionar otro mientras subimos la imagen
        setAvatarBusy(true);

        //Mostramos la imagen subida en el preview
        try {
            const optimizedBlob = await fileToOptimizedBlob(file);
            const nextPreviewUrl = URL.createObjectURL(optimizedBlob);

            if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
            setAvatarPreviewUrl(nextPreviewUrl);
            setAvatarFile(optimizedBlob);
            setAvatarRemove(false);
        } catch {
            setError("No se pudo cargar la imagen. Intenta con otro archivo.");
        } finally {
            setAvatarBusy(false);
            event.target.value = "";
        }
    };

    //Elimina la imagen del preview
    const handleAvatarRemove = () => {
        if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
        setAvatarPreviewUrl("");
        setAvatarFile(null);
        setAvatarRemove(true);
    };

    //Maneja el submit del formulario, modificando la info del usuario
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setNotice("");

        //Valida que el usuario ponga la contraseña actual antes de cambiarla y que las nuevas coincidan
        if (
            passwords.newPassword ||
            passwords.confirmPassword ||
            passwords.currentPassword
        ) {
            if (!passwords.currentPassword) {
                setError("Introduce tu contraseña actual para cambiarla.");
                return;
            }
            if (passwords.newPassword !== passwords.confirmPassword) {
                setError("La nueva contraseña y la confirmación no coinciden.");
                return;
            }
        }

        try {
            //Construye el payload de la peticion, incluyendo la nueva contraseña si existe
            const payload = {
                name: profile.name,
                username: profile.username,
                email: profile.email,
            };

            if (passwords.newPassword) {
                payload.currentPassword = passwords.currentPassword;
                payload.newPassword = passwords.newPassword;
            }

            //Llama a la API para actualizar la info del usuario
            const result = await updateUser(payload);
            const updatedUser = result?.user ?? result?.data?.user;

            let nextUser =
                updatedUser ?? {
                    ...(user ?? {}),
                    name: profile.name,
                    username: profile.username,
                    email: profile.email,
                };
            
            //Si hay imagen o se borró, actualizamos cloudinary
            if (avatarRemove || avatarFile) {
                setAvatarBusy(true);
                try {
                    let imageUrl = "";
                    //Subimos la imagen a cloudinary, usando al firma del backend
                    if (!avatarRemove && avatarFile) {
                        const signatureData = await getUserImageUploadSignature();
                        imageUrl = await uploadToCloudinary(avatarFile, signatureData);
                        if (!imageUrl) throw new Error("No se pudo obtener la URL de la imagen");
                    }

                    //Actualizamos la imagen del usuario
                    const imagePayload = { imageUrl };
                    const imageResult = await updateUserImage(imagePayload);
                    const imageUser = imageResult?.user ?? imageResult?.data?.user;
                    nextUser = imageUser ?? { ...nextUser, image: imageUrl };
                    resetAvatarDraft();
                } finally {
                    setAvatarBusy(false);
                }
            }

            setUser?.(nextUser); //Actualizamos el estado del usuario con la nueva info
            setNotice("Usuario actualizado correctamente.");
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });

        } catch (err) {
            setError(err.message);
        }
    };

    // Maneja la accion de eliminar un usuario
    const handleDelete = async () => {
        setError("");
        setNotice("");

        try {
            await deleteUser();
            setUser(null);
            setNotice("Cuenta eliminada correctamente.");
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    };

    return {
        //Info del usuario
        user,
        //Displays para mostrar la info del usuario
        displayName,
        displayUsername,
        initials,
        //Info y estado del perfil
        profile,
        setProfile,
        //Info y estados de password
        passwords,
        setPasswords,
        passwordChangeActive,
        //Info y estados del preview de la imagen
        avatarPreview,
        avatarBusy,
        handleAvatarChange,
        handleAvatarRemove,
        //Estados para informar al usuario
        error,
        notice,
        //Manejo del submir del usuario
        handleSubmit,
        //Manejo de la modal de confirmación
        showDeleteConfirm,
        setShowDeleteConfirm,
        handleDelete,
    };
}
