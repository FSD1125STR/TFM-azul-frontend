import styles from "./EventForm.module.css";

// Campos del formulario de evento, usando react hook form
export default function EventForm({ register, errors, disabled }) {
    return (
        <>
            <div className={styles.field}>
                <label>Título</label>
                <input {...register("title")} disabled={disabled} />
                {errors.title && <span className={styles.fieldError}>{errors.title.message}</span>}
            </div>

            <div className={styles.row}>
                <div className={styles.field}>
                    <label>Fecha y hora</label>
                    <input type="datetime-local" {...register("date")} disabled={disabled} />
                    {errors.date && <span className={styles.fieldError}>{errors.date.message}</span>}
                </div>

                <div className={styles.field}>
                    <label>Lugar</label>
                    <input {...register("location")} disabled={disabled} />
                    {errors.location && <span className={styles.fieldError}>{errors.location.message}</span>}
                </div>
            </div>

            <div className={styles.field}>
                <label>Descripción</label>
                <textarea rows={4} {...register("description")} disabled={disabled} />
                {errors.description && <span className={styles.fieldError}>{errors.description.message}</span>}
            </div>
        </>
    );
}
