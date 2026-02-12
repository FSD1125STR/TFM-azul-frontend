import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import "./login.css";

const loginSchema = z.object({
    username: z.string().min(3, { message: "Username must be at least 3 characters" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});
 
const Login = () => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const {
        handleSubmit, 
        register,
        formState: { errors }
    } = useForm({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (data) => {
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: data.username, password: data.password }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                setError(responseData.error || "Login failed");
                return;
            }

            // Store token in localStorage
            localStorage.setItem("authToken", responseData.token);
            localStorage.setItem("username", responseData.username);

            // Redirect to dashboard
            navigate("/dashboard");
        } catch (error) {
            setError("Connection error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <Link to="/register" className="register-link">
                SIGN UP
            </Link>
            <div className="login-wrapper">
                <h2> WELCOME TO CREW GO</h2>

                {error && <p className="login-error">{error}</p>}

                <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            {...register("username")}
                            disabled={loading}
                        />
                        {errors.username && <p className="error-message">⚠ {errors.username.message}</p>}
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            {...register("password")}
                            disabled={loading}
                        />
                        {errors.password && <p className="error-message">⚠ {errors.password.message}</p>}
                    </div>

                    <button type="submit" disabled={loading} className="login-button">
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
