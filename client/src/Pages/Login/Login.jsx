import { useState } from "react";
import logo from "../../assets/logo.png";
import styles from "./Login.module.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className={styles.loginContainer}>
            {/* Drift Logo & Sign In Heading */}
            <div className={styles.header}>
                <img src={logo} alt="Drift Logo" className={styles.logo} />
                <h1 className={styles.heading}>Listen In</h1>
            </div>

            {/* Login Form */}
            <form className={styles.form}>
                <input
                    type="email"
                    className={styles.input}
                    placeholder="Example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <div className={styles.passwordWrapper}>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className={styles.input}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className={styles.eyeButton}
                        onClick={togglePasswordVisibility}
                        aria-label="Toggle password visibility"
                    >
                        {showPassword ? (
                            // Eye Open SVG
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 4.5C7 4.5 2.73 8.11 1 12c1.73 3.89 6 7.5 11 7.5s9.27-3.61 11-7.5c-1.73-3.89-6-7.5-11-7.5zm0 12.75c-2.9 0-5.25-2.35-5.25-5.25S9.1 6.75 12 6.75 17.25 9.1 17.25 12 14.9 17.25 12 17.25zm0-8.25a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                            </svg>
                        ) : (
                            // Eye Closed SVG
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 5c-5 0-9.27 3.61-11 7.5 1.1 2.47 3.15 4.53 5.64 5.79L2 21l1.41 1.41L21.41 4.41 20 3l-4.14 4.14C14.51 6.39 13.27 6 12 6c-1.62 0-3.11.64-4.24 1.76L6.2 7.2C7.9 5.86 9.87 5 12 5zm0 13c5 0 9.27-3.61 11-7.5-.86-1.93-2.28-3.6-3.96-4.77l-1.45 1.45C19.7 8.25 21 10 21 12c-1.62 3.62-5.57 6-9 6-1.12 0-2.2-.23-3.2-.65l-1.45 1.45C8.63 18.84 10.28 19 12 19z" />
                            </svg>
                        )}
                    </button>
                </div>


                <button type="submit" className={styles.button}>Sign In</button>

                <div className={styles.optionContainer}>
                        <a href="#">Forgot password?</a>
                        <a href="../Signup/Signup.jsx">Sign Up</a>
                </div>

            </form>
        </div>
    );
}

export default Login;
