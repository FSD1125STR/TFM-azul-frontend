import React, { useState, useEffect } from 'react';
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
    const [crews, setCrews] = useState([]);
    const [editingCrew, setEditingCrew] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);

    // Fetch all crews on mount
    useEffect(() => {
        fetchCrews();
    }, []);

    const fetchCrews = async () => {
        try {
            const response = await fetch('/api');
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
            const response = await fetch('/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(crewData),
            });

            if (!response.ok) throw new Error('Failed to create crew');
            
            const newCrew = await response.json();
            setCrews([...crews, newCrew]);
            showNotification('Crew created successfully!', 'success');
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
            const response = await fetch(`/api/${editingCrew._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(crewData),
            });

            if (!response.ok) throw new Error('Failed to update crew');
            
            const updatedCrew = await response.json();
            setCrews(crews.map(c => c._id === editingCrew._id ? updatedCrew : c));
            setEditingCrew(null);
            showNotification('Crew updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating crew:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCrew = async (id) => {
        if (!window.confirm('Are you sure you want to delete this crew?')) return;

        try {
            const response = await fetch(`/api/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete crew');
            
            setCrews(crews.filter(c => c._id !== id));
            showNotification('Crew deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting crew:', error);
            showNotification('Failed to delete crew', 'error');
        }
    };

    const handleEditClick = (crew) => {
        setEditingCrew(crew);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingCrew(null);
    };

    return (
        <div className="crew-manager">
            {notification && (
                <ErrorNotification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
      
            
            <CrewForm
                onSubmit={editingCrew ? handleUpdateCrew : handleCreateCrew}
                editCrew={editingCrew}
                handleCancel={handleCancelEdit}
                isSubmitting={isSubmitting}
            />

            <div className="crews-list">
                <h2>All Crews</h2>
                {crews.length === 0 ? (
                    <p>No crews yet. Create one above!</p>
                ) : (
                    <div className="crews-grid">
                        {crews.map((crew) => (
                            <div key={crew._id} className="crew-card">
                                <img 
                                src={`http://localhost:3000${crew.imageUrl}`} 
                                alt={crew.name}
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                                }}/>
                                <h3>{crew.name}</h3>
                                <p>{crew.description}</p>
                                <p><strong>Activity:</strong> {crew.activity}</p>
                                <p><strong>Sub-Activity:</strong> {crew.SubActivity}</p>
                                <div className="crew-actions">
                                    <button onClick={() => handleEditClick(crew)}>Edit</button>
                                    <button onClick={() => handleDeleteCrew(crew._id)} className="delete-btn">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}