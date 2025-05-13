import { useState, useRef, useEffect } from 'react';
import styles from './MediaControlBar.module.css';
import PropTypes from 'prop-types';
import { Play, Pause, Shuffle, Repeat, SkipForward, SkipBack, Volume2, Volume1, VolumeX } from 'lucide-react';

function MediaControlBar({ 
    currentSong,
    isPlaying, 
    setIsPlaying,
    artistsMap,
    // New props for playlist functionality
    playlistMode = false,
    shuffleMode = false,
    repeatMode = false,
    handleNextSong = null,
    handlePreviousSong = null,
    toggleShuffle = null,
    toggleRepeat = null,
    handleSongEnded = null
}) {
    const [volume, setVolume] = useState(0.7); // Default volume is 70%
    const audioRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDraggingProgress, setIsDraggingProgress] = useState(false);
    const [isDraggingVolume, setIsDraggingVolume] = useState(false);
    const [seekTime, setSeekTime] = useState(0);

    // Progress bar and volume elements
    const progressBarContainerRef = useRef(null);
    const progressBarFillRef = useRef(null);
    const volumeBarContainerRef = useRef(null);
    const volumeBarFillRef = useRef(null);
    
    // Extract necessary properties from currentSong
    const title = currentSong?.title;
    
    // Format artist display - handle array of artist IDs
    const formatArtist = (artistIds) => {
        if (!artistIds) return "Unknown Artist";
        
        // Handle array of artists
        if (Array.isArray(artistIds)) {
            return artistIds
                .map(id => artistsMap?.[id]?.name || `Artist ${id}`)
                .join(', ');
        }
        
        // Handle single artist
        return artistsMap?.[artistIds]?.name || `Artist ${artistIds}`;
    };
    
    const artist = currentSong?.artist ? formatArtist(currentSong.artist) : "Artist";
    const albumArt = currentSong?.cover_image_url;
    const audioUrl = currentSong?.audio_url;
    
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
    }, [currentSong, audioUrl, isPlaying]);

    // Handle play/pause state changes
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Error playing audio:", e));
            }
            else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

    // Update progress fill effect
    useEffect(() => {
        if (progressBarContainerRef.current && progressBarFillRef.current) {
            const percent = duration 
                ? ((isDraggingProgress ? seekTime : currentTime) / duration) * 100
                : 0;
            
            progressBarFillRef.current.style.width = `${percent}%`;
        }
    }, [currentTime, duration, isDraggingProgress, seekTime]);

    // Update volume fill effect
    useEffect(() => {
        if (volumeBarContainerRef.current && volumeBarFillRef.current) {
            volumeBarFillRef.current.style.width = `${volume * 100}%`;
        }
    }, [volume]);

    // Audio event handlers
    useEffect(() => {
        const audioElement = audioRef.current;

        const updateTime = () => {
            if (!isDraggingProgress && audioElement) {
                setCurrentTime(audioElement.currentTime);
            }
        };

        const updateDuration = () => {
            if (audioElement) {
                setDuration(audioElement.duration);
                if (audioElement.volume !== volume) {
                    audioElement.volume = volume;
                }
            }
        };        const handleEnded = () => {
            if (handleSongEnded) {
                // Use the playlist's song ended handler if in playlist mode
                handleSongEnded();
            } else {
                // Default behavior for single song
                setIsPlaying(false);
            }
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
    }, [isDraggingProgress, setIsPlaying, volume]);

    const togglePlayPause = () => {
        if (!audioUrl) return;
        setIsPlaying(!isPlaying);
    };

    // Progress bar drag handlers - improved version
    const handleProgressMouseDown = (e) => {
        if (!audioRef.current || !progressBarContainerRef.current || !audioUrl) return;
        
        e.preventDefault();
        setIsDraggingProgress(true);
        document.addEventListener('mousemove', handleProgressMouseMove);
        document.addEventListener('mouseup', handleProgressMouseUp);
        
        // Calculate initial position
        const rect = progressBarContainerRef.current.getBoundingClientRect();
        const clickPosition = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
        const newTime = clickPosition * duration;
        setSeekTime(newTime);
    };
    
    const handleProgressMouseMove = (e) => {
        if (!progressBarContainerRef.current || !duration) return;
        
        const rect = progressBarContainerRef.current.getBoundingClientRect();
        const clickPosition = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
        const newTime = clickPosition * duration;
        setSeekTime(newTime);
    };
    
    const handleProgressMouseUp = () => {
        setIsDraggingProgress(false);
        document.removeEventListener('mousemove', handleProgressMouseMove);
        document.removeEventListener('mouseup', handleProgressMouseUp);
        
        if (audioRef.current) {
            audioRef.current.currentTime = seekTime;
            setCurrentTime(seekTime);
        }
    };

    // Volume drag handlers - improved version
    const handleVolumeMouseDown = (e) => {
        if (!volumeBarContainerRef.current) return;
        
        e.preventDefault();
        setIsDraggingVolume(true);
        document.addEventListener('mousemove', handleVolumeMouseMove);
        document.addEventListener('mouseup', handleVolumeMouseUp);
        
        // Calculate initial position
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

    // Click handlers (without dragging) for both controls
    const handleProgressClick = (e) => {
        if (isDraggingProgress) return; // Skip if we're already dragging
        
        const rect = progressBarContainerRef.current.getBoundingClientRect();
        const clickPosition = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
        const newTime = clickPosition * duration;
        
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };
    
    const handleVolumeClick = (e) => {
        if (isDraggingVolume) return; // Skip if we're already dragging
        
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

    // Default placeholder image
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
                    <div className={styles.likeIcon}>
                        <i className="fas fa-heart" style={{ color: '#e75454' }}></i>
                    </div>
                )}
            </div>

            {/* CENTER: Playback Controls */}
            <div className={styles.playbackControls}>                <div className={styles.controlsRow}>
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
                    </button>                    <button 
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
                    
                    {/* Custom progress bar implementation */}
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
            <div className={styles.extraControls}>                <div className={styles.volumeControl}>
                    {volume === 0 ? <VolumeX size={18} /> : 
                     volume < 0.5 ? <Volume1 size={18} /> : 
                     <Volume2 size={18} />}
                    
                    {/* Custom volume slider implementation */}
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
                ref={audioRef} 
                src={`http://localhost:3000${audioUrl}` || ""} 
                preload="metadata"
                onError={(e) => {
                    console.error("Audio playback error:", e);
                    console.error("Error details:", e.target.error);
                    console.error("Source URL:", audioUrl);
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
    // Playlist functionality props
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
