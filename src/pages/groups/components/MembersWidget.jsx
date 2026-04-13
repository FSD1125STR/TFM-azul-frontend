import WidgetCard from "../../../components/ui/WidgetCard.jsx";
import styles from "./MembersWidget.module.css";

const MAX_VISIBLE = 5;

export default function MembersWidget({ members }) {
    // Calculamos los miembros visibles y el conteo de miembros extra para mostrar en el widget
    const visible = members.slice(0, MAX_VISIBLE);
    const extra = Math.max(0, members.length - MAX_VISIBLE);

    return (
        //Widget como contenedor con titulo, link y mensaje de vacío, renderiza a su hijo con la lista de miembros si no está vacío
        <WidgetCard
            title="Miembros"
            linkTo="members"
            linkLabel="Ver todos"
            isEmpty={members.length === 0}
            emptyMessage="Este grupo todavía no tiene miembros."
        >
            <ul className={styles.list}>
                {visible.map((member) => (
                    <li key={member.id} className={styles.row}>
                        {/** Avatar del miembro: imagen si existe, inicial si no */}
                        {member.image ? (
                            <img src={member.image} alt={member.name || member.username} className={styles.avatar} />
                        ) : (
                            <span className={styles.avatar}>
                                {(member.name || member.username)?.[0]?.toUpperCase() ?? "?"}
                            </span>
                        )}

                        {/** Información del miembro: nombre y rol */}
                        <div className={styles.info}>
                            <span className={styles.name}>
                                {member.name || member.username}
                            </span>
                            <span className={styles.role}>{member.role}</span>
                        </div>
                    </li>
                ))}
                
                {extra > 0 && (
                    <li className={styles.extra}>+{extra} más</li>
                )}
            </ul>
        </WidgetCard>
    );
}
