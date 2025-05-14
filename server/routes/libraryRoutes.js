import express from 'express';
import { Song, Artist, Album, User } from '../db_entities.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all artists from the songs in a user's playlists
router.get('/user/:userId/artists', verifyToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Get the user and their playlists
        const user = await User.findById(userId).populate('playlists');
        
        if (!user || !user.playlists || user.playlists.length === 0) {
            return res.json([]);
        }
        
        // Extract all song IDs from the playlists
        let songIds = [];
        user.playlists.forEach(playlist => {
            if (playlist.songs && playlist.songs.length > 0) {
                songIds.push(...playlist.songs);
            }
        });
        
        // Remove duplicates
        songIds = [...new Set(songIds)];
        
        if (songIds.length === 0) {
            return res.json([]);
        }
        
        // Get all songs with these IDs
        const songs = await Song.find({ trackId: { $in: songIds } });
        
        if (songs.length === 0) {
            return res.json([]);
        }
        
        // Extract all unique artist IDs from these songs
        const artistIds = new Set();
        songs.forEach(song => {
            if (song.artist && song.artist.length > 0) {
                song.artist.forEach(artistId => {
                    artistIds.add(artistId);
                });
            }
        });
        
        const artistIdArray = Array.from(artistIds);
        
        if (artistIdArray.length === 0) {
            return res.json([]);
        }
        
        // Get all artists with these IDs
        const artists = await Artist.find({ artistID: { $in: artistIdArray } });
        
        if (artists.length === 0) {
            return res.json([]);
        }
        
        // Add song count for each artist
        const artistsWithCounts = artists.map(artist => {
            // Count songs in the user's playlists that include this artist
            const artistSongs = songs.filter(song => 
                Array.isArray(song.artist) && song.artist.includes(artist.artistID)
            );
            
            // If the artist has a songs field (from db_entities), use its length as fallback
            const songsCount = artistSongs.length || (Array.isArray(artist.songs) ? artist.songs.length : 0);
            
            return {
                ...artist.toObject(),
                songsCount: songsCount
            };
        });
        
        res.json(artistsWithCounts);
    } catch (err) {
        console.error("Error fetching artists from playlists:", err);
        res.status(500).json({ message: "Failed to fetch artists", error: err.message });
    }
});

// Get all albums from the songs in a user's playlists
router.get('/user/:userId/albums', verifyToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Get the user and their playlists
        const user = await User.findById(userId).populate('playlists');
        
        if (!user || !user.playlists || user.playlists.length === 0) {
            return res.json([]);
        }
        
        // Extract all song IDs from the playlists
        let songIds = [];
        user.playlists.forEach(playlist => {
            if (playlist.songs && playlist.songs.length > 0) {
                songIds.push(...playlist.songs);
            }
        });
        
        // Remove duplicates
        songIds = [...new Set(songIds)];
        
        if (songIds.length === 0) {
            return res.json([]);
        }
        
        // Get all songs with these IDs
        const songs = await Song.find({ trackId: { $in: songIds } });
        
        if (songs.length === 0) {
            return res.json([]);
        }
        
        // Extract all unique album IDs from these songs
        const albumIds = new Set();
        songs.forEach(song => {
            if (song.album) {
                albumIds.add(song.album);
            }
        });
        
        const albumIdArray = Array.from(albumIds);
        
        if (albumIdArray.length === 0) {
            return res.json([]);
        }
        
        // Get all albums with these IDs
        const albums = await Album.find({ album_id: { $in: albumIdArray } });
        
        if (albums.length === 0) {
            return res.json([]);
        }
        
        // Add song count and artist name for each album
        const albumsWithInfo = await Promise.all(albums.map(async album => {
            // Count songs in the user's playlists that belong to this album
            const albumSongs = songs.filter(song => song.album === album.album_id);
            
            // If the album has a songs field (from db_entities), use its length as fallback
            let songsCount = albumSongs.length;
            if (songsCount === 0 && album.songs && Array.isArray(album.songs)) {
                songsCount = album.songs.length;
            }
            
            // Get artist name
            let artistName = "";
            if (album.artist) {
                const artist = await Artist.findOne({ artistID: album.artist });
                if (artist) {
                    artistName = artist.name;
                }
            }
            
            return {
                ...album.toObject(),
                artistName,
                songsCount: songsCount
            };
        }));
        
        res.json(albumsWithInfo);
    } catch (err) {
        console.error("Error fetching albums from playlists:", err);
        res.status(500).json({ message: "Failed to fetch albums", error: err.message });
    }
});

export default router;
