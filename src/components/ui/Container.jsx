import styles from "./Container.module.css";

function Container({ children, className }) {

    return (
        <div className={`${styles.container}${className ? ` ${className}` : ""}`}>
            {children}
        </div>
    );
}

export { Container };
