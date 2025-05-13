import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import logo from "../../../assets/logo.png";
import styles from "./Signup.module.css";

function Signup() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        dob: "",
        country: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault(); 

        const result = await register(formData);
        if (result.success) {
            navigate('/');
        }

        // try {
        //     const response = await fetch("http://localhost:3000/api/auth/register", {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json"
        //         },
        //         credentials: "include",
        //         body: JSON.stringify({
        //             username: formData.username,
        //             email: formData.email,
        //             password: formData.password,
        //             dob: formData.dob,
        //             country: formData.country
        //         })
        //     });

        //     const data = await response.json();

        //     if (response.ok) {
        //         console.log("Registration successful:", data);
        //         navigate('/');
        //     } else {
        //         console.error("Registration failed:", data.message);
        //         alert(data.message || "Registration failed.");
        //     }
        // } catch (err) {
        //     console.error("Error while registering user:", err);
        //     alert("An error occurred during registration.");
        // }
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
                    name="username"
                    className={styles.input}
                    placeholder="Username"
                    value={formData.username}
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