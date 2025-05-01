import {useEffect, useState} from "react";
import styles from "./Home.module.css";
import TopBar from "./TopBar.jsx";
import CurrentlyPlayingSection from "./CurrentlyPlayingSection.jsx";
import SideBar from "./SideBar.jsx";
import MediaControlBar from "./MediaControlBar.jsx";

function Home() {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        async function fetchSongs() {
            try {
                let response = await fetch('/api/songs');
                let json = await response.json();
    
                if (response.ok)
                    setSongs(json);
                else
                    setError("Failed to retrieve songs");
            }
            catch (err) {
                console.error("Error fetching songs:", err);
                setError("Error connecting to the server");
            }
            finally {
                setLoading(false);
            }
        }

        fetchSongs();
    }, []);

    const handlePlayClick = (song) => {
        if (currentSong && song._id === currentSong._id) {
            // If clicking the same song that's already selected, toggle play/pause
            setIsPlaying(!isPlaying);
        } else {
            // If clicking a new song, set it as current and start playing
            setCurrentSong(song);
            setIsPlaying(true);
        }
    };

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Default placeholder image for when no album art is available
    const defaultCoverImage = "https://placehold.co/400x400/111/F72585?text=Music";

    return (
        <div className={styles.pageContainer}>
            <div className={styles.topSection}>
                <TopBar />
            </div>

            <div className={styles.midSection}>
                <div className={styles.leftMiddle}>
                    <SideBar />
                </div>

                <div className={styles.centerMiddle}>
                    {loading && <p className={styles.loadingMessage}>Loading songs...</p>}
                    
                    {error && <p className={styles.errorMessage}>Error: {error}</p>}
                    
                    {!loading && !error && songs.length === 0 && (
                        <p className={styles.noSongsMessage}>No songs found</p>
                    )}
                    
                    {!loading && !error && songs.length > 0 && (
                        <div className={styles.songsContainer}>
                            <h1>Available Songs</h1>
                            
                            <div className={styles.songsList}>
                                {songs.map((song) => {
                                    const isThisSongPlaying = isPlaying && currentSong && song._id === currentSong._id;
                                    return (
                                    <div key={song._id} className={styles.songCard}>
                                        <div className={styles.songImageContainer}>
                                            <img 
                                                src={song.cover_image_url || defaultCoverImage} 
                                                alt={`${song.title} cover`}
                                                className={styles.songImage}
                                            />
                                            <div 
                                                className={`${styles.playButtonOverlay} ${isThisSongPlaying ? styles.playing : ''}`}
                                                onClick={() => handlePlayClick(song)}
                                            >
                                                {isThisSongPlaying ? (
                                                    <i className={`fas fa-pause ${styles.playIcon}`}></i>
                                                ) : (
                                                    <i className={`fas fa-play ${styles.playIcon}`}></i>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className={styles.songInfo}>
                                            <h3 className={styles.songTitle}>{song.title}</h3>
                                            <p className={styles.songArtist}>{song.artist}</p>
                                            {song.genre && <p className={styles.songGenre}>{song.genre}</p>}
                                        </div>
                                    </div>
                                )})}
                            </div>
                        </div>
                    )}
                </div>

                {<div className={styles.rightMiddle}>
                    <CurrentlyPlayingSection
                        song={currentSong}
                    />
                </div>}
            </div>
            {currentSong && <div className={styles.bottomSection}>
                <MediaControlBar
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                />
            </div>}
        </div>
    );
}

export default Home;