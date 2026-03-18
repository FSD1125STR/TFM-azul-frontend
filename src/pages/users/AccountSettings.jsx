import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AccountSettings.module.css";
import { AuthContext } from "../../hooks/context/AuthContext.jsx";
import { updateUser, updateUserImage, deleteUser } from "../../services/apiUser.js";

const readFileAsDataURL = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

const loadImage = (src) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });

const fileToOptimizedDataURL = async (file, { maxSize = 256, quality = 0.85 } = {}) => {
    const originalDataUrl = await readFileAsDataURL(file);
    const img = await loadImage(originalDataUrl);

    const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
    const width = Math.max(1, Math.round(img.width * ratio));
    const height = Math.max(1, Math.round(img.height * ratio));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return originalDataUrl;

    ctx.drawImage(img, 0, 0, width, height);

    const webp = canvas.toDataURL("image/webp", quality);
    if (webp && webp.startsWith("data:image/webp")) return webp;

    const jpeg = canvas.toDataURL("image/jpeg", quality);
    if (jpeg && jpeg.startsWith("data:image/jpeg")) return jpeg;

    return originalDataUrl;
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
    const [avatarDraft, setAvatarDraft] = useState(null); // null = sin cambios, "" = quitar, "data:*" = nueva imagen
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

    const avatarPreview = avatarDraft !== null ? avatarDraft : (user?.image ?? "");

    const handleAvatarChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError("");
        setNotice("");

        if (!file.type?.startsWith("image/")) {
            setError("Selecciona un archivo de imagen vÃ¡lido.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("La imagen es demasiado grande (mÃ¡ximo 5MB).");
            return;
        }

        setAvatarBusy(true);
        try {
            const optimized = await fileToOptimizedDataURL(file);
            setAvatarDraft(optimized);
        } catch {
            setError("No se pudo cargar la imagen. Intenta con otro archivo.");
        } finally {
            setAvatarBusy(false);
            event.target.value = "";
        }
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

            if (avatarDraft !== null) {
                const imagePayload = { imageUrl: avatarDraft || "" };
                const imageResult = await updateUserImage(imagePayload);
                const imageUser = imageResult?.user ?? imageResult?.data?.user;
                nextUser = imageUser ?? { ...nextUser, image: avatarDraft || "" };
                setAvatarDraft(null);
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
                                onClick={() => setAvatarDraft("")}
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
