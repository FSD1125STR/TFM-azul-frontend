import { useState, useContext, useEffect } from "react";
import pollStyles from "./CrewPolls.module.css";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../crews/CrewDetails.module.css";
import CrewToast from "../crews/components/CrewToast.jsx";
import { CrewContext } from "../../hooks/context/CrewContext";
import { createPoll, getCrewPolls, votePoll } from "../../services/apiPolls";

function ActivePollCard({ poll, onVoteSuccess }) {
    const { idCrew } = useParams();
    const [selected, setSelected] = useState(null);
    const [voted, setVoted] = useState(false);
    const [isVoting, setIsVoting] = useState(false);
    const [voteError, setVoteError] = useState(null);
    const [voteCounts, setVoteCounts] = useState({});

    // Update vote counts whenever poll changes
    useEffect(() => {
        if (poll?.options) {
            setVoteCounts(
                poll.options.reduce((acc, o) => ({ ...acc, [o.id]: o.votes ?? 0 }), {}),
            );
        }
    }, [poll]);

    const handleVote = async () => {
        if (!selected || isVoting) return;

        setIsVoting(true);
        setVoteError(null);

        try {
            await votePoll(idCrew, poll._id, selected);
            setVoteCounts((prev) => ({
                ...prev,
                [selected]: (prev[selected] || 0) + 1,
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
        <div className={pollStyles.pollCard}>
            <h3 className={pollStyles.pollQuestion}>{poll.question}</h3>
            <div className={pollStyles.optionsList}>
                {poll.options?.length > 0 ? (
                    poll.options.map((opt) => (
                        <label
                            key={opt.id}
                            className={`${pollStyles.optionRow} ${selected === opt.id ? pollStyles.selected : ""} ${voted ? pollStyles.disabled : ""}`}
                            onClick={() => !voted && setSelected(opt.id)}
                        >
                            <div className={pollStyles.radioCircle}>
                                {selected === opt.id && <div className={pollStyles.radioDot} />}
                            </div>
                            <span className={pollStyles.optionLabel}>{opt.label}</span>
                            <span className={pollStyles.voteCount}>{voteCounts[opt.id]}</span>
                        </label>
                    ))
                ) : (
                    <p>No options available</p>
                )}
            </div>
            {voteError && <p className={pollStyles.voteError}>⚠️ {voteError}</p>}
            {!voted ? (
                <button
                    className={`${pollStyles.voteBtn} ${selected ? pollStyles.active : ""}`}
                    onClick={handleVote}
                    disabled={isVoting || !selected}
                >
                    {isVoting ? "Votando..." : "Votar"}
                </button>
            ) : (
                <p className={pollStyles.votedMsg}>✓ Voto registrado</p>
            )}
        </div>
    );
}

function PastPollCard({ poll }) {
    // Calculate total votes and percentages
    const totalVotes = (poll.options ?? []).reduce(
        (sum, o) => sum + (o.votes ?? 0),
        0,
    );
    const optionsWithPercent = (poll.options ?? []).map((o) => ({
        ...o,
        percent:
      totalVotes > 0 ? Math.round(((o.votes ?? 0) / totalVotes) * 100) : 0,
    }));
    const validPercents = optionsWithPercent
        .map((o) => o.percent)
        .filter((p) => p > 0);
    const max = validPercents.length > 0 ? Math.max(...validPercents) : 0;

    return (
        <div className={pollStyles.pollCard}>
            <h3 className={pollStyles.pollQuestion}>{poll.question}</h3>
            <div className={pollStyles.resultsList}>
                {optionsWithPercent?.length > 0 ? (
                    optionsWithPercent.map((opt) => (
                        <div key={opt.id} className={pollStyles.resultRow}>
                            <div className={pollStyles.resultHeader}>
                                <span className={pollStyles.optionLabel}>{opt.label}</span>
                                <span className={pollStyles.resultMeta}>
                                    {opt.votes ?? 0} votos ({opt.percent}%)
                                </span>
                            </div>
                            <div className={pollStyles.barTrack}>
                                <div
                                    className={`${pollStyles.barFill} ${opt.percent === max ? pollStyles.barWinner : ""}`}
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

    const INITIAL_OPTIONS_COUNT = 3;
    const MAX_OPTIONS_COUNT = INITIAL_OPTIONS_COUNT + 2;

    // Get crew data from context instead of managing in local state
    const { crew, loading } = useContext(CrewContext) || {
        crew: null,
        loading: true,
    };

    const [tab, setTab] = useState("active");
    const [showModal, setShowModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState("");
    const [newExpiresAt, setNewExpiresAt] = useState("");
    const [newOptions, setNewOptions] = useState(
        Array.from({ length: INITIAL_OPTIONS_COUNT }, () => ""),
    );
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
    const canCreatePoll = crew?.userRole?.permission === "admin";

    useEffect(() => {
        if (showModal && !canCreatePoll) setShowModal(false);
    }, [showModal, canCreatePoll]);



    const handleAddPoll = () => {
        if (!canCreatePoll) {
            setShowModal(false);
            setNotification({
                type: "error",
                message: "Solo el admin puede crear encuestas",
            });
            return;
        }

        setNewQuestion("");
        setNewExpiresAt("");
        setNewOptions(Array.from({ length: INITIAL_OPTIONS_COUNT }, () => ""));
        setShowModal(true);
    };
    const handleCreatePoll = async () => {
        if (!canCreatePoll) {
            setNotification({
                type: "error",
                message: "Solo el admin puede crear encuestas",
            });
            return;
        }
        if (!newQuestion.trim()) return;
        try {
            setIsAdding(true);
            const added = await createPoll(idCrew, {
                question: newQuestion.trim(),
                options: newOptions
                    .filter((opt) => opt.trim())
                    .map((opt) => opt.trim()),
                expiresAt: newExpiresAt ? new Date(newExpiresAt).toISOString() : null,
            });
            setpolls((prev) => [...prev, added]);
            setNewQuestion("");
            setNewExpiresAt("");
            setNewOptions(Array.from({ length: INITIAL_OPTIONS_COUNT }, () => ""));
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
                {/* Page Header */}
                <div className={pollStyles.pageHeader}>
                    <h1 className={styles.title}>
                        {loading ? "Loading..." : crew?.name || "Crew"}{" "}
                        <span>Members Polls</span>
                    </h1>

                    <button
                        className={pollStyles.btnPrimary}
                        disabled={isAdding}
                        onClick={handleAddPoll}
                    >
              + Create Poll
                    </button>
                </div>

                {/* Tabs */}
                <div className={pollStyles.tabs}>
                    <button
                        className={`${pollStyles.tabBtn} ${tab === "active" ? pollStyles.active : ""}`}
                        onClick={() => setTab("active")}
                    >
            Active
                    </button>
                    <button
                        className={`${pollStyles.tabBtn} ${tab === "past" ? pollStyles.active : ""}`}
                        onClick={() => setTab("past")}
                    >
            Past
                    </button>
                </div>

                {/* Polls */}
                <div className={pollStyles.pollsGrid}>
                    {tab === "active"
                        ? activePolls.map((p) => (
                            <ActivePollCard
                                key={p._id}
                                poll={p}
                                onVoteSuccess={refreshPolls}
                            />
                        ))
                        : pastPolls.map((p) => <PastPollCard key={p._id} poll={p} />)}
                </div>

                {/* CREATE POLL MODAL */}
                {showModal && canCreatePoll && (
                    <div
                        className={pollStyles.modalOverlay}
                        onClick={() => setShowModal(false)}
                    >
                        <div
                            className={pollStyles.modal}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className={pollStyles.modalTitle}>Create Poll</h2>
                            <div className={pollStyles.formGroup}>
                                <label className={pollStyles.formLabel}>Question</label>
                                <input
                                    className={pollStyles.formInput}
                                    placeholder="What is your question?"
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.target.value)}
                                />
                            </div>
                            <div className={pollStyles.formGroup}>
                                <label className={pollStyles.formLabel}>Voting Ends</label>
                                <input
                                    type="datetime-local"
                                    className={pollStyles.formInput}
                                    value={newExpiresAt}
                                    onChange={(e) => setNewExpiresAt(e.target.value)}
                                />
                            </div>
                            <div className={pollStyles.formGroup}>
                                <div className={pollStyles.optionsHeader}>
                                    <label className={pollStyles.formLabel}>Options</label>
                                    <button
                                        type="button"
                                        className={pollStyles.addOptionsBtn}
                                        onClick={() =>
                                            setNewOptions((prev) => {
                                                if (prev.length >= MAX_OPTIONS_COUNT) return prev;
                                                return [...prev, ""];
                                            })
                                        }
                                        disabled={newOptions.length >= MAX_OPTIONS_COUNT}
                                        aria-label="Add option"
                                        title="Add option"
                                    >
                    +
                                    </button>
                                </div>
                                {newOptions.map((opt, i) => (
                                    <input
                                        key={i}
                                        className={pollStyles.formInput}
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
                            <div className={pollStyles.modalActions}>
                                <button
                                    className={pollStyles.btnSecondary}
                                    onClick={() => setShowModal(false)}
                                >
                  Cancel
                                </button>
                                <button
                                    className={pollStyles.btnPrimary}
                                    onClick={() => handleCreatePoll()}
                                    disabled={
                                        isAdding ||
                    !newQuestion.trim() ||
                    newOptions.filter((o) => o.trim()).length < 2 ||
                    (newExpiresAt && new Date(newExpiresAt).getTime() <= Date.now())
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
