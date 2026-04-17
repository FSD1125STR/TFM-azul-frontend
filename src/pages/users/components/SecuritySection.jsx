/**
 * SecuritySection
 *
 * Renders the "Security & Password" card inside AccountSettings.
 * The current-password field is disabled until the user starts typing a new password.
 *
 * @param {object} props
 * @param {{ currentPassword: string, newPassword: string, confirmPassword: string }} props.passwords
 * @param {boolean}  props.passwordChangeActive - true when newPassword or confirmPassword is non-empty
 * @param {Function} props.onPasswordChange     - (field, value) => void
 */

import styles from "../AccountSettings.module.css";

export default function SecuritySection({ passwords, passwordChangeActive, onPasswordChange }) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2>Seguridad &amp; Contraseña</h2>
            </div>

            <div className={styles.stack}>
                <label className={styles.field}>
                    <span className={styles.label}>Contraseña actual</span>
                    {/** Input de contraseña actual, solo se habilita si se escribe la nueva contraseña */}
                    <input
                        className={styles.input}
                        type="password"
                        value={passwords.currentPassword}
                        onChange={(e) => onPasswordChange("currentPassword", e.target.value)} //Cambia el estado de passwords, el campo currentPassword
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
                
                {/** Input de la nueva contraseña */}
                <label className={styles.field}>
                    <span className={styles.label}>Nueva contraseña</span>
                    <input
                        className={styles.input}
                        type="password"
                        value={passwords.newPassword}
                        onChange={(e) => onPasswordChange("newPassword", e.target.value)} //Cambia el estado de passwords, el campo newPassword
                        autoComplete="new-password"
                    />
                </label>
                
                {/** Input de confirmacion de la nueva contraseña */}
                <label className={styles.field}>
                    <span className={styles.label}>Confirmar contraseña</span>
                    <input
                        className={styles.input}
                        type="password"
                        value={passwords.confirmPassword}
                        onChange={(e) => onPasswordChange("confirmPassword", e.target.value)} //Cambia el estado de passwords, el campo confirmPassword
                        autoComplete="new-password"
                    />
                </label>
            </div>
        </div>
    );
}
