import { Search, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import styles from "./SideBar.module.css";
import PlaylistCard from "./PlaylistCard";

function SideBar({ onPlaylistClick, onCreatePlaylistClick, selectedPlaylist, refreshTrigger }) {
    const [activeTab, setActiveTab] = useState("Playlists");
    const [searchTerm, setSearchTerm] = useState("");
    const [playlists, setPlaylists] = useState([]);
    const [filteredPlaylists, setFilteredPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const filters = ["Playlists", "Artists", "Albums"];

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };
      // Function to fetch playlists that can be called from outside
    const fetchPlaylists = async () => {
        try {
            setIsLoading(true);
            if (user && user.id) {
                const response = await axios.get(`/api/playlists/user/${user.id}`, { withCredentials: true });
                
                // For each playlist, get the count of songs
                const playlistsWithCounts = await Promise.all(
                    response.data.map(async (playlist) => {
                        try {
                            const playlistDetails = await axios.get(`/api/playlists/${playlist._id}`, { withCredentials: true });
                            return {
                                ...playlist,
                                songsCount: playlistDetails.data.songs ? playlistDetails.data.songs.length : 0
                            };
                        } catch (err) {
                            console.error(`Failed to fetch songs for playlist ${playlist._id}:`, err);
                            return {
                                ...playlist,
                                songsCount: 0
                            };
                        }
                    })
                );
                
                setPlaylists(playlistsWithCounts);
                setFilteredPlaylists(playlistsWithCounts);
            }
        } catch (err) {
            console.error("Failed to fetch playlists:", err);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Initial fetch when component mounts or user changes
    useEffect(() => {
        if (user) fetchPlaylists();
    }, [user]);
    
    // Refetch when refreshTrigger changes
    useEffect(() => {
        if (refreshTrigger && user) fetchPlaylists();
    }, [refreshTrigger, user]);
    
    // Filter playlists based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredPlaylists(playlists);
            return;
        }
        
        const filtered = playlists.filter(playlist => 
            playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPlaylists(filtered);
    }, [searchTerm, playlists]);    return (
        <div className={styles.sideBarContainer}>
            <div className={styles.libraryHeader}>
                <h2 className={styles.libraryTitle}>Your Library</h2>
                <button 
                    className={styles.createButton} 
                    aria-label="Create playlist"
                    onClick={onCreatePlaylistClick}
                >
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
            </div>            {/* Scrollable List Section */}
            <div className={styles.scrollSection}>
                {isLoading ? (
                    <div className={styles.loading}>Loading playlists...</div>
                ) : activeTab === "Playlists" ? (
                    filteredPlaylists.length === 0 ? (
                        <div className={styles.emptyList}>
                            {searchTerm ? "No matching playlists found" : "No playlists yet. Create one!"}
                        </div>
                    ) : (
                        <ul className={styles.itemList}>
                            {filteredPlaylists.map((playlist) => (
                                <li key={playlist._id} className={styles.itemWrapper}>
                                    <PlaylistCard 
                                        playlist={playlist} 
                                        onClick={onPlaylistClick}
                                        isActive={selectedPlaylist && selectedPlaylist._id === playlist._id}
                                    />
                                </li>
                            ))}
                        </ul>
                    )
                ) : (
                    <div className={styles.emptyList}>
                        {activeTab === "Artists" ? "Artists section coming soon" : "Albums section coming soon"}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SideBar;