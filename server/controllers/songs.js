import {Song, Artist, Album} from "../db_entities.js";

export const getSongs = async (req, res) => {
    try {
        // Extract page and limit from query parameters
        const page = parseInt(req.query.page) || 1;  // Default to page 1
        const limit = parseInt(req.query.limit) || 20;  // Default to 20 songs per page
        const skip = (page - 1) * limit;

        // Query with pagination
        const songs = await Song.find({})
            .skip(skip)
            .limit(limit);
        
        // Get total count for pagination metadata
        const totalSongs = await Song.countDocuments();

        res.status(200).json({
            songs,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalSongs / limit),
                totalSongs,
                songsPerPage: limit
            }
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getSongById = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if(!song) {
            return res.status(404).json({error: "Song not found"});
        }
        res.status(200).json(song);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

export const getArtistById = async (req, res) => {
    try {
        const artistId = parseInt(req.params.id);
        if (isNaN(artistId)) {
            return res.status(400).json({error: "Invalid artist ID"});
        }
        
        const artist = await Artist.findOne({artistID: artistId});
        if (!artist) {
            return res.status(404).json({error: "Artist not found"});
        }
        
        res.status(200).json(artist);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

export const getAlbumById = async (req, res) => {
    try {
        const albumId = parseInt(req.params.id);
        if (isNaN(albumId)) {
            return res.status(400).json({error: "Invalid album ID"});
        }
        
        const album = await Album.findOne({album_id: albumId});
        if (!album) {
            return res.status(404).json({error: "Album not found"});
        }
        
        res.status(200).json(album);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

export const insertSong = async (req, res) => {
    try {
        const song = await Song.create(req.body);
        res.status(200).json(song);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getSongDetails = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({error: "Song not found"});
        }
        
        // Get artist details
        let artistDetails = [];
        if (Array.isArray(song.artist)) {
            const artistPromises = song.artist.map(artistId => Artist.findOne({artistID: artistId}));
            artistDetails = await Promise.all(artistPromises);
            artistDetails = artistDetails.filter(artist => artist !== null);
        }
        
        // Get album details
        let albumDetails = null;
        if (song.album) {
            albumDetails = await Album.findOne({album_id: song.album});
        }
        
        res.status(200).json({
            song,
            artists: artistDetails,
            album: albumDetails
        });
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

export const getAllArtists = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const artists = await Artist.find({})
            .skip(skip)
            .limit(limit);
            
        const totalArtists = await Artist.countDocuments();
        
        res.status(200).json({
            artists,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalArtists / limit),
                totalArtists,
                artistsPerPage: limit
            }
        });
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

export const getAllAlbums = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const albums = await Album.find({})
            .skip(skip)
            .limit(limit);
            
        const totalAlbums = await Album.countDocuments();
        
        res.status(200).json({
            albums,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalAlbums / limit),
                totalAlbums,
                albumsPerPage: limit
            }
        });
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};