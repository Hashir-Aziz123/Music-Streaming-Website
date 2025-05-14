import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

// This will be accessible outside React components
export let notifyGlobalLikeChange = () => {};

const LikeContext = createContext();

export const useLikes = () => useContext(LikeContext);

export const LikeProvider = ({ children }) => {
    const [likedSongs, setLikedSongs] = useState({});  // Map of songId -> liked status
    const [likeChangeNotifier, setLikeChangeNotifier] = useState(0); // Counter to trigger updates
    
    // Function to notify all components about like changes
    const notifyLikeChange = useCallback(() => {
        setLikeChangeNotifier(prev => prev + 1);
    }, []);
    
    // Update the global function
    useEffect(() => {
        notifyGlobalLikeChange = notifyLikeChange;
    }, [notifyLikeChange]);
    
    // Check if a song is liked
    const isLiked = (songId) => {
        if (!songId) return false;
        return !!likedSongs[songId];
    };
    
    // Fetch like status for a specific song
    const fetchLikeStatus = async (songId) => {
        if (!songId) return;
        
        try {
            const response = await axios.get(`/api/likes/song/${songId}`, { withCredentials: true });
            setLikedSongs(prev => ({
                ...prev,
                [songId]: response.data.liked
            }));
            return response.data.liked;
        } catch (error) {
            console.error("Error fetching like status:", error);
            return false;
        }
    };
      // Toggle like for a song
    const toggleLike = async (songId, currentSong) => {
        if (!songId) return;
        
        try {
            const response = await axios.post(`/api/likes/song/${songId}/toggle`, {}, { withCredentials: true });
            
            // Update like status in state
            setLikedSongs(prev => ({
                ...prev,
                [songId]: response.data.liked
            }));
            
            // Notify all components about the like status change
            setLikeChangeNotifier(prev => prev + 1);
            
            // Return the updated data
            return {
                liked: response.data.liked,
                likesCount: response.data.likes_count
            };
        } catch (error) {
            console.error("Error toggling like:", error);
            return { liked: isLiked(songId), likesCount: currentSong?.likes_count || 0 };
        }
    };
    
    // Utility function to sync a song's like status with the Liked Songs playlist
    const syncLikedSongsPlaylist = useCallback(async () => {
        try {
            await axios.post('/api/likes/sync-playlist', {}, { withCredentials: true });
        } catch (error) {
            console.error("Error syncing liked songs playlist:", error);
        }
    }, []);    const value = {
        isLiked,
        fetchLikeStatus,
        toggleLike,
        syncLikedSongsPlaylist,
        likeChangeNotifier,
        notifyLikeChange
    };
    
    return <LikeContext.Provider value={value}>{children}</LikeContext.Provider>;
};

LikeProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default LikeContext;
