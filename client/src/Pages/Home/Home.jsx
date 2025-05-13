import {useEffect, useState, useRef, useCallback} from "react";
import styles from "./Home.module.css";
import TopBar from "./TopBar.jsx";
import CurrentlyPlayingSection from "./CurrentlyPlayingSection.jsx";
import SideBar from "./SideBar.jsx";
import MediaControlBar from "./MediaControlBar.jsx";
import AllSongsView, { LoadingIndicator } from "./AllSongsView.jsx";
import AlbumView from "./AlbumView.jsx";
import ArtistView from "./ArtistView.jsx";
import RecommendationView from "./RecommendationView.jsx";
import PlaylistView from "./PlaylistView.jsx";
import CreatePlaylistModal from "./CreatePlaylistModal.jsx";

function Home() {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [artistsMap, setArtistsMap] = useState({});
    const [albumsMap, setAlbumsMap] = useState({});
    const [playlistRefreshTrigger, setPlaylistRefreshTrigger] = useState(0);
    const [selectedPlaylistRefreshTrigger, setSelectedPlaylistRefreshTrigger] = useState(0);
    
    // Album view states
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [albumSongs, setAlbumSongs] = useState([]);
    const [loadingAlbum, setLoadingAlbum] = useState(false);
    
    // Artist view states
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [artistSongs, setArtistSongs] = useState([]);
    const [artistAlbums, setArtistAlbums] = useState([]);
    const [loadingArtist, setLoadingArtist] = useState(false);

    // Recommendation view states
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [recommendedSongs, setRecommendedSongs] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);

    // Playlist view states
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);

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

    // Function to handle album selection and fetching album songs
    const handleAlbumClick = async (albumId) => {
        try {
            // Reset artist view if active
            setSelectedArtist(null);
            setArtistSongs([]);
            setArtistAlbums([]);
            
            setLoadingAlbum(true);
            setSelectedAlbum(albumId);
            
            // Get album details if not already in our map
            if (!albumsMap[albumId]) {
                const response = await fetch(`http://localhost:3000/api/songs/album/${albumId}`);
                if (response.ok) {
                    const albumData = await response.json();
                    setAlbumsMap(prev => ({...prev, [albumId]: albumData}));
                }
            }
            
            // Find songs that belong to this album
            const filteredSongs = songs.filter(song => song.album === albumId);
            
            // If we don't have enough songs in our current list, fetch all songs from this album
            if (filteredSongs.length === 0 || albumsMap[albumId]?.songs?.length > filteredSongs.length) {
                // This is a simplified approach - ideally we would have an API endpoint to fetch all songs from an album
                // For now, we'll use the songs we have and display those
                setAlbumSongs(filteredSongs);
            } else {
                setAlbumSongs(filteredSongs);
            }
        } catch (error) {
            console.error("Error fetching album songs:", error);
        } finally {
            setLoadingAlbum(false);
        }
    };

    // Function to handle artist selection and fetching artist songs and albums
    const handleArtistClick = async (artistId) => {
        try {
            // Reset album view if active
            setSelectedAlbum(null);
            setAlbumSongs([]);
            
            setLoadingArtist(true);
            setSelectedArtist(artistId);
            
            // Get artist details if not already in our map
            if (!artistsMap[artistId]) {
                const response = await fetch(`http://localhost:3000/api/songs/artist/${artistId}`);
                if (response.ok) {
                    const artistData = await response.json();
                    setArtistsMap(prev => ({...prev, [artistId]: artistData}));
                }
            }
            
            // Find songs that belong to this artist
            const artistSongsFiltered = songs.filter(song => {
                if (Array.isArray(song.artist)) {
                    return song.artist.includes(artistId);
                }
                return song.artist === artistId;
            });
            
            setArtistSongs(artistSongsFiltered);
            
            // Find albums by this artist
            // Create a Set to avoid duplicate albums
            const albumIds = new Set();
            artistSongsFiltered.forEach(song => {
                if (song.album) {
                    albumIds.add(song.album);
                }
            });
            
            // Fetch any album details we don't already have
            const artistAlbumsFiltered = [];
            
            for (const albumId of albumIds) {
                if (!albumsMap[albumId]) {
                    try {
                        const response = await fetch(`http://localhost:3000/api/songs/album/${albumId}`);
                        if (response.ok) {
                            const albumData = await response.json();
                            setAlbumsMap(prev => ({...prev, [albumId]: albumData}));
                            artistAlbumsFiltered.push(albumData);
                        }
                    } catch (err) {
                        console.error(`Error fetching album ${albumId}:`, err);
                    }
                } else {
                    artistAlbumsFiltered.push(albumsMap[albumId]);
                }
            }
            
            setArtistAlbums(artistAlbumsFiltered);
            
        } catch (error) {
            console.error("Error fetching artist data:", error);
        } finally {
            setLoadingArtist(false);
        }
    };

    // Function to handle back button for all detailed views
    const handleBackToAllSongs = () => {
        setSelectedAlbum(null);
        setAlbumSongs([]);
        setSelectedArtist(null);
        setArtistSongs([]);
        setArtistAlbums([]);
        setSelectedPlaylist(null);
    };
    
    // Function to handle playlist selection
    const handlePlaylistClick = (playlist) => {
        // Reset other views if active
        setSelectedAlbum(null);
        setAlbumSongs([]);
        setSelectedArtist(null);
        setArtistSongs([]);
        setArtistAlbums([]);
        
        // Set selected playlist
        setSelectedPlaylist(playlist);
    };    // Function to handle playlist creation success
    const handlePlaylistCreated = (newPlaylist) => {
        // Close the modal
        setShowCreatePlaylistModal(false);
        
        // Set the refresh trigger to force SideBar to reload playlists
        setPlaylistRefreshTrigger(prev => prev + 1);
        
        // Optionally, automatically select the newly created playlist
        setSelectedPlaylist(newPlaylist);
    };    // Function to handle when songs are added to a playlist
    const handlePlaylistSongsUpdate = (playlistId) => {
        // Increment the playlist refresh trigger to force a sidebar reload
        setPlaylistRefreshTrigger(prev => prev + 1);
        
        // If the updated playlist is the one currently being viewed, refresh it
        if (selectedPlaylist && selectedPlaylist._id === playlistId) {
            setSelectedPlaylistRefreshTrigger(prev => prev + 1);
        }
    };
    
    // Function to handle playlist deletion
    const handlePlaylistDelete = (playlistId) => {
        // Reset selected playlist if it's the one being deleted
        if (selectedPlaylist && selectedPlaylist._id === playlistId) {
            setSelectedPlaylist(null);
        }
        
        // Increment the playlist refresh trigger to force a reload of the sidebar
        setPlaylistRefreshTrigger(prev => prev + 1);
    };

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

    //recommendation view logic
    const loadRecommendations = async (userId) => {
        try {
            setLoadingRecommendations(true);
            const response = await fetch(`http://localhost:3000/api/recommendations/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setRecommendedSongs(data || []);
            }
        } catch (error) {
            console.error("Error fetching recommendations:", error);
        } finally {
            setLoadingRecommendations(false);
        }
    };
    // Function to determine which view to render
    const renderContentView = () => {        if (selectedPlaylist) {
            return (                <PlaylistView
                    playlist={selectedPlaylist}
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    handlePlayClick={handlePlayClick}
                    handleBackToAllSongs={handleBackToAllSongs}
                    artistsMap={artistsMap}
                    albumsMap={albumsMap}
                    isOwner={true}
                    onPlaylistUpdate={handlePlaylistSongsUpdate}
                    onPlaylistDelete={handlePlaylistDelete}
                    refreshTrigger={selectedPlaylistRefreshTrigger}
                />
            );
        } else if (selectedArtist) {
            return (
                <ArtistView 
                    artist={artistsMap[selectedArtist]}
                    artistSongs={artistSongs}
                    artistAlbums={artistAlbums}
                    loadingArtist={loadingArtist}
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    artistsMap={artistsMap}
                    albumsMap={albumsMap}
                    handleBackToAllSongs={handleBackToAllSongs}
                    handlePlayClick={handlePlayClick}
                    handleAlbumClick={handleAlbumClick}
                />
            );
        } else if (selectedAlbum) {
            return (
                <AlbumView 
                    album={albumsMap[selectedAlbum]}
                    albumSongs={albumSongs}
                    loadingAlbum={loadingAlbum}
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    artistsMap={artistsMap}
                    handleBackToAllSongs={handleBackToAllSongs}
                    handlePlayClick={handlePlayClick}
                />
            );
        // } else {
        //     return (
        //         <RecommendationView
        //             recommendedSongs={recommendedSongs}
        //             isLoading={loadingRecommendations}
        //             currentSong={currentSong}
        //             isPlaying={isPlaying}
        //             handlePlayClick={handlePlayClick}
        //             artistsMap={artistsMap}
        //             albumsMap={albumsMap}
        //         />
        //     );
        // }
        } else {
            return (
                <AllSongsView
                    songs={songs}
                    artistsMap={artistsMap}
                    albumsMap={albumsMap}
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    lastSongRef={lastSongRef}
                    loadingMore={loadingMore}
                    hasMore={hasMore}
                    handlePlayClick={handlePlayClick}
                    handleAlbumClick={handleAlbumClick}
                    handleArtistClick={handleArtistClick}
                />
            );
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.topSection}>
                <TopBar />
                {/*<button onClick={() => {*/}
                {/*    setShowRecommendations( !showRecommendations);*/}
                {/*    setSelectedAlbum(null);*/}
                {/*    setSelectedArtist(null);*/}
                {/*    loadRecommendations("681b690549be81240cd1c847"); // replace with actual userId*/}
                {/*}}>*/}
                {/*    Show Recommendations*/}
                {/*</button>*/}

            </div>            <div className={styles.midSection}>                <div className={styles.leftMiddle}>
                    <SideBar 
                        onPlaylistClick={handlePlaylistClick} 
                        onCreatePlaylistClick={() => setShowCreatePlaylistModal(true)}
                        selectedPlaylist={selectedPlaylist}
                        refreshTrigger={playlistRefreshTrigger}
                    />
                </div>

                <div className={styles.centerMiddle}>
                    {loading && <LoadingIndicator message="Loading songs..." />}
                    
                    {error && <p className={styles.errorMessage}>Error: {error}</p>}
                    
                    {!loading && !error && !selectedAlbum && !selectedArtist && songs.length === 0 && (
                        <p className={styles.noSongsMessage}>No songs found</p>
                    )}
                    
                    {!loading && !error && renderContentView()}
                </div>

                {<div className={styles.rightMiddle}>                    <CurrentlyPlayingSection
                        song={currentSong}
                        artistsMap={artistsMap}
                        albumsMap={albumsMap}
                        onAlbumClick={handleAlbumClick}
                        onArtistClick={handleArtistClick}
                        onPlaylistUpdate={handlePlaylistSongsUpdate}
                    />
                </div>}
            </div>
            {currentSong && <div className={styles.bottomSection}>
                <MediaControlBar
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    artistsMap={artistsMap}
                />            </div>}
            
            {showCreatePlaylistModal && (
                <CreatePlaylistModal 
                    onClose={() => setShowCreatePlaylistModal(false)} 
                    onPlaylistCreated={handlePlaylistCreated} 
                />
            )}
        </div>
    );
}

// useful code for later
// <button onClick={() => {
//     setShowRecommendations( !showRecommendations);
//     setSelectedAlbum(null);
//     setSelectedArtist(null);
//     loadRecommendations("681b690549be81240cd1c847"); // replace with actual userId
// }}>
//     Show Recommendations
// </button>

export default Home;