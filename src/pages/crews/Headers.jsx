
import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

function Header({ username = "Username" }) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        // Add your logout logic here
        console.log("Logging out...");
        navigate("/login");
    };

    return (
        <header className="app-header">
            <div className="header-container">
                {/* Logo Section */}
                <Link to="/home" className="logo-section">
                    <div className="logo-icon">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2" transform="rotate(45 16 16)"/>
                        </svg>
                    </div>
                    <span className="logo-text">CrewGO</span>
                </Link>

                {/* Navigation Links */}
                <nav className="nav-links">
                    <Link to="/dashboard" className="nav-link">
                        Dashboards
                    </Link>
                    <Link to="/crews" className="nav-link">
                        MyCrews
                    </Link>
                    <Link to="/events" className="nav-link">
                        Events
                    </Link>
                </nav>

                {/* User Section */}
                <div className="user-section" ref={menuRef}>
                    <button 
                        className="user-button"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        <span className="username">{username}</span>
                        <div className="user-avatar">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
                                <circle cx="10" cy="8" r="3" fill="currentColor"/>
                                <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                        <div className="user-dropdown">
                            <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                                <span className="dropdown-icon">👤</span>
                                Profile
                            </Link>
                            <Link to="/settings" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                                <span className="dropdown-icon">⚙️</span>
                                Settings
                            </Link>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item" onClick={handleLogout}>
                                <span className="dropdown-icon">🚪</span>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;

