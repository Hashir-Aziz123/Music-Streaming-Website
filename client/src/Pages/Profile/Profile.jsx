import { useState } from "react";
import styles from "./Profile.module.css";
import TopBar from "../Home/TopBar.jsx";
import UserStats from "./UserStats.jsx";
import { User } from "lucide-react";

function Profile() {
    const [activeSection, setActiveSection] = useState('stats');

    const countries = [
        "Afghanistan", "Argentina", "Australia", "Brazil", "Canada", "China", "Egypt", "France", "Germany", "India",
        "Indonesia", "Iran", "Italy", "Japan", "Mexico", "Netherlands", "New Zealand", "Nigeria", "Pakistan", "Russia",
        "Saudi Arabia", "South Africa", "South Korea", "Spain", "Sweden", "Turkey", "United Kingdom", "United States"
    ];

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
                        <h1 className={styles.profileName}>John Doe</h1>
                        <p className={styles.profileEmail}>john.doe@example.com</p>
                        <div className={styles.profileStats}>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>24</span>
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
                    <button 
                        className={`${styles.tabButton} ${activeSection === 'preferences' ? styles.active : ''}`}
                        onClick={() => setActiveSection('preferences')}
                    >
                        Preferences
                    </button>
                </div>

                <div className={styles.tabContent}>
                    {activeSection === 'stats' && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Listening Statistics</h2>
                            <UserStats />
                        </div>
                    )}

                    {activeSection === 'editProfile' && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Edit Profile</h2>
                            <form className={styles.profileForm}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="name">Username</label>
                                    <input type="text" id="name" placeholder="Username" className={styles.inputField} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="email">Email</label>
                                    <input type="email" id="email" placeholder="Email" className={styles.inputField} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="dob">Date of Birth</label>
                                    <input type="date" id="dob" className={styles.inputField} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="country">Country</label>
                                    <select id="country" className={styles.inputField}>
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
                            <form className={styles.profileForm}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="currentPassword">Current Password</label>
                                    <input type="password" id="currentPassword" placeholder="Current Password" className={styles.inputField} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="newPassword">New Password</label>
                                    <input type="password" id="newPassword" placeholder="New Password" className={styles.inputField} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <input type="password" id="confirmPassword" placeholder="Confirm Password" className={styles.inputField} />
                                </div>
                                <button type="submit" className={styles.submitButton}>Update Password</button>
                            </form>
                        </div>
                    )}

                    {activeSection === 'preferences' && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Preferences</h2>
                            <form className={styles.profileForm}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="language">Language</label>
                                    <select id="language" className={styles.inputField}>
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="de">German</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="theme">Theme</label>
                                    <select id="theme" className={styles.inputField}>
                                        <option value="dark">Dark</option>
                                        <option value="light">Light</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.checkboxLabel}>
                                        <input type="checkbox" className={styles.checkbox} />
                                        Enable notifications
                                    </label>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.checkboxLabel}>
                                        <input type="checkbox" className={styles.checkbox} />
                                        Show explicit content
                                    </label>
                                </div>
                                <button type="submit" className={styles.submitButton}>Save Preferences</button>
                            </form>
                        </div>
                    )}
                </div>

                <div className={styles.dangerZone}>
                    <h3 className={styles.dangerTitle}>Danger Zone</h3>
                    <div className={styles.dangerButtons}>
                        <button className={styles.logoutButton}>
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
