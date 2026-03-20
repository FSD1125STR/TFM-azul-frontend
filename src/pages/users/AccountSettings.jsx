import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AccountSettings.module.css";
import { AuthContext } from "../../hooks/context/AuthContext.jsx";
import {
    updateUser,
    getUserImageUploadSignature,
    updateUserImage,
    deleteUser,
} from "../../services/apiUser.js";

const loadImageFromBlob = (blob) =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = (e) => {
            URL.revokeObjectURL(url);
            reject(e);
        };
        img.src = url;
    });

const canvasToBlob = (canvas, type, quality) =>
    new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), type, quality);
    });

const fileToOptimizedBlob = async (file, { maxSize = 512, quality = 0.85 } = {}) => {
    const img = await loadImageFromBlob(file);
    const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
    const width = Math.max(1, Math.round(img.width * ratio));
    const height = Math.max(1, Math.round(img.height * ratio));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(img, 0, 0, width, height);

    const webp = await canvasToBlob(canvas, "image/webp", quality);
    if (webp && webp.size > 0) return webp;

    const jpeg = await canvasToBlob(canvas, "image/jpeg", quality);
    if (jpeg && jpeg.size > 0) return jpeg;

    return file;
};

const uploadToCloudinary = async (file, signatureData) => {
    const cloudName = signatureData?.cloudName;
    const apiKey = signatureData?.apiKey;
    const timestamp = signatureData?.timestamp;
    const signature = signatureData?.signature;
    const folder = signatureData?.folder;
    const allowed_formats = signatureData?.allowed_formats;
    const type = signatureData?.type;

    if (!cloudName || !apiKey || !timestamp || !signature) {
        throw new Error("Faltan datos para subir la imagen");
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);
    if (folder) form.append("folder", folder);
    if (allowed_formats) form.append("allowed_formats", allowed_formats);
    if (type) form.append("type", type);

    const response = await fetch(endpoint, { method: "POST", body: form });
    if (!response.ok) {
        throw new Error("No se pudo subir la imagen a Cloudinary");
    }

    const data = await response.json();
    return data?.secure_url ?? data?.url ?? "";
};

export default function AccountSettings() {
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);

    const displayName = useMemo(
        () => user?.name ?? user?.username ?? "Nombre usuario",
        [user],
    );
    const displayUsername = useMemo(() => user?.username ?? "username", [user]);
    const initials = useMemo(() => {
        const base = (user?.name ?? user?.username ?? "").trim();
        if (!base) return "U";
        const parts = base.split(/\s+/).filter(Boolean);
        const first = parts[0]?.[0] ?? "U";
        const second = (parts[1]?.[0] ?? parts[0]?.[1] ?? "").trim();
        return (first + second).toUpperCase();
    }, [user]);

    const [profile, setProfile] = useState({
        name: "",
        username: "",
        email: "",
    });
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
    const [avatarRemove, setAvatarRemove] = useState(false);
    const [avatarBusy, setAvatarBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const passwordChangeActive = Boolean(passwords.newPassword || passwords.confirmPassword);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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

    const avatarPreview = avatarRemove ? "" : (avatarPreviewUrl || user?.image || "");

    const resetAvatarDraft = () => {
        if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
        setAvatarPreviewUrl("");
        setAvatarFile(null);
        setAvatarRemove(false);
    };

    const handleAvatarChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError("");
        setNotice("");

        if (!file.type?.startsWith("image/")) {
            setError("Selecciona un archivo de imagen válido.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("La imagen es demasiado grande (máximo 5MB).");
            return;
        }

        setAvatarBusy(true);
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

    const handleAvatarRemove = () => {
        if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
        setAvatarPreviewUrl("");
        setAvatarFile(null);
        setAvatarRemove(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setNotice("");

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
            const payload = {
                name: profile.name,
                username: profile.username,
                email: profile.email,
            };

            if (passwords.newPassword) {
                payload.currentPassword = passwords.currentPassword;
                payload.newPassword = passwords.newPassword;
            }

            const result = await updateUser(payload);
            const updatedUser = result?.user ?? result?.data?.user;

            let nextUser =
                updatedUser ?? {
                    ...(user ?? {}),
                    name: profile.name,
                    username: profile.username,
                    email: profile.email,
                };

            if (avatarRemove || avatarFile) {
                setAvatarBusy(true);
                try {
                    let imageUrl = "";
                    if (!avatarRemove && avatarFile) {
                        const signatureData = await getUserImageUploadSignature();
                        imageUrl = await uploadToCloudinary(avatarFile, signatureData);
                        if (!imageUrl) throw new Error("No se pudo obtener la URL de la imagen");
                    }

                    const imagePayload = { imageUrl };
                    const imageResult = await updateUserImage(imagePayload);
                    const imageUser = imageResult?.user ?? imageResult?.data?.user;
                    nextUser = imageUser ?? { ...nextUser, image: imageUrl };
                    resetAvatarDraft();
                } finally {
                    setAvatarBusy(false);
                }
            }

            setUser?.(nextUser);

            setNotice("Changes saved successfully.");
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDelete = async () => {
        setError("");
        setNotice("");

        try {
            await deleteUser();
            setUser(null);
            setNotice("Account deleted successfully.");
            navigate("/");
        } catch (error) {
            setError(error.message);
        }
    };

    if (!user) return null;

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Account Settings</h1>

            <form className={styles.card} onSubmit={handleSubmit}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.sectionTitle}>Profile Information</h2>
                </div>

                <div className={styles.profileRow}>
                    <div className={styles.avatarWrap} aria-hidden="true">
                        {avatarPreview ? (
                            <img className={styles.avatarImg} src={avatarPreview} alt="" />
                        ) : (
                            <div className={styles.avatarFallback}>{initials}</div>
                        )}
                    </div>

                    <div className={styles.profileMeta}>
                        <div className={styles.profileName}>{displayName}</div>
                        <div className={styles.profileUsername}>{displayUsername}</div>

                        <div className={styles.avatarControls}>
                            <label className={styles.fileLabel}>
                                <span
                                    className={`${styles.fileLabelText} ${avatarBusy ? styles.fileLabelTextDisabled : ""}`}
                                >
                                    {avatarBusy ? "Cargando..." : "Cambiar foto"}
                                </span>
                                <input
                                    className={styles.fileInput}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    disabled={avatarBusy}
                                />
                            </label>

                            <button
                                type="button"
                                className={styles.avatarRemove}
                                onClick={handleAvatarRemove}
                                disabled={avatarBusy || !avatarPreview}
                            >
                                Quitar
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.grid}>
                    <label className={styles.field}>
                        <span className={styles.label}>Full name</span>
                        <input
                            className={styles.input}
                            value={profile.name}
                            onChange={(e) =>
                                setProfile((p) => ({ ...p, name: e.target.value }))
                            }
                            placeholder="Nombre completo"
                            autoComplete="name"
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.label}>Username</span>
                        <input
                            className={styles.input}
                            value={profile.username}
                            onChange={(e) =>
                                setProfile((p) => ({ ...p, username: e.target.value }))
                            }
                            placeholder="username"
                            autoComplete="username"
                        />
                    </label>

                    <label className={`${styles.field} ${styles.fullRow}`}>
                        <span className={styles.label}>Email</span>
                        <input
                            className={styles.input}
                            value={profile.email}
                            onChange={(e) =>
                                setProfile((p) => ({ ...p, email: e.target.value }))
                            }
                            placeholder="email@domain.com"
                            autoComplete="email"
                        />
                    </label>
                </div>

                <div className={styles.divider} />

                <h2 className={styles.sectionTitle}>Security &amp; Password</h2>

                <div className={styles.stack}>
                    <label className={styles.field}>
                        <span className={styles.label}>Current Password</span>
                        <input
                            className={styles.input}
                            type="password"
                            value={passwords.currentPassword}
                            onChange={(e) =>
                                setPasswords((p) => ({ ...p, currentPassword: e.target.value }))
                            }
                            disabled={!passwordChangeActive}
                            readOnly={!passwordChangeActive}
                            placeholder={
                                passwordChangeActive
                                    ? "Tu contraseña actual"
                                    : "Escribe una nueva contraseña para habilitar"
                            }
                            autoComplete="current-password"
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.label}>New Password</span>
                        <input
                            className={styles.input}
                            type="password"
                            value={passwords.newPassword}
                            onChange={(e) =>
                                setPasswords((p) => ({ ...p, newPassword: e.target.value }))
                            }
                            autoComplete="new-password"
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.label}>Confirm Password</span>
                        <input
                            className={styles.input}
                            type="password"
                            value={passwords.confirmPassword}
                            onChange={(e) =>
                                setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))
                            }
                            autoComplete="new-password"
                        />
                    </label>
                </div>

                {(error || notice) && (
                    <div
                        className={`${styles.message} ${error ? styles.error : styles.success}`}
                        role="status"
                    >
                        {error || notice}
                    </div>
                )}

                <div className={styles.footer}>
                    <button
                        type="button"
                        className={styles.cancel}
                        onClick={() => navigate(-1)}
                    >
            Cancelar
                    </button>
                    <button type="submit" className={styles.save}>
            Save Changes
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        className={styles.delete}
                    >
            Delete Account
                    </button>
                </div>
            </form>
        </div>
    );
}
