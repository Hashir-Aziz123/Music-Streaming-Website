import styles from './PlaylistCard.module.css';

function AlbumCard({ album, onClick, isActive }) {
    const defaultImage = "https://placehold.co/400/111/e75454?text=Album";

    return (
        <div 
            className={`${styles.card} ${isActive ? styles.activeCard : ''}`} 
            onClick={() => onClick && onClick(album)}
        >
            <div className={styles.imageContainer}>
                    <img 
                        src={defaultImage} 
                        alt={album.title} 
                        className={styles.playlistImage} 
                    />
            </div>
            <div className={styles.cardContent}>
                <h4 className={styles.title}>{album.title}</h4>
                <p className={styles.subtitle}>Album</p>
            </div>
        </div>
    );
}

export default AlbumCard;
