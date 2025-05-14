import { Playlist, User, Song } from "../db_entities.js";

export const createPlaylist = async (req, res) => {
    try {
        const { name, description, is_public } = req.body;
        const userId = req.user.id;

        const playlist = await Playlist.create({
            name,
            description,
            cover_image_url: "",
            songs: [],
            is_public
        });

        await User.findByIdAndUpdate(userId, {
            $push: { playlists: playlist._id }
        });

        res.status(201).json(playlist);
    } catch (error) {
        console.log(req.body);
        res.status(400).json({ error: error.message });
    }
};

export const getUserPlaylists = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const user = await User.findById(userId).populate('playlists');
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        let playlists = user.playlists;
        
        if (userId !== req.user.id.toString()) {
            playlists = playlists.filter(playlist => playlist.is_public);
        }

        res.status(200).json(playlists);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getPlaylistById = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) {
            return res.status(404).json({ error: "Playlist not found" });
        }

        const songDetails = await Promise.all(
            playlist.songs.map(songId => Song.findOne({ trackId: songId }))
        );

        res.status(200).json({
            ...playlist.toObject(),
            songs: songDetails
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const addSongToPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.params;
        const userId = req.user.id;
        
        const song = await Song.findOne({ trackId: parseInt(songId) });
        if (!song) {
            return res.status(404).json({ error: "Song not found" });
        }

        let playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ error: "Playlist not found" });
        }

        if (!playlist.songs) {
            playlist.songs = [];
        }

        if (!playlist.songs.includes(song.trackId)) {
            playlist.songs.push(song.trackId);
            
            // Special handling for Liked Songs playlist
            if (playlist.name === "Liked Songs" || playlist.is_system === true) {
                // Also update the user's liked_songs array
                await User.findByIdAndUpdate(userId, {
                    $addToSet: { liked_songs: parseInt(songId) }
                });
                
                // Update the song's like count
                await Song.findOneAndUpdate(
                    { trackId: parseInt(songId) },
                    { $inc: { likes_count: 1 } }
                );
            }
            
            await playlist.save();

            const updatedPlaylist = await Playlist.findById(playlistId);
            const songDetails = await Promise.all(
                updatedPlaylist.songs.map(trackId => Song.findOne({ trackId }))
            );

            return res.status(200).json({
                ...updatedPlaylist.toObject(),
                songs: songDetails
            });
        }

        res.status(200).json({ message: "Song already in playlist" });
    } catch (error) {
        console.error('Error adding song to playlist:', error);
        res.status(400).json({ error: error.message });
    }
};

export const removeSongFromPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.params;
        const userId = req.user.id;
        
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ error: "Playlist not found" });
        }

        // Special handling for Liked Songs playlist
        if (playlist.name === "Liked Songs" || playlist.is_system === true) {
            // Also update the user's liked_songs array
            await User.findByIdAndUpdate(userId, {
                $pull: { liked_songs: parseInt(songId) }
            });
            
            // Update the song's like count
            await Song.findOneAndUpdate(
                { trackId: parseInt(songId) },
                { $inc: { likes_count: -1 } }
            );
        }

        playlist.songs = playlist.songs.filter(id => id !== parseInt(songId));
        await playlist.save();

        res.status(200).json(playlist);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updatePlaylist = async (req, res) => {
    try {
        const { name, description, is_public } = req.body;
        
        const playlist = await Playlist.findByIdAndUpdate(
            req.params.id,
            { name, description, is_public },
            { new: true }
        );

        if (!playlist) {
            return res.status(404).json({ error: "Playlist not found" });
        }

        res.status(200).json(playlist);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deletePlaylist = async (req, res) => {
    try {
        const playlistId = req.params.id;
        const userId = req.user.id;
        
        // Check if this is the Liked Songs playlist
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ error: "Playlist not found" });
        }
        
        // Prevent deletion of the Liked Songs playlist or any system playlist
        if (playlist.name === "Liked Songs" || playlist.is_system === true) {
            return res.status(403).json({ error: "Cannot delete system playlists like 'Liked Songs'" });
        }

        await User.findByIdAndUpdate(userId, {
            $pull: { playlists: playlistId }
        });

        await Playlist.findByIdAndDelete(playlistId);

        res.status(200).json({ message: "Playlist deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};