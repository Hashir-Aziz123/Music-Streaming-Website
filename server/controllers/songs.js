import {Song, Artist, Album} from "../db_entities.js";

export const getSongs = async (req, res) => {
    try {
        // Extract query parameters
        const page = parseInt(req.query.page) || 1;  // Default to page 1
        const limit = parseInt(req.query.limit) || 20;  // Default to 20 songs per page
        const artistId = req.query.artistId;
        const albumId = req.query.albumId;
        const skip = (page - 1) * limit;
        
        let query = {};
          // Filter by artist if artistId is provided
        if (artistId) {
            const parsedArtistId = parseInt(artistId);
            
            // Match songs where artist can be in various formats:
            // - An array of artist IDs
            // - A single artist ID 
            // - An array of objects with _id property (as stored in playlists)
            query = { 
                $or: [
                    { artist: { $elemMatch: { $eq: parsedArtistId } } }, // For array of artist IDs
                    { artist: parsedArtistId }, // For single artist ID
                    { "artist._id": parsedArtistId }, // For array of artist objects
                    { "artist.artistID": parsedArtistId } // For artist objects with artistID
                ]
            };
        } else if (albumId) {
            // Filter by album if albumId is provided
            const parsedAlbumId = parseInt(albumId);
            
            // Match songs where album field equals the specified albumId
            query = { album: parsedAlbumId };
        }

        // Query with filters and pagination
        const songs = await Song.find(query)
            .skip(skip)
            .limit(limit);
        
        // Get total count for pagination metadata
        const totalSongs = await Song.countDocuments(query);

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
        console.error(`API: Error getting artist with ID ${req.params.id}:`, error);
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

// Get songs by artist ID
export const getSongsByArtist = async (req, res) => {
    try {
        // Allow both string and number IDs by trying different formats
        let artistId = req.params.artistId;
        let parsedArtistId = parseInt(artistId);
        
        // Check for valid parsed ID
        if (isNaN(parsedArtistId)) {
            console.log(`API: Invalid artist ID format: ${artistId}`);
            return res.status(400).json({ error: "Invalid artist ID" });
        }

        // Match songs where artist can be in various formats:
        // - An array of artist IDs
        // - A single artist ID 
        // - An array of objects with _id or artistID property
        const query = { 
            $or: [
                { artist: { $elemMatch: { $eq: parsedArtistId } } }, // For array of artist IDs
                { artist: parsedArtistId }, // For single artist ID
                { "artist._id": parsedArtistId }, // For array of artist objects with _id
                { "artist.artistID": parsedArtistId } // For artist objects with artistID
            ]
        };

        // Removed pagination to get all songs for a particular artist
        const songs = await Song.find(query).limit(100); // Reasonable limit to prevent huge responses
        
        // Check artist info to confirm it exists
        const artist = await Artist.findOne({ artistID: parsedArtistId });
        if (!artist) {
            // Look for any song with this artist to debug
            const samplesWithArtist = await Song.find({ artist: parsedArtistId }).limit(5);
            if (samplesWithArtist.length <= 0) {
                // Try alternate artist formats
                const altSamples = await Song.find({
                    $or: [
                        { "artist._id": parsedArtistId },
                        { "artist.artistID": parsedArtistId }
                    ]
                }).limit(5);
            }
        }

        res.status(200).json(songs);
    } catch (error) {
        console.error(`Error getting songs for artist ID ${req.params.artistId}:`, error);
        res.status(400).json({ error: error.message });
    }
};