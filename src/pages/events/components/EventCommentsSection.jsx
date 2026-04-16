import { useState } from "react";
import CommentForm from "./CommentForm.jsx";
import ConfirmModal from "../../../components/common/ConfirmModal.jsx";
import { addEventComment, deleteEventComment, updateEventComment } from "../../../services/events.js";
import styles from "./EventCommentsSection.module.css";

export default function EventCommentsSection({ comments: initialComments, eventId, crewId, userId }) {
    // Lista de comentarios del evento
    const [comments, setComments] = useState(initialComments);
    // Comentario en edición: { id, text } cuando hay uno activo, null en caso contrario
    const [editingComment, setEditingComment] = useState(null);
    // ID del comentario que se está eliminando (para bloquear su card durante la operación)
    // ID del comentario pendiente de confirmar eliminación (controla la apertura del modal)
    // Error producido durante la eliminación (los errores de submit los gestiona CommentForm)
    const [deleteError, setDeleteError] = useState("");
    //Estados para eliminar un comentario
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);
    const [deletingCommentId, setDeletingCommentId] = useState("");

    // ─── Nuevo comentario ────────────────────────────────────────────────────────

    // Añade el comentario a la lista; si falla, propaga el error a CommentForm
    const handleCommentAdd = async (content) => {
        const newComment = await addEventComment(crewId, eventId, content);
        setComments((prev) => [...prev, newComment]);
    };

    // ─── Edición de comentario ───────────────────────────────────────────────────

    // Activa el modo edición para el comentario seleccionado
    const handleEditStart = (comment) => {
        setEditingComment({ id: comment._id, text: comment.content });
    };

    // Cancela la edición sin guardar cambios
    const handleEditCancel = () => {
        setEditingComment(null);
    };

    // Guarda los cambios y cierra el editor; si falla, propaga el error a CommentForm
    const handleEditSave = async (content) => {
        const updated = await updateEventComment(crewId, eventId, editingComment.id, content);
        setComments((prev) => prev.map((c) => (c._id === editingComment.id ? updated : c)));
        setEditingComment(null);
    };

    // ─── Eliminación de comentario ───────────────────────────────────────────────

    // Muestra la modal de confirmación para el comentario seleccionado
    const handleDeleteConfirm = async (commentId) => {
        setCommentToDelete(commentId);
        setShowDeleteConfirm(true);

    };

    // Ejecuta la eliminación tras la confirmación; si falla, muestra el error en la sección
    const handleDeletePost = async (commentId) => {
        setDeleteError("");
        setDeletingCommentId(commentId);

        try {
            //Llamamos a la API para eliminar el comentario
            await deleteEventComment(crewId, eventId, commentId);
            setComments((prev) => prev.filter((c) => c._id !== commentId));

            // Si el comentario eliminado estaba en edición, cerramos el editor
            if (editingComment?.id === commentId) setEditingComment(null);

        } catch (err) {
            setDeleteError(err.message || "No se pudo eliminar el comentario");

        } finally {
            setCommentToDelete(null);
            setShowDeleteConfirm(false);
            setDeletingCommentId("");
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2>Comentarios</h2>
                <p>Escribe lo que quieras compartir sobre el evento con el resto del equipo.</p>
            </div>

            {/* Error de eliminación (los errores de submit los muestra CommentForm inline) */}
            {deleteError && <p className={styles.error}>{deleteError}</p>}

            {/* Formulario para añadir un nuevo comentario */}
            <CommentForm onSubmit={handleCommentAdd} />

            <div className={styles.divider} />

            {/* Lista de comentarios */}
            <div className={styles.commentList}>
                {comments.length ? (
                    comments.map((comment) => {
                        const commentAuthor = comment.user ?? {};
                        const authorName = commentAuthor.name || commentAuthor.username || "Usuario";
                        const isOwnComment = commentAuthor._id === userId;
                        const isEditing = editingComment?.id === comment._id;
                        // El card queda bloqueado mientras se elimina ese comentario
                        const isDeleting = deletingCommentId === comment._id;

                        // Fecha formateada en español
                        const postedAt = comment.createdAt
                            ? new Date(comment.createdAt).toLocaleString("es-ES", {
                                dateStyle: "medium",
                                timeStyle: "short",
                            })
                            : "";

                        return (
                            <article key={comment._id} className={styles.commentCard}>
                                <div className={styles.commentHeader}>
                                    {/* Información del autor */}
                                    <div className={styles.commentAuthor}>
                                        {/* Avatar: imagen real o inicial del nombre como fallback */}
                                        {commentAuthor.image ? (
                                            <img
                                                src={commentAuthor.image}
                                                alt={authorName}
                                                className={styles.commentAvatar}
                                            />
                                        ) : (
                                            <div className={styles.commentAvatarFallback}>
                                                {authorName.charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        <div>
                                            <p className={styles.commentAuthorName}>{authorName}</p>
                                            <p className={styles.commentAuthorMeta}>
                                                {commentAuthor.username ? `@${commentAuthor.username}` : ""}
                                                {commentAuthor.email ? ` · ${commentAuthor.email}` : ""}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={styles.commentHeaderMeta}>
                                        {postedAt && <time className={styles.commentDate}>{postedAt}</time>}

                                        {/* Botones de acción: solo para comentarios propios y fuera del modo edición */}
                                        {isOwnComment && !isEditing && (
                                            <div className={styles.commentActions}>
                                                <button
                                                    type="button"
                                                    className={styles.commentActionButton}
                                                    onClick={() => handleEditStart(comment)}
                                                    disabled={isDeleting}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className={styles.commentDeleteButton}
                                                    onClick={() => handleDeleteConfirm(comment._id)}
                                                    disabled={isDeleting}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Editor inline cuando el comentario está en modo edición */}
                                {isEditing ? (
                                    <div className={styles.commentEditor}>
                                        <CommentForm
                                            defaultValue={editingComment.text}
                                            onSubmit={handleEditSave}
                                            onCancel={handleEditCancel}
                                        />
                                    </div>
                                ) : (
                                    <p className={styles.commentContent}>{comment.content}</p>
                                )}
                            </article>
                        );
                    })
                ) : (
                    <p className={styles.empty}>Todavia no hay comentarios en este evento.</p>
                )}
            </div>

            <ConfirmModal
                open={showDeleteConfirm}
                title="Eliminar comentario?"
                description="Esta accion no se puede deshacer."
                confirmLabel="Eliminar"
                onConfirm={() => handleDeletePost(commentToDelete)}
                onCancel={() => setShowDeleteConfirm(false)}
                isLoading={!!deletingCommentId}
            />
        </section>
    );
}
