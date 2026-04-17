import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button.jsx";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import { CrewContext } from "../../hooks/context/CrewContext";
import {
    createGroup,
    deleteGroup,
    getGroupsInCrew,
    updateGroup,
} from "../../services/apiGroups.js";
import { Title, Subtitle } from "../../components/ui/Title.jsx";
import GroupCard from "./components/GroupCard.jsx";
import GroupFilters from "./components/GroupFilters.jsx";
import GroupFormModal from "./components/GroupFormModal.jsx";
import styles from "./crewGroups.module.css";

export default function CrewGroups() {
    // Obtener datos de la crew y permisos del usuario
    const { crew } = useContext(CrewContext);
    const { idCrew } = useParams();
    const navigate = useNavigate();

    const isAdmin = crew?.userRole?.permission === "admin";
    const crewName = crew?.name || "la crew";

    // Estados para grupos, carga, errores y búsqueda
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    //Lista de grupos filtrados, solo se recalcula cuando cambian los grupos o el término de búsqueda para optimizar el rendimiento.
    const filteredGroups = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return groups;
        return groups.filter((g) => g.name?.toLowerCase().includes(term));
    }, [groups, search]);

    // Estado del modal de crear/editar
    const [formModal, setFormModal] = useState({ open: false, group: null });
    const [formLoading, setFormLoading] = useState(false);

    // Estado del modal de confirmación de eliminar
    const [confirmModal, setConfirmModal] = useState({ open: false, group: null });
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Cargar grupos al montar el componente o cuando cambia la crew
    useEffect(() => {
        if (!idCrew) return;
        let isMounted = true;

        const fetchGroups = async () => {
            setLoading(true);
            setError("");
            try {
                // Llamada a la API para obtener los grupos de la crew
                const data = await getGroupsInCrew(idCrew);
                if (isMounted) setGroups(data);

            } catch (err) {
                if (isMounted) setError(err.message || "No se pudieron cargar los grupos.");

            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchGroups();
        return () => { isMounted = false; };
    }, [idCrew]);

    // Handlers para abrir/cerrar modales y realizar acciones de crear, editar, eliminar y ver grupos
    const handleOpenCreate = () => setFormModal({ open: true, group: null });
    const handleOpenEdit = (group) => setFormModal({ open: true, group });
    const handleCloseForm = () => setFormModal({ open: false, group: null });

    // El handler de guardar maneja tanto la creación como la edición de grupos. Si el modal tiene un grupo, se actualiza; si no, se crea uno nuevo. Después de la operación, se actualiza la lista de grupos en el estado para reflejar los cambios sin necesidad de recargar toda la lista desde la API.
    const handleSave = async ({ name, description }) => {
        setFormLoading(true);
        try {
            //Si el grupo existe se llama a la api para actualizarlo, si no se llama a la api para crearlo
            if (formModal.group) {
                //Llamamos a la api para actualizar el grupo y luego actualizamos el estado de grupos reemplazando el grupo editado por el nuevo grupo devuelto por la API
                const updated = await updateGroup(idCrew, formModal.group._id, { name, description });
                setGroups((prev) => prev.map((g) => g._id === updated._id ? updated : g));

            } else {
                //Llamamos a la api para crear el grupo
                const created = await createGroup(idCrew, { name, description });
                setGroups((prev) => [...prev, created]);
            }

            handleCloseForm();

        } catch (err) {
            setError(err.message || "No se pudo guardar el grupo.");

        } finally {
            setFormLoading(false);
        }
    };

    const handleOpenDelete = (group) => setConfirmModal({ open: true, group });
    const handleCloseDelete = () => setConfirmModal({ open: false, group: null });

    //Manejador para confirmar y eliminar un grupo
    const handleConfirmDelete = async () => {
        if (!confirmModal.group) return;
        setDeleteLoading(true);

        try {
            //Llamamos a la api para eliminar el grupo y luego actualizamos el estado de grupos filtrando el grupo eliminado
            await deleteGroup(idCrew, confirmModal.group._id);
            setGroups((prev) => prev.filter((g) => g._id !== confirmModal.group._id));
            handleCloseDelete();

        } catch (err) {
            setError(err.message || "No se pudo eliminar el grupo.");
            handleCloseDelete();
            
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleView = (group) => navigate(`/crews/${idCrew}/groups/${group._id}`);

    return (
        <section className={styles.page}>
            <header className={styles.header}>
                <div>
                    <Title>Grupos de <span>{crewName}</span></Title>
                    <Subtitle>Organiza los miembros de tu crew en grupos más pequeños.</Subtitle>
                </div>
                
                {isAdmin && (
                    <Button className={styles.headerButton} onClick={handleOpenCreate}>
                        Crear grupo
                    </Button>
                )}
            </header>

            <div className={styles.content}>
                <GroupFilters search={search} onSearchChange={setSearch} />

                {error && <p className={styles.error}>{error}</p>}

                {loading ? (
                    <div className={styles.state}>Cargando grupos...</div>
                ) : groups.length === 0 ? ( //Si no hay grupos
                    <div className={styles.emptyState}>
                        <h3>No hay grupos todavía</h3>
                        <p>
                            {isAdmin
                                ? "Crea un grupo para organizar a los miembros de la crew."
                                : "Aún no perteneces a ningún grupo de esta crew."}
                        </p>
                        {isAdmin && (
                            <button
                                type="button"
                                className={styles.emptyAction}
                                onClick={handleOpenCreate}
                            >
                                Crear grupo
                            </button>
                        )}
                    </div>
                ) : filteredGroups.length === 0 ? ( //Si no hay grupos que coincidan con la búsqueda
                    <div className={styles.state}>No hay grupos que coincidan con la búsqueda.</div>
                ) : (
                    <div className={styles.grid}>
                        {filteredGroups.map((group) => (
                            <GroupCard
                                key={group._id}
                                group={group}
                                isAdmin={isAdmin}
                                onView={handleView}
                                onEdit={handleOpenEdit}
                                onDelete={handleOpenDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            {/** Modal para crear o editar grupos */}
            <GroupFormModal
                open={formModal.open}
                group={formModal.group}
                onSave={handleSave}
                onCancel={handleCloseForm}
                isLoading={formLoading}
            />
            
            {/** Modal de confirmación para eliminar grupos */}
            <ConfirmModal
                open={confirmModal.open}
                title="Eliminar grupo"
                description={`¿Estás seguro de que quieres eliminar el grupo "${confirmModal.group?.name}"? Esta acción no se puede deshacer.`}
                confirmLabel="Eliminar"
                onConfirm={handleConfirmDelete}
                onCancel={handleCloseDelete}
                isLoading={deleteLoading}
            />
        </section>
    );
}
