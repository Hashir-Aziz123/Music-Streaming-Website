// import { useState, useEffect } from "react";
// import styles from "./Profile.module.css";
// import TopBar from "../Home/TopBar.jsx";
// import UserStats from "./UserStats.jsx";
// import GlobalStats from "./GlobalStats.jsx";
// import AdminSongManagement from "./AdminSongManagement.jsx"; // Import the new component
// import { User, ShieldCheck, Music } from "lucide-react"; // Added Music icon
// import { useAuth } from "../../context/AuthContext.jsx"; 
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// function Profile() {
//     const [activeSection, setActiveSection] = useState('stats');
//     const { isAuthenticated, user, logout, updateProfile, updatePassword } = useAuth(); 
//     const [playlists, setPlaylists] = useState([]);
//     const [isLoading, setIsLoading] = useState(true); 
//     const [userStats, setUserStats] = useState(null); 
//     const navigate = useNavigate();

//     // User-specific data fetching
//     useEffect(() => {
//         const fetchData = async () => {
//             if (!user || !user.id) {
//                  setIsLoading(false);
//                  return;
//             }
//             try {
//                 setIsLoading(true);
//                 const [playlistsResponse, statsResponse] = await Promise.all([
//                     axios.get(`/api/playlists/user/${user.id}`, { withCredentials: true }),
//                     axios.get(`/api/history/stats/${user.id}`, { withCredentials: true })
//                 ]);
                
//                 setPlaylists(playlistsResponse.data);
//                 setUserStats(statsResponse.data);
//             } catch (err) {
//                 console.error("Failed to fetch user data:", err);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         if (isAuthenticated && user) {
//             fetchData();
//         } else {
//             setIsLoading(false); 
//         }
//     }, [user, isAuthenticated]);


//     const countries = [
//         "Afghanistan", "Argentina", "Australia", "Brazil", "Canada", "China", "Egypt", "France", "Germany", "India",
//         "Indonesia", "Iran", "Italy", "Japan", "Mexico", "Netherlands", "New Zealand", "Nigeria", "Pakistan", "Russia",
//         "Saudi Arabia", "South Africa", "South Korea", "Spain", "Sweden", "Turkey", "United Kingdom", "United States"
//     ];

//     const [formData, setFormData] = useState({
//         username: user?.username || '',
//         email: user?.email || '',
//         dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '', 
//         country: user?.country || ''
//     });

//     const [passwordForm, setPasswordForm] = useState({
//         currentPassword: '',
//         newPassword: '',
//         confirmPassword: ''
//     });
    
//     useEffect(() => {
//         if (user) {
//             setFormData({
//                 username: user.username || '',
//                 email: user.email || '',
//                 dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
//                 country: user.country || ''
//             });
//         }
//     }, [user]);


//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };

//     const handlePasswordChange = (e) => {
//         const { name, value } = e.target;
//         setPasswordForm(prev => ({ ...prev, [name]: value }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const dataToUpdate = Object.fromEntries(
//             Object.entries(formData).filter(([_, value]) => value !== '' && value !== null)
//         );

//         const result = await updateProfile(dataToUpdate); 
//         if (result.success) {
//             console.log("Profile updated successfully");
//              alert(result.message || "Profile updated successfully!");
//         } else {
//             console.error(result.message);
//             alert(`Profile update failed: ${result.message}`);
//         }
//     }

//     const handlePasswordSubmit = async (e) => {
//         e.preventDefault();
        
//         if (passwordForm.newPassword !== passwordForm.confirmPassword) {
//             alert("New passwords don't match"); 
//             return;
//         }

//         const result = await updatePassword( 
//             passwordForm.currentPassword,
//             passwordForm.newPassword
//         );

//         if (result.success) {
//             setPasswordForm({
//                 currentPassword: '',
//                 newPassword: '',
//                 confirmPassword: ''
//             });
//             alert(result.message || "Password updated successfully!"); 
//         } else {
//             console.error(result.message);
//             alert(`Password update failed: ${result.message}`); 
//         }
//     };

//     const logoutHandler = async () => {
//         await logout(); 
//         navigate('/login');
//     }

//     const handleDeleteAccount = async () => {
//         const isConfirmed = window.confirm(
//             "Are you sure you want to delete your account? This action cannot be undone."
//         );

//         if (isConfirmed && user && user.id) {
//             try {
//                 await axios.post(
//                     `/api/auth/delete/${user.id}`, 
//                     {},
//                     { withCredentials: true }
//                 );
//                 await logout(); 
//                 navigate('/login');
//             } catch (error) {
//                 console.error('Failed to delete account:', error);
//                 alert('Failed to delete account. Please try again.');
//             }
//         }
//     };


//     if (!isAuthenticated && !isLoading) {
//         return <div className={styles.pageContainer}><TopBar /><div className={styles.contentSection}><p>Please log in to view your profile.</p></div></div>;
//     }
    
//     if (isLoading && !user) { 
//         return <div className={styles.pageContainer}><TopBar /><div className={styles.contentSection}><p>Loading profile...</p></div></div>;
//     }


//     return (
//         <div className={styles.pageContainer}>
//             <div className={styles.topSection}>
//                 <TopBar />
//             </div>

//             <div className={styles.contentSection}>
//                 {user && (
//                     <div className={styles.profileHeader}>
//                         <div className={styles.profileAvatar}>
//                             <User size={80} /> 
//                         </div>
//                         <div className={styles.profileInfo}>
//                             <h1 className={styles.profileName}>{user.username}</h1>
//                             <p className={styles.profileEmail}>{user.email}</p>
//                             <div className={styles.profileStats}>
//                                 <div className={styles.statItem}>
//                                     <span className={styles.statValue}>{playlists?.length || 0}</span>
//                                     <span className={styles.statLabel}>Playlists</span>
//                                 </div>
//                                 <div className={styles.statItem}>
//                                     <span className={styles.statValue}>{userStats ? Math.round(userStats.totalListeningTime / 3600) : 0}</span>
//                                     <span className={styles.statLabel}>Hours</span>
//                                 </div>
//                                 <div className={styles.statItem}>
//                                     <span className={styles.statValue}>{userStats ? userStats.totalSongs : 0}</span>
//                                     <span className={styles.statLabel}>Songs</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 <div className={styles.tabs}>
//                     <button 
//                         className={`${styles.tabButton} ${activeSection === 'stats' ? styles.active : ''}`}
//                         onClick={() => setActiveSection('stats')}
//                     >
//                         My Statistics
//                     </button>
//                     <button 
//                         className={`${styles.tabButton} ${activeSection === 'editProfile' ? styles.active : ''}`}
//                         onClick={() => setActiveSection('editProfile')}
//                     >
//                         Edit Profile
//                     </button>
//                     <button 
//                         className={`${styles.tabButton} ${activeSection === 'changePassword' ? styles.active : ''}`}
//                         onClick={() => setActiveSection('changePassword')}
//                     >
//                         Change Password
//                     </button>
//                     {user && user.role === 'admin' && ( 
//                         <>
//                             <button 
//                                 className={`${styles.tabButton} ${activeSection === 'adminStats' ? styles.active : ''}`}
//                                 onClick={() => setActiveSection('adminStats')}
//                             >
//                                 <ShieldCheck size={18} style={{ marginRight: '5px' }} /> Global Stats
//                             </button>
//                             <button 
//                                 className={`${styles.tabButton} ${activeSection === 'adminSongManagement' ? styles.active : ''}`}
//                                 onClick={() => setActiveSection('adminSongManagement')}
//                             >
//                                 <Music size={18} style={{ marginRight: '5px' }} /> Song Management
//                             </button>
//                         </>
//                     )}
//                 </div>

//                 <div className={styles.tabContent}>
//                     {activeSection === 'stats' && (
//                         <div className={styles.section}>
//                             {isLoading && !userStats ? <p>Loading your stats...</p> : 
//                              userStats ? <UserStats playlistsNum={playlists?.length || 0} /> : <p>No statistics available yet.</p>}
//                         </div>
//                     )}

//                     {activeSection === 'editProfile' && user && ( 
//                         <div className={styles.section}>
//                             <h2 className={styles.sectionTitle}>Edit Profile</h2>
//                             <form className={styles.profileForm} onSubmit={handleSubmit}>
//                                 <div className={styles.formGroup}>
//                                     <label htmlFor="username">Username</label>
//                                     <input type="text" id="username" placeholder="Username" name="username" className={styles.inputField} value={formData.username} onChange={handleChange} />
//                                 </div>
//                                 <div className={styles.formGroup}>
//                                     <label htmlFor="email">Email</label>
//                                     <input type="email" id="email" placeholder="Email" name="email" className={styles.inputField} value={formData.email} onChange={handleChange} />
//                                 </div>
//                                 <div className={styles.formGroup}>
//                                     <label htmlFor="dob">Date of Birth</label>
//                                     <input type="date" id="dob" name="dob" className={styles.inputField} value={formData.dob} onChange={handleChange} />
//                                 </div>
//                                 <div className={styles.formGroup}>
//                                     <label htmlFor="country">Country</label>
//                                     <select id="country" name="country" className={styles.inputField} value={formData.country} onChange={handleChange} >
//                                         <option value="">Select Country</option>
//                                         {countries.map((country) => (
//                                             <option key={country} value={country}>{country}</option>
//                                         ))}
//                                     </select>
//                                 </div>
//                                 <button type="submit" className={styles.submitButton}>Update Profile</button>
//                             </form>
//                         </div>
//                     )}

//                     {activeSection === 'changePassword' && (
//                         <div className={styles.section}>
//                             <h2 className={styles.sectionTitle}>Change Password</h2>
//                             <form className={styles.profileForm} onSubmit={handlePasswordSubmit}>
//                                 <div className={styles.formGroup}>
//                                     <label htmlFor="currentPassword">Current Password</label>
//                                     <input type="password" id="currentPassword" name="currentPassword" placeholder="Current Password" className={styles.inputField} value={passwordForm.currentPassword} onChange={handlePasswordChange} required />
//                                 </div>
//                                 <div className={styles.formGroup}>
//                                     <label htmlFor="newPassword">New Password</label>
//                                     <input type="password" id="newPassword" name="newPassword" placeholder="New Password" className={styles.inputField} value={passwordForm.newPassword} onChange={handlePasswordChange} required/>
//                                 </div>
//                                 <div className={styles.formGroup}>
//                                     <label htmlFor="confirmPassword">Confirm Password</label>
//                                     <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm Password" className={styles.inputField} value={passwordForm.confirmPassword} onChange={handlePasswordChange} required/>
//                                 </div>
//                                 <button type="submit" className={styles.submitButton}>Update Password</button>
//                             </form>
//                         </div>
//                     )}
                    
//                     {activeSection === 'adminStats' && user && user.role === 'admin' && (
//                         <div className={styles.section}>
//                             <GlobalStats />
//                         </div>
//                     )}

//                     {activeSection === 'adminSongManagement' && user && user.role === 'admin' && ( // New Section
//                         <div className={styles.section}>
//                             <AdminSongManagement />
//                         </div>
//                     )}
//                 </div>

//                 {user && (
//                 <div className={styles.dangerZone}>
//                     <h3 className={styles.dangerTitle}>Danger Zone</h3>
//                     <div className={styles.dangerButtons}>
//                         <button className={styles.logoutButton} onClick={logoutHandler}>
//                             <i className="fas fa-sign-out-alt" style={{marginRight: '5px'}}></i> Logout
//                         </button>
//                         <button className={styles.deleteAccountButton} onClick={handleDeleteAccount}>
//                             <i className="fas fa-trash-alt" style={{marginRight: '5px'}}></i> Delete Account
//                         </button>
//                     </div>
//                 </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default Profile;

// Profile.jsx

import { useState, useEffect } from "react";
import styles from "./Profile.module.css";
import TopBar from "../Home/TopBar.jsx";
import UserStats from "./UserStats.jsx";
import GlobalStats from "./GlobalStats.jsx";
import AdminSongManagement from "./AdminSongManagement.jsx"; 
import AdminArtistManagement from "./AdminArtistManagement.jsx"; // New
import AdminAlbumManagement from "./AdminAlbumManagement.jsx";   // New
import { User, ShieldCheck, Music, Users, Library /*or AlbumIcon*/ } from "lucide-react"; 
import { useAuth } from "../../context/AuthContext.jsx"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile() {
    const [activeSection, setActiveSection] = useState('stats');
    const { isAuthenticated, user, logout, updateProfile, updatePassword } = useAuth(); 
    const [playlists, setPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(true); 
    const [userStats, setUserStats] = useState(null); 
    const navigate = useNavigate();

    // User-specific data fetching
    useEffect(() => {
        const fetchData = async () => {
            if (!user || !user.id) {
                 setIsLoading(false);
                 return;
            }
            try {
                setIsLoading(true);
                const [playlistsResponse, statsResponse] = await Promise.all([
                    axios.get(`/api/playlists/user/${user.id}`, { withCredentials: true }),
                    axios.get(`/api/history/stats/${user.id}`, { withCredentials: true })
                ]);
                
                setPlaylists(playlistsResponse.data);
                setUserStats(statsResponse.data);
            } catch (err) {
                console.error("Failed to fetch user data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && user) {
            fetchData();
        } else {
            setIsLoading(false); 
        }
    }, [user, isAuthenticated]);


    const countries = [ // Keep your list of countries
        "Afghanistan", "Argentina", "Australia", "Brazil", "Canada", "China", "Egypt", "France", "Germany", "India",
        "Indonesia", "Iran", "Italy", "Japan", "Mexico", "Netherlands", "New Zealand", "Nigeria", "Pakistan", "Russia",
        "Saudi Arabia", "South Africa", "South Korea", "Spain", "Sweden", "Turkey", "United Kingdom", "United States"
    ];

    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '', 
        country: user?.country || ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                country: user.country || ''
            });
        }
    }, [user]);


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
        const dataToUpdate = Object.fromEntries(
            Object.entries(formData).filter(([_, value]) => value !== '' && value !== null)
        );

        const result = await updateProfile(dataToUpdate); 
        if (result.success) {
            console.log("Profile updated successfully");
             alert(result.message || "Profile updated successfully!");
        } else {
            console.error(result.message);
            alert(`Profile update failed: ${result.message}`);
        }
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("New passwords don't match"); 
            return;
        }

        const result = await updatePassword( 
            passwordForm.currentPassword,
            passwordForm.newPassword
        );

        if (result.success) {
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            alert(result.message || "Password updated successfully!"); 
        } else {
            console.error(result.message);
            alert(`Password update failed: ${result.message}`); 
        }
    };

    const logoutHandler = async () => {
        await logout(); 
        navigate('/login');
    }

    const handleDeleteAccount = async () => {
        const isConfirmed = window.confirm(
            "Are you sure you want to delete your account? This action cannot be undone."
        );

        if (isConfirmed && user && user.id) {
            try {
                await axios.post(
                    `/api/auth/delete/${user.id}`, 
                    {},
                    { withCredentials: true }
                );
                await logout(); 
                navigate('/login');
            } catch (error) {
                console.error('Failed to delete account:', error);
                alert('Failed to delete account. Please try again.');
            }
        }
    };


    if (!isAuthenticated && !isLoading) {
        return <div className={styles.pageContainer}><TopBar /><div className={styles.contentSection}><p>Please log in to view your profile.</p></div></div>;
    }
    
    if (isLoading && !user) { 
        return <div className={styles.pageContainer}><TopBar /><div className={styles.contentSection}><p>Loading profile...</p></div></div>;
    }


    return (
        <div className={styles.pageContainer}>
            <div className={styles.topSection}>
                <TopBar onAllSongsClick={() => {navigate('/')}}/>
            </div>

            <div className={styles.contentSection}>
                {user && (
                    <div className={styles.profileHeader}>
                        <div className={styles.profileAvatar}>
                            <User size={80} /> 
                        </div>
                        <div className={styles.profileInfo}>
                            <h1 className={styles.profileName}>{user.username}</h1>
                            <p className={styles.profileEmail}>{user.email}</p>
                            <div className={styles.profileStats}>
                                <div className={styles.statItem}>
                                    <span className={styles.statValue}>{playlists?.length || 0}</span>
                                    <span className={styles.statLabel}>Playlists</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statValue}>{userStats ? Math.round(userStats.totalListeningTime / 3600) : 0}</span>
                                    <span className={styles.statLabel}>Hours</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statValue}>{userStats ? userStats.totalSongs : 0}</span>
                                    <span className={styles.statLabel}>Songs</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tabButton} ${activeSection === 'stats' ? styles.active : ''}`}
                        onClick={() => setActiveSection('stats')}
                    >
                        My Statistics
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
                    {user && user.role === 'admin' && ( 
                        <>
                            <button 
                                className={`${styles.tabButton} ${activeSection === 'adminStats' ? styles.active : ''}`}
                                onClick={() => setActiveSection('adminStats')}
                            >
                                <ShieldCheck size={18} style={{ marginRight: '5px' }} /> Global Stats
                            </button>
                            <button 
                                className={`${styles.tabButton} ${activeSection === 'adminSongManagement' ? styles.active : ''}`}
                                onClick={() => setActiveSection('adminSongManagement')}
                            >
                                <Music size={18} style={{ marginRight: '5px' }} /> Song Mgmt
                            </button>
                            <button  // New Artist Management Tab
                                className={`${styles.tabButton} ${activeSection === 'adminArtistManagement' ? styles.active : ''}`}
                                onClick={() => setActiveSection('adminArtistManagement')}
                            >
                                <Users size={18} style={{ marginRight: '5px' }} /> Artist Mgmt
                            </button>
                            <button  // New Album Management Tab
                                className={`${styles.tabButton} ${activeSection === 'adminAlbumManagement' ? styles.active : ''}`}
                                onClick={() => setActiveSection('adminAlbumManagement')}
                            >
                                <Library size={18} style={{ marginRight: '5px' }} /> Album Mgmt 
                            </button>
                        </>
                    )}
                </div>

                <div className={styles.tabContent}>
                    {activeSection === 'stats' && (
                        <div className={styles.section}>
                            {isLoading && !userStats ? <p>Loading your stats...</p> : 
                             userStats ? <UserStats playlistsNum={playlists?.length || 0} /> : <p>No statistics available yet.</p>}
                        </div>
                    )}

                    {activeSection === 'editProfile' && user && ( 
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
                                    <input type="password" id="currentPassword" name="currentPassword" placeholder="Current Password" className={styles.inputField} value={passwordForm.currentPassword} onChange={handlePasswordChange} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="newPassword">New Password</label>
                                    <input type="password" id="newPassword" name="newPassword" placeholder="New Password" className={styles.inputField} value={passwordForm.newPassword} onChange={handlePasswordChange} required/>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm Password" className={styles.inputField} value={passwordForm.confirmPassword} onChange={handlePasswordChange} required/>
                                </div>
                                <button type="submit" className={styles.submitButton}>Update Password</button>
                            </form>
                        </div>
                    )}
                    
                    {activeSection === 'adminStats' && user && user.role === 'admin' && (
                        <div className={styles.section}>
                            <GlobalStats />
                        </div>
                    )}

                    {activeSection === 'adminSongManagement' && user && user.role === 'admin' && ( 
                        <div className={styles.section}>
                            <AdminSongManagement />
                        </div>
                    )}
                    {activeSection === 'adminArtistManagement' && user && user.role === 'admin' && ( // New Section
                        <div className={styles.section}>
                            <AdminArtistManagement />
                        </div>
                    )}
                    {activeSection === 'adminAlbumManagement' && user && user.role === 'admin' && ( // New Section
                        <div className={styles.section}>
                            <AdminAlbumManagement />
                        </div>
                    )}
                </div>

                {user && (
                <div className={styles.dangerZone}>
                    <h3 className={styles.dangerTitle}>Danger Zone</h3>
                    <div className={styles.dangerButtons}>
                        <button className={styles.logoutButton} onClick={logoutHandler}>
                            <i className="fas fa-sign-out-alt" style={{marginRight: '5px'}}></i> Logout
                        </button>
                        <button className={styles.deleteAccountButton} onClick={handleDeleteAccount}>
                            <i className="fas fa-trash-alt" style={{marginRight: '5px'}}></i> Delete Account
                        </button>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}

export default Profile;