import styles from "./Title.module.css";

export function Title({ children }) {
    return (
        <h1 className={styles.title}>
            {children}
        </h1>
    );
}

export function GroupTitle({ children }) {
    return (
        <h1 className={`${styles.title} ${styles.groupTitle}`}>
            {children}
        </h1>
    );
}

export function Subtitle({ children }) {
    return(
        <p className={styles.subtitle}>
            {children}
        </p>
    );
} 

