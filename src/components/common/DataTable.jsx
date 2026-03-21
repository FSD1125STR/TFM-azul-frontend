import styles from "./DataTable.module.css";

//Componente de tabla genérico y reutilizable.
//columns: array de { label, center? } para el encabezado.
//children: filas <tr> del cuerpo de la tabla (cada página renderiza las suyas).
export default function DataTable({ columns, children }) {
    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((col, i) => (
                            <th
                                key={i}
                                className={`${styles.th} ${col.center ? styles.thCenter : ""}`}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}
