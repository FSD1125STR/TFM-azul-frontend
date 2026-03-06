import React, { useContext, useEffect, useRef, useState } from "react";
import { CrewContext } from "../../hooks/context/CrewContext";
import { getCrewFiles, uploadCrewFile, deleteCrewFile } from "../../services/apiFiles.js";

export default function CrewFiles() {
    const { crew, crewId } = useContext(CrewContext);
    const isAdmin = crew?.userRole?.permission === "admin";

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!crewId) return;
        setLoading(true);
        getCrewFiles(crewId)
            .then(setFiles)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [crewId]);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";

        setIsUploading(true);
        setError(null);
        try {
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
        <div>
            <h1>Archivos de {crew?.name || "la Crew"}</h1>

            {isAdmin && (
                <>
                    <input
                        ref={fileInputRef}
                        type="file"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? "Subiendo..." : "Subir archivo"}
                    </button>
                </>
            )}

            {error && <p style={{ color: "red" }}>{error}</p>}

            {loading ? (
                <p>Cargando archivos...</p>
            ) : files.length === 0 ? (
                <p>No hay archivos en esta crew.</p>
            ) : (
                <ul>
                    {files.map((file) => (
                        <li key={file._id}>
                            <a href={file.path} target="_blank" rel="noreferrer" download={file.originalName}>
                                {file.originalName}
                            </a>
                            <span> — {formatSize(file.size)}</span>
                            <span> — {new Date(file.createdAt).toLocaleDateString()}</span>
                            {isAdmin && (
                                <button onClick={() => handleDelete(file._id)} style={{ marginLeft: "1rem" }}>
                                    Eliminar
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
