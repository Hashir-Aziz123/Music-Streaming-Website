import { useState, useEffect } from "react";
import styles from "./Profile.module.css";
import TopBar from "../Home/TopBar.jsx";
import UserStats from "./UserStats.jsx";
import { User } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile() {
    const [activeSection, setActiveSection] = useState('stats');
    const { isAuthenticated, user, logout, updateProfile, updatePassword } = useAuth();
    const [playlists, setPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const countries = [
        "Afghanistan", "Argentina", "Australia", "Brazil", "Canada", "China", "Egypt", "France", "Germany", "India",
        "Indonesia", "Iran", "Italy", "Japan", "Mexico", "Netherlands", "New Zealand", "Nigeria", "Pakistan", "Russia",
        "Saudi Arabia", "South Africa", "South Korea", "Spain", "Sweden", "Turkey", "United Kingdom", "United States"
    ];

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        dob: '',
        country: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await updateProfile(formData);
        if (result.success) {
            navigate('/profile');
        } else {
            console.error(result.message);
        }
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            console.error("New passwords don't match");
            return;
        }

        const result = await updatePassword(
            passwordForm.currentPassword,
            passwordForm.newPassword
        );

        if (result.success) {
            // Clear form
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            console.log(result.message);
        } else {
            console.error(result.message);
        }
    };

    const logoutHandler = async () => {
        const logoutResult = await logout();
        navigate('/login');
    }

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const response = await axios.get(`/api/playlists/${user.id}`, { withCredentials: true });
                setPlaylists(response.data);
            } catch (err) {
                console.error("Failed to fetch playlists:", err);
            } finally {
                setIsLoading(false);
            }
        }

        if (user) fetchPlaylists();
    }, [user]);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.topSection}>
                <TopBar />
            </div>

            <div className={styles.contentSection}>
                <div className={styles.profileHeader}>
                    <div className={styles.profileAvatar}>
                        <User size={80} />
                    </div>
                    <div className={styles.profileInfo}>
                        <h1 className={styles.profileName}>{user?.username}</h1>
                        <p className={styles.profileEmail}>{user?.email}</p>
                        <div className={styles.profileStats}>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{playlists.length}</span>
                                <span className={styles.statLabel}>Playlists</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>136</span>
                                <span className={styles.statLabel}>Hours</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>325</span>
                                <span className={styles.statLabel}>Songs</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tabButton} ${activeSection === 'stats' ? styles.active : ''}`}
                        onClick={() => setActiveSection('stats')}
                    >
                        Statistics
                    </button>
                    <button 
                        className={`${styles.tabButton} ${activeSection === 'editProfile' ? styles.active : ''}`}
                        onClick={() => setActiveSection('editProfile')}
                    >
                        Edit Profile
                    </button>
                    <button 
                        className={`${styles.tabButton} ${activeSection === 'changePassword' ? styles.active : ''}`}
                        onClick={() => setActiveSection('changePassword')}
                    >
                        Change Password
                    </button>
                </div>

                <div className={styles.tabContent}>
                    {activeSection === 'stats' && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Listening Statistics</h2>
                            <UserStats playlistsNum={playlists.length} />
                        </div>
                    )}

                    {activeSection === 'editProfile' && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Edit Profile</h2>
                            <form className={styles.profileForm} onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="username">Username</label>
                                    <input type="text" id="username" placeholder="Username" name="username" className={styles.inputField} value={formData.username} onChange={handleChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="email">Email</label>
                                    <input type="email" id="email" placeholder="Email" name="email" className={styles.inputField} value={formData.email} onChange={handleChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="dob">Date of Birth</label>
                                    <input type="date" id="dob" name="dob" className={styles.inputField} value={formData.dob} onChange={handleChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="country">Country</label>
                                    <select id="country" name="country" className={styles.inputField} value={formData.country} onChange={handleChange} >
                                        <option value="">Select Country</option>
                                        {countries.map((country) => (
                                            <option key={country} value={country}>{country}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className={styles.submitButton}>Update Profile</button>
                            </form>
                        </div>
                    )}

                    {activeSection === 'changePassword' && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Change Password</h2>
                            <form className={styles.profileForm} onSubmit={handlePasswordSubmit}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="currentPassword">Current Password</label>
                                    <input type="password" id="currentPassword" name="currentPassword" placeholder="Current Password" className={styles.inputField} value={passwordForm.currentPassword} onChange={handlePasswordChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="newPassword">New Password</label>
                                    <input type="password" id="newPassword" name="newPassword" placeholder="New Password" className={styles.inputField} value={passwordForm.newPassword} onChange={handlePasswordChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm Password" className={styles.inputField} value={passwordForm.confirmPassword} onChange={handlePasswordChange} />
                                </div>
                                <button type="submit" className={styles.submitButton}>Update Password</button>
                            </form>
                        </div>
                    )}
                </div>

                <div className={styles.dangerZone}>
                    <h3 className={styles.dangerTitle}>Danger Zone</h3>
                    <div className={styles.dangerButtons}>
                        <button className={styles.logoutButton} onClick={logoutHandler}>
                            <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                        <button className={styles.deleteAccountButton}>
                            <i className="fas fa-trash-alt"></i> Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
