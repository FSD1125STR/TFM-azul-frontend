import { useContext } from "react";
import { Link, Outlet } from "react-router-dom";
import styles from "./AppLayout.module.css";
import { AuthContext } from "../../hooks/context/AuthContext.jsx";

export default function AppLayout({ children }) {
  const { user } = useContext(AuthContext);
  const username = user?.username ?? user?.name ?? "Username";

  return (
    <div className={styles.appLayout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand}>
            <span className={styles.brandText}>CrewGO</span>
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            <Link className={styles.navLink} to="/">
              Dashboards
            </Link>
            <Link className={styles.navLink} to="/crews">
              MyCrews
            </Link>
            <Link className={styles.navLink} to="/events">
              Events
            </Link>
          </nav>

          <div className={styles.userArea}>
            <span className={styles.username}>{username}</span>
            <span className={styles.avatar} aria-hidden="true" />
          </div>
        </div>
      </header>

      <main className={styles.main}>{children ?? <Outlet />}</main>
    </div>
  );
}
