import styles from './PlaylistCard.module.css';

function AlbumCard({ album, onClick, isActive }) {
    const defaultImage = "https://placehold.co/400/111/e75454?text=Playlist";

    return (
        <div 
            className={`${styles.card} ${isActive ? styles.activeCard : ''}`} 
            onClick={() => onClick && onClick(album)}
        >
            <div className={styles.imageContainer}>
                    <img 
                        src={album.cover_image_url ? (album.cover_image_url) : defaultImage} 
                        alt={album.title} 
                        className={styles.playlistImage} 
                    />
            </div>
            <div className={styles.cardContent}>
                <h4 className={styles.title}>{album.title}</h4>                <p className={styles.subtitle}>
                    {album.artistName && `By ${album.artistName}`}
                    {typeof album.songsCount === 'number' ? 
                        ` • ${album.songsCount} ${album.songsCount === 1 ? 'song' : 'songs'}` : 
                        album.songs && Array.isArray(album.songs) ?
                            ` • ${album.songs.length} ${album.songs.length === 1 ? 'song' : 'songs'}` : 
                            ''}
                </p>
            </div>
        </div>
    );
}

export default AlbumCard;
