import styles from './CurrentlyPlayingSection.module.css';
import PropTypes from 'prop-types';

function CurrentlyPlayingSection({ song }) {
    // Default placeholder image
    const defaultAlbumArt = "https://placehold.co/400x400/111/e75454?text=Music";

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
                        <p className={styles.songArtist}>{song.artist}</p>
                        {song.genre && <p className={styles.songGenre}>{song.genre.join ? song.genre.join(', ') : song.genre}</p>}
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
                            <p className={styles.albumName}>{song.album}</p>
                        </div>
                    )}

                    <div className={styles.actionButtons}>
                        <button className={styles.actionButton}>
                            <i className="fas fa-heart"></i>
                        </button>
                        <button className={styles.actionButton}>
                            <i className="fas fa-plus"></i>
                        </button>
                        <button className={styles.actionButton}>
                            <i className="fas fa-share-alt"></i>
                        </button>
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
    song: PropTypes.object
};

export default CurrentlyPlayingSection;
