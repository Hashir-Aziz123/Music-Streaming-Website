import { Search, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import styles from "./SideBar.module.css";

function SideBar() {
    const [activeTab, setActiveTab] = useState("Playlists");
    const [searchTerm, setSearchTerm] = useState("");
    const [playlists, setPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const filters = ["Playlists", "Artists", "Albums"];

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const response = await axios.get(`/api/playlists/user/${user.id}`, { withCredentials: true });
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
        <div className={styles.sideBarContainer}>
            <div className={styles.libraryHeader}>
                <h2 className={styles.libraryTitle}>Your Library</h2>
                <button className={styles.createButton} aria-label="Create playlist or folder">
                    <Plus size={20} />
                </button>
            </div>

            {/* Filter Buttons */}
            <div className={styles.selectors}>
                {filters.map((filter) => (
                    <button
                        key={filter}
                        className={`${styles.filterBtn} ${activeTab === filter ? styles.active : ""}`}
                        onClick={() => handleTabClick(filter)}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Search and Order */}
            <div className={styles.options}>
                <div className={styles.searchBar}>
                    <div className={styles.searchContainer}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder={`Search in ${activeTab.toLowerCase()}`}
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className={styles.orderSelectContainer}>
                    <select className={styles.orderSelect}>
                        <option value="recent">Recent</option>
                        <option value="alphabetical">A-Z</option>
                        <option value="creator">Creator</option>
                    </select>
                </div>
            </div>

            {/* Scrollable List Section */}
            <div className={styles.scrollSection}>
                {isLoading ? (
                    <div className={styles.loading}>Loading playlists...</div>
                ) : (
                    <ul className={styles.itemList}>
                        {playlists.map((item) => (
                            <li key={item._id}>
                                <img 
                                    src={item.imageUrl || "https://placehold.co/400/111/e75454?text=Playlist"} 
                                    alt={`${item.title} cover`} 
                                />
                                <div className={styles.itemContent}>
                                    <div className={styles.itemTitle}>{item.title}</div>
                                    <div className={styles.itemSubtitle}>
                                        Playlist • {item.creator}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default SideBar;