import { useState, useContext, useEffect } from "react";
import "./CrewPolls.css";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../crews/CrewDetails.module.css";
import CrewToast from "../crews/components/CrewToast.jsx";
import { CrewContext } from "../../hooks/context/CrewContext";
import { createPoll, getCrewPolls, votePoll } from "../../services/apiPolls";

function ActivePollCard({ poll, onVoteSuccess}) {
    const {idCrew} = useParams();
    const [selected, setSelected] = useState(null);
    const [voted, setVoted] = useState(false);
    const [isVoting, setIsVoting] = useState(false);
    const [voteError, setVoteError] = useState(null);
    const [voteCounts, setVoteCounts] = useState(() => {
    // Initialize vote counts from poll options
        return poll.options.reduce(
            (acc, o) => ({ ...acc, [o.id]: o.votes ?? 0}),
            {},
        );
    });

    const handleVote = async() => {
        if (!selected || isVoting) return;

        setIsVoting(true);
        setVoteError(null);

        try{
            await votePoll(idCrew, poll._id, selected);
            setVoteCounts((prev) => ({
                ...prev,
                [selected]: (prev[selected] || 0) + 1
            }));
            setVoted(true);
            // Refresh polls after voting to show updated counts
            if (onVoteSuccess) {
                setTimeout(() => onVoteSuccess(), 500);
            }
        } catch (err) {
            if (err.code === "ALREADY_VOTED") {
                setVoteError("You have already Voted once");
                setVoted(false);
            } else {
                setVoteError(err.message || "Error al votar");
            }
            console.error("Vote error:", err.message);
        } finally {
            setIsVoting(false);
        }
    };

    return (
        <div className="poll-card active-poll">
            <h3 className="poll-question">{poll.question}</h3>
            <div className="options-list">
                {poll.options?.length > 0 ? (
                    poll.options.map((opt) => (
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
                    ))
                ) : (
                    <p>No options available</p>
                )}
            </div>
            {voteError && (
                <p className="vote-error">⚠️ {voteError}</p>
            )}
            {!voted ? (
                <button
                    className={`vote-btn ${selected ? "active" : ""}`}
                    onClick={handleVote}
                    disabled={isVoting || !selected}
                >
                    {isVoting ? "Votando..." : "Votar"}
                </button>
            ) : (
                <p className="voted-msg">✓ Voto registrado</p>
            )}
        </div>
    );
}

function PastPollCard({ poll }) {
    // Calculate total votes and percentages
    const totalVotes = (poll.options ?? []).reduce((sum, o) => sum + (o.votes ?? 0), 0);
    const optionsWithPercent = (poll.options ?? []).map((o) => ({
        ...o,
        percent: totalVotes > 0 ? Math.round(((o.votes ?? 0) / totalVotes) * 100) : 0,
    }));
    const validPercents = optionsWithPercent.map((o) => o.percent).filter((p) => p > 0);
    const max = validPercents.length > 0 ? Math.max(...validPercents) : 0;

    return (
        <div className="poll-card past-poll">
            <h3 className="poll-question">{poll.question}</h3>
            <div className="results-list">
                {optionsWithPercent?.length > 0 ? (
                    optionsWithPercent.map((opt) => (
                        <div key={opt.id} className="result-row">
                            <div className="result-header">
                                <span className="option-label">{opt.label}</span>
                                <span className="result-meta">
                                    {opt.votes ?? 0} votos ({opt.percent}%)
                                </span>
                            </div>
                            <div className="bar-track">
                                <div
                                    className={`bar-fill ${opt.percent === max ? "bar-winner" : ""}`}
                                    style={{ width: `${opt.percent}%` }}
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No results available</p>
                )}
            </div>
        </div>
    );
}

export default function CrewPolls() {
    const navigate = useNavigate();
    const { idCrew } = useParams();

    // Get crew data from context instead of managing in local state
    const { crew, loading } = useContext(CrewContext) || {
        crew: null,
        loading: true,
    };

    const [tab, setTab] = useState("active");
    const [showModal, setShowModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState("");
    const [newOptions, setNewOptions] = useState(["", "", ""]);
    const [polls, setpolls] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        // Fetch polls from API when component mounts
        const fetchPolls = async () => {
            try {
                const updatedPolls = await getCrewPolls(idCrew);
                setpolls(Array.isArray(updatedPolls) ? updatedPolls : []);
            } catch (error) {
                console.error("Error fetching polls:", error);
            }
        };
        fetchPolls();
    }, [idCrew]);

    const refreshPolls = async () => {
        try {
            const updatedPolls = await getCrewPolls(idCrew);
            setpolls(Array.isArray(updatedPolls) ? updatedPolls : []);
        } catch (error) {
            console.error("Error refreshing polls:", error);
        }
    };

    const activePolls = polls.filter((p) => p.isActive === true);
    const pastPolls = polls.filter((p) => p.isActive === false);

    const handleCreatePoll = async () => {
        if (!newQuestion.trim()) return;
        try {
            setIsAdding(true);
            const added = await createPoll(idCrew, {
                question: newQuestion.trim(),
                options: newOptions
                    .filter((opt) => opt.trim())
                    .map((opt) => opt.trim()),
            });
            setpolls((prev) => [...prev, added]);
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
            {notification && (
                <CrewToast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

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
                        onClick={() => navigate(`/crews/${idCrew}`)}
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
                        ? activePolls.map((p) => <ActivePollCard key={p._id} poll={p} onVoteSuccess={refreshPolls} />)
                        : pastPolls.map((p) => <PastPollCard key={p._id} poll={p} />)}
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
                                    disabled={
                                        isAdding ||
                    !newQuestion.trim() ||
                    newOptions.filter((o) => o.trim()).length < 2
                                    }
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
