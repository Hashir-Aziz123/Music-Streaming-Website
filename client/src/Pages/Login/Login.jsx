import { useState } from "react";
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import logo from "../../assets/logo.png";
import styles from "./Login.module.css";

function Login() {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 

        try {
            const response = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ username: formData.username, password: formData.password })
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Login successful:", data);
            } else {
                console.error("Login failed:", data.message);
                alert(data.message || "Login failed.");
            }
        } catch (err) {
            console.error("Error logging in:", err);
            alert("An error occurred during login.");
        }
    };

    return (
        <div className={styles.loginContainer}>
            {/* Logo & Heading */}
            <div className={styles.header}>
                <Link to='/'>
                    <img src={logo} alt="Drift Logo" className={styles.logo} />
                </Link>
                <h1 className={styles.heading}>Listen In</h1>
            </div>

            {/* Login Form */}
            <form className={styles.form} onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    className={styles.input}
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />

                <div className={styles.passwordWrapper}>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className={styles.input}
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <button
                        type="button"
                        className={styles.eyeButton}
                        onClick={togglePasswordVisibility}
                        aria-label="Toggle password visibility"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                <button type="submit" className={styles.button}>
                    Log In
                </button>

                <div className={styles.optionContainer}>
                    <Link to="/forgot-password">Forgot your password?</Link>
                    <p>
                        Don't have an account?{' '}
                        <Link to='/signup'>Sign up</Link>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default Login;