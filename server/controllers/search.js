import { Song, Artist, Album, Playlist } from "../db_entities.js";

export const search = async (req, res) => {
    try {
        const { query, limit = 5 } = req.query;
        
        if (!query || query.trim() === '') {
            return res.status(400).json({ error: "Search query is required" });
        }
        
        // Create a case-insensitive regex for the search query
        const searchRegex = new RegExp(query, 'i');

        // Search for songs
        const songs = await Song.find({
            title: searchRegex
        }).limit(parseInt(limit) + 5); // Fetch a few extra to ensure we have enough after filtering
        
        // Search for artists
        const artists = await Artist.find({
            name: searchRegex
        }).limit(parseInt(limit));
        
        // Search for albums
        const albums = await Album.find({
            title: searchRegex
        }).limit(parseInt(limit));
        
        // Search for public playlists only
        const playlists = await Playlist.find({
            name: searchRegex,
            is_public: true
        }).limit(parseInt(limit));

        // Limit to exact requested amount
        const limitedSongs = songs.slice(0, parseInt(limit));
        
        res.status(200).json({
            songs: limitedSongs,
            artists,
            albums,
            playlists,
            counts: {
                songs: songs.length,
                artists: await Artist.countDocuments({ name: searchRegex }),
                albums: await Album.countDocuments({ title: searchRegex }),
                playlists: await Playlist.countDocuments({ name: searchRegex, is_public: true })
            }
        });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const searchMore = async (req, res) => {
    try {
        const { query, type, page = 1, limit = 20 } = req.query;
        
        if (!query || query.trim() === '') {
            return res.status(400).json({ error: "Search query is required" });
        }
        
        if (!type || !['songs', 'artists', 'albums', 'playlists'].includes(type)) {
            return res.status(400).json({ error: "Valid search type is required" });
        }
        
        const searchRegex = new RegExp(query, 'i');
        const skip = (parseInt(page) - 1) * parseInt(limit);
        let results = [];
        let total = 0;
        
        switch(type) {
            case 'songs':
                results = await Song.find({ title: searchRegex })
                    .skip(skip)
                    .limit(parseInt(limit));
                total = await Song.countDocuments({ title: searchRegex });
                break;
                
            case 'artists':
                results = await Artist.find({ name: searchRegex })
                    .skip(skip)
                    .limit(parseInt(limit));
                total = await Artist.countDocuments({ name: searchRegex });
                break;
                
            case 'albums':
                results = await Album.find({ title: searchRegex })
                    .skip(skip)
                    .limit(parseInt(limit));
                total = await Album.countDocuments({ title: searchRegex });
                break;
                
            case 'playlists':
                results = await Playlist.find({ 
                    name: searchRegex,
                    is_public: true
                })
                    .skip(skip)
                    .limit(parseInt(limit));
                total = await Playlist.countDocuments({ name: searchRegex, is_public: true });
                break;
        }
        
        res.status(200).json({
            results,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                total,
                perPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error("Search more error:", error);
        res.status(500).json({ error: error.message });
    }
};
