import { IconSearch } from "@tabler/icons-react";
import styles from "./EventFilters.module.css";

//Valores del filtro de tiempo que se guardarán en el state timeFilter
const TIME_OPTIONS = [
    { value: "all", label: "Todos" },
    { value: "upcoming", label: "Próximos" },
    { value: "past", label: "Pasados" },
];

export default function EventFilters({
    search,
    onSearchChange,
    timeFilter,
    onTimeFilterChange,
}) {
    return (
        <div className={styles.bar}>
            {/** Muestra los botones para filtrar por tiempo */}
            <div className={styles.tabs}>
                {TIME_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        className={
                            timeFilter === opt.value
                                ? `${styles.tab} ${styles.tabActive}`
                                : styles.tab
                        }
                        onClick={() => onTimeFilterChange(opt.value)} //Cambia el filtro de tiempo
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
            
            {/** Muestra el input para filtrar por busqueda */}
            <div className={styles.searchWrapper}>
                <IconSearch size={15} stroke={2} className={styles.searchIcon} />
                <input
                    type="search"
                    placeholder="Buscar evento..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
        </div>
    );
}
