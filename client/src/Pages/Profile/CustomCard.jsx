import styles from './CustomCard.module.css';
import PropTypes from 'prop-types';

function CustomCard({ title, imgSrc, artist, album, releaseYear, timesListened }) {
    // Default image if none provided
    const defaultImage = "https://placehold.co/400x400/111/e75454?text=Music";
    
    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <img 
                    src={imgSrc || defaultImage} 
                    alt={title} 
                    className={styles.image} 
                />
                <div className={styles.overlay}>
                    <span className={styles.playCount}>{timesListened} plays</span>
                </div>
            </div>
            <div className={styles.cardContent}>
                <h4 className={styles.title}>{title}</h4>
                <p className={styles.artist}>{artist}</p>
                <div className={styles.details}>
                    <span className={styles.album}>{album}</span>
                    {releaseYear && <span className={styles.year}>{releaseYear}</span>}
                </div>
            </div>
        </div>
    );
}

CustomCard.propTypes = {
    title: PropTypes.string.isRequired,
    imgSrc: PropTypes.string,
    artist: PropTypes.string.isRequired,
    album: PropTypes.string,
    releaseYear: PropTypes.string,
    timesListened: PropTypes.number
};

export default CustomCard;
