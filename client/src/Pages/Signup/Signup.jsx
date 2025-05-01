import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../assets/logo.png";
import styles from "./Signup.module.css";

function Signup() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        dob: "",
        country: ""
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
        console.log("Sign up attempt with:", formData);
    };

    const countries = [
        "Afghanistan", "Argentina", "Australia", "Brazil", "Canada", "China", "Egypt", "France", "Germany", "India",
        "Indonesia", "Iran", "Italy", "Japan", "Mexico", "Netherlands", "New Zealand", "Nigeria", "Pakistan", "Russia",
        "Saudi Arabia", "South Africa", "South Korea", "Spain", "Sweden", "Turkey", "United Kingdom", "United States"
    ];

    return (
        <div className={styles.signupContainer}>
            <div className={styles.header}>
                <Link to='/'>
                    <img src={logo} alt="Drift Logo" className={styles.logo} />
                </Link>
                <h1 className={styles.heading}>Join the Vibe</h1>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    className={styles.input}
                    placeholder="Username"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                
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

                <input
                    type="date"
                    name="dob"
                    className={styles.input}
                    value={formData.dob}
                    onChange={handleChange}
                    required
                />
                
                <select
                    name="country"
                    className={styles.input}
                    value={formData.country}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                        <option key={country} value={country}>
                            {country}
                        </option>
                    ))}
                </select>

                <button type="submit" className={styles.button}>Sign Up</button>

                <div className={styles.optionContainer}>
                    <p>
                        Already have an account?{' '}
                        <Link to='/login'>Log in</Link>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default Signup;
