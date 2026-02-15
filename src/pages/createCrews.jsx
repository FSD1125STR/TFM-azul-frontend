import "./createCrew.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Headers";




function ErrorNotification({ message, type = "error", onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`error-notification ${type}`}>
            <div className="error-notification-text">{message}</div>
            <button className="error-notification-close" onClick={onClose}>×</button>
        </div>
    );
}

function CrewForm({ onSubmit, editCrew, isSubmitting, handleCancel }) {

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [activity, setActivity] = useState("");
    const [SubActivity, setSubActivity] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // Activity categories and subcategories
    const activityOptions = {
        "Deportes": ["Fútbol", "Baloncesto", "Padel", "Tenis", "Running", "Ciclismo", "Gimnasio", "Balonmano", "Boxeo","Voleibol", "Natación", "Escalada", "Surf", "Skateboarding", "Esquí", "Snowboard"],
        "Ocio": ["Juegos de mesa", "Videojuegos", "Cine", "Escape-room", "Quedadas-Sociales","Teatro"],
        "Música": ["Rock", "Jazz", "Clásica", "Electrónica", "Pop", "Rap", "Hip-Hop", "Reggae", "Blues", "Country", "Folk", "conciertos", "DJ/Electrónica", "Producción Musical"],
        "Estudios": ["Grupos de estudio", "Preparación de Exámenes", "Cursos", "Talleres", "Formacion-Online"],
        "Trabajo y Proyectos": ["Proyecto académico", "Proyecto personal", "Startup/Idea", "Equipo de trabajo", "Networking", "ReUniones", "Colaboraciones"],
        "Eventos y Comunidades": ["Eventos Puntuales", "Eventos Semanales", "Eventos Mensuales", "Comunidad local", "Asociaciones", "Voluntariado", "Grupos de Interés", "Meetups", "Conferencias", "Ferias", "Festivales"],
        "Otros": ["Cualquier otra actividad que no encaje en las categorías anteriores"]
    };

   
    useEffect(() => {
        if (editCrew) {
            setName(editCrew.name || "");
            setDescription(editCrew.description || "");
            setActivity(editCrew.activity || "");
            setSubActivity(editCrew.SubActivity || "");
            setImageUrl(editCrew.imageUrl || "");
            setImagePreview(editCrew.imageUrl || "");
        } else {
            setName("");
            setDescription("");
            setActivity("");
            setSubActivity("");
            setImageUrl("");
            setImagePreview("");
        }
    }, [editCrew]);

    // Get subcategories based on selected activity
    const getSubActivityOptions = () => {
        return activity ? activityOptions[activity] || [] : [];
    };

    // Reset subcategory when activity changes
    useEffect(() => {
        setSubActivity("");
    }, [activity]);

 
    const uploadImageToBackend = async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();          
            return data.filePath; 
            
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error(error.message || 'Failed to upload image. Please try again.');
        }
    };

   
    const showNotification = (message, type = "error") => {
        setNotification({ message, type });
    };

   
    const validateForm = () => {
        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = "Crew name is required";
        } else if (name.trim().length < 3) {
            newErrors.name = "Crew name must be at least 3 characters";
        }

        if (!description.trim()) {
            newErrors.description = "Description is required";
        } else if (description.trim().length < 10) {
            newErrors.description = "Description must be at least 10 characters";
        }

        if (!activity.trim()) {
            newErrors.activity = "Activity is required";
        }

        if (!SubActivity.trim()) {
            newErrors.SubActivity = "Sub Activity is required";
        }

        if (!imageUrl && !imagePreview) {
            newErrors.image = "Please upload an image or provide an image URL";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle drag and drop events
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileSelection(files[0]);
        }
    };

    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelection(file);
        }
    };

    const handleFileSelection = (file) => {
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showNotification("Please upload a valid image file (JPEG, PNG, GIF, or WebP)", "error");
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            showNotification("Image size must be less than 5MB", "error");
            return;
        }

        setImageFile(file);
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        setImageUrl("");

        if (errors.image) {
            setErrors({ ...errors, image: null });
        }
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        
        if (!validateForm()) {
            const errorMessages = Object.values(errors);
            showNotification(
                errorMessages.length > 0 
                    ? errorMessages[0] 
                    : "Please fill in all fields correctly.",
                "error"
            );
            return;
        }

        try {
            let finalImageUrl = imageUrl;

            if (imageFile) {
                setIsUploading(true);
                try {
                    finalImageUrl = await uploadImageToBackend(imageFile);
                    console.log('Image uploaded successfully:', finalImageUrl);
                } catch (uploadError) {
                    setIsUploading(false);
                    throw uploadError;
                }
                setIsUploading(false);
            }

            const crewData = {
                name,
                description,
                activity,
                SubActivity,
                imageUrl: finalImageUrl
            };

            await onSubmit(crewData);
            showNotification(editCrew ? "Crew updated successfully!" : "Crew created successfully!", "success");
     
            // Reset form after successful submission
            setTimeout(() => {
                setName("");
                setDescription("");
                setActivity("");
                setSubActivity("");
                setImageUrl("");
                setImagePreview("");
                setErrors({});
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }, 1500);

        } catch (error) {
            console.error('Submission error:', error);
            showNotification(
                error.message || "An error occurred. Please try again.",
                "error"
            );
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview("");
        setImageUrl("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }  
    };

   
    return (
        <>
            {notification && (
                <ErrorNotification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className="create-crews-container">
                <h1 className="form-title">Crear nueva Crew</h1>
                
                <form onSubmit={handleSubmit} className="crew-form">
                    {/* Basic Information Section */}
                    <div className="form-section">
                        <h2 className="section-title">Información básica</h2>
                        
                        <div className="form-field">
                            <label>Crew name</label>
                            <input
                                type="text"
                                placeholder="Enter crew name (min. 3 characters)"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (errors.name) {
                                        setErrors({ ...errors, name: null });
                                    }
                                }}
                                className={errors.name ? "error" : ""}
                                disabled={isSubmitting || isUploading}
                            />
                            {errors.name && <div className="field-error">{errors.name}</div>}
                        </div>

                        <div className="form-field">
                            <label>Crew description</label>
                            <textarea
                                placeholder="Describe your crew (min. 10 characters)"
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    if (errors.description) {
                                        setErrors({ ...errors, description: null });
                                    }
                                }}
                                className={errors.description ? "error" : ""}
                                disabled={isSubmitting || isUploading}
                                rows="4"
                            />
                            {errors.description && <div className="field-error">{errors.description}</div>}
                        </div>
                    </div>

                    {/* Activity Section */}
                    <div className="form-section">
                        <h2 className="section-title">Activity</h2>
                        
                        <div className="form-row">
                            <div className="form-field">
                                <label>Activity Category</label>
                                <select
                                    value={activity}
                                    onChange={(e) => {
                                        setActivity(e.target.value);
                                        if (errors.activity) {
                                            setErrors({ ...errors, activity: null });
                                        }
                                    }}
                                    className={errors.activity ? "error" : ""}
                                    disabled={isSubmitting || isUploading}
                                >
                                    <option value="">Select category</option>
                                    {Object.keys(activityOptions).map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                {errors.activity && <div className="field-error">{errors.activity}</div>}
                            </div>

                            <div className="form-field">
                                <label>Sub-Category</label>
                                <select
                                    value={SubActivity}
                                    onChange={(e) => {
                                        setSubActivity(e.target.value);
                                        if (errors.SubActivity) {
                                            setErrors({ ...errors, SubActivity: null });
                                        }
                                    }}
                                    className={errors.SubActivity ? "error" : ""}
                                    disabled={!activity || isSubmitting || isUploading}
                                >
                                    <option value="">Select sub-category</option>
                                    {getSubActivityOptions().map((subCategory) => (
                                        <option key={subCategory} value={subCategory}>
                                            {subCategory}
                                        </option>
                                    ))}
                                </select>
                                {errors.SubActivity && <div className="field-error">{errors.SubActivity}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Visual Identity Section */}
                    <div className="form-section">
                        <h2 className="section-title">Visual identity</h2>
                        
                        <div className="form-field">
                            <label>Crew cover image</label>
                            
                            {/* Drag and Drop Zone */}
                            <div 
                                className={`drop-zone ${isDragging ? 'dragging' : ''} ${imagePreview ? 'has-image' : ''}`}
                                onDragEnter={handleDragEnter}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => !imagePreview && fileInputRef.current?.click()}
                            >
                                {imagePreview ? (
                                    <div className="preview-container">
                                        <img src={imagePreview} alt="Preview" className="preview-image" />
                                        <button 
                                            type="button" 
                                            className="remove-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveImage();
                                            }}
                                            disabled={isSubmitting || isUploading}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div className="drop-zone-content">
                                        <span className="drop-zone-text">
                                            Click to upload or drag and drop
                                        </span>
                                    </div>
                                )}
                                
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    onChange={handleFileChange}
                                    className="hidden-file-input"
                                    disabled={isSubmitting || isUploading}
                                />
                            </div>
                            
                            {errors.image && <div className="field-error">{errors.image}</div>}
                            
                            {isUploading && (
                                <div className="upload-progress">
                                    <div className="upload-progress-bar"></div>
                                    <span>Uploading image...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button 
                            type="button"
                            className="btn-secondary"
                            onClick={editCrew ? handleCancel : () => navigate("/crews")}
                            disabled={isSubmitting || isUploading}
                        >
                            Cancelar
                        </button>
                        
                        <button 
                            type="submit" 
                            className="btn-primary"
                            disabled={isSubmitting || isUploading}
                        >
                            {isUploading 
                                ? "Uploading..." 
                                : isSubmitting 
                                    ? "Saving..." 
                                    : (editCrew ? "Update Crew" : "crear crew")
                            }
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default CrewForm;