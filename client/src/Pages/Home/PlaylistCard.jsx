import styles from './PlaylistCard.module.css';
import PropTypes from 'prop-types';

function PlaylistCard({ playlist, onClick, isActive }) {
    // Default image if none provided
    const defaultImage = "https://placehold.co/400/111/e75454?text=Playlist";

    return (
        <div 
            className={`${styles.card} ${isActive ? styles.active : ''}`} 
            onClick={() => onClick(playlist)}
        >
            <div className={styles.imageContainer}>
                <img
                    src={playlist.cover_image_url || defaultImage}
                    alt={playlist.name}
                    className={styles.image}
                />
            </div>

            <div className={styles.cardContent}>
                <h4 className={styles.title}>{playlist.name}</h4>
                <p className={styles.subtitle}>
                    Playlist • {playlist.songsCount || "0"} songs
                </p>
            </div>
        </div>
    );
}

PlaylistCard.propTypes = {
    playlist: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        cover_image_url: PropTypes.string,
        is_public: PropTypes.bool
    }).isRequired,
    onClick: PropTypes.func.isRequired,
    isActive: PropTypes.bool
};

export default PlaylistCard;
