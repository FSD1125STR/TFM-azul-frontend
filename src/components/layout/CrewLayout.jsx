import { NavLink, Outlet } from "react-router-dom";
import styles from "./CrewLayout.module.css";

const defaultNavItems = [
  {
    key: "overview",
    label: "Overview",
    to: "overview",
    end: true,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="8" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
        <rect x="13" y="13" width="8" height="8" rx="2" />
      </svg>
    ),
  },
  {
    key: "events",
    label: "Events",
    to: "events",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: "files",
    label: "Files",
    to: "files",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
      </svg>
    ),
  },
  {
    key: "polls",
    label: "Polls",
    to: "polls",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 20V9" />
        <path d="M12 20V4" />
        <path d="M19 20v-6" />
      </svg>
    ),
  },
  {
    key: "members",
    label: "Members",
    to: "members",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
        <path d="M14.5 20a4.5 4.5 0 0 1 6 0" />
      </svg>
    ),
  },
  {
    key: "subgroups",
    label: "Subgroups",
    to: "subgroups",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="6" height="6" rx="1.5" />
        <rect x="14" y="4" width="6" height="6" rx="1.5" />
        <rect x="9" y="14" width="6" height="6" rx="1.5" />
        <path d="M7 10v4h10v-4" />
      </svg>
    ),
  },
];

export default function CrewLayout({ crew, children }) {
  const name = crew?.name?.trim() || "Crew Name";
  const imageUrl = crew?.imageUrl || "";
  const initial = name.charAt(0).toUpperCase() || "C";
  const items = defaultNavItems;

  return (
    <div className={styles.crewLayout}>
        {/** Barra lateral para la navegacion dentro de una crew */}
        <aside className={styles.sidebar}>
            {/*/ Header de la barra lateral con info de la crew */}
            <div className={styles.sidebarHeader}>
                {/** Imagen de la crew */}
                <div className={styles.crewAvatar} aria-hidden="true">
                    {imageUrl ? (
                    <img src={imageUrl} alt="Crew Image" className={styles.crewAvatarImage} />
                    ) : (
                    <span className={styles.crewInitial}>{initial}</span>
                    )}
                </div>
                {/** Nombre e info de la crew */}
                <div className={styles.crewInfo}>
                    <p className={styles.crewName}>{name}</p>
                    <a href="">Editar</a>
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
            <div className={styles.sidebarFooter}>
            <button type="button" className={styles.inviteButton}>
                <span className={styles.inviteIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24">
                    <circle cx="9" cy="9" r="3" />
                    <path d="M4 20a5 5 0 0 1 10 0" />
                    <path d="M16 8v6M13 11h6" />
                </svg>
                </span>
                Invite Members
            </button>
            </div>
        </aside>
        
        {/** Contenido principal de la crew */}
        <section className={styles.content}>{children ?? <Outlet />}</section>
    </div>
  );
}
