import { useState, useEffect } from 'react';
import styles from './CurrentlyPlayingSection.module.css';
import PropTypes from 'prop-types';
import AddToPlaylistMenu from './AddToPlaylistMenu';
import { Plus, Heart, Share } from 'lucide-react';
import { useLikes } from '../../context/LikeContext';

function CurrentlyPlayingSection({ song, artistsMap, albumsMap, onPlaylistUpdate, onArtistClick, onAlbumClick }) {
    const [showAddToPlaylistMenu, setShowAddToPlaylistMenu] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    // Use the like context
    const { isLiked: checkIsLiked, fetchLikeStatus: contextFetchLikeStatus, toggleLike: contextToggleLike, likeChangeNotifier } = useLikes();
    // Default placeholder image
    const defaultAlbumArt = "https://placehold.co/400x400/111/e75454?text=Music";
    
    // Fetch like status when song changes
    useEffect(() => {
        if (song) {
            setLikesCount(song.likes_count || 0);
            fetchLikeStatus();
        }
    }, [song, likeChangeNotifier]); // Re-run when likeChangeNotifier changes
    
    // Function to fetch the like status for the current song
    const fetchLikeStatus = async () => {
        if (!song || !song.trackId) return;
        
        // Use context function
        const liked = await contextFetchLikeStatus(song.trackId);
        setIsLiked(liked);
    };
    
    // Function to toggle like status
    const toggleLike = async () => {
        if (!song || !song.trackId) return;
        
        try {
            // Use context function
            const result = await contextToggleLike(song.trackId, song);
            setIsLiked(result.liked);
            setLikesCount(result.likesCount);
            
            // Update the song object if needed
            if (song) {
                song.likes_count = result.likesCount;
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    // Format artist display - handle array of artist IDs
    const formatArtist = (artistIds) => {
        if (!artistIds) return "Unknown Artist";
        
        // Handle different formats of artist data
        
        // Case 1: Array of artist IDs or objects
        if (Array.isArray(artistIds)) {
            return artistIds
                .map(id => {
                    // Check if this is an ID or an object with name
                    if (typeof id === 'object' && id !== null) {
                        return id.name || artistsMap[id._id]?.name || `Artist ${id._id || 'Unknown'}`;
                    }
                    return artistsMap[id]?.name || `Artist ${id}`;
                })
                .join(', ');
        }
        
        // Case 2: Object with name (from playlist)
        if (typeof artistIds === 'object' && artistIds !== null) {
            return artistIds.name || artistsMap[artistIds._id]?.name || `Artist ${artistIds._id || 'Unknown'}`;
        }
        
        // Case 3: Simple ID string
        return artistsMap[artistIds]?.name || `Artist ${artistIds}`;
    };

    // Format album display
    const formatAlbum = (albumId) => {
        if (!albumId) return "Unknown Album";
        
        // Handle album as object (from playlist)
        if (typeof albumId === 'object' && albumId !== null) {
            return albumId.title || albumsMap[albumId._id]?.title || `Album ${albumId._id || 'Unknown'}`;
        }
        
        // Simple ID string
        return albumsMap[albumId]?.title || `Album ${albumId}`;
    };    // Handle artist click
    const handleArtistClick = (artistId) => {
        if (onArtistClick && artistId) {
            console.log(`CurrentlyPlayingSection: Artist click with ID ${JSON.stringify(artistId)} (type: ${typeof artistId})`);
            
            // Handle array of artists (select the first one)
            if (Array.isArray(artistId)) {
                if (artistId.length > 0) {
                    const firstArtist = artistId[0];
                    // Check if artist is an object with ID or just an ID
                    const id = typeof firstArtist === 'object' && firstArtist !== null 
                        ? (firstArtist._id || firstArtist.artistID) 
                        : firstArtist;
                    
                    console.log(`CurrentlyPlayingSection: Selected first artist with ID ${id}`);
                    // Parse to integer if it's a string representing a number
                    const parsedId = typeof id === 'string' && !isNaN(id) ? parseInt(id) : id;
                    onArtistClick(parsedId);
                    return;
                }
            }
            
            // Handle single artist object or ID
            const id = typeof artistId === 'object' && artistId !== null
                ? (artistId._id || artistId.artistID)
                : artistId;
            
            console.log(`CurrentlyPlayingSection: Redirecting to artist with ID ${id}`);
            // Parse to integer if it's a string representing a number
            const parsedId = typeof id === 'string' && !isNaN(id) ? parseInt(id) : id;
            onArtistClick(parsedId);
        }
    };

    // Handle album click
    const handleAlbumClick = (albumId) => {
        if (onAlbumClick && albumId) {
            // Handle both normal album ID and playlist-specific format
            // In playlist songs, album might be an object with _id property
            const id = albumId._id ? albumId._id : albumId;
            onAlbumClick(id);
        }
    };

    return (
        <div className={styles.sidebar}>
            <h2 className={styles.header}>Now Playing</h2>
            
            {song ? (
                <div className={styles.songCard}>
                    <div className={styles.albumArtContainer}>
                        <img 
                            src={song.cover_image_url || defaultAlbumArt} 
                            alt={`${song.title} cover`} 
                            className={styles.albumArt} 
                        />
                        <div className={styles.playingAnimation}>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                    
                    <div className={styles.songInfo}>
                        <h3 className={styles.songTitle}>{song.title}</h3>                        {song.artist && (
                            <p 
                                className={styles.songArtist} 
                                onClick={() => handleArtistClick(song.artist)}
                                title="View artist details"
                            >
                                {formatArtist(song.artist)}
                            </p>
                        )}
                        {song.genre && <p className={styles.songGenre}>{Array.isArray(song.genre) ? song.genre.join(', ') : song.genre}</p>}
                    </div>
                    
                    {song.description && (
                        <div className={styles.infoSection}>
                            <h4 className={styles.sectionHeader}>About</h4>
                            <p className={styles.songDescription}>{song.description}</p>
                        </div>
                    )}

                    <div className={styles.statSection}>
                        {/* <div className={styles.statItem}>
                            <i className="fas fa-play-circle"></i>
                            <span>{song.play_count || 0}</span>
                            <span className={styles.statLabel}>Plays</span>
                        </div> */}
                        <div className={styles.statItem}>
                            <i className="fas fa-heart"></i>
                            <span>{likesCount}</span>
                            <span className={styles.statLabel}>Likes</span>
                        </div>
                        {song.duration_seconds && (
                            <div className={styles.statItem}>
                                <i className="fas fa-clock"></i>
                                <span>{Math.floor(song.duration_seconds / 60)}:{(song.duration_seconds % 60).toString().padStart(2, '0')}</span>
                                <span className={styles.statLabel}>Length</span>
                            </div>
                        )}
                    </div>                    {song.album && (
                        <div className={styles.infoSection}>
                            <h4 className={styles.sectionHeader}>Album</h4>
                            <p 
                                className={styles.albumName}
                                onClick={() => handleAlbumClick(song.album)}
                                title="View album details"
                            >
                                {formatAlbum(song.album)}
                            </p>
                        </div>
                    )}
                    <div className={styles.actionButtons}>
                        <button 
                            className={`${styles.actionButton} ${isLiked ? styles.activeLike : ''}`}
                            onClick={toggleLike}
                            title={isLiked ? "Unlike" : "Like"}
                        >
                            <Heart size={18} fill={isLiked ? "#e75454" : "none"} color={isLiked ? "#e75454" : "currentColor"} />
                        </button>
                        <button 
                            className={styles.actionButton}
                            onClick={() => setShowAddToPlaylistMenu(true)}
                            title="Add to playlist"
                        >
                            <Plus size={18} />
                        </button>
                        {/* <button className={styles.actionButton}>
                            <Share size={18} />
                        </button> */}
                        {showAddToPlaylistMenu && (
                            <AddToPlaylistMenu 
                                song={song} 
                                onClose={() => setShowAddToPlaylistMenu(false)}
                                onPlaylistUpdate={onPlaylistUpdate}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className={styles.noSong}>
                    <div className={styles.placeholderArt}>
                        <i className="fas fa-music"></i>
                    </div>
                    <p>No song currently playing</p>
                    <p className={styles.selectSongText}>Select a song from the library to start listening</p>
                </div>
            )}
        </div>
    );
}

CurrentlyPlayingSection.propTypes = {
    song: PropTypes.object,
    artistsMap: PropTypes.object,
    albumsMap: PropTypes.object,
    onPlaylistUpdate: PropTypes.func,
    onArtistClick: PropTypes.func,
    onAlbumClick: PropTypes.func
};

export default CurrentlyPlayingSection;
