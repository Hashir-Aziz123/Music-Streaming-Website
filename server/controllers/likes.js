import { User, Song, Playlist } from "../db_entities.js";

// Toggle like status for a song
export const toggleLikeSong = async (req, res) => {
    try {
        const { songId } = req.params;
        const userId = req.user.id;
        
        // Find the song
        const song = await Song.findOne({ trackId: parseInt(songId) });
        if (!song) {
            return res.status(404).json({ error: "Song not found" });
        }
        
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Check if song is already liked
        const isLiked = user.liked_songs && user.liked_songs.includes(parseInt(songId));
          if (isLiked) {
            // Unlike the song
            await User.findByIdAndUpdate(userId, {
                $pull: { liked_songs: parseInt(songId) }
            });
            
            // Decrease like count if greater than 0
            if (song.likes_count > 0) {
                await Song.findOneAndUpdate(
                    { trackId: parseInt(songId) },
                    { $inc: { likes_count: -1 } }
                );
            }
              // Remove from Liked Songs playlist
            await removeFromLikedSongsPlaylist(userId, parseInt(songId));
            
            res.status(200).json({ 
                liked: false, 
                message: "Song unliked successfully",
                likes_count: Math.max(0, song.likes_count - 1)
            });
        } else {
            // Like the song
            await User.findByIdAndUpdate(userId, {
                $push: { liked_songs: parseInt(songId) }
            });
            
            // Increase like count
            await Song.findOneAndUpdate(
                { trackId: parseInt(songId) },
                { $inc: { likes_count: 1 } }
            );
            
            // Also make sure the song is in the "Liked Songs" playlist
            await ensureLikedSongsPlaylist(userId, parseInt(songId));
            
            res.status(200).json({ 
                liked: true, 
                message: "Song liked successfully",
                likes_count: song.likes_count + 1
            });
        }
    } catch (error) {
        console.error("Error toggling song like:", error);
        res.status(400).json({ error: error.message });
    }
};

// Get liked status for a song
export const getSongLikedStatus = async (req, res) => {
    try {
        const { songId } = req.params;
        const userId = req.user.id;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        const isLiked = user.liked_songs && user.liked_songs.includes(parseInt(songId));
        
        res.status(200).json({ liked: isLiked });
    } catch (error) {
        console.error("Error getting song liked status:", error);
        res.status(400).json({ error: error.message });
    }
};

// Get all liked songs for a user
export const getLikedSongs = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;
        
        // Check if the requesting user is authorized to see the liked songs
        if (userId !== req.user.id.toString()) {
            return res.status(403).json({ error: "Not authorized to view this user's liked songs" });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        if (!user.liked_songs || user.liked_songs.length === 0) {
            return res.status(200).json({ songs: [] });
        }
        
        // Get details of all liked songs
        const songs = await Promise.all(
            user.liked_songs.map(trackId => Song.findOne({ trackId }))
        );
        
        // Filter out any null results (songs that may have been deleted)
        const validSongs = songs.filter(song => song !== null);
        
        res.status(200).json({ songs: validSongs });
    } catch (error) {
        console.error("Error getting liked songs:", error);
        res.status(400).json({ error: error.message });
    }
};

// Helper function to ensure the "Liked Songs" playlist exists and contains the song
export const ensureLikedSongsPlaylist = async (userId, songId = null) => {
    try {
        const user = await User.findById(userId).populate('playlists');
        if (!user) return null;
        
        // Look for an existing "Liked Songs" playlist
        let likedSongsPlaylist = user.playlists.find(p => p.name === "Liked Songs");
        
        if (!likedSongsPlaylist) {
            // Create the "Liked Songs" playlist if it doesn't exist
            likedSongsPlaylist = await Playlist.create({
                name: "Liked Songs",
                description: "Songs you've liked",
                cover_image_url: "", // You could set a default cover image here
                songs: songId ? [songId] : [],
                is_public: true,
                is_system: true // Mark as a system playlist that can't be deleted
            });
            
            // Add the new playlist to the user's playlists
            await User.findByIdAndUpdate(userId, {
                $push: { playlists: likedSongsPlaylist._id }
            });
        } else if (songId) {
            // Add the song to the playlist if it's not already there and songId is provided
            if (!likedSongsPlaylist.songs.includes(songId)) {
                likedSongsPlaylist.songs.push(songId);
                await likedSongsPlaylist.save();
            }
        }
        
        return likedSongsPlaylist;
    } catch (error) {
        console.error("Error ensuring Liked Songs playlist:", error);
        return null;
    }
};

// Helper function to remove a song from the "Liked Songs" playlist
export const removeFromLikedSongsPlaylist = async (userId, songId) => {
    try {
        const user = await User.findById(userId).populate('playlists');
        if (!user) return null;
        
        // Look for the "Liked Songs" playlist
        const likedSongsPlaylist = user.playlists.find(p => p.name === "Liked Songs");
        
        if (likedSongsPlaylist && likedSongsPlaylist.songs) {
            // Remove the song from the playlist
            likedSongsPlaylist.songs = likedSongsPlaylist.songs.filter(id => id !== songId);
            await likedSongsPlaylist.save();
            return likedSongsPlaylist;
        }
        
        return null;
    } catch (error) {
        console.error("Error removing song from Liked Songs playlist:", error);
        return null;
    }
};