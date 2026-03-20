import { IconSearch } from "@tabler/icons-react";
import styles from "./EventFilters.module.css";

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
                        onClick={() => onTimeFilterChange(opt.value)}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

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
