import { useState, useContext } from "react";
import "./CrewPolls.css";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../crews/CrewDetails.module.css";
import CrewToast from "../crews/components/CrewToast";
import { CrewContext } from "../../hooks/context/CrewContext";
import { addCrewMember } from "../../services/apiMembers";

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
    const [voteCounts, setVoteCounts] = useState(() => {
    // Initialize vote counts with random values
        return poll.options.reduce(
            (acc, o) => ({ ...acc, [o.id]: Math.floor(Math.random() * 10) + 1 }),
            {},
        );
    });

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

export default function CrewPolls() {
    const navigate = useNavigate();
    const { crewId } = useParams();

    // Get crew data from context instead of managing in local state
    const { crew, loading, error } = useContext(CrewContext) || {
        crew: null,
        loading: true,
        error: "",
    };

    const [tab, setTab] = useState("active");
    const [showModal, setShowModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState("");
    const [newOptions, setNewOptions] = useState(["", "", ""]);
    const [Polls, setPolls] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [notification, setNotification] = useState(null);
    

    const activePolls = polls.filter((p) => p.type === "active");
    const pastPolls = polls.filter((p) => p.type === "past");


     const handleCreatePoll = async () => {
        if (!newQuestion.trim()) return;
        try {
            setIsAdding(true);
            const added = await addCrewMember(crewId, {
                question: newQuestion.trim(),
                options: newOptions.filter((opt) => opt.trim()),
            });
            setPolls((prev) => [...prev, added]);
            setNewQuestion("");
            setNewOptions(["", "", ""]);
            setShowModal(false);
            setNotification({
                type: "success",
                message: "Encuesta creada correctamente",
            });
        } catch (err) {
            setNotification({
                type: "error",
                message: err.message || "No se pudo crear la encuesta",
            });
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <>
            {/* MAIN */}
            <div className={styles.container}>
                {/* Breadcrumb */}
                <nav className={styles.breadcrumb} aria-label="breadcrumb">
                    <span
                        onClick={() => navigate("/crews")}
                        style={{ cursor: "pointer", color: "#7c858d" }}
                    >
            / Mis Crews
                    </span>
                    <span className={styles.sep}>/</span>
                    <span
                        onClick={() => navigate(`/crews/${crewId}`)}
                        style={{ cursor: "pointer", color: "#7c858d" }}
                    >
                        {loading ? "Loading..." : crew?.name || "Crew"}
                    </span>
                    <span className={styles.sep}>/</span>
                    <span
                        onClick={() => navigate(`/crews/${crewId}`)}
                        style={{ cursor: "pointer", color: "#7c858d" }}
                    >
                        {loading ? "Loading..." : crew?.name || "Crew"}
                    </span>
                    <span className={styles.sep}>/</span>
                    <span className={styles.current}>Polls</span>
                </nav>

                {/* Page Header */}
                <div className="page-header">
                    {/* Título */}
                    <h1 className={styles.title}>
                        {loading ? "Loading..." : crew?.name || "Crew"}{" "}
                        <span>Members Polls</span>
                    </h1>

                    <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Create Poll
                    </button>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab-btn ${tab === "active" ? "active" : ""}`}
                        onClick={() => setTab("active")}
                    >
            Active
                    </button>
                    <button
                        className={`tab-btn ${tab === "past" ? "active" : ""}`}
                        onClick={() => setTab("past")}
                    >
            Past
                    </button>
                </div>

                {/* Polls */}
                <div className="polls-grid">
                    {tab === "active"
                        ? activePolls.map((p) => <ActivePollCard key={p.id} poll={p} />)
                        : pastPolls.map((p) => <PastPollCard key={p.id} poll={p} />)}
                </div>

                {/* CREATE POLL MODAL */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <h2 className="modal-title">Create Poll</h2>
                            <div className="form-group">
                                <label className="form-label">Question</label>
                                <input
                                    className="form-input"
                                    placeholder="What is your question?"
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Options</label>
                                {newOptions.map((opt, i) => (
                                    <input
                                        key={i}
                                        className="form-input"
                                        style={{ marginBottom: 8 }}
                                        placeholder={`Option ${i + 1}`}
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
                  Cancel
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={() => handleCreatePoll()}
                                    disabled={isAdding || !newQuestion.trim() || newOptions.filter((o) => o.trim()).length < 2}
                                >
                  Create
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
