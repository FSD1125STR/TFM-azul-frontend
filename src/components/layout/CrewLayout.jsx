import { useContext } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { CrewContext, CrewProvider } from "../../hooks/context/CrewContext.jsx";
import { IconUserPlus, IconLayoutDashboard, IconCalendarEventFilled, IconFolderFilled, IconChartBar, IconUsers, IconBinaryTree2 } from "@tabler/icons-react";
import styles from "./CrewLayout.module.css";

/* Definimos los elementos del menu de navegacion
  - key: identifica el elemento
  - label: Texto que se mostrará en el menú
  - to: Lo que se añadirá a la url
  - icon: el icono SVG que se muestra
*/
const defaultNavItems = [
    {
        key: "overview",
        label: "Overview",
        to: ".", //Apunta al index del padre (CrewDetails)
        end: true,
        icon: <IconLayoutDashboard size={18} stroke={1.8} />,
    },
    {
        key: "events",
        label: "Events",
        to: "events",
        icon: <IconCalendarEventFilled size={18} />,
    },
    {
        key: "files",
        label: "Files",
        to: "files",
        icon: <IconFolderFilled size={18} />,
    },
    {
        key: "polls",
        label: "Polls",
        to: "polls",
        icon: <IconChartBar size={18} stroke={1.8} />,
    },
    {
        key: "members",
        label: "Members",
        to: "members",
        icon: <IconUsers size={18} stroke={1.8} />,
    },
    {
        key: "groups",
        label: "Groups",
        to: "groups",
        icon: <IconBinaryTree2 size={18} stroke={1.8} />,
    },
];

// Layout para la navegacion dentro de una crew
export default function CrewLayout({ children }) {
    const { idCrew } = useParams(); //Extraemos la crew de los paramtros de la url

    return (
        <>
            {/** ENVOLVEMOS EL CREW LAYOUT CON EL PROVIDER DE LA CREW PARA QUE TODAS SUS RUTAS TENGAN ACCESO AL CONTEXTO Y ACCEDER A LA INFO DE LA CREW */}
            <CrewProvider crewId={idCrew}> 
                <CrewLayoutContent>{children}</CrewLayoutContent>
            </CrewProvider>
        </>
    );
}

// Componente con el contenido del Layout (Menu de navegacion de la crew)
function CrewLayoutContent({ children }) {
    // Utilizamos el CrewContext para poder acceder a toda la info de la Crew
    const { crew } = useContext(CrewContext);

    const name = crew?.name?.trim() || "Crew Name";
    //const imageUrl = crew?.imageUrl ? getCrewImageUrl(crew.imageUrl) : "";
    const initial = name.charAt(0).toUpperCase() || "C";
    const items = defaultNavItems;
    const canManageCrew = crew?.userRolePermission === "admin";

    return (
        <div className={styles.crewLayout}>
            {/** Barra lateral para la navegacion dentro de una crew */}
            <aside className={styles.sidebar}>
                {/*/ Header de la barra lateral con info de la crew */}
                <div className={styles.sidebarHeader}>
                    {/** Imagen de la crew */}
                    <div className={styles.crewAvatar} aria-hidden="true">
                        <span className={styles.crewInitial}>{initial}</span>
                    </div>
                    {/** Nombre e info de la crew */}
                    <div className={styles.crewInfo}>
                        <p className={styles.crewName}>{name}</p>
                        {canManageCrew && <a href="">Editar</a>}
                    </div>
                </div>
            
                {/** Navegacion dentro de la crew */}
                <nav className={styles.nav} aria-label="Crew sections">
                    <ul className={styles.navList}>
                        {items.map((item) => (
                            <li key={item.key}>
                                <NavLink
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        [
                                            styles.navItem,
                                            isActive ? styles.navItemActive : "",
                                        ]
                                            .filter(Boolean)
                                            .join(" ")
                                    }
                                >
                                    <span className={styles.navIcon}>{item.icon}</span>
                                    <span className={styles.navLabel}>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            
                {/** Footer de la barra lateral con acciones adicionales */}
                {canManageCrew && (
                    <div className={styles.sidebarFooter}>
                        <button type="button" className={styles.inviteButton}>
                            <span className={styles.inviteIcon} aria-hidden="true">
                                <IconUserPlus size={18} stroke={1.8} />
                            </span>
                            Invite Members
                        </button>
                    </div>
                )}
            </aside>
        
            {/** Contenido principal de la crew */}
            <section className={styles.content}>{children ?? <Outlet />}</section>
        </div>
    );
}
