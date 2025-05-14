import styles from './PlaylistCard.module.css';
import PropTypes from 'prop-types';

function PlaylistCard({ playlist, onClick, isActive, title, imgSrc, subtitle, inScrollSection = false }) {
    // Default image if none provided
    const defaultImage = "https://placehold.co/400/111/e75454?text=Playlist";
    
    // Support both formats - either playlist object or individual props
    const isPlaylistObject = !!playlist;
    
    // Handle click event safely
    const handleClick = () => {
        if (onClick && playlist) {
            onClick(playlist);
        }
    };

    // In RecommendationView's ScrollSection, we need a vertical card layout
    if (!isPlaylistObject && (inScrollSection || imgSrc)) {
        return (
            <div className={styles.recommendationCard} onClick={handleClick}>
                <div className={styles.recommendationImageContainer}>
                    <img 
                        src={imgSrc || defaultImage}
                        alt={title}
                        className={styles.recommendationImage}
                    />
                </div>
                <div className={styles.recommendationContent}>
                    <h4 className={styles.recommendationTitle}>{title}</h4>
                    <p className={styles.recommendationSubtitle}>{subtitle}</p>
                </div>
            </div>
        );
    }    // Default horizontal card layout for playlists
    return (
        <div 
            className={`${styles.card} ${isActive ? styles.active : ''}`} 
            onClick={handleClick}
        >
            <div className={styles.imageContainer}>
                <img
                    src={isPlaylistObject ? (playlist.cover_image_url || defaultImage) : (imgSrc || defaultImage)}
                    alt={isPlaylistObject ? playlist.name : title}
                    className={styles.image}
                />
            </div>

            <div className={styles.cardContent}>
                <h4 className={styles.title}>{isPlaylistObject ? playlist.name : title}</h4>
                <p className={styles.subtitle}>
                    {isPlaylistObject 
                        ? `${playlist.is_system || playlist.name === "Liked Songs" ? "System • " : ""}Playlist`
                        : subtitle
                    }
                </p>
            </div>
        </div>
    );
}

PlaylistCard.propTypes = {
    // Original playlist object props
    playlist: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        cover_image_url: PropTypes.string,
        is_public: PropTypes.bool,
        songsCount: PropTypes.number
    }),
    onClick: PropTypes.func,
    isActive: PropTypes.bool,
      // Alternative direct props
    title: PropTypes.string,
    imgSrc: PropTypes.string,
    subtitle: PropTypes.string,
    // Additional props
    inScrollSection: PropTypes.bool
};

export default PlaylistCard;
