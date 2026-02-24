import styles from "./CrewFilters.module.css";

// Componente que renderiza la seccion de filtros y guarda los campos en los correspondientes estados de MyCrews
export default function CrewFilters({
    search,
    onSearchChange,
    activity,
    onActivityChange,
    role,
    onRoleChange,
    activities,
}) {

    return (
        <>
            {/* Seccion de filtros */}
            <div className={styles.filters}>
                {/* Campo de buscador - Al cambiar setea el estado de search */}
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="crew-search">Buscar</label>
                    <input
                        id="crew-search"
                        type="text"
                        placeholder="Buscar crew..."
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        className={styles.input}
                    />
                </div>

                {/* Campo de seleccion actividad  - Al cambiar setea el estado de actividad*/}
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="crew-activity">Actividad</label>
                    <select
                        id="crew-activity"
                        value={activity}
                        onChange={(event) => onActivityChange(event.target.value)}
                        className={styles.select}
                    >
                        <option value="">Todas</option>
                        {activities.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* Campo de seleccion rol  - Al cambiar setea el estado de rol*/}
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="crew-role">Rol</label>
                    <select
                        id="crew-role"
                        value={role}
                        onChange={(event) => onRoleChange(event.target.value)}
                        className={styles.select}
                    >
                        <option value="">Todos</option>
                        <option value="Admin">Admin</option>
                        <option value="Member">Member</option>
                    </select>
                </div>
            </div>
        </>
    );
}
