import { useContext } from "react";
import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import { IconLayoutDashboard, IconCalendarEventFilled, IconChartBar, IconUsers, IconArrowLeft } from "@tabler/icons-react";
import { CrewContext } from "../../hooks/context/CrewContext.jsx";
import { GroupContext, GroupProvider } from "../../hooks/context/GroupContext.jsx";
import styles from "./GroupLayout.module.css";

const navItems = [
    {
        key: "overview",
        label: "Dashboard",
        to: ".",
        end: true,
        icon: <IconLayoutDashboard size={18} stroke={1.8} />,
    },
    {
        key: "events",
        label: "Eventos",
        to: "events",
        icon: <IconCalendarEventFilled size={18} />,
    },
    {
        key: "polls",
        label: "Encuestas",
        to: "polls",
        icon: <IconChartBar size={18} stroke={1.8} />,
    },
    {
        key: "members",
        label: "Miembros",
        to: "members",
        icon: <IconUsers size={18} stroke={1.8} />,
    },
];

export default function GroupLayout() {
    const { idCrew, groupId } = useParams();

    return (
        <GroupProvider crewId={idCrew} groupId={groupId}>
            <GroupLayoutContent />
        </GroupProvider>
    );
}

function GroupLayoutContent() {
    const { crew } = useContext(CrewContext);
    const { group } = useContext(GroupContext);
    const { idCrew } = useParams();

    const crewName = crew?.name?.trim() || "Crew";
    const groupName = group?.name?.trim() || "Group";
    const initial = groupName.charAt(0).toUpperCase();

    return (
        <div className={styles.crewLayout}>
            <aside className={styles.sidebar}>
                <Link to={`/crews/${idCrew}`} className={styles.breadcrumb}>
                    <IconArrowLeft size={14} stroke={2.2} />
                    {crewName}
                </Link>

                <div className={styles.sidebarHeader}>
                    <div className={styles.crewAvatar} aria-hidden="true">
                        <span className={styles.crewInitial}>{initial}</span>
                    </div>
                    <p className={styles.crewName}>{groupName}</p>
                </div>

                <nav className={styles.nav} aria-label="Group sections">
                    <ul className={styles.navList}>
                        {navItems.map((item) => (
                            <li key={item.key}>
                                <NavLink
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        [styles.navItem, isActive ? styles.navItemActive : ""]
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
            </aside>

            <section className={styles.content}>
                <Outlet />
            </section>
        </div>
    );
}
