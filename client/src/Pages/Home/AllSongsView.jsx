import styles from './Home.module.css';
import PropTypes from 'prop-types';

// Loading indicator component for reuse
const LoadingIndicator = ({ message = "Loading songs..." }) => (
    <div className={styles.loadingMoreContainer}>
        <p className={styles.loadingMoreText}>{message}</p>
        <div className={styles.loadingSpinner}></div>
    </div>
);

import { ArrowLeft } from "lucide-react";

function AllSongsView({ 
    songs, 
    artistsMap, 
    albumsMap, 
    currentSong, 
    isPlaying, 
    lastSongRef, 
    loadingMore, 
    hasMore,
    handlePlayClick, 
    handleAlbumClick,
    handleArtistClick,
    handleBackToAllSongs
}) {
    // Default placeholder image for when no album art is available
    const defaultCoverImage = "https://placehold.co/400x400/111/e75454?text=Music";    // Format artist display with names from artistsMap
    const formatArtist = (artistIds) => {
        if (!artistIds) return "Unknown Artist";
        
        // Ensure ID is correctly handled (parse to integer if needed)
        const processArtistId = (id) => {
            // If id is a string that represents a number, convert to integer
            if (typeof id === 'string' && !isNaN(id)) {
                return parseInt(id);
            }
            return id;
        };
        
        // Handle array of artists
        if (Array.isArray(artistIds)) {
            return artistIds.map(id => (
                <span key={id}>
                    <span 
                        className={styles.clickableArtist}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleArtistClick(processArtistId(id));
                        }}
                    >
                        {artistsMap[id]?.name || `Artist ${id}`}
                    </span>
                    {artistIds.indexOf(id) < artistIds.length - 1 ? ', ' : ''}
                </span>
            ));
        }
        
        // Handle single artist
        return (
            <span 
                className={styles.clickableArtist}
                onClick={(e) => {
                    e.stopPropagation();
                    handleArtistClick(processArtistId(artistIds));
                }}
            >
                {artistsMap[artistIds]?.name || `Artist ${artistIds}`}
            </span>
        );
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
    };    return (
        <div className={styles.songsContainer}>
            <div className={styles.viewHeader}>
                <button 
                    className={styles.backButton} 
                    onClick={handleBackToAllSongs}
                >
                    <ArrowLeft size={24} />
                </button>
                <h2>All Songs</h2>
            </div>
            
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
                            <p className={styles.songArtist}>
                                {formatArtist(song.artist)}
                            </p>
                            {song.genre && <p className={styles.songGenre}>{formatGenre(song.genre)}</p>}
                            {song.album && (
                                <p 
                                    className={`${styles.songAlbum} ${styles.clickableAlbum}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAlbumClick(song.album);
                                    }}
                                >
                                    {formatAlbum(song.album)}
                                </p>
                            )}
                        </div>
                    </div>
                )})}
            </div>
            
            {loadingMore && <LoadingIndicator message="Loading more songs..." />}
            
            {!hasMore && songs.length > 0 && (
                <p className={styles.endOfResultsMessage}>You've reached the end of the list</p>
            )}
        </div>
    );
}

AllSongsView.propTypes = {
    songs: PropTypes.array.isRequired,
    artistsMap: PropTypes.object.isRequired,
    albumsMap: PropTypes.object.isRequired,
    currentSong: PropTypes.object,
    isPlaying: PropTypes.bool.isRequired,
    lastSongRef: PropTypes.func.isRequired,
    loadingMore: PropTypes.bool.isRequired,
    hasMore: PropTypes.bool.isRequired,    handlePlayClick: PropTypes.func.isRequired,
    handleAlbumClick: PropTypes.func.isRequired,
    handleArtistClick: PropTypes.func.isRequired,
    handleBackToAllSongs: PropTypes.func.isRequired
};

export { LoadingIndicator };
export default AllSongsView;