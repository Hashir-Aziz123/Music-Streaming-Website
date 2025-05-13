import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Play, Pause, Shuffle, Repeat } from "lucide-react";
import { LoadingIndicator } from "./AllSongsView";
import styles from "./PlaylistView.module.css";
import PropTypes from 'prop-types';

function PlaylistView({
    playlist,
    currentSong,
    isPlaying,
    handlePlayClick,
    handleBackToAllSongs,
    artistsMap,
    albumsMap,
    onRemoveSong = null,
    isOwner = false,
    onPlaylistUpdate = null,
    onPlaylistDelete = null,
    refreshTrigger = 0,
    // New props for playlist functionality
    playlistMode = false,
    handlePlayPlaylist,
    shuffleMode = false,
    repeatMode = false,
    toggleShuffle,
    toggleRepeat
}) {
    const [playlistSongs, setPlaylistSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSongIndex, setCurrentSongIndex] = useState(-1);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [removingSongId, setRemovingSongId] = useState(null);

    useEffect(() => {
        const fetchPlaylistSongs = async () => {
            try {
                setLoading(true);
                if (playlist && playlist._id) {
                    // Get full playlist details including song objects
                    const response = await axios.get(`/api/playlists/${playlist._id}`, { withCredentials: true });
                    if (response.data && response.data.songs) {
                        setPlaylistSongs(response.data.songs);
                    }
                }
            } catch (error) {
                console.error("Error fetching playlist songs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylistSongs();
    }, [playlist, refreshTrigger]);

    useEffect(() => {
        // Find the index of the current playing song in the playlist
        if (currentSong && playlistSongs.length > 0) {
            const index = playlistSongs.findIndex(song => song._id === currentSong._id);
            setCurrentSongIndex(index);
        } else {
            setCurrentSongIndex(-1);
        }
    }, [currentSong, playlistSongs]);

    const startPlaylist = () => {
        if (playlistSongs.length > 0) {
            // Use the new handlePlayPlaylist function instead of handlePlayClick
            handlePlayPlaylist(playlist, playlistSongs);
        }
    };
    
    const playSongInPlaylist = (song, index) => {
        // Start playlist from the selected song
        handlePlayPlaylist(playlist, playlistSongs, index);
    };



    const handleRemoveSong = async (songId) => {
        try {
            if (playlist && playlist._id) {
                // Set loading state
                setRemovingSongId(songId);
                
                await axios.delete(`/api/playlists/${playlist._id}/songs/${songId}`, { withCredentials: true });
                
                // Remove the song from the UI
                setPlaylistSongs(prevSongs => prevSongs.filter(song => song.trackId !== songId));
                
                // Call the parent handler if exists
                if (typeof onRemoveSong === 'function') {
                    onRemoveSong(songId);
                }
                
                // Update playlist counts in sidebar if callback exists
                if (typeof onPlaylistUpdate === 'function') {
                    onPlaylistUpdate(playlist._id);
                }
            }
        } catch (error) {
            console.error("Error removing song from playlist:", error);
        } finally {
            setRemovingSongId(null);
        }
    };

    // Function to delete the entire playlist
    const handleDeletePlaylist = async () => {
        if (!playlist || !playlist._id) return;
        
        try {
            setIsDeleting(true);
            await axios.delete(`/api/playlists/${playlist._id}`, { withCredentials: true });
            
            // Close the confirmation dialog
            setShowDeleteConfirmation(false);
            
            // Notify the parent component about the deletion
            if (typeof onPlaylistDelete === 'function') {
                onPlaylistDelete(playlist._id);
            }
            
            // Go back to all songs view
            handleBackToAllSongs();
        } catch (error) {
            console.error("Error deleting playlist:", error);
            setIsDeleting(false);
        }
    };

    if (loading) {
        return <LoadingIndicator message="Loading playlist songs..." />;
    }

    const getArtistNames = (artists) => {
        if (!artists || !Array.isArray(artists) || artists.length === 0) return "Unknown Artist";
        
        return artists.map(artistId => {
            const artist = artistsMap[artistId];
            return artist ? artist.name : "Unknown Artist";
        }).join(", ");
    };

    return (
        <div className={styles.playlistViewContainer}>
            {/* Header section with playlist info */}
            <div className={styles.playlistHeader}>
                <button onClick={handleBackToAllSongs} className={styles.backButton}>
                    <ArrowLeft size={24} />
                </button>

                <div className={styles.playlistInfo}>
                    <div className={styles.coverImage}>
                        <img 
                            src={playlist?.cover_image_url || "https://placehold.co/400/111/e75454?text=Playlist"} 
                            alt={playlist?.name} 
                        />
                    </div>
                    <div className={styles.playlistDetails}>
                        <h1 className={styles.playlistTitle}>{playlist?.name}</h1>
                        <p className={styles.playlistDescription}>{playlist?.description || "No description"}</p>
                        <div className={styles.playlistMeta}>
                            <span>{playlistSongs.length} songs</span>
                            <span>{playlist?.is_public ? "Public" : "Private"}</span>
                            
                            {isOwner && (
                                <button 
                                    onClick={() => setShowDeleteConfirmation(true)} 
                                    className={styles.deletePlaylistButton}
                                >
                                    Delete Playlist
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Delete Confirmation Dialog */}
                {showDeleteConfirmation && (
                    <div className={styles.confirmationOverlay}>
                        <div className={styles.confirmationDialog}>
                            <h3>Delete Playlist</h3>
                            <p>Are you sure you want to delete "{playlist?.name}"? This action cannot be undone.</p>
                            
                            <div className={styles.confirmationButtons}>
                                <button 
                                    className={styles.cancelButton}
                                    onClick={() => setShowDeleteConfirmation(false)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className={styles.deleteButton}
                                    onClick={handleDeletePlaylist}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls section */}
            <div className={styles.controlsSection}>
                <button 
                    className={`${styles.playButton} ${playlistSongs.length === 0 ? styles.disabled : ''}`}
                    onClick={startPlaylist}
                    disabled={playlistSongs.length === 0}
                >
                    {(isPlaying && playlistMode && currentSongIndex >= 0) ? <Pause size={24} /> : <Play size={24} />}
                </button>

                <button 
                    className={`${styles.shuffleButton} ${shuffleMode ? styles.active : ''}`}
                    onClick={toggleShuffle}
                >
                    <Shuffle size={18} />
                </button>

                <button 
                    className={`${styles.repeatButton} ${repeatMode ? styles.active : ''}`}
                    onClick={toggleRepeat}
                >
                    <Repeat size={18} />
                </button>
            </div>

            {/* Songs list */}
            <div className={styles.songsListContainer}>
                {playlistSongs.length === 0 ? (
                    <div className={styles.emptyPlaylist}>
                        <p>This playlist is empty</p>
                        <p>Add songs from your library or search for more</p>
                    </div>
                ) : (
                    <div className={styles.songsList}>
                        <div className={styles.songHeader}>
                            <div className={styles.indexColumn}>#</div>
                            <div className={styles.titleColumn}>TITLE</div>
                            <div className={styles.albumColumn}>ALBUM</div>
                            <div className={styles.durationColumn}>DURATION</div>
                        </div>

                        {playlistSongs.map((song, index) => (
                            <div 
                                key={song._id} 
                                className={`${styles.songRow} ${currentSong && currentSong._id === song._id ? styles.currentlyPlaying : ''}`}
                                onClick={() => playSongInPlaylist(song, index)}
                            >
                                <div className={styles.indexColumn}>
                                    {currentSong && currentSong._id === song._id && isPlaying ? (
                                        <div className={styles.playingAnimation}>
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                
                                <div className={styles.titleColumn}>
                                    <div className={styles.songInfo}>
                                        <img 
                                            src={song.cover_image_url || albumsMap[song.album]?.cover_image_url || "https://placehold.co/400x400/111/e75454?text=Song"} 
                                            alt={song.title} 
                                            className={styles.songThumbnail}
                                        />
                                        <div>
                                            <div className={styles.songTitle}>{song.title}</div>
                                            <div className={styles.songArtist}>
                                                {getArtistNames(song.artist)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={styles.albumColumn}>
                                    {albumsMap[song.album]?.title || "Unknown Album"}
                                </div>
                                
                                <div className={styles.durationColumn}>
                                    {Math.floor(song.duration_seconds / 60)}:
                                    {String(Math.floor(song.duration_seconds % 60)).padStart(2, '0')}

                                    {isOwner && (
                                        <button 
                                            className={`${styles.removeButton} ${removingSongId === song.trackId ? styles.removing : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveSong(song.trackId);
                                            }}
                                            disabled={removingSongId === song.trackId}
                                        >
                                            {removingSongId === song.trackId ? 'Removing...' : 'Remove'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

PlaylistView.propTypes = {
    playlist: PropTypes.object,
    currentSong: PropTypes.object,
    isPlaying: PropTypes.bool,
    handlePlayClick: PropTypes.func.isRequired,
    handleBackToAllSongs: PropTypes.func.isRequired,
    artistsMap: PropTypes.object,
    albumsMap: PropTypes.object,
    onRemoveSong: PropTypes.func,
    isOwner: PropTypes.bool,
    onPlaylistUpdate: PropTypes.func,
    onPlaylistDelete: PropTypes.func,
    refreshTrigger: PropTypes.number,
    // Playlist functionality props
    playlistMode: PropTypes.bool,
    handlePlayPlaylist: PropTypes.func,
    shuffleMode: PropTypes.bool,
    repeatMode: PropTypes.bool,
    toggleShuffle: PropTypes.func,
    toggleRepeat: PropTypes.func
};

export default PlaylistView;
