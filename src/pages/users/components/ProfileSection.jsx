/**
 * ProfileSection
 *
 * Renders the "Profile Information" card inside AccountSettings.
 * Handles avatar display/upload controls and the name/username/email fields.
 *
 * @param {object} props
 * @param {string}   props.avatarPreview     - URL of the current avatar (or "")
 * @param {boolean}  props.avatarBusy        - true while image is being processed
 * @param {string}   props.initials          - fallback initials for avatarFallback
 * @param {string}   props.displayName       - display name shown in the profile row
 * @param {string}   props.displayUsername   - username shown in the profile row
 * @param {Function} props.onAvatarChange    - input onChange handler
 * @param {Function} props.onAvatarRemove    - "Quitar" button handler
 * @param {{ name: string, username: string, email: string }} props.profile
 * @param {Function} props.onProfileChange   - (field, value) => void
 */

import styles from "../AccountSettings.module.css";

export default function ProfileSection({
    avatarPreview, //url del preview de la imagen
    avatarBusy, //Estado para saber si se esta subiendo una imagen y deshbilitar el boton
    initials, //Iniciales del usuario por si no hay imagen
    displayName, //Nombre del usuario
    displayUsername, //username
    onAvatarChange, //Detecta que se selecciono una imagen y la muestra en el preview
    onAvatarRemove, //Borra el archivo y el preview de la imagen del usuario
    profile, //Datos del perfil para cubrir los inputs del formulario
    onProfileChange, //Funcion que recibe el campo y el valor a actualizar en el estado del perfil
}) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2>Información del perfil</h2>
            </div>

            <div className={styles.profileRow}>
                {/** Avatar/Imagen del usuario */}
                <div className={styles.avatarWrap} aria-hidden="true">
                    {avatarPreview ? (
                        <img className={styles.avatarImg} src={avatarPreview} alt="" />
                    ) : (
                        <div className={styles.avatarFallback}>{initials}</div>
                    )}
                </div>
                
                {/** Seccion de datos del perfil y botones de edicion de imagen */}
                <div className={styles.profileMeta}>
                    <div className={styles.profileName}>{displayName}</div>
                    <div className={styles.profileUsername}>{displayUsername}</div>
                    
                    {/** Botones para subir o borrar la imagen del preview */}
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
                                onChange={onAvatarChange}
                                disabled={avatarBusy}
                            />
                        </label>

                        <button
                            type="button"
                            className={styles.avatarRemove}
                            onClick={onAvatarRemove}
                            disabled={avatarBusy || !avatarPreview}
                        >
                            Quitar
                        </button>
                    </div>
                </div>
            </div>
            
            {/**Formulario para modificar los datos del usuario: name, username y email */}
            <div className={styles.grid}>
                <label className={styles.field}>
                    <span className={styles.label}>Nombre completo</span>
                    <input
                        className={styles.input}
                        value={profile.name}
                        onChange={(e) => onProfileChange("name", e.target.value)} //Cambia en el estado, el campo name
                        placeholder="Nombre completo"
                        autoComplete="name"
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.label}>Usuario</span>
                    <input
                        className={styles.input}
                        value={profile.username}
                        onChange={(e) => onProfileChange("username", e.target.value)} //Cambia en el estado, el campo username
                        placeholder="username"
                        autoComplete="username"
                    />
                </label>

                <label className={`${styles.field} ${styles.fullRow}`}>
                    <span className={styles.label}>Email</span>
                    <input
                        className={styles.input}
                        value={profile.email}
                        onChange={(e) => onProfileChange("email", e.target.value)} //Cambia en el estado, el campo email
                        placeholder="email@domain.com"
                        autoComplete="email"
                    />
                </label>
            </div>
        </div>
    );
}
