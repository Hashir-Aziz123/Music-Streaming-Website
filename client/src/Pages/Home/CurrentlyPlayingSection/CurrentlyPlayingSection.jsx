import styles from './CurrentlyPlayingSection.module.css';
import PropTypes from 'prop-types';

function CurrentlyPlayingSection({ title, artist, albumArt, credits }) {
    const hasSong = title && artist && albumArt;

    return (
        <div className={styles.sidebar}>
            <h2 className={styles.header}>Now Playing</h2>

            {hasSong ? (
                <div className={styles.songCard}>
                    <img src={albumArt} alt="Album Art" className={styles.albumArt} />
                    <div className={styles.songInfo}>
                        <h3>{title}</h3>
                        <p>{artist}</p>
                    </div>
                </div>
            ) : (
                <p className={styles.noSong}>No song selected</p>
            )}

            <div className={styles.creditsSection}>
                <h3>Credits</h3>
                {credits && credits.length > 0 ? (
                    <ul className={styles.creditsList}>
                        {credits.map((credit, index) => (
                            <li key={index}>{credit}</li>
                        ))}
                    </ul>
                ) : (
                    <p className={styles.noCredits}>N/A</p>
                )}
            </div>
        </div>
    );
}

CurrentlyPlayingSection.propTypes = {
    title: PropTypes.string,
    artist: PropTypes.string,
    albumArt: PropTypes.string,
    credits: PropTypes.arrayOf(PropTypes.string)
};

export default CurrentlyPlayingSection;
