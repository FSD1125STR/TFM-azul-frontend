import { Link } from "react-router-dom";
import { IconArrowRight } from "@tabler/icons-react";
import { Container } from "./Container.jsx";
import styles from "./WidgetCard.module.css";

export default function WidgetCard({ title, linkTo, linkLabel, isEmpty, emptyMessage, children }) {
    return (
        <Container className={styles.widget}>
            <div className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
                {linkTo && (
                    <Link to={linkTo} className={styles.link}>
                        {linkLabel ?? "Ver todos"} <IconArrowRight size={13} stroke={2} />
                    </Link>
                )}
            </div>

            {isEmpty ? (
                <p className={styles.empty}>{emptyMessage}</p>
            ) : (
                children
            )}
        </Container>
    );
}
