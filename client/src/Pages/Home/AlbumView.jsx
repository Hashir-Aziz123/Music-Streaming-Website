import styles from './Home.module.css';
import PropTypes from 'prop-types';
import { LoadingIndicator } from './AllSongsView';
import { ArrowLeft } from 'lucide-react';

function AlbumView({
    album,
    albumSongs,
    loadingAlbum,
    currentSong,
    isPlaying,
    artistsMap,
    handleBackToAllSongs,
    handlePlayClick
}) {
    // Default placeholder image for when no album art is available
    const defaultCoverImage = "https://placehold.co/400x400/111/e75454?text=Music";

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

    if (!album) return null;

    return (
        <div className={styles.albumViewContainer}>
            <div className={styles.albumHeader}>                <button 
                    className={styles.backButton}
                    onClick={handleBackToAllSongs}
                >
                    <ArrowLeft size={24} />
                </button>
                
                <div className={styles.albumInfo}>
                    <div className={styles.albumCover}>
                        <img 
                            src={album.cover_image_url || defaultCoverImage} 
                            alt={`${album.title} cover`}
                        />
                    </div>
                    <div className={styles.albumDetails}>
                        <h2>{album.title}</h2>
                        <p>{formatArtist(album.artist)}</p>
                    </div>
                </div>
            </div>
            
            {loadingAlbum ? (
                <LoadingIndicator message="Loading album songs..." />
            ) : albumSongs.length === 0 ? (
                <p className={styles.noSongsMessage}>No songs found in this album</p>
            ) : (
                <div className={styles.albumSongsList}>
                    <table className={styles.songsTable}>
                        <thead>
                            <tr>
                                <th className={styles.indexColumn}>#</th>
                                <th>Title</th>
                                <th>Artist</th>
                                <th>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {albumSongs.map((song, index) => {
                                const isThisSongPlaying = isPlaying && currentSong && song._id === currentSong._id;
                                
                                return (
                                    <tr 
                                        key={song._id}
                                        className={`${styles.songRow} ${isThisSongPlaying ? styles.playingRow : ''}`}
                                        onClick={() => handlePlayClick(song)}
                                    >
                                        <td className={styles.indexColumn}>
                                            {isThisSongPlaying ? (
                                                <i className="fas fa-volume-up" style={{ color: '#e75454' }}></i>
                                            ) : (
                                                index + 1
                                            )}
                                        </td>
                                        <td className={styles.titleColumn}>
                                            <div className={styles.songTitleWrapper}>
                                                <img 
                                                    src={song.cover_image_url || defaultCoverImage} 
                                                    alt={`${song.title} cover`}
                                                    className={styles.songRowImage}
                                                />
                                                <span>{song.title}</span>
                                            </div>
                                        </td>
                                        <td>{formatArtist(song.artist)}</td>
                                        <td>
                                            {song.duration_seconds ? 
                                              `${Math.floor(song.duration_seconds / 60)}:${(song.duration_seconds % 60).toString().padStart(2, '0')}` 
                                              : '--:--'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

AlbumView.propTypes = {
    album: PropTypes.object.isRequired,
    albumSongs: PropTypes.array.isRequired,
    loadingAlbum: PropTypes.bool.isRequired,
    currentSong: PropTypes.object,
    isPlaying: PropTypes.bool.isRequired,
    artistsMap: PropTypes.object.isRequired,
    handleBackToAllSongs: PropTypes.func.isRequired,
    handlePlayClick: PropTypes.func.isRequired
};

export default AlbumView;