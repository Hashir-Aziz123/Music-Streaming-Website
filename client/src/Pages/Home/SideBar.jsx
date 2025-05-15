import { Search, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import styles from "./SideBar.module.css";
import PlaylistCard from "./PlaylistCard";
import ArtistCard from "./ArtistCard";
import AlbumCard from "./AlbumCard";

function SideBar({ onPlaylistClick, onCreatePlaylistClick, onArtistClick, onAlbumClick, selectedPlaylist, selectedArtistId, selectedAlbumId, refreshTrigger }) {
    const [activeTab, setActiveTab] = useState("Playlists");
    const [searchTerm, setSearchTerm] = useState("");
    const [playlists, setPlaylists] = useState([]);
    const [filteredPlaylists, setFilteredPlaylists] = useState([]);
    const [artists, setArtists] = useState([]);
    const [filteredArtists, setFilteredArtists] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [filteredAlbums, setFilteredAlbums] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const filters = ["Playlists", "Artists", "Albums"];    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setSearchTerm("");
        
        if (tab === "Artists" && artists.length === 0) {
            fetchArtists();
        } else if (tab === "Albums" && albums.length === 0) {
            fetchAlbums();
        }
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
      // Function to fetch artists from user's playlists
    const fetchArtists = async () => {
        try {
            setIsLoading(true);
            if (user && user.id) {
                console.log("Fetching artists for user:", user.id);
                const response = await axios.get(`/api/library/user/${user.id}/artists`, { withCredentials: true });
                console.log("Artists retrieved:", response.data.length);
                
                // Ensure songsCount exists for each artist
                const artistsWithCounts = response.data.map(artist => {
                    if (typeof artist.songsCount !== 'number') {
                        // Fix artist without songsCount
                        return {
                            ...artist,
                            songsCount: Array.isArray(artist.songs) ? artist.songs.length : 0
                        };
                    }
                    return artist;
                });
                
                setArtists(artistsWithCounts);
                setFilteredArtists(artistsWithCounts);
            }
        } catch (err) {
            console.error("Failed to fetch artists:", err);
        } finally {
            setIsLoading(false);
        }
    };    // Function to fetch albums from user's playlists
    const fetchAlbums = async () => {
        try {
            setIsLoading(true);
            if (user && user.id) {
                console.log("Fetching albums for user:", user.id);
                const response = await axios.get(`/api/library/user/${user.id}/albums`, { withCredentials: true });
                console.log("Albums retrieved:", response.data.length);
                
                // Ensure songsCount exists for each album
                const albumsWithCounts = response.data.map(album => {
                    if (typeof album.songsCount !== 'number') {
                        // Fix album without songsCount
                        return {
                            ...album,
                            songsCount: Array.isArray(album.songs) ? album.songs.length : 0
                        };
                    }
                    return album;
                });
                
                setAlbums(albumsWithCounts);
                setFilteredAlbums(albumsWithCounts);
            }
        } catch (err) {
            console.error("Failed to fetch albums:", err);
        } finally {
            setIsLoading(false);
        }
    };
    // Handle artist click
    const handleArtistClick = (artist) => {
        console.log("SideBar: Artist selected:", artist);
        if (onArtistClick) {
            // Make sure we have a valid artist ID to pass
            const artistId = artist.artistID || artist._id || artist.id;
            console.log(`SideBar: Using artist ID ${artistId} (${typeof artistId})`);
            
            // Parse to integer if it's a string representing a number
            const parsedId = typeof artistId === 'string' && !isNaN(artistId) ? parseInt(artistId) : artistId;
            console.log(`SideBar: Passing parsed artist ID ${parsedId} (${typeof parsedId})`);
            
            onArtistClick(parsedId);
        }
    };
      // Handle album click
    const handleAlbumClick = (album) => {
        console.log("SideBar: Album selected:", album);
        if (onAlbumClick) {
            // Make sure we have a valid album ID to pass
            const albumId = album.album_id || album._id || album.id;
            console.log(`SideBar: Using album ID ${albumId} (${typeof albumId})`);
            
            // Parse to integer if it's a string representing a number
            const parsedId = typeof albumId === 'string' && !isNaN(albumId) ? parseInt(albumId) : albumId;
            console.log(`SideBar: Passing parsed album ID ${parsedId} (${typeof parsedId})`);
            
            onAlbumClick(parsedId);
        }
    };
      // Initial fetch when component mounts or user changes
    useEffect(() => {
        if (user) {
            fetchPlaylists();
            if (activeTab === "Artists") {
                fetchArtists();
            } else if (activeTab === "Albums") {
                fetchAlbums();
            }
        }
    }, [user, activeTab]);
    
    // Refetch when refreshTrigger changes
    useEffect(() => {
        if (refreshTrigger && user) {
            fetchPlaylists();
            if (activeTab === "Artists") {
                fetchArtists();
            } else if (activeTab === "Albums") {
                fetchAlbums();
            }
        }
    }, [refreshTrigger, user, activeTab]);
    
    // Filter items based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredPlaylists(playlists);
            setFilteredArtists(artists);
            setFilteredAlbums(albums);
            return;
        }
        
        const searchTermLower = searchTerm.toLowerCase();
        
        if (activeTab === "Playlists") {
            const filtered = playlists.filter(playlist => 
                playlist.name.toLowerCase().includes(searchTermLower)
            );
            setFilteredPlaylists(filtered);
        } else if (activeTab === "Artists") {
            const filtered = artists.filter(artist => 
                artist.name.toLowerCase().includes(searchTermLower)
            );
            setFilteredArtists(filtered);
        } else if (activeTab === "Albums") {
            const filtered = albums.filter(album => 
                album.title.toLowerCase().includes(searchTermLower) || 
                (album.artistName && album.artistName.toLowerCase().includes(searchTermLower))
            );
            setFilteredAlbums(filtered);
        }
    }, [searchTerm, playlists, artists, albums, activeTab]);
    
    return (
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
                
                {/* <div className={styles.orderSelectContainer}>
                    <select className={styles.orderSelect}>
                        <option value="recent">Recent</option>
                        <option value="alphabetical">A-Z</option>
                        <option value="creator">Creator</option>
                    </select>
                </div> */}
            </div>
              {/* Scrollable List Section */}
            <div className={styles.scrollSection}>
                {isLoading ? (
                    <div className={styles.loading}>Loading {activeTab.toLowerCase()}...</div>
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
                ) : activeTab === "Artists" ? (
                    filteredArtists.length === 0 ? (
                        <div className={styles.emptyList}>
                            {searchTerm ? "No matching artists found" : "No artists in your playlists"}
                        </div>
                    ) : (
                        <ul className={styles.itemList}>
                            {filteredArtists.map((artist) => (
                                <li key={artist.artistID} className={styles.itemWrapper}>                                    <ArtistCard 
                                        artist={artist} 
                                        onClick={handleArtistClick}
                                        isActive={selectedArtistId === artist.artistID}
                                    />
                                </li>
                            ))}
                        </ul>
                    )
                ) : activeTab === "Albums" ? (
                    filteredAlbums.length === 0 ? (
                        <div className={styles.emptyList}>
                            {searchTerm ? "No matching albums found" : "No albums in your playlists"}
                        </div>
                    ) : (
                        <ul className={styles.itemList}>
                            {filteredAlbums.map((album) => (
                                <li key={album.album_id} className={styles.itemWrapper}>                                    <AlbumCard 
                                        album={album} 
                                        onClick={handleAlbumClick}
                                        isActive={selectedAlbumId === album.album_id}
                                    />
                                </li>
                            ))}
                        </ul>
                    )
                ) : (
                    <div className={styles.emptyList}>
                        Something went wrong
                    </div>
                )}
            </div>
        </div>
    );
}

export default SideBar;