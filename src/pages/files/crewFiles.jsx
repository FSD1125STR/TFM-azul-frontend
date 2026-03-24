import { useContext, useEffect, useRef, useState } from "react";
import { IconUpload, IconFile, IconTrash, IconFolderOpen } from "@tabler/icons-react";
import { CrewContext } from "../../hooks/context/CrewContext";
import { getCrewFiles, uploadCrewFile, deleteCrewFile } from "../../services/apiFiles.js";
import { Button } from "../../components/ui/Button.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import styles from "./crewFiles.module.css";

export default function CrewFiles() {
    const { crew, crewId } = useContext(CrewContext);
    const isAdmin = crew?.userRole?.permission === "admin";

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    //Cargamos todos los archivos de la crew
    useEffect(() => {
        if (!crewId) return;
        setLoading(true);

        getCrewFiles(crewId)
            .then(setFiles)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));

    }, [crewId]);

    //Maneja cuando se añade un archivo nuevo
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";

        setIsUploading(true);
        setError(null);

        try {
            //Subimos el archivo
            const newFile = await uploadCrewFile(crewId, file);
            setFiles((prev) => [newFile, ...prev]);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (fileId) => {
        setError(null);
        try {
            await deleteCrewFile(crewId, fileId);
            setFiles((prev) => prev.filter((f) => f._id !== fileId));
        } catch (err) {
            setError(err.message);
        }
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <section className={styles.page}>
            {/** Header con boton de subir archivos, solo si es administrador */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Archivos de {crew?.name || "la Crew"}</h1>
                    <p className={styles.subtitle}>
                        Sube y gestiona los archivos compartidos de tu crew.
                    </p>
                </div>

                {isAdmin && (
                    <>
                        <input
                            ref={fileInputRef}
                            type="file"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                        <Button
                            className={styles.uploadButton}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            <IconUpload size={17} />
                            {isUploading ? "Subiendo..." : "Subir archivo"}
                        </Button>
                    </>
                )}
            </header>

            {/** Sección de lista de archivos */}
            <div className={styles.container}>
                {error && <p className={styles.error}>{error}</p>}

                {loading ? (
                    <p className={styles.loading}>Cargando archivos...</p>

                ) : files.length === 0 ? (
                    <div className={styles.empty}>
                        <IconFolderOpen size={48} className={styles.emptyIcon} />
                        <p>No hay archivos en esta crew.</p>
                    </div>

                ) : (
                    //Tabla de archivos usando el componente DataTable común
                    <DataTable
                        columns={[
                            { label: "Nombre" },
                            { label: "Subido por" },
                            { label: "Fecha", center: true },
                            { label: "Tamaño", center: true },
                            ...(isAdmin ? [{ label: "Acciones", center: true }] : []),
                        ]}
                    >
                        {files.map((file) => (
                            <tr key={file._id}>
                                {/**Nombre con icono y link de descarga */}
                                <td>
                                    <div className={styles.nameCell}>
                                        <IconFile size={16} className={styles.fileIcon} />
                                        <a
                                            href={file.url ?? file.path}
                                            target="_blank"
                                            rel="noreferrer"
                                            download={file.originalName}
                                            className={styles.fileName}
                                        >
                                            {file.originalName}
                                        </a>
                                    </div>
                                </td>

                                {/**Owner: foto de perfil si existe, sino inicial del username */}
                                <td>
                                    <div className={styles.ownerCell}>
                                        {file.uploadedBy?.image ? (
                                            <img
                                                src={file.uploadedBy.image}
                                                alt={file.uploadedBy.username}
                                                className={styles.ownerAvatar}
                                            />
                                        ) : (
                                            <span className={styles.ownerAvatar}>
                                                {file.uploadedBy?.username?.[0]?.toUpperCase() ?? "?"}
                                            </span>
                                        )}
                                        <span className={styles.ownerName}>
                                            {file.uploadedBy?.username ?? "—"}
                                        </span>
                                    </div>
                                </td>

                                {/**Fecha de subida */}
                                <td className={styles.tdMeta}>
                                    {new Date(file.createdAt).toLocaleDateString("es-ES", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </td>

                                {/**Tamaño del archivo */}
                                <td className={styles.tdMeta}>{formatSize(file.size)}</td>

                                {/**Boton para borrar si el usuario es admin */}
                                {isAdmin && (
                                    <td className={styles.tdCenter}>
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => handleDelete(file._id)}
                                        >
                                            <IconTrash size={14} />
                                            Eliminar
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </DataTable>
                )}
            </div>
        </section>
    );
}
