import styles from './PlaylistCard.module.css';
import PropTypes from 'prop-types';

function PlaylistCard({ title, imgSrc, subtitle}) {
    // Default image if none provided
    const defaultImage = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQPZcjVw-tHtbV1BTXhSy86q-bARMButrtbA&s";


    return (
        <div className={styles.card} onClick={() => console.log( title , "|| ",  imgSrc ,"|| ",  subtitle ) }>
            <div className={styles.imageContainer}>
                <img
                    src={defaultImage}
                    alt={title}
                    className={styles.image}
                />
            </div>

            <div className={styles.cardContent}>
                <h4 className={styles.title}>{title}</h4>
                <p className={styles.subtitle}>{subtitle}</p>
            </div>
        </div>
    );
}

PlaylistCard.propTypes = {
    title: PropTypes.string.isRequired,
    imgSrc: PropTypes.string,
    subtitle: PropTypes.string,
};

export default PlaylistCard;
