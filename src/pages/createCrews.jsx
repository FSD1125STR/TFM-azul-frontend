
import "./createCrew.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";


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
    
    console.log("CrewForm Props:", { onSubmit, editCrew, isSubmitting, handleCancel }); 
    console.log('onSubmit type:', typeof onSubmit); 


    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [activity, setActivity] = useState("");
    const [SubActivity, setSubActivity] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

   
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

    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        
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
                <form onSubmit={handleSubmit}>
                  
                    <ul>
                        <label>Crew Name</label>
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
                    </ul>

                
                    <ul>
                        <label>Crew Description</label>
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
                        />
                        {errors.description && <div className="field-error">{errors.description}</div>}
                    </ul>

                    
                    <ul>
                        <label>Activity</label>
                        <input
                            type="text"
                            placeholder="e.g., Hiking, Gaming, Photography"
                            value={activity}
                            onChange={(e) => {
                                setActivity(e.target.value);
                                if (errors.activity) {
                                    setErrors({ ...errors, activity: null });
                                }
                            }}
                            className={errors.activity ? "error" : ""}
                            disabled={isSubmitting || isUploading}
                        />
                        {errors.activity && <div className="field-error">{errors.activity}</div>}
                    </ul>

                   
                    <ul>
                        <label>Sub Activity</label>
                        <input
                            type="text"
                            placeholder="e.g., Mountain Climbing, FPS, Portrait"
                            value={SubActivity}
                            onChange={(e) => {
                                setSubActivity(e.target.value);
                                if (errors.SubActivity) {
                                    setErrors({ ...errors, SubActivity: null });
                                }
                            }}
                            className={errors.SubActivity ? "error" : ""}
                            disabled={isSubmitting || isUploading}
                        />
                        {errors.SubActivity && <div className="field-error">{errors.SubActivity}</div>}
                    </ul>

                 
                    <ul>
                        <label>Crew Image</label>
                        
                      
                        <div className="image-upload-container">
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                onChange={handleFileChange}
                                className="file-input"
                                id="image-upload"
                                disabled={isSubmitting || isUploading}
                            />
                            <label htmlFor="image-upload" className="file-input-label">
                                <span className="upload-icon">📁</span>
                                <span>Choose Image</span>
                            </label>
                            <span className="file-input-info">
                                {imageFile ? imageFile.name : "JPEG, PNG, GIF, WebP (Max 5MB)"}
                            </span>
                        </div>

                
                        <div className="separator">
                            <span>OR</span>
                        </div>

                    
                        <input
                            type="text"
                            placeholder="Paste image URL here"
                            value={imageUrl}
                            onChange={(e) => {
                                setImageUrl(e.target.value);
                                setImagePreview(e.target.value);
                                setImageFile(null); 
                                if (errors.image) {
                                    setErrors({ ...errors, image: null });
                                }
                            }}
                            className={errors.image ? "error" : ""}
                            disabled={isSubmitting || isUploading}
                        />
                        
                        {errors.image && <div className="field-error">{errors.image}</div>}

                      
                        {imagePreview && (
                            <div className="image-preview-container">
                                <img src={imagePreview} alt="Preview" className="image-preview" />
                                <button 
                                    type="button" 
                                    className="remove-image-btn"
                                    onClick={handleRemoveImage}
                                    disabled={isSubmitting || isUploading}
                                >
                                    ✕ Remove
                                </button>
                            </div>
                        )}

                        
                        {isUploading && (
                            <div className="upload-progress">
                                <div className="upload-progress-bar"></div>
                                <span>Uploading image...</span>
                            </div>
                        )}
                    </ul>

                   
                    <button 
                        type="submit" 
                        disabled={isSubmitting || isUploading}
                        className={isSubmitting || isUploading ? "loading" : ""}
                    >
                        {isUploading 
                            ? "Uploading..." 
                            : isSubmitting 
                                ? "Saving..." 
                                : (editCrew ? "Update Crew" : "Create Crew")
                        }
                    </button>

                    {editCrew && (
                        <button 
                            type="button" 
                            onClick={handleCancel} 
                            style={{ marginLeft: "10px" }}
                            disabled={isSubmitting || isUploading}
                        >
                            Cancel Edit
                        </button>
                    )}
                </form>
            </div>
        </>
    );
}

export default CrewForm;