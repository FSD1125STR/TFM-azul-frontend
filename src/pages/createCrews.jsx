import "./createCrew.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Error Notification Component
function ErrorNotification({ message, type = "error", onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto-dismiss after 5 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`error-notification ${type}`}>
            <div className="error-notification-text">{message}</div>
            <button className="error-notification-close" onClick={onClose}>
                ×
            </button>
        </div>
    );
}

export default function CrewForm({ onCreateCrew, editCrew, onEditCrew, handleCancel }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [activity, setActivity] = useState("");
    const [SubActivity, setSubActivity] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
   // const navigate = useNavigate();

    useEffect(() => {
        if (editCrew) {
            setName(editCrew.name || "");
            setDescription(editCrew.description || "");
            setActivity(editCrew.activity || "");
            setSubActivity(editCrew.SubActivity || "");
            setImageUrl(editCrew.imageUrl || "");
        }
    }, [editCrew]);

    // Validation function
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

        if (!imageUrl.trim()) {
            newErrors.imageUrl = "Image URL is required";
        } else if (!isValidUrl(imageUrl)) {
            newErrors.imageUrl = "Please enter a valid URL";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // URL validation helper
    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        // eslint-disable-next-line no-unused-vars
        } catch (_) {
            return false;
        }
    };

    const showNotification = (message, type = "error") => {
        setNotification({ message, type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous errors
        setErrors({});

        // Validate form
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

        setIsSubmitting(true);

        try {
            if (editCrew) {
                console.log('Editing crew with ID:', editCrew._id);
                await onEditCrew(editCrew._id, {
                    name,
                    description,
                    activity,
                    SubActivity,
                    imageUrl
                });
                showNotification("Crew updated successfully!", "success");
            } else {
                await onCreateCrew({
                    name,
                    description,
                    activity,
                    SubActivity,
                    imageUrl
                });
                showNotification("Crew created successfully!", "success");
            }

            // Clear form after successful submission
            setTimeout(() => {
                setName("");
                setDescription("");
                setActivity("");
                setSubActivity("");
                setImageUrl("");
                setErrors({});
            }, 1500);

        } catch (error) {
            showNotification(
                error.message || "An error occurred. Please try again.",
                "error"
            );
        } finally {
            setIsSubmitting(false);
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
                        />
                        {errors.SubActivity && <div className="field-error">{errors.SubActivity}</div>}
                    </ul>

                    <ul>
                        <label>Upload Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            placeholder="Kindly upload an image representing your crew"
                            value={imageUrl}
                            onChange={(e) => {
                                setImageUrl(e.target.files[0]);
                                if (errors.imageUrl) {
                                    setErrors({ ...errors, imageUrl: null });
                                }
                            }}
                            className={errors.imageUrl ? "error" : ""}
                        />
                        {errors.imageUrl && <div className="field-error">{errors.imageUrl}</div>}
                    </ul>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={isSubmitting ? "loading" : ""}
                    >
                        {isSubmitting ? "" : (editCrew ? "Update Crew" : "Create Crew")}
                    </button>

                    {editCrew && (
                        <button 
                            type="button" 
                            onClick={handleCancel} 
                            style={{ marginLeft: "10px" }}
                            disabled={isSubmitting}
                        >
                            Cancel Edit
                        </button>
                    )}
                </form>
            </div>
        </>
    );
}