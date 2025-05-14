import React, { createContext, useState, useContext, useCallback, useRef } from 'react';

const PlaybackContext = createContext();

export const usePlayback = () => {
    const context = useContext(PlaybackContext);
    if (!context) {
        throw new Error('usePlayback must be used within a PlaybackProvider');
    }
    return context;
};

export const PlaybackProvider = ({ children }) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlayingState] = useState(false); // Renamed to avoid clash
    const audioRefInternal = useRef(null); // Internal ref for the provider

    const setAudioRef = useCallback((ref) => {
        audioRefInternal.current = ref;
    }, []);

    const seekTo = useCallback((time) => {
        if (audioRefInternal.current) {
            audioRefInternal.current.currentTime = time;
            setCurrentTime(time); // Ensure context state is also updated immediately
        }
    }, []);

    // Expose setIsPlaying via context as well, if needed by other components too
    // For now, we'll focus on time, but this is where you'd add it.

    const value = {
        currentTime,
        setCurrentTime, // For MediaControlBar to update from audio events
        duration,
        setDuration,   // For MediaControlBar to update from audio events
        seekTo,        // For MediaControlBar (and potentially others) to call
        setAudioRef,   // For MediaControlBar to register its audio element
        audioRef: audioRefInternal, // Expose the ref if other components might need direct access (use with caution)

        // We can also manage isPlaying here if desired
        isPlayingInternal: isPlaying, // Using 'Internal' to differentiate from MediaControlBar's prop
        setIsPlayingInternal: setIsPlayingState,
    };

    return (
        <PlaybackContext.Provider value={value}>
            {children}
        </PlaybackContext.Provider>
    );
};