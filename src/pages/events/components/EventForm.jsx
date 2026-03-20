import styles from "./EventForm.module.css";

export default function EventForm({
    values,
    onChange,
    disabled,
    idPrefix = "event",
}) {
    return (
        <>
            <div className={styles.field}>
                <label htmlFor={`${idPrefix}-title`}>Título</label>
                <input
                    id={`${idPrefix}-title`}
                    name="title"
                    value={values.title}
                    onChange={onChange}
                    required
                    disabled={disabled}
                />
            </div>

            <div className={styles.row}>
                <div className={styles.field}>
                    <label htmlFor={`${idPrefix}-date`}>Fecha y hora</label>
                    <input
                        id={`${idPrefix}-date`}
                        type="datetime-local"
                        name="date"
                        value={values.date}
                        onChange={onChange}
                        required
                        disabled={disabled}
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor={`${idPrefix}-location`}>Lugar</label>
                    <input
                        id={`${idPrefix}-location`}
                        name="location"
                        value={values.location}
                        onChange={onChange}
                        disabled={disabled}
                    />
                </div>
            </div>

            <div className={styles.field}>
                <label htmlFor={`${idPrefix}-description`}>Descripción</label>
                <textarea
                    id={`${idPrefix}-description`}
                    name="description"
                    rows={4}
                    value={values.description}
                    onChange={onChange}
                    disabled={disabled}
                />
            </div>
        </>
    );
}
