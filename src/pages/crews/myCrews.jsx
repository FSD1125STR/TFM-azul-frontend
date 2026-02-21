import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const activityColors = {
  "Deportes": { bg: "#e8f5e9", accent: "#2e7d32", dot: "#4caf50" },
  "Música": { bg: "#fce4ec", accent: "#880e4f", dot: "#e91e63" },
  "Ocio": { bg: "#fff8e1", accent: "#e65100", dot: "#ff9800" },
  "Trabajo y Proyectos": { bg: "#e3f2fd", accent: "#0d47a1", dot: "#2196f3" },
  "Estudios": { bg: "#f3e5f5", accent: "#4a148c", dot: "#9c27b0" },
  "Eventos y Comunidades": { bg: "#e0f7fa", accent: "#006064", dot: "#00bcd4" },
  "Otros": { bg: "#f5f5f5", accent: "#333", dot: "#999" },
};

function CrewCard({ crew, onView }) {
  const colors = activityColors[crew.activity] || { bg: "#f5f5f5", accent: "#333", dot: "#999" };

  return (
    <div
      style={{
        background: "#fff", borderRadius: "16px", overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0",
        display: "flex", flexDirection: "column",
        transition: "transform 0.2s ease, box-shadow 0.2s ease", cursor: "pointer",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.13)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)"; }}
    >
      <div style={{
        height: "140px",
        background: crew.imageUrl ? `url(http://localhost:3000${crew.imageUrl}) center/cover` : `linear-gradient(135deg, ${colors.bg} 0%, #e0e0e0 100%)`,
        display: "flex", alignItems: "flex-end", padding: "10px",
      }}>
        <span style={{ background: colors.dot, color: "#fff", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
          {crew.activity}
        </span>
        <span style={{ marginLeft: "auto", background: crew.role === "Admin" ? "#1a1a2e" : "#f5f5f5", color: crew.role === "Admin" ? "#fff" : "#555", fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif" }}>
          {crew.role || "Member"}
        </span>
      </div>

      <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#1a1a2e", fontFamily: "'Syne', sans-serif" }}>{crew.name}</h3>
        <p style={{ fontSize: "13px", color: "#888", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{crew.description}</p>

        <div style={{ display: "flex", gap: "16px", marginTop: "2px" }}>
          <span style={{ fontSize: "13px", color: "#666", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: "5px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {crew.members || 0} Miembros
          </span>
          <span style={{ fontSize: "13px", color: "#666", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: "5px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {crew.events || 0} Eventos
          </span>
        </div>

        <button
          onClick={() => onView(crew)}
          style={{ marginTop: "auto", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "10px", padding: "10px", fontSize: "13px", fontWeight: "600", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "background 0.2s ease" }}
          onMouseEnter={e => e.target.style.background = "#2d2d4e"}
          onMouseLeave={e => e.target.style.background = "#1a1a2e"}
        >
          Ver Crew →
        </button>
      </div>
    </div>
  );
}

export default function MyCrews() {
  const navigate = useNavigate();
  const [crews, setCrews] = useState([]);
  const [search, setSearch] = useState("");
  const [activityFilter, setActivityFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCrews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/crews');
        if (!response.ok) throw new Error('Failed to fetch crews');
        const data = await response.json();
        const nextCrews = Array.isArray(data) ? data : data?.crews;
        setCrews(Array.isArray(nextCrews) ? nextCrews : []);
      } catch (err) {
        console.error('Error fetching crews:', err);
        setError('Failed to load crews. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchCrews();
  }, []);

  const filtered = crews.filter(c => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase());
    const matchActivity = activityFilter ? c.activity === activityFilter : true;
    const matchRole = roleFilter ? c.role === roleFilter : true;
    return matchSearch && matchActivity && matchRole;
  });

  // ✅ Navigate to crew detail page
  const handleViewCrew = (crew) => {
    navigate(`/crews/${crew._id}`);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f7f7f9; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f7f7f9", fontFamily: "'DM Sans', sans-serif" }}>
        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "36px", fontWeight: "800", color: "#1a1a2e", letterSpacing: "-0.03em" }}>
              My Crews
            </h1>
            <Link
              to="/crews/create"
              style={{ background: "#1a1a2e", color: "#fff", borderRadius: "12px", padding: "12px 22px", fontSize: "14px", fontWeight: "600", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.background = "#2d2d4e"}
              onMouseLeave={e => e.currentTarget.style.background = "#1a1a2e"}
            >
              <span style={{ fontSize: "18px", lineHeight: 1 }}>+</span> Create Crew
            </Link>
          </div>

          {/* Search & Filters */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "32px", background: "#fff", padding: "14px 16px", borderRadius: "14px", border: "1px solid #ebebeb", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#aaa" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" placeholder="Buscar crew..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", padding: "9px 12px 9px 36px", border: "1.5px solid #ebebeb", borderRadius: "10px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", color: "#1a1a2e", outline: "none", background: "#fafafa" }}
                onFocus={e => e.target.style.borderColor = "#1a1a2e"}
                onBlur={e => e.target.style.borderColor = "#ebebeb"}
              />
            </div>
            <select value={activityFilter} onChange={e => setActivityFilter(e.target.value)}
              style={{ padding: "9px 16px", border: "1.5px solid #ebebeb", borderRadius: "10px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", color: activityFilter ? "#1a1a2e" : "#aaa", background: "#fafafa", cursor: "pointer", outline: "none", minWidth: "130px" }}>
              <option value="">Activity</option>
              {Object.keys(activityColors).map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              style={{ padding: "9px 16px", border: "1.5px solid #ebebeb", borderRadius: "10px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", color: roleFilter ? "#1a1a2e" : "#aaa", background: "#fafafa", cursor: "pointer", outline: "none", minWidth: "110px" }}>
              <option value="">Role</option>
              <option value="Admin">Admin</option>
              <option value="Member">Member</option>
            </select>
          </div>

          {loading && <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa", fontFamily: "'DM Sans', sans-serif" }}>Loading crews...</div>}
          {error && <div style={{ textAlign: "center", padding: "60px 0", color: "#e53935", fontFamily: "'DM Sans', sans-serif" }}>{error}</div>}

          {!loading && !error && (
            filtered.length === 0
              ? <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa", fontFamily: "'DM Sans', sans-serif" }}>No crews found matching your filters.</div>
              : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                  {filtered.map(crew => (
                    <CrewCard key={crew._id} crew={crew} onView={handleViewCrew} />
                  ))}
                </div>
          )}
        </main>
      </div>
    </>
  );
}
