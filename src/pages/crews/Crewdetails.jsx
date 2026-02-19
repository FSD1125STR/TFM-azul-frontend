import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CrewForm from "./createCrews"; // ✅ Reuse existing CrewForm for editing

const activityColors = {
  "Deportes": { bg: "#e8f5e9", dot: "#4caf50" },
  "Música": { bg: "#fce4ec", dot: "#e91e63" },
  "Ocio": { bg: "#fff8e1", dot: "#ff9800" },
  "Trabajo y Proyectos": { bg: "#e3f2fd", dot: "#2196f3" },
  "Estudios": { bg: "#f3e5f5", dot: "#9c27b0" },
  "Eventos y Comunidades": { bg: "#e0f7fa", dot: "#00bcd4" },
  "Otros": { bg: "#f5f5f5", dot: "#999" },
};

function ErrorNotification({ message, type = "error", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed", top: "20px", right: "20px", zIndex: 1000,
      background: type === "success" ? "#4caf50" : "#e53935",
      color: "#fff", borderRadius: "12px", padding: "14px 20px",
      display: "flex", alignItems: "center", gap: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: "600"
    }}>
      <span>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "18px", lineHeight: 1 }}>×</button>
    </div>
  );
}

export default function CrewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [crew, setCrew] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // ✅ Toggle edit mode
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleCloseNotification = useCallback(() => setNotification(null), []);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
  };

  // ✅ Fetch crew by ID
  useEffect(() => {
    const fetchCrew = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/crews/${id}`);
        if (!response.ok) throw new Error('Crew not found');
        const data = await response.json();
        setCrew(data);
      } catch (err) {
        console.error('Error fetching crew:', err);
        setError('Failed to load crew details.');
      } finally {
        setLoading(false);
      }
    };
    fetchCrew();
  }, [id]);

  // ✅ Handle edit form submission - sends PUT request to update crew
  const handleUpdateCrew = async (crewData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/crews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crewData),
      });

      if (!response.ok) throw new Error('Failed to update crew');

      const updatedCrew = await response.json();
      setCrew(updatedCrew);         // ✅ Update local state with new data
      setIsEditing(false);          // ✅ Exit edit mode
      showNotification('Crew updated successfully!', 'success');

    } catch (err) {
      console.error('Error updating crew:', err);
      showNotification('Failed to update crew. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Handle delete
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/crews/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete crew');
      showNotification('Crew deleted successfully!', 'success');
      setTimeout(() => navigate('/crews'), 1500);
    } catch (err) {
      console.error('Error deleting crew:', err);
      showNotification('Failed to delete crew. Please try again.', 'error');
      setIsDeleting(false);
    }
  };

  const colors = crew ? (activityColors[crew.activity] || { bg: "#f5f5f5", dot: "#999" }) : {};

  // --- Loading ---
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f7f9", fontFamily: "'DM Sans', sans-serif", color: "#aaa" }}>
      Loading crew...
    </div>
  );

  // --- Error ---
  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f7f7f9", fontFamily: "'DM Sans', sans-serif", gap: "16px" }}>
      <p style={{ color: "#e53935", fontSize: "15px" }}>{error}</p>
      <button onClick={() => navigate('/crews')} style={{ background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 24px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "14px" }}>
        ← Back to My Crews
      </button>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f7f7f9; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f7f7f9", fontFamily: "'DM Sans', sans-serif" }}>

        {/* Notification */}
        {notification && (
          <ErrorNotification
            message={notification.message}
            type={notification.type}
            onClose={handleCloseNotification}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
            <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", maxWidth: "400px", width: "90%", textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", color: "#1a1a2e", marginBottom: "12px" }}>Delete Crew?</h3>
              <p style={{ fontSize: "14px", color: "#666", fontFamily: "'DM Sans', sans-serif", marginBottom: "24px" }}>
                Are you sure you want to delete <strong>{crew?.name}</strong>? This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button onClick={() => setShowDeleteConfirm(false)}
                  style={{ padding: "10px 24px", borderRadius: "10px", border: "1.5px solid #ddd", background: "#fff", color: "#555", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", fontWeight: "600" }}>
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={isDeleting}
                  style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "#e53935", color: "#fff", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", fontWeight: "600" }}>
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        <main style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>

          {/* Back Button */}
          <button
            onClick={() => isEditing ? setIsEditing(false) : navigate('/crews')}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#666", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", marginBottom: "24px", padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = "#1a1a2e"}
            onMouseLeave={e => e.currentTarget.style.color = "#666"}
          >
            ← {isEditing ? "Back to Crew Details" : "Back to My Crews"}
          </button>

          {/* ✅ EDIT MODE - Show CrewForm with existing crew data */}
          {isEditing ? (
            <div style={{ background: "#fff", borderRadius: "20px", padding: "32px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0" }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: "800", color: "#1a1a2e", marginBottom: "24px" }}>
                ✏️ Editing: {crew.name}
              </h2>
              {/* ✅ Pass existing crew data as editCrew prop so the form pre-fills */}
              <CrewForm
                onSubmit={handleUpdateCrew}
                editCrew={crew}
                handleCancel={() => setIsEditing(false)}
                isSubmitting={isSubmitting}
                showNotification={showNotification}
              />
            </div>

          ) : (
            // ✅ VIEW MODE - Show crew details
            <>
              {/* Hero Image */}
              <div style={{
                height: "260px", borderRadius: "20px", overflow: "hidden",
                background: crew.imageUrl
                  ? `url(http://localhost:3000${crew.imageUrl}) center/cover`
                  : `linear-gradient(135deg, ${colors.bg} 0%, #e0e0e0 100%)`,
                marginBottom: "28px", position: "relative",
              }}>
                <div style={{ position: "absolute", bottom: "16px", left: "16px", display: "flex", gap: "8px" }}>
                  <span style={{ background: colors.dot, color: "#fff", fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "20px", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
                    {crew.activity}
                  </span>
                  <span style={{ background: "#fff", color: "#333", fontSize: "12px", fontWeight: "600", padding: "4px 12px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif" }}>
                    {crew.SubActivity}
                  </span>
                </div>
              </div>

              {/* Crew Info Card */}
              <div style={{ background: "#fff", borderRadius: "20px", padding: "32px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0", marginBottom: "20px" }}>

                {/* Name + Action Buttons */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px", gap: "16px" }}>
                  <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "28px", fontWeight: "800", color: "#1a1a2e", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                    {crew.name}
                  </h1>

                  <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                    {/* ✅ Edit button - switches to edit mode, no page navigation */}
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f5f5f5", color: "#1a1a2e", border: "none", borderRadius: "10px", padding: "10px 18px", fontSize: "13px", fontWeight: "600", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "background 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#e0e0e0"}
                      onMouseLeave={e => e.currentTarget.style.background = "#f5f5f5"}
                    >
                      ✏️ Edit
                    </button>

                    {/* ✅ Delete button - opens confirmation modal */}
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      style={{ display: "flex", alignItems: "center", gap: "6px", background: "#fdecea", color: "#e53935", border: "none", borderRadius: "10px", padding: "10px 18px", fontSize: "13px", fontWeight: "600", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "background 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#ffcdd2"}
                      onMouseLeave={e => e.currentTarget.style.background = "#fdecea"}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: "15px", color: "#555", lineHeight: "1.7", fontFamily: "'DM Sans', sans-serif", marginBottom: "24px" }}>
                  {crew.description}
                </p>

                {/* Stats Row */}
                <div style={{ display: "flex", gap: "24px", padding: "20px", background: "#f7f7f9", borderRadius: "12px" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "24px", fontWeight: "800", color: "#1a1a2e" }}>{crew.members || 0}</div>
                    <div style={{ fontSize: "12px", color: "#888", fontFamily: "'DM Sans', sans-serif", marginTop: "2px" }}>Miembros</div>
                  </div>
                  <div style={{ width: "1px", background: "#e0e0e0" }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "24px", fontWeight: "800", color: "#1a1a2e" }}>{crew.events || 0}</div>
                    <div style={{ fontSize: "12px", color: "#888", fontFamily: "'DM Sans', sans-serif", marginTop: "2px" }}>Eventos</div>
                  </div>
                  <div style={{ width: "1px", background: "#e0e0e0" }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: "700", color: "#1a1a2e", paddingTop: "4px" }}>{crew.role || "Member"}</div>
                    <div style={{ fontSize: "12px", color: "#888", fontFamily: "'DM Sans', sans-serif", marginTop: "2px" }}>Tu Rol</div>
                  </div>
                </div>

                {/* Created At */}
                {crew.createdAt && (
                  <p style={{ fontSize: "12px", color: "#bbb", fontFamily: "'DM Sans', sans-serif", marginTop: "16px" }}>
                    Created {new Date(crew.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
            </>
          )}

        </main>
      </div>
    </>
  );
}