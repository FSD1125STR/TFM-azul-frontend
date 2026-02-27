import { useState } from "react";
import "./Polls.css";

const polls = [
  {
    id: 1,
    question: "Where should we hold the next team meetup?",
    type: "active",
    options: [
      { id: "a", label: "Downtown office", votes: null },
      { id: "b", label: "Rooftop venue", votes: null },
      { id: "c", label: "Virtual/Remote", votes: null },
    ],
  },
  {
    id: 2,
    question: "Best day for weekly sync?",
    type: "active",
    options: [
      { id: "a", label: "Monday", votes: null },
      { id: "b", label: "Wednesday", votes: null },
      { id: "c", label: "Friday", votes: null },
    ],
  },
  {
    id: 3,
    question: "Preferred project management tool?",
    type: "past",
    options: [
      { id: "a", label: "Notion", votes: 18, percent: 40 },
      { id: "b", label: "Jira", votes: 20, percent: 44 },
      { id: "c", label: "Trello", votes: 7, percent: 16 },
    ],
  },
  {
    id: 4,
    question: "Team lunch cuisine preference?",
    type: "past",
    options: [
      { id: "a", label: "Italian", votes: 15, percent: 33 },
      { id: "b", label: "Japanese", votes: 22, percent: 49 },
      { id: "c", label: "Mexican", votes: 8, percent: 18 },
    ],
  },
];

function ActivePollCard({ poll }) {
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);
  const [voteCounts, setVoteCounts] = useState(
    poll.options.reduce(
      (acc, o) => ({ ...acc, [o.id]: Math.floor(Math.random() * 10) + 1 }),
      {}
    )
  );

  const handleVote = () => {
    if (!selected) return;
    setVoteCounts((prev) => ({ ...prev, [selected]: prev[selected] + 1 }));
    setVoted(true);
  };

  return (
    <div className="poll-card active-poll">
      <h3 className="poll-question">{poll.question}</h3>
      <div className="options-list">
        {poll.options.map((opt) => (
          <label
            key={opt.id}
            className={`option-row ${selected === opt.id ? "selected" : ""} ${voted ? "disabled" : ""}`}
            onClick={() => !voted && setSelected(opt.id)}
          >
            <div className="radio-circle">
              {selected === opt.id && <div className="radio-dot" />}
            </div>
            <span className="option-label">{opt.label}</span>
            <span className="vote-count">{voteCounts[opt.id]}</span>
          </label>
        ))}
      </div>
      {!voted ? (
        <button
          className={`vote-btn ${selected ? "active" : ""}`}
          onClick={handleVote}
          disabled={!selected}
        >
          Votar
        </button>
      ) : (
        <p className="voted-msg">✓ Voto registrado</p>
      )}
    </div>
  );
}

function PastPollCard({ poll }) {
  const max = Math.max(...poll.options.map((o) => o.percent));
  return (
    <div className="poll-card past-poll">
      <h3 className="poll-question">{poll.question}</h3>
      <div className="results-list">
        {poll.options.map((opt) => (
          <div key={opt.id} className="result-row">
            <div className="result-header">
              <span className="option-label">{opt.label}</span>
              <span className="result-meta">
                {opt.votes} votos ({opt.percent}%)
              </span>
            </div>
            <div className="bar-track">
              <div
                className={`bar-fill ${opt.percent === max ? "bar-winner" : ""}`}
                style={{ width: `${opt.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PollsPage() {
  const [tab, setTab] = useState("active");
  const [showModal, setShowModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", ""]);

  const activePolls = polls.filter((p) => p.type === "active");
  const pastPolls = polls.filter((p) => p.type === "past");

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-logo">
          <span className="diamond" />
          CrewGO
        </div>
        <div className="nav-links">
          <a href="#">Dashboards</a>
          <a href="#">MyCrews</a>
          <a href="#">Events</a>
          <div className="nav-divider" />
          <div className="nav-user">
            Username
            <div className="avatar">U</div>
          </div>
        </div>
      </nav>

      <div className="app-layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="crew-header">
            <div className="crew-thumb" />
            <div>
              <div className="crew-name">Nombre del grupo</div>
              <div className="crew-sub">nombre crew</div>
            </div>
          </div>
          <div className="sidebar-divider" />
          {[
            { label: "Overview", icon: "◇" },
            { label: "Eventos", icon: "◇" },
            { label: "Encuestas", icon: "◇", active: true },
            { label: "Archivos", icon: "◇" },
            { label: "Miembros", icon: "◇" },
          ].map((item) => (
            <a
              key={item.label}
              className={`nav-item ${item.active ? "active" : ""}`}
              href="#"
            >
              <span>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </aside>

        {/* MAIN */}
        <main className="main-content">
          <div className="breadcrumb">
            / Nombre Crew <span>›</span> Groups <span>›</span> Nombre grupo{" "}
            <span>›</span> Encuestas
          </div>

          <div className="page-header">
            <h1 className="page-title">Nombre Crew Encuestas</h1>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Crear encuesta
            </button>
          </div>

          <div className="tabs">
            <button
              className={`tab-btn ${tab === "active" ? "active" : ""}`}
              onClick={() => setTab("active")}
            >
              Activas
            </button>
            <button
              className={`tab-btn ${tab === "past" ? "active" : ""}`}
              onClick={() => setTab("past")}
            >
              Pasadas
            </button>
          </div>

          <div className="polls-grid">
            {tab === "active"
              ? activePolls.map((p) => <ActivePollCard key={p.id} poll={p} />)
              : pastPolls.map((p) => <PastPollCard key={p.id} poll={p} />)}
          </div>
        </main>
      </div>

      {/* CREATE POLL MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Crear encuesta</h2>
            <div className="form-group">
              <label className="form-label">Pregunta</label>
              <input
                className="form-input"
                placeholder="¿Cuál es tu pregunta?"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Opciones</label>
              {newOptions.map((opt, i) => (
                <input
                  key={i}
                  className="form-input"
                  style={{ marginBottom: 8 }}
                  placeholder={`Opción ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const updated = [...newOptions];
                    updated[i] = e.target.value;
                    setNewOptions(updated);
                  }}
                />
              ))}
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={() => setShowModal(false)}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}