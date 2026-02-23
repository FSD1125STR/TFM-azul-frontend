import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import useNavigate
import CrewForm from './createCrews';


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


export default function CrewManager() {
    const navigate = useNavigate(); // ✅ Initialize navigate

    const [crews, setCrews] = useState([]);
    const [editingCrew, setEditingCrew] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);

    // ✅ Stable reference to prevent infinite loop in ErrorNotification
    const handleCloseNotification = useCallback(() => {
        setNotification(null);
    }, []);

    // Fetch all crews on mount
    useEffect(() => {
        fetchCrews();
    }, []);

    const fetchCrews = async () => {
        try {
            const response = await fetch('/api/crews');
            console.log('Fetch crews response:', response.status);
            if (!response.ok) throw new Error('Failed to fetch crews');
            const data = await response.json();
            setCrews(data);
        } catch (error) {
            console.error('Error fetching crews:', error);
            showNotification('Failed to load crews', 'error');
        }
    };

    const showNotification = (message, type = "error") => {
        setNotification({ message, type });
    };

    const handleCreateCrew = async (crewData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/crews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(crewData),
            });

            if (!response.ok) throw new Error('Failed to create crew');

            const newCrew = await response.json();
            setCrews([...crews, newCrew]);
            showNotification('Crew created successfully!', 'success');

            // ✅ Redirect to MyCrews after short delay so user sees the success message
            setTimeout(() => {
                navigate('/crews');
            }, 1500);

        } catch (error) {
            console.error('Error creating crew:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateCrew = async (crewData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/crews/${editingCrew._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(crewData),
            });

            if (!response.ok) throw new Error('Failed to update crew');

            const updatedCrew = await response.json();
            setCrews(crews.map(c => c._id === editingCrew._id ? updatedCrew : c));
            setEditingCrew(null);
            showNotification('Crew updated successfully!', 'success');

            // ✅ Redirect to MyCrews after short delay
            setTimeout(() => {
                navigate('/crews');
            }, 3000);

        } catch (error) {
            console.error('Error updating crew:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingCrew(null);
        navigate('/crews'); // ✅ Also redirect on cancel
    };

return (
        <div className="crew-manager">
            {notification && (
                <ErrorNotification
                    message={notification.message}
                    type={notification.type}
                    onClose={handleCloseNotification} // ✅ Stable reference
                />
            )}
                <CrewForm
                onSubmit={editingCrew ? handleUpdateCrew : handleCreateCrew}
                editCrew={editingCrew}
                handleCancel={handleCancelEdit}
                isSubmitting={isSubmitting}
                showNotification={showNotification}
            />
        </div>
    );
}