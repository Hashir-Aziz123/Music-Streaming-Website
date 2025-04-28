import styles from "./CustomCard.module.css";
import PropTypes from "prop-types"

function CustomCard(props){
    return(
        <div className={styles.customCard}>
            <figure className={styles.customCardImage}>
                <img
                    src={props.imgSrc}
                    alt="Shoes"
                    className={styles.customImg}
                />
            </figure>
            <div className={styles.customCardBody}>
                <h2 className={styles.customCardTitle}> {props.tile}</h2>
                <p className={styles.customCardText}>
                    Artist: {props.artist}
                </p>
                <p className={styles.customCardText}>
                    Album: {props.album}
                </p>
                <p className={styles.customCardText}>
                    Release: {props.releaseYear}
                </p>
                <p className={styles.customCardText}>
                    Listened: {props.timesListened} times
                </p>
            </div>
        </div>

    );
}

CustomCard.propTypes = {
    title: PropTypes.string,
    imgSrc: PropTypes.string,
    artist: PropTypes.string,
    album: PropTypes.string,
    releaseYear: PropTypes.string,
    timesListened: PropTypes.number,
}

export default CustomCard;
