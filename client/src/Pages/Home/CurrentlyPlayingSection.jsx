import { useState } from 'react';
import styles from './CurrentlyPlayingSection.module.css';
import PropTypes from 'prop-types';
import AddToPlaylistMenu from './AddToPlaylistMenu';
import { Plus, Heart, Share } from 'lucide-react';

function CurrentlyPlayingSection({ song, artistsMap, albumsMap, onPlaylistUpdate, onArtistClick, onAlbumClick }) {
    const [showAddToPlaylistMenu, setShowAddToPlaylistMenu] = useState(false);
    // Default placeholder image
    const defaultAlbumArt = "https://placehold.co/400x400/111/e75454?text=Music";
    
    // Format artist display - handle array of artist IDs
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

    // Format album display
    const formatAlbum = (albumId) => {
        if (!albumId) return "Unknown Album";
        return albumsMap[albumId]?.title || `Album ${albumId}`;
    };

    // Handle artist click
    const handleArtistClick = (artistId) => {
        if (onArtistClick && artistId) {
            onArtistClick(artistId);
        }
    };

    // Handle album click
    const handleAlbumClick = (albumId) => {
        if (onAlbumClick && albumId) {
            onAlbumClick(albumId);
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
                        <h3 className={styles.songTitle}>{song.title}</h3>
                        {song.artist && (
                            <p 
                                className={styles.songArtist} 
                                onClick={() => handleArtistClick(song.artist)}
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
                        <div className={styles.statItem}>
                            <i className="fas fa-play-circle"></i>
                            <span>{song.play_count || 0}</span>
                            <span className={styles.statLabel}>Plays</span>
                        </div>
                        <div className={styles.statItem}>
                            <i className="fas fa-heart"></i>
                            <span>{song.likes_count || 0}</span>
                            <span className={styles.statLabel}>Likes</span>
                        </div>
                        {song.duration_seconds && (
                            <div className={styles.statItem}>
                                <i className="fas fa-clock"></i>
                                <span>{Math.floor(song.duration_seconds / 60)}:{(song.duration_seconds % 60).toString().padStart(2, '0')}</span>
                                <span className={styles.statLabel}>Length</span>
                            </div>
                        )}
                    </div>

                    {song.album && (
                        <div className={styles.infoSection}>
                            <h4 className={styles.sectionHeader}>Album</h4>
                            <p 
                                className={styles.albumName}
                                onClick={() => handleAlbumClick(song.album)}
                            >
                                {formatAlbum(song.album)}
                            </p>
                        </div>
                    )}
                    <div className={styles.actionButtons}>
                        <button className={styles.actionButton}>
                            <Heart size={18} />
                        </button>
                        <button 
                            className={styles.actionButton}
                            onClick={() => setShowAddToPlaylistMenu(true)}
                            title="Add to playlist"
                        >
                            <Plus size={18} />
                        </button>
                        <button className={styles.actionButton}>
                            <Share size={18} />
                        </button>                        {showAddToPlaylistMenu && (
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
