import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./CrewForm.module.css";
import {
    ACTIVITY_OPTIONS,
    getSubactivitiesFor,
} from "../constants/crewActivities.js";
import { getCrewImageUrl, uploadCrewImage } from "../../../services/apiCrews.js";

// Valores por defecto, util para diferenciar entre crear y actualizar
const DEFAULT_VALUES = {
    name: "",
    description: "",
    activity: "",
    subactivity: "",
    imageUrl: "",
};

export default function CrewForm({
    initialValues,
    onSubmit,
    onCancel,
    submitLabel,
}) {

    // Usamos useForm para el formulario de la crew
    const {
        register,
        handleSubmit,
        reset, //Reemplaza valores y limpia el formulario
        watch, //Se suscribe para detectar cambios
        setValue, //Actualiza manualmente un campo sin el input
        formState: { errors, isSubmitting }, //error: de formulario | isSubmitting: si se está enviando el formulario
    } = useForm({
        defaultValues: DEFAULT_VALUES,
    });

    const [submitError, setSubmitError] = useState(""); //Guarda errores globales
    const [isUploading, setIsUploading] = useState(false); //Indica si se está subiendo la imagen
    const [imagePreview, setImagePreview] = useState(""); //Url de la imagen a mostrar en el formulario
    const [imageFile, setImageFile] = useState(null); //Imagen seleccionada
    const [isDragging, setIsDragging] = useState(false); //Para saber si esta arrastrando un archivo a la zona de input file (Drag & Drop)
    const fileInputRef = useRef(null); //Referencia al input file del formulario

    const activityValue = watch("activity"); //Actividad seleccionada, se rerenderiza cuando cambia
    const subactivityValue = watch("subactivity"); //Subactividad seleccionada, se rerenderiza cuando cambia
    //Lista de subactividades, se recalcula cuando cambia la actividad principal (activityValue)
    const subactivityOptions = useMemo(
        () => getSubactivitiesFor(activityValue),
        [activityValue],
    ); 

    //Sincroniza el formulario con los valores iniciales
    useEffect(() => {
        // Actualiza los valores por si se crea el formulario con datos iniciales no vacios (editar crew)
        const nextValues = {
            ...DEFAULT_VALUES,
            ...initialValues,
            subactivity: initialValues?.subactivity ?? "",
        };

        reset(nextValues); //Introduce los valores iniciales al formulario
        setImageFile(null); //Resetea la imagen
        setImagePreview(
            nextValues.imageUrl ? getCrewImageUrl(nextValues.imageUrl) : "",
        ); //Actualiza el preview con la imagen de la crew o de los valores iniciales, si existen

    }, [initialValues, reset]);

    //Garantiza la consistencia entre Actividad y Subactividad, evitando una subactividad inválida
    useEffect(() => {
        if (subactivityValue && !subactivityOptions.includes(subactivityValue)) {
            setValue("subactivity", "");
        }
    }, [subactivityOptions, subactivityValue, setValue]);

    //Maneja los errores al subir el archivo, editando los errores globales
    const showFileError = (message) => {
        setSubmitError(message);
    };

    // Se ejecuta cuando se coge el archivo, para procesar su validez y renderizar un preview
    const handleFileSelection = (file) => {
        if (!file) return;

        const validTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
        ];

        //Valida el tipo de archivo 
        if (!validTypes.includes(file.type)) {
            showFileError("Formato inválido. Usa JPG, PNG, GIF o WebP.");
            return;
        }

        //Valida que el tamaño sea el correcto
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            showFileError("La imagen no puede superar los 5MB.");
            return;
        }

        //Una vez validado, borra errores, actualiza la imagen subida
        setSubmitError("");
        setImageFile(file);

        //Generamos preview con FileRender
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Se ejecuta cuando el usuario suelta un archivo en la zona de Drag & Drop
    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);

        // Cogemos el archivo
        const file = event.dataTransfer.files?.[0];
        handleFileSelection(file);
    };

    // Se ejecuta cuando se hace click en la X de la imagen, para poder eliminarla del formulario
    const handleRemoveImage = () => {
        // Limpia el estado y el campo imageUrl (Campos que referencian a una imagen)
        setImageFile(null);
        setImagePreview("");
        setValue("imageUrl", "");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Handler que valida, sube imagen y construye payload
    const onSubmitForm = async (values) => {
        setSubmitError("");

        try {
            let finalImageUrl = values.imageUrl?.trim() || "";

            if (imageFile) {
                setIsUploading(true);
                finalImageUrl = await uploadCrewImage(imageFile);
            }

            const payload = {
                ...values,
                imageUrl: finalImageUrl,
            };

            await onSubmit(payload);
            setIsUploading(false);

            if (!initialValues) {
                reset(DEFAULT_VALUES);
                setImageFile(null);
                setImagePreview("");
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }

        } catch (error) {
            setIsUploading(false);
            setSubmitError(error.message || "No se pudo guardar la crew.");
        }
    };

    // Renderizamos el formulario
    return (
        <form className={styles.form} onSubmit={handleSubmit(onSubmitForm)}>
            <input type="hidden" {...register("imageUrl")} />

            {/** Seccion para solicitar info basica */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Información básica</h2>
                    <p>Define el nombre y la descripción de tu crew.</p>
                </div>

                {/** Nombre de la crew */}
                <div className={styles.field}>
                    <label htmlFor="crew-name">Nombre</label>
                    <input
                        id="crew-name"
                        type="text"
                        placeholder="Ej. Crew de fútbol"
                        className={errors.name ? styles.errorField : ""}
                        disabled={isSubmitting || isUploading}
                        {...register("name", {
                            required: "El nombre es obligatorio",
                            minLength: { value: 3, message: "Mínimo 3 caracteres" },
                        })}
                    />
                    {errors.name && <span className={styles.errorText}>{errors.name.message}</span>}
                </div>
                
                {/** Descripcion de la crew */}
                <div className={styles.field}>
                    <label htmlFor="crew-description">Descripción</label>
                    <textarea
                        id="crew-description"
                        rows="4"
                        placeholder="Describe en qué consiste la crew"
                        className={errors.description ? styles.errorField : ""}
                        disabled={isSubmitting || isUploading}
                        {...register("description", {
                            required: "La descripción es obligatoria",
                            minLength: { value: 10, message: "Mínimo 10 caracteres" },
                        })}
                    />
                    {errors.description && (
                        <span className={styles.errorText}>{errors.description.message}</span>
                    )}
                </div>
            </div>
            
            {/** Seccion para solicitar la Actividad y Subactividad con selectores dinámicos */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Actividad</h2>
                    <p>Selecciona la actividad principal y la subcategoría.</p>
                </div>
                
                {/** Selector de Actividad */}
                <div className={styles.row}>
                    <div className={styles.field}>
                        <label htmlFor="crew-activity">Actividad</label>
                        <select
                            id="crew-activity"
                            className={errors.activity ? styles.errorField : ""}
                            disabled={isSubmitting || isUploading}
                            {...register("activity", { required: "Selecciona una actividad" })}
                        >
                            <option value="">Selecciona</option>
                            {ACTIVITY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {errors.activity && (
                            <span className={styles.errorText}>{errors.activity.message}</span>
                        )}
                    </div>
                    
                    {/** Selector de Subactividad */}
                    <div className={styles.field}>
                        <label htmlFor="crew-subactivity">Subactividad</label>
                        <select
                            id="crew-subactivity"
                            className={errors.subactivity ? styles.errorField : ""}
                            disabled={!activityValue || isSubmitting || isUploading}
                            {...register("subactivity", {
                                required: "Selecciona una subactividad",
                            })}
                        >
                            <option value="">Selecciona</option>
                            {subactivityOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        {errors.subactivity && (
                            <span className={styles.errorText}>{errors.subactivity.message}</span>
                        )}
                    </div>
                </div>
            </div>
            
            {/** Seccion para subir una imagen para la crew */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Imagen</h2>
                    <p>Sube una imagen para representar la crew.</p>
                </div>
                
                {/** Seccion habilitada para arrastrar archivos - Drag & Drop */}
                <div
                    className={`${styles.dropZone} ${isDragging ? styles.dragging : ""} ${imagePreview ? styles.hasImage : ""}`}
                    //Eventos para detectar arrastre de imagen (Drag&Drop)
                    //El elemento arrastrado entra dentro de la sección
                    onDragEnter={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsDragging(true);
                    }}

                    //Se dispara mientras el elemento esté encima de la seccion
                    onDragOver={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                    }}

                    //Se dispara cuando el elemento sale fuera de la seccion
                    onDragLeave={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsDragging(false);
                    }}

                    //Se dispara cuando se suelta el elemento dentro de la zona
                    onDrop={handleDrop}
                    
                    //Se dispara al hacer click, en este caso si no hay imagen cargada, traslada el click al file input para que se maneje el handleFileSelection
                    onClick={() => !imagePreview && fileInputRef.current?.click()}
                >
                    {imagePreview ? (
                        //Seccion para mostrar la imagen cargada, si existe
                        <div className={styles.previewWrapper}>
                            <img src={imagePreview} alt="Preview" className={styles.previewImage} />
                            {/** Boton para borrar la imagen */}
                            <button
                                type="button"
                                className={styles.removeButton}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleRemoveImage();
                                }}
                            > 
                              x
                            </button>
                        </div>
                    ) : (
                        // Si no hay imagen renderizamos lo siguiente
                        <div className={styles.dropContent}>
                            <span>Arrastra una imagen o haz clic para subir</span>
                            <small>JPG, PNG, GIF o WebP (max 5MB)</small>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        className={styles.hiddenInput}
                        onChange={(event) => handleFileSelection(event.target.files?.[0])}
                        disabled={isSubmitting || isUploading}
                    />

                </div>
            </div>
            
            {/** Mostramos el error de submit si es que se produce uno */}
            {submitError && <div className={styles.submitError}>{submitError}</div>}
            
            {/** Seccion de acciones para poder cancelar o enviar el formulario */}
            <div className={styles.actions}>
                {/** Boton para cancelar, ejecuta el onCancel de las props */}
                {onCancel && (
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={onCancel}
                        disabled={isSubmitting || isUploading}
                    >
                      Cancelar
                    </button>
                )}

                {/** Boton para enviar el formulario, ejecuta el handler que valida el form */}
                <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={isSubmitting || isUploading}
                >
                    {isUploading ? "Subiendo..." : submitLabel || "Guardar"}
                </button>
            </div>
        </form>
    );
}
