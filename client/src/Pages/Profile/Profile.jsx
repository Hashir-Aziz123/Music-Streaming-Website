import styles from "./Profile.module.css";
import { FaUserCircle } from "react-icons/fa";
import modernLogo2 from "../../assets/modernLogo2.png"
import UserStats from "./UserStats/UserStats.jsx";


function Profile() {

    const countries = [
        "Afghanistan", "Argentina", "Australia", "Brazil", "Canada", "China", "Egypt", "France", "Germany", "India",
        "Indonesia", "Iran", "Italy", "Japan", "Mexico", "Netherlands", "New Zealand", "Nigeria", "Pakistan", "Russia",
        "Saudi Arabia", "South Africa", "South Korea", "Spain", "Sweden", "Turkey", "United Kingdom", "United States"
    ];


    return (
        <div className={styles.profileContainer}>
            {/* Navbar */}
            <nav className={styles.navbar}>
                <img src={modernLogo2} alt="Drift Logo" className={styles.logo} />

                <div className={styles.navRight}>
                    <a href="#" className={styles.navLink}>Home</a>

                    <div className={styles.userMenu}>
                        <FaUserCircle className={styles.userIcon} />
                        <div className={styles.dropdown}>
                            <button className={styles.logoutButton}>Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* User Stats Section */}
           <UserStats />

            {/* Edit Profile Section */}
            <section className={styles.editProfile}>
                <h3>Edit Profile</h3>
                <form>
                    <input type="text" placeholder="Full Name" />
                    <input type="email" placeholder="Email" />
                    <input type="date" />
                    <select>
                        <option value="">Select Country</option>
                        <option value="Pakistan">Pakistan</option>
                        <option value="USA">USA</option>
                        {/* Add more countries */}
                    </select>
                    <button type="submit">Update Account Information</button>
                </form>
            </section>

            {/* Change Password Section */}
            <section className={styles.changePassword}>
                <h3>Change Password</h3>
                <form>
                    <input type="password" placeholder="Old Password" />
                    <input type="password" placeholder="New Password" />
                    <input type="password" placeholder="Confirm Password" />
                    <button type="submit">Update</button>
                </form>
            </section>
        </div>
    );
}

export default Profile;
