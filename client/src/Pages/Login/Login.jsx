import { useState } from "react";
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import logo from "../../assets/logo.png";
import styles from "./Login.module.css";

function Login() {
    const [formData, setFormData] = useState({
        email: "",
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

    const handleSubmit = (e) => {
        e.preventDefault();
        // Form submission logic will go here
        console.log("Login attempt with:", formData);
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
                    type="email"
                    name="email"
                    className={styles.input}
                    placeholder="Email address"
                    value={formData.email}
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
