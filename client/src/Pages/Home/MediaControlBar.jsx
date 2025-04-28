import React, { useState, useRef, useEffect } from 'react';
import styles from './MediaControlBar.module.css';
import PropTypes from 'prop-types';

function MediaControlBar({ 
    currentSong, 
    title, 
    artist, 
    albumArt, 
    audioUrl, 
    isPlaying, 
    setIsPlaying 
}) {
    const [volume, setVolume] = useState(1); // Default volume is 100%
    const audioRef = useRef(null); // Ref to access the audio element
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false); // New state to track dragging
    const [seekTime, setSeekTime] = useState(0);       // New state to store seek time

    // Update audio source when song changes
    useEffect(() => {
        if (currentSong && audioRef.current) {
            audioRef.current.pause();
            setCurrentTime(0);
            // After a short delay, play the new song if there is one
            if (audioUrl) {
                setTimeout(() => {
                    if (isPlaying) {
                        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
                    }
                }, 100);
            }
        }
    }, [currentSong, audioUrl]);

    // Handle play/pause state changes
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Error playing audio:", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

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

        const handleEnded = () => {
            setIsPlaying(false);
        };

        if (audioElement) {
            audioElement.addEventListener('timeupdate', updateTime);
            audioElement.addEventListener('loadedmetadata', updateDuration);
            audioElement.addEventListener('ended', handleEnded);

            return () => {
                audioElement.removeEventListener('timeupdate', updateTime);
                audioElement.removeEventListener('loadedmetadata', updateDuration);
                audioElement.removeEventListener('ended', handleEnded);
            };
        }
    }, [isDragging, setIsPlaying]);

    const togglePlayPause = () => {
        if (!audioUrl) return; // Don't do anything if no song is loaded
        setIsPlaying(!isPlaying);
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

    // Default placeholder image for when no album art is available
    const defaultAlbumArt = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMg5hJqZQ8aoIRfBaHXE6yxdTmQ1uj7Eq2ug&s";

    return (
        <div className={styles.mediaControlBar}>
            {/* LEFT: Song Info */}
            <div className={styles.songInfo}>
                <img
                    src={albumArt || defaultAlbumArt}
                    alt={title ? `${title} Album Art` : "Album Art"}
                    className={styles.albumArt}
                />
                <div className={styles.songMeta}>
                    <span className={styles.songTitle}>{title || "No song selected"}</span>
                    <span className={styles.songArtist}>{artist || "Artist"}</span>
                </div>
                {currentSong && (
                    <div className={styles.likeIcon}>
                        <i className="fas fa-check-circle" style={{ color: '#1DB954' }}></i>
                    </div>
                )}
            </div>

            {/* CENTER: Playback Controls */}
            <div className={styles.playbackControls}>
                <div className={styles.controlsRow}>
                    <i className="fas fa-random" />
                    <i className="fas fa-step-backward" />

                    <button 
                        className={styles.playButton} 
                        onClick={togglePlayPause}
                        disabled={!audioUrl}
                        style={{ opacity: audioUrl ? 1 : 0.5 }}
                    >
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
                        max={duration || 1} // Set the maximum to the duration of the song or 1 to avoid issues
                        value={isDragging ? seekTime : currentTime} // Set the current value to the current time
                        onChange={handleProgressChange}
                        onMouseDown={handleProgressMouseDown} // Track when dragging starts
                        onMouseUp={handleProgressMouseUp}
                        disabled={!audioUrl}
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
            <audio 
                ref={audioRef} 
                src={audioUrl || ""} 
            />
        </div>
    );
}

MediaControlBar.propTypes = {
    currentSong: PropTypes.object,
    title: PropTypes.string,
    artist: PropTypes.string,
    albumArt: PropTypes.string,
    audioUrl: PropTypes.string,
    isPlaying: PropTypes.bool,
    setIsPlaying: PropTypes.func
};

export default MediaControlBar;
