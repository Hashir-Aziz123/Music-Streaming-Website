import {useEffect, useState, useRef, useCallback} from "react";
import styles from "./Home.module.css";
import TopBar from "./TopBar.jsx";
import CurrentlyPlayingSection from "./CurrentlyPlayingSection.jsx";
import SideBar from "./SideBar.jsx";
import MediaControlBar from "./MediaControlBar.jsx";

// Loading indicator component for reuse
const LoadingIndicator = ({ message = "Loading songs..." }) => (
    <div className={styles.loadingMoreContainer}>
        <p className={styles.loadingMoreText}>{message}</p>
        <div className={styles.loadingSpinner}></div>
    </div>
);

function Home() {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [artistsMap, setArtistsMap] = useState({});
    const [albumsMap, setAlbumsMap] = useState({});
    
    // Pagination states
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const observer = useRef();
    const lastSongElementRef = useRef(null);

    // Function to fetch songs with pagination
    const fetchSongs = useCallback(async (pageNum = 1, append = false) => {
        try {
            setLoadingMore(pageNum > 1);
            
            let response = await fetch(`http://localhost:3000/api/songs?page=${pageNum}&limit=20`);
            let json = await response.json();
    
            if (response.ok) {
                const songsData = json.songs || json;
                
                // Update pagination info
                if (json.pagination) {
                    setHasMore(json.pagination.currentPage < json.pagination.totalPages);
                } else {
                    setHasMore(songsData.length > 0);
                }
                
                // If appending, add to existing songs, otherwise replace
                if (append) {
                    setSongs(prev => [...prev, ...songsData]);
                } else {
                    setSongs(songsData);
                }
                
                // After getting songs, fetch artist and album details
                await fetchArtistsAndAlbums(songsData);
            }
            else {
                setError("Failed to retrieve songs");
            }
        }
        catch (err) {
            console.error("Error fetching songs:", err);
            setError("Error connecting to the server");
        }
        finally {
            setLoading(pageNum === 1 ? false : loading);
            setLoadingMore(false);
        }
    }, [loading]);

    // Initial load of songs
    useEffect(() => {
        fetchSongs(1, false);
    }, [fetchSongs]);

    // Setup intersection observer for infinite scroll
    const lastSongRef = useCallback(node => {
        if (loading || loadingMore) return;
        
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loadingMore) {
                setPage(prevPage => {
                    const nextPage = prevPage + 1;
                    fetchSongs(nextPage, true);
                    return nextPage;
                });
            }
        }, { threshold: 0.5 });
        
        if (node) observer.current.observe(node);
        lastSongElementRef.current = node;
    }, [loading, loadingMore, hasMore, fetchSongs]);

    // Fetch artists and albums details
    const fetchArtistsAndAlbums = async (songsData) => {
        try {
            // Create sets of unique artist IDs and album IDs
            const artistIds = new Set();
            const albumIds = new Set();
            
            songsData.forEach(song => {
                // Add artist IDs to the set
                if (Array.isArray(song.artist)) {
                    song.artist.forEach(artistId => artistIds.add(artistId));
                } else if (song.artist) {
                    artistIds.add(song.artist);
                }
                
                // Add album ID to the set
                if (song.album) {
                    albumIds.add(song.album);
                }
            });
            
            // Fetch artist details
            const artistsData = {};
            for (const artistId of artistIds) {
                try {
                    const response = await fetch(`http://localhost:3000/api/songs/artist/${artistId}`);
                    if (response.ok) {
                        const artistData = await response.json();
                        artistsData[artistId] = artistData;
                    }
                } catch (err) {
                    console.error(`Error fetching artist ${artistId}:`, err);
                }
            }
            
            // Fetch album details
            const albumsData = {};
            for (const albumId of albumIds) {
                try {
                    const response = await fetch(`http://localhost:3000/api/songs/album/${albumId}`);
                    if (response.ok) {
                        const albumData = await response.json();
                        albumsData[albumId] = albumData;
                    }
                } catch (err) {
                    console.error(`Error fetching album ${albumId}:`, err);
                }
            }
            
            setArtistsMap(prevArtistsMap => ({...prevArtistsMap, ...artistsData}));
            setAlbumsMap(prevAlbumsMap => ({...prevAlbumsMap, ...albumsData}));
            
        } catch (err) {
            console.error("Error fetching artist and album details:", err);
        }
    };

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

    // Format artist display with names from artistsMap
    const formatArtist = (artistIds) => {
        if (!artistIds) return "Unknown Artist";
        
        // Handle array of artists
        if (Array.isArray(artistIds)) {
            return artistIds
                .map(id => artistsMap[id]?.name || `Artist ${id}`)
                .join(', ');
        }
        
        // Handle single artist
        return artistsMap[artistIds]?.name || `Artist ${artistIds}`;
    };

    // Format album display with name from albumsMap
    const formatAlbum = (albumId) => {
        if (!albumId) return "Unknown Album";
        return albumsMap[albumId]?.title || `Album ${albumId}`;
    };

    // Format genre display
    const formatGenre = (genreData) => {
        if (!genreData) return null;
        
        if (Array.isArray(genreData)) {
            return genreData.join(', ');
        }
        
        return genreData;
    };

    // Default placeholder image for when no album art is available
    const defaultCoverImage = "https://placehold.co/400x400/111/e75454?text=Music";

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
                    {loading && <LoadingIndicator message="Loading songs..." />}
                    
                    {error && <p className={styles.errorMessage}>Error: {error}</p>}
                    
                    {!loading && !error && songs.length === 0 && (
                        <p className={styles.noSongsMessage}>No songs found</p>
                    )}
                    
                    {!loading && !error && songs.length > 0 && (
                        <div className={styles.songsContainer}>
                            <h1>Available Songs</h1>
                            
                            <div className={styles.songsList}>
                                {songs.map((song, index) => {
                                    const isThisSongPlaying = isPlaying && currentSong && song._id === currentSong._id;
                                    
                                    // Apply ref to the last element for infinite scrolling
                                    const isLastElement = index === songs.length - 1;
                                    
                                    return (
                                    <div 
                                        key={song._id} 
                                        className={styles.songCard}
                                        ref={isLastElement ? lastSongRef : null}
                                    >
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
                                            <p className={styles.songArtist}>{formatArtist(song.artist)}</p>
                                            {song.genre && <p className={styles.songGenre}>{formatGenre(song.genre)}</p>}
                                            {song.album && <p className={styles.songAlbum}>{formatAlbum(song.album)}</p>}
                                        </div>
                                    </div>
                                )})}
                            </div>
                            
                            {/* Use the same LoadingIndicator component for pagination loading */}
                            {loadingMore && <LoadingIndicator message="Loading more songs..." />}
                            
                            {/* End of results message */}
                            {!hasMore && songs.length > 0 && (
                                <p className={styles.endOfResultsMessage}>You've reached the end of the list</p>
                            )}
                        </div>
                    )}
                </div>

                {<div className={styles.rightMiddle}>
                    <CurrentlyPlayingSection
                        song={currentSong}
                        artistsMap={artistsMap}
                        albumsMap={albumsMap}
                    />
                </div>}
            </div>
            {currentSong && <div className={styles.bottomSection}>
                <MediaControlBar
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    artistsMap={artistsMap}
                />
            </div>}
        </div>
    );
}

export default Home;