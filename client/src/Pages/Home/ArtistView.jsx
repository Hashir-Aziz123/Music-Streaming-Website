import { useState } from 'react';
import styles from './Home.module.css';
import PropTypes from 'prop-types';
import { LoadingIndicator } from './AllSongsView';
import { ArrowLeft } from 'lucide-react';

function ArtistView({
    artist,
    artistSongs,
    artistAlbums,
    loadingArtist,
    currentSong,
    isPlaying,
    artistsMap,
    albumsMap,
    handleBackToAllSongs,
    handlePlayClick,
    handleAlbumClick
}) {
    // Default placeholder images
    const defaultCoverImage = "https://placehold.co/400x400/111/e75454?text=Music";
    const defaultArtistImage = "https://placehold.co/400x400/111/e75454?text=Artist";
    
    // State to manage active tab
    const [activeTab, setActiveTab] = useState('songs');

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

    // Group songs by album to display in the Albums tab
    const getAlbumDetails = () => {
        if (!artistAlbums || !Array.isArray(artistAlbums)) {
            return [];
        }
        return artistAlbums;
    };

    if (!artist) return null;

    return (
        <div className={styles.artistViewContainer}>            <button 
                className={styles.backButton}
                onClick={handleBackToAllSongs}
            >
                <ArrowLeft size={24} />
            </button>
            
            <div className={styles.artistHeader}>
                <div className={styles.artistImageContainer}>
                    <img 
                        src={artist.profile_image_url || defaultArtistImage} 
                        alt={`${artist.name}`}
                        className={styles.artistImage}
                    />
                </div>
                <div className={styles.artistInfo}>
                    <h1>{artist.name}</h1>
                    {artistSongs && <p>{artistSongs.length} songs</p>}
                </div>
            </div>
            
            {artist.bio && (
                <div className={styles.artistBio}>
                    <h3>About</h3>
                    <p>{artist.bio}</p>
                </div>
            )}
            
            <div className={styles.tabsContainer}>
                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tabButton} ${activeTab === 'songs' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('songs')}
                    >
                        Songs
                    </button>
                    <button 
                        className={`${styles.tabButton} ${activeTab === 'albums' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('albums')}
                    >
                        Albums
                    </button>
                </div>
                
                <div className={styles.tabContent}>
                    {loadingArtist ? (
                        <LoadingIndicator message="Loading artist content..." />
                    ) : activeTab === 'songs' ? (
                        <div className={styles.artistSongsList}>
                            {artistSongs && artistSongs.length > 0 ? (
                                <table className={styles.songsTable}>
                                    <thead>
                                        <tr>
                                            <th className={styles.indexColumn}>#</th>
                                            <th>Title</th>
                                            <th>Album</th>
                                            <th>Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {artistSongs.map((song, index) => {
                                            const isThisSongPlaying = isPlaying && currentSong && song._id === currentSong._id;
                                            
                                            return (
                                                <tr 
                                                    key={song._id || index}
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
                                                    <td>
                                                        {song.album && (
                                                            <span 
                                                                className={styles.clickableAlbum}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleAlbumClick(song.album);
                                                                }}
                                                            >
                                                                {formatAlbum(song.album)}
                                                            </span>
                                                        )}
                                                    </td>
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
                            ) : (
                                <p className={styles.noContentMessage}>No songs found for this artist</p>
                            )}
                        </div>
                    ) : (
                        <div className={styles.artistAlbums}>
                            {artistAlbums && artistAlbums.length > 0 ? (
                                <div className={styles.albumGrid}>
                                    {getAlbumDetails().map((album) => (
                                        <div 
                                            key={album.album_id}
                                            className={styles.albumCard}
                                            onClick={() => handleAlbumClick(album.album_id)}
                                        >
                                            <div className={styles.albumCardImage}>
                                                <img 
                                                    src={album.cover_image_url || defaultCoverImage} 
                                                    alt={album.title}
                                                />
                                                <div className={styles.albumPlayButton}>
                                                    <i className="fas fa-play"></i>
                                                </div>
                                            </div>
                                            <h3 className={styles.albumCardTitle}>{album.title}</h3>
                                            <p className={styles.albumCardYear}>
                                                {album.release_date ? new Date(album.release_date).getFullYear() : 'Unknown Year'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.noContentMessage}>No albums found for this artist</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

ArtistView.propTypes = {
    artist: PropTypes.object.isRequired,
    artistSongs: PropTypes.array.isRequired,
    artistAlbums: PropTypes.array.isRequired,
    loadingArtist: PropTypes.bool.isRequired,
    currentSong: PropTypes.object,
    isPlaying: PropTypes.bool.isRequired,
    artistsMap: PropTypes.object.isRequired,
    albumsMap: PropTypes.object.isRequired,
    handleBackToAllSongs: PropTypes.func.isRequired,
    handlePlayClick: PropTypes.func.isRequired,
    handleAlbumClick: PropTypes.func.isRequired
};

export default ArtistView;