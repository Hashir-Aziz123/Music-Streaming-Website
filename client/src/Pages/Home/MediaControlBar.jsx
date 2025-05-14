import { useState, useRef, useEffect } from 'react';
import styles from './MediaControlBar.module.css';
import PropTypes from 'prop-types';
import { Play, Pause, Shuffle, Repeat, SkipForward, SkipBack, Volume2, Volume1, VolumeX, Heart } from 'lucide-react';
import { useLikes } from '../../context/LikeContext';
import { usePlayback } from '../../context/PlaybackContext'; // Import the context hook

function MediaControlBar({
                             currentSong,
                             isPlaying,
                             setIsPlaying, // This prop is still used to control playback from parent
                             artistsMap,
                             playlistMode = false,
                             shuffleMode = false,
                             repeatMode = false,
                             handleNextSong = null,
                             handlePreviousSong = null,
                             toggleShuffle = null,
                             toggleRepeat = null,
                             handleSongEnded = null
                         }) {
    const [volume, setVolume] = useState(0.7);
    const [isLiked, setIsLiked] = useState(false);
    const audioRef = useRef(null); // Keep this ref for direct audio manipulation here

    // Consume from PlaybackContext
    const {
        currentTime, setCurrentTime: setContextCurrentTime,
        duration, setDuration: setContextDuration,
        seekTo, setAudioRef
    } = usePlayback();

    const [isDraggingProgress, setIsDraggingProgress] = useState(false);
    const [isDraggingVolume, setIsDraggingVolume] = useState(false);
    const [seekTime, setSeekTime] = useState(0); // Local state for drag interaction

    const progressBarContainerRef = useRef(null);
    const progressBarFillRef = useRef(null);
    const volumeBarContainerRef = useRef(null);
    const volumeBarFillRef = useRef(null);

    const title = currentSong?.title;

    const formatArtist = (artistIds) => {
        if (!artistIds) return "Unknown Artist";
        if (Array.isArray(artistIds)) {
            return artistIds.map(id => artistsMap?.[id]?.name || `Artist ${id}`).join(', ');
        }
        return artistsMap?.[artistIds]?.name || `Artist ${artistIds}`;
    };

    const artist = currentSong?.artist ? formatArtist(currentSong.artist) : "Artist";
    const albumArt = currentSong?.cover_image_url;
    const audioUrl = currentSong?.audio_url;

    // Register the audio element with the context
    useEffect(() => {
        if (audioRef.current) {
            setAudioRef(audioRef.current);
        }
        // Cleanup on component unmount or if audioRef changes
        return () => {
            setAudioRef(null);
        };
    }, [setAudioRef]); // audioRef.current itself shouldn't be a dependency here

    useEffect(() => {
        if (currentSong && audioRef.current) {
            audioRef.current.pause();
            setContextCurrentTime(0); // Reset context current time
            if (audioUrl) {
                // Let audio element load new src
                setTimeout(() => {
                    if (isPlaying && audioRef.current) { // Check audioRef.current again
                        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
                    }
                }, 100);
            }
        }
    }, [currentSong, audioUrl, isPlaying, setContextCurrentTime]); // isPlaying is still from props

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
        if (progressBarContainerRef.current && progressBarFillRef.current) {
            const percent = duration
                ? ((isDraggingProgress ? seekTime : currentTime) / duration) * 100
                : 0;
            progressBarFillRef.current.style.width = `${percent}%`;
        }
    }, [currentTime, duration, isDraggingProgress, seekTime]); // Use context currentTime & duration

    const { isLiked: checkIsLiked, fetchLikeStatus: contextFetchLikeStatus, toggleLike: contextToggleLike, likeChangeNotifier } = useLikes();

    useEffect(() => {
        if (currentSong && currentSong.trackId) {
            fetchLikeStatus();
        }
    }, [currentSong, likeChangeNotifier]);

    const fetchLikeStatus = async () => {
        if (!currentSong || !currentSong.trackId) return;
        const liked = await contextFetchLikeStatus(currentSong.trackId);
        setIsLiked(liked);
    };

    const toggleLike = async () => {
        if (!currentSong || !currentSong.trackId) return;
        try {
            const result = await contextToggleLike(currentSong.trackId, currentSong);
            setIsLiked(result.liked);
            if (currentSong) {
                currentSong.likes_count = result.likesCount;
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    useEffect(() => {
        if (volumeBarContainerRef.current && volumeBarFillRef.current) {
            volumeBarFillRef.current.style.width = `${volume * 100}%`;
        }
    }, [volume]);

    useEffect(() => {
        const audioElement = audioRef.current;

        const updateTime = () => {
            if (!isDraggingProgress && audioElement) {
                setContextCurrentTime(audioElement.currentTime); // Update context
            }
        };

        const updateDuration = () => {
            if (audioElement) {
                setContextDuration(audioElement.duration); // Update context
                if (audioElement.volume !== volume) {
                    audioElement.volume = volume;
                }
            }
        };
        const handleEnded = () => {
            if (handleSongEnded) {
                handleSongEnded();
            } else {
                setIsPlaying(false); // Prop setIsPlaying
            }
        };

        if (audioElement) {
            audioElement.addEventListener('timeupdate', updateTime);
            audioElement.addEventListener('loadedmetadata', updateDuration);
            audioElement.addEventListener('ended', handleEnded);

            // Initial set of duration if metadata already loaded
            if (audioElement.readyState >= 1) { // HAVE_METADATA
                updateDuration();
            }


            return () => {
                audioElement.removeEventListener('timeupdate', updateTime);
                audioElement.removeEventListener('loadedmetadata', updateDuration);
                audioElement.removeEventListener('ended', handleEnded);
            };
        }
    }, [isDraggingProgress, setIsPlaying, volume, setContextCurrentTime, setContextDuration, handleSongEnded]);

    const togglePlayPause = () => {
        if (!audioUrl) return;
        setIsPlaying(!isPlaying); // Prop setIsPlaying
    };

    const handleProgressMouseDown = (e) => {
        if (!audioRef.current || !progressBarContainerRef.current || !audioUrl) return;
        e.preventDefault();
        setIsDraggingProgress(true);
        document.addEventListener('mousemove', handleProgressMouseMove);
        document.addEventListener('mouseup', handleProgressMouseUp);

        const rect = progressBarContainerRef.current.getBoundingClientRect();
        const clickPosition = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
        const newTime = clickPosition * duration; // Use context duration
        setSeekTime(newTime);
    };

    const handleProgressMouseMove = (e) => {
        if (!progressBarContainerRef.current || !duration) return; // Use context duration
        const rect = progressBarContainerRef.current.getBoundingClientRect();
        const clickPosition = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
        const newTime = clickPosition * duration; // Use context duration
        setSeekTime(newTime);
    };

    const handleProgressMouseUp = () => {
        setIsDraggingProgress(false);
        document.removeEventListener('mousemove', handleProgressMouseMove);
        document.removeEventListener('mouseup', handleProgressMouseUp);

        // Use the seekTo function from context
        seekTo(seekTime);
    };

    const handleVolumeMouseDown = (e) => {
        if (!volumeBarContainerRef.current) return;
        e.preventDefault();
        setIsDraggingVolume(true);
        document.addEventListener('mousemove', handleVolumeMouseMove);
        document.addEventListener('mouseup', handleVolumeMouseUp);

        const rect = volumeBarContainerRef.current.getBoundingClientRect();
        const clickPosition = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));

        setVolume(clickPosition);
        if (audioRef.current) {
            audioRef.current.volume = clickPosition;
        }
    };

    const handleVolumeMouseMove = (e) => {
        if (!volumeBarContainerRef.current) return;
        const rect = volumeBarContainerRef.current.getBoundingClientRect();
        const clickPosition = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));

        setVolume(clickPosition);
        if (audioRef.current) {
            audioRef.current.volume = clickPosition;
        }
    };

    const handleVolumeMouseUp = () => {
        setIsDraggingVolume(false);
        document.removeEventListener('mousemove', handleVolumeMouseMove);
        document.removeEventListener('mouseup', handleVolumeMouseUp);
    };

    const handleProgressClick = (e) => {
        if (isDraggingProgress || !duration) return;
        const rect = progressBarContainerRef.current.getBoundingClientRect();
        const clickPosition = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
        const newTime = clickPosition * duration; // Use context duration

        seekTo(newTime); // Use context seekTo
    };

    const handleVolumeClick = (e) => {
        if (isDraggingVolume) return;
        const rect = volumeBarContainerRef.current.getBoundingClientRect();
        const clickPosition = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));

        setVolume(clickPosition);
        if (audioRef.current) {
            audioRef.current.volume = clickPosition;
        }
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return "0:00";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${minutes}:${remainingSeconds}`;
    };

    const defaultAlbumArt = "https://placehold.co/400x400/111/e75454?text=Music";

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
                    <span className={styles.songArtist}>{artist}</span>
                </div>
                {currentSong && (
                    <div className={styles.likeIcon} onClick={toggleLike} title={isLiked ? "Unlike" : "Like"}>
                        <Heart size={16} fill={isLiked ? "#e75454" : "none"} color={isLiked ? "#e75454" : "currentColor"} />
                    </div>
                )}
            </div>

            {/* CENTER: Playback Controls */}
            <div className={styles.playbackControls}>
                <div className={styles.controlsRow}>
                    <button
                        className={`${styles.shuffleButton} ${shuffleMode ? styles.active : ''}`}
                        onClick={toggleShuffle}
                        disabled={!playlistMode}
                        style={{ opacity: playlistMode ? 1 : 0.5 }}
                    >
                        <Shuffle size={18} />
                    </button>

                    <button
                        className={`${styles.iconButton}`}
                        onClick={handlePreviousSong}
                        disabled={!playlistMode}
                        style={{ opacity: playlistMode ? 1 : 0.5 }}
                    >
                        <SkipBack size={20} />
                    </button>
                    <button
                        className={styles.playButton}
                        onClick={togglePlayPause}
                        disabled={!audioUrl}
                        style={{ opacity: audioUrl ? 1 : 0.5 }}
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    <button
                        className={`${styles.iconButton}`}
                        onClick={handleNextSong}
                        disabled={!playlistMode}
                        style={{ opacity: playlistMode ? 1 : 0.5 }}
                    >
                        <SkipForward size={20} />
                    </button>

                    <button
                        className={`${styles.repeatButton} ${repeatMode ? styles.active : ''}`}
                        onClick={toggleRepeat}
                        disabled={!playlistMode}
                        style={{ opacity: playlistMode ? 1 : 0.5 }}
                    >
                        <Repeat size={18} />
                    </button>
                </div>

                <div className={styles.progressContainer}>
                    <span className={styles.time}>{formatTime(isDraggingProgress ? seekTime : currentTime)}</span>

                    <div
                        className={styles.progressBarContainer}
                        ref={progressBarContainerRef}
                        onClick={handleProgressClick}
                        onMouseDown={handleProgressMouseDown}
                    >
                        <div className={styles.progressBarBackground}></div>
                        <div
                            className={styles.progressBarFill}
                            ref={progressBarFillRef}
                            style={{
                                width: `${duration ? ((isDraggingProgress ? seekTime : currentTime) / duration) * 100 : 0}%`
                            }}
                        ></div>
                        <div
                            className={styles.progressBarThumb}
                            style={{
                                left: `${duration ? ((isDraggingProgress ? seekTime : currentTime) / duration) * 100 : 0}%`,
                                opacity: isDraggingProgress ? 1 : undefined
                            }}
                        ></div>
                    </div>

                    <span className={styles.time}>{formatTime(duration)}</span>
                </div>
            </div>

            {/* RIGHT: Extra Controls */}
            <div className={styles.extraControls}>
                <div className={styles.volumeControl}>
                    {volume === 0 ? <VolumeX size={18} /> :
                        volume < 0.5 ? <Volume1 size={18} /> :
                            <Volume2 size={18} />}

                    <div
                        className={styles.volumeBarContainer}
                        ref={volumeBarContainerRef}
                        onClick={handleVolumeClick}
                        onMouseDown={handleVolumeMouseDown}
                    >
                        <div className={styles.volumeBarBackground}></div>
                        <div
                            className={styles.volumeBarFill}
                            ref={volumeBarFillRef}
                            style={{ width: `${volume * 100}%` }}
                        ></div>
                        <div
                            className={styles.volumeBarThumb}
                            style={{
                                left: `${volume * 100}%`,
                                opacity: isDraggingVolume ? 1 : undefined
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Audio Element */}
            <audio
                ref={audioRef} // Still managed here, but registered with context
                src={audioUrl ? `http://localhost:3000${audioUrl}` : ""}
                preload="metadata"
                onError={(e) => {
                    console.error("Audio playback error:", e);
                    if (e.target.error) {
                        console.error("Error details:", e.target.error.message, "Code:", e.target.error.code);
                    }
                    console.error("Source URL:", audioUrl);
                }}
                onLoadedMetadata={() => { // Ensure duration is set on initial load
                    if (audioRef.current) {
                        setContextDuration(audioRef.current.duration);
                    }
                }}
            />
        </div>
    );
}

MediaControlBar.propTypes = {
    currentSong: PropTypes.object,
    isPlaying: PropTypes.bool,
    setIsPlaying: PropTypes.func,
    artistsMap: PropTypes.object,
    playlistMode: PropTypes.bool,
    shuffleMode: PropTypes.bool,
    repeatMode: PropTypes.bool,
    handleNextSong: PropTypes.func,
    handlePreviousSong: PropTypes.func,
    toggleShuffle: PropTypes.func,
    toggleRepeat: PropTypes.func,
    handleSongEnded: PropTypes.func
};

export default MediaControlBar;