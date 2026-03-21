import styles from "./Button.module.css";

function Button({ children, onClick, className, type = "button", disabled, variant }) {
    const variantClass = variant ? styles[variant] : "";
    return (
        <button
            type={type}
            disabled={disabled}
            className={`${styles.button} ${variantClass} ${className ?? ""}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

export { Button };
