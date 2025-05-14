import styles from './PlaylistCard.module.css';

function ArtistCard({ artist, onClick, isActive }) {
    const defaultImage = "https://placehold.co/400/111/e75454?text=Artist";
    return (
        <div 
            className={`${styles.card} ${isActive ? styles.active : ''}`} 
            onClick={() => onClick && onClick(artist)}
        >
            <div className={styles.imageContainer}>
                <img 
                    src={defaultImage} 
                    alt={artist.name} 
                    className={styles.image} 
                />
            </div>
            <div className={styles.cardContent}>
                <h4 className={styles.title}>{artist.name}</h4>
                <p className={styles.subtitle}>Artist</p>
            </div>
        </div>
    );
}

export default ArtistCard;
