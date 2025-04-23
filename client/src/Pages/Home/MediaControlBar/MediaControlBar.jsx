import React, { useState, useRef, useEffect } from 'react';
import styles from './MediaControlBar.module.css';

function MediaControlBar() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1); // Default volume is 100%
    const audioRef = useRef(null); // Ref to access the audio element
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false); // New state to track dragging
    const [seekTime, setSeekTime] = useState(0);       // New state to store seek time

    useEffect(() => {
        const audioElement = audioRef.current;

        const updateTime = () => {
            if (!isDragging) { // Only update currentTime if not dragging
                setCurrentTime(audioElement.currentTime);
            }
        };

        const updateDuration = () => {
            setDuration(audioElement.duration);
        };

        if (audioElement) {
            audioElement.addEventListener('timeupdate', updateTime);
            audioElement.addEventListener('loadedmetadata', updateDuration);

            return () => {
                audioElement.removeEventListener('timeupdate', updateTime);
                audioElement.removeEventListener('loadedmetadata', updateDuration);
            };
        }
    }, [isDragging]);

    const togglePlayPause = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(prev => !prev);
    };

    const handleVolumeChange = (event) => {
        const volumeValue = event.target.value / 100; // Convert to range 0-1
        setVolume(volumeValue);
        if (audioRef.current) {
            audioRef.current.volume = volumeValue; // Update volume of the audio element
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${minutes}:${remainingSeconds}`;
    };

    const handleProgressChange = (event) => {
        setSeekTime(parseFloat(event.target.value))
    };

    const handleProgressMouseDown = () => {
        setIsDragging(true); // Set dragging to true when mouse button is pressed down
    };

    const handleProgressMouseUp = () => {
        if (isDragging && audioRef.current) {
            audioRef.current.currentTime = seekTime; // Update audio's currentTime on mouse up
            setCurrentTime(seekTime); // Update the displayed currentTime immediately
        }
        setIsDragging(false); // Set dragging to false when mouse button is released
    };

    return (
        <div className={styles.mediaControlBar}>
            {/* LEFT: Song Info */}
            <div className={styles.songInfo}>
                <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMg5hJqZQ8aoIRfBaHXE6yxdTmQ1uj7Eq2ug&s"
                    alt="Album Art"
                    className={styles.albumArt}
                />
                <div className={styles.songMeta}>
                    <span className={styles.songTitle}>Roots</span>
                    <span className={styles.songArtist}>Imagine Dragons</span>
                </div>
                <div className={styles.likeIcon}>
                    <i className="fas fa-check-circle" style={{ color: '#1DB954' }}></i>
                </div>
            </div>

            {/* CENTER: Playback Controls */}
            <div className={styles.playbackControls}>
                <div className={styles.controlsRow}>
                    <i className="fas fa-random" />
                    <i className="fas fa-step-backward" />

                    <button className={styles.playButton} onClick={togglePlayPause}>
                        <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`} />
                    </button>

                    <i className="fas fa-step-forward" />
                    <i className="fas fa-redo-alt" />
                </div>

                <div className={styles.progressContainer}>
                    <span className={styles.time}>{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        className={styles.progressBar}
                        min="0"
                        max={duration} // Set the maximum to the duration of the song
                        value={isDragging ? seekTime : currentTime} // Set the current value to the current time
                        onChange={handleProgressChange}
                        onMouseDown={handleProgressMouseDown} // Track when dragging starts
                        onMouseUp={handleProgressMouseUp}
                    />
                    <span className={styles.time}>{formatTime(duration-currentTime)}</span>
                </div>
            </div>

            {/* RIGHT: Extra Controls */}
            <div className={styles.extraControls}>
                <div className={styles.volumeControl}>
                    <i className="fas fa-volume-up" />
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume * 100} // Volume as percentage
                        onChange={handleVolumeChange}
                        className={styles.volumeSlider}
                    />
                </div>
                <div className={styles.shuffleControl}>
                    <i className={`fas fa-random ${styles.shuffleIcon}`} />
                </div>
                <div className={styles.repeatControl}>
                    <i className={`fas fa-redo-alt ${styles.repeatIcon}`} />
                </div>
                <div className={styles.fullscreenControl}>
                    <i className="fas fa-expand-alt" />
                </div>
            </div>

            {/* Audio Element */}
            <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />
        </div>
    );
}

export default MediaControlBar;
