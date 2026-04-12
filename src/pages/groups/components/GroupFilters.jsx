import styles from "./GroupFilters.module.css";

export default function GroupFilters({ search, onSearchChange }) {
    return (
        <div className={styles.filters}>
            <div className={styles.field}>
                <label className={styles.label} htmlFor="group-search">Buscar</label>
                <input
                    id="group-search"
                    type="text"
                    placeholder="Buscar grupo..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className={styles.input}
                />
            </div>
        </div>
    );
}
