/**
 * AccountSettings (page)
 *
 * Thin orchestration layer: wires useAccountSettings hook to ProfileSection,
 * SecuritySection, action buttons, and the ConfirmModal for account deletion.
 * All business logic lives in useAccountSettings; all section rendering lives
 * in the sub-components.
 */

import { useNavigate } from "react-router-dom";
import styles from "./AccountSettings.module.css";
import { useAccountSettings } from "../../hooks/useAccountSettings.js";
import ProfileSection from "./components/ProfileSection.jsx";
import SecuritySection from "./components/SecuritySection.jsx";
import { Button } from "../../components/ui/Button.jsx";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";

export default function AccountSettings() {
    const navigate = useNavigate();

    //Custom Hook para la logica de ajustes del usuario
    const {
        user,
        displayName,
        displayUsername,
        initials,
        profile,
        setProfile,
        passwords,
        setPasswords,
        passwordChangeActive,
        avatarPreview,
        avatarBusy,
        handleAvatarChange,
        handleAvatarRemove,
        error,
        notice,
        handleSubmit,
        showDeleteConfirm,
        setShowDeleteConfirm,
        handleDelete,
    } = useAccountSettings({ navigate });

    if (!user) return null;

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <h1 className={styles.title}>Configuración de usuario</h1>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {/** Sección de información del perfil */}
                    <ProfileSection
                        avatarPreview={avatarPreview}
                        avatarBusy={avatarBusy}
                        initials={initials}
                        displayName={displayName}
                        displayUsername={displayUsername}
                        onAvatarChange={handleAvatarChange}
                        onAvatarRemove={handleAvatarRemove}
                        profile={profile}
                        onProfileChange={(field, value) =>
                            setProfile((p) => ({ ...p, [field]: value }))
                        }
                    />

                    {/** Sección de información de credenciales */}
                    <SecuritySection
                        passwords={passwords}
                        passwordChangeActive={passwordChangeActive}
                        onPasswordChange={(field, value) =>
                            setPasswords((p) => ({ ...p, [field]: value }))
                        }
                    />

                    {/**Se muestra un error o notificacion para mostrar la info al usuario */}
                    {(error || notice) && (
                        <div
                            className={`${styles.message} ${error ? styles.error : styles.success}`}
                            role="status"
                        >
                            {error || notice}
                        </div>
                    )}
                    
                    {/** Seccion de botones para finalizar el formulario */}
                    <div className={styles.actions}>
                        {/** Botton de cancelar. Navega a la pagina anterior */}
                        <Button
                            variant="secondary"
                            className={styles.secondaryButton}
                            onClick={() => navigate(-1)}
                        >
                            Cancelar
                        </Button>

                        {/** Botton de submit. Ejecuta el submit del formulario */}
                        <Button
                            type="submit" //Ejecuta el submit del formulario
                            className={styles.primaryButton}
                        >
                            Guardar
                        </Button>

                        {/** Botton de borrar cuenta. Muestra la modal de confirmacion */}
                        <Button
                            variant="danger"
                            className={styles.dangerButton}
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            Borrar cuenta
                        </Button>
                    </div>
                </form>
            </div>

            <ConfirmModal
                open={showDeleteConfirm}
                title="Borrar cuenta"
                description="¿Estás seguro de que quieres borrar tu cuenta? Esta acción no se puede deshacer."
                confirmLabel="Borrar cuenta"
                cancelLabel="Cancelar"
                onCancel={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
}
