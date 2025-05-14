import { Song, Artist, Album } from "../db_entities.js"; 
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

async function populateSongDetails(songDoc) {
    if (!songDoc) return null;
    const song = songDoc.toObject(); 
    // Populate artists
    if (song.artist && song.artist.length > 0) {
        try {
            const artistIDs = song.artist.map(id => Number(id)).filter(id => !isNaN(id));
            if (artistIDs.length > 0) {
                song.artistDetails = await Artist.find({ artistID: { $in: artistIDs } });
            } else {
                song.artistDetails = [];
            }
        } catch (e) {
            console.error("Error populating artists for song:", e);
            song.artistDetails = [];
        }
    } else {
        song.artistDetails = [];
    }

    // Populate album
    if (song.album) { 
        try {
            const albumIdNum = Number(song.album);
            if (!isNaN(albumIdNum)) {
                song.albumDetails = await Album.findOne({ album_id: albumIdNum });
            } else {
                song.albumDetails = null;
            }
        } catch (e) {
            console.error("Error populating album for song:", e);
            song.albumDetails = null;
        }
    } else {
        song.albumDetails = null;
    }
    return song;
}

export const getSongs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20; // Default limit
        const artistIdParam = req.query.artistId;
        const albumIdParam = req.query.albumId;
        const searchQuery = req.query.search || ''; // New search query parameter
        const skip = (page - 1) * limit;

        let query = {};

        // Add search functionality (searching by song title)
        if (searchQuery) {
            query.title = { $regex: searchQuery, $options: 'i' }; // Case-insensitive regex search
        }

        // Existing filters (can be combined with search)
        if (artistIdParam) {
            const parsedArtistId = parseInt(artistIdParam);
            if (!isNaN(parsedArtistId)) {
                query.artist = parsedArtistId; 
            }
        }
        if (albumIdParam) {
            const parsedAlbumId = parseInt(albumIdParam);
            if(!isNaN(parsedAlbumId)) {
                query.album = parsedAlbumId; 
            }
        }
        
        const songDocs = await Song.find(query)
            .sort({ title: 1 }) // Sort by title, or any other preferred field like uploaded_at: -1
            .skip(skip)
            .limit(limit);

        const totalSongs = await Song.countDocuments(query); // Get total count matching the query for pagination

        const songsWithDetails = await Promise.all(songDocs.map(doc => populateSongDetails(doc)));

        res.status(200).json({
            songs: songsWithDetails,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalSongs / limit),
                totalSongs,
                songsPerPage: limit,
                hasNextPage: (page * limit) < totalSongs // Added for easier frontend logic
            }
        });
    } catch (error) {
        console.error("Error in getSongs:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getSongById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid Song ID format" });
        }
        const songDoc = await Song.findById(req.params.id);
        if (!songDoc) {
            return res.status(404).json({ error: "Song not found" });
        }
        const populatedSong = await populateSongDetails(songDoc);
        res.status(200).json(populatedSong);
    } catch (error) {
        console.error("Error in getSongById:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getSongDetails = async (req, res) => { 
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid Song ID format" });
        }
        const songDoc = await Song.findById(req.params.id);
        if (!songDoc) {
            return res.status(404).json({ error: "Song not found" });
        }
        const song = await populateSongDetails(songDoc);
        res.status(200).json({
            song: songDoc.toObject(), 
            artists: song.artistDetails, 
            album: song.albumDetails     
        });
    } catch (error) {
        console.error("Error in getSongDetails:", error);
        res.status(500).json({ error: error.message });
    }
};

export const adminCreateSong = async (req, res) => {
    try {
        const {
            trackId, title, artist, album, genre, duration_seconds, description
        } = req.body;

        if (!title || !artist || !duration_seconds || !trackId) {
            return res.status(400).json({ message: "Missing required fields: trackId, title, artist (comma-separated IDs), duration_seconds." });
        }
        
        let audio_url = '';
        let cover_image_url = '';

        if (req.files && req.files.audioFile && req.files.audioFile[0]) {
            audio_url = `/songs/fma_small/${req.files.audioFile[0].filename}`;
        }
        if (req.files && req.files.coverImageFile && req.files.coverImageFile[0]) {
            cover_image_url = `/covers/${req.files.coverImageFile[0].filename}`;
        }
        
        const artistArray = artist.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        if (artistArray.length === 0 && artist.trim() !== '') { 
             return res.status(400).json({ message: "Invalid Artist ID(s) format. Please provide comma-separated numbers."});
        } else if (artistArray.length === 0) { 
             return res.status(400).json({ message: "Artist ID(s) are required."});
        }

        const genreArray = genre ? genre.split(',').map(g => g.trim()).filter(g => g) : []; 
        const albumIdNum = album ? parseInt(album.trim()) : null;

        if (album && isNaN(albumIdNum)) { 
            return res.status(400).json({message: "Invalid Album ID format. It should be a number."});
        }

        const newSong = new Song({
            trackId: parseInt(trackId),
            title,
            artist: artistArray,
            album: (albumIdNum !== null && !isNaN(albumIdNum)) ? albumIdNum : undefined,
            genre: genreArray,
            duration_seconds: parseFloat(duration_seconds),
            audio_url,
            cover_image_url: cover_image_url || '',
            description: description || '',
        });

        const savedSongDoc = await newSong.save();
        const populatedSong = await populateSongDetails(savedSongDoc);
        res.status(201).json(populatedSong);

    } catch (error) {
        console.error("Error creating song:", error);
        if (req.files) { 
            if (req.files.audioFile && req.files.audioFile[0]) {
                fs.unlink(req.files.audioFile[0].path, err => {
                    if (err) console.error("Error deleting orphaned audio file on song creation failure:", err);
                });
            }
            if (req.files.coverImageFile && req.files.coverImageFile[0]) {
                 fs.unlink(req.files.coverImageFile[0].path, err => {
                    if (err) console.error("Error deleting orphaned cover file on song creation failure:", err);
                });
            }
        }
        if (error.code === 11000) { 
             return res.status(409).json({ message: "Song with this Track ID already exists.", error: error.message });
        }
        res.status(500).json({ message: "Server error creating song.", error: error.message });
    }
};
export const adminGetSongById = async (req, res) => { // Copied from previous version
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid Song ID format" });
        }
        const songDoc = await Song.findById(req.params.id);
        if (!songDoc) {
            return res.status(404).json({ error: "Song not found" });
        }
        const populatedSong = await populateSongDetails(songDoc);
        res.status(200).json(populatedSong);
    } catch (error) {
        console.error("Error in adminGetSongById:", error);
        res.status(500).json({ error: error.message });
    }
};
export const adminUpdateSong = async (req, res) => { // Copied from previous version
    try {
        const songId = req.params.id; 
         if (!mongoose.Types.ObjectId.isValid(songId)) {
            return res.status(400).json({ error: "Invalid Song ID format" });
        }

        const updates = req.body;
        let songToUpdate = await Song.findById(songId);

        if (!songToUpdate) {
            return res.status(404).json({ message: "Song not found." });
        }

        let oldAudioPath, oldCoverPath;
        if (req.files) {
            if (req.files.audioFile && req.files.audioFile[0]) {
                if (songToUpdate.audio_url) {
                    oldAudioPath = path.join(path.resolve(), 'server/uploads', songToUpdate.audio_url.replace(/^\//, ''));
                }
                updates.audio_url = `/songs/fma_small/${req.files.audioFile[0].filename}`;
            }
            if (req.files.coverImageFile && req.files.coverImageFile[0]) {
                if (songToUpdate.cover_image_url) {
                   oldCoverPath = path.join(path.resolve(), 'server/uploads', songToUpdate.cover_image_url.replace(/^\//, ''));
                }
                updates.cover_image_url = `/covers/${req.files.coverImageFile[0].filename}`;
            }
        }
        
        if (updates.artist && typeof updates.artist === 'string') {
            updates.artist = updates.artist.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
             if (updates.artist.length === 0 && updates.artist.trim() !== '') { // Corrected from previous
                return res.status(400).json({ message: "Invalid Artist ID(s) format for update. Please provide comma-separated numbers."});
            } else if (updates.artist.length === 0 && artist.trim() === '') { // if it was empty and required
                 return res.status(400).json({ message: "Artist ID(s) are required for update."});
            }
        }
        if (updates.genre && typeof updates.genre === 'string') {
            updates.genre = updates.genre.split(',').map(g => g.trim()).filter(g => g);
        } else if (updates.genre === '') { 
            updates.genre = [];
        }

        if (updates.trackId) updates.trackId = parseInt(updates.trackId); // Ensure trackId is number
        if (updates.album) updates.album = parseInt(updates.album); 
        else if (updates.album === '') updates.album = null; 
        if (updates.duration_seconds) updates.duration_seconds = parseFloat(updates.duration_seconds);


        Object.assign(songToUpdate, updates);
        const updatedSongDoc = await songToUpdate.save();

        if (oldAudioPath) {
            try { if (fs.existsSync(oldAudioPath)) fs.unlinkSync(oldAudioPath); } 
            catch (e) { console.error("Error deleting old audio file during update:", e); }
        }
        if (oldCoverPath) {
            try { if (fs.existsSync(oldCoverPath)) fs.unlinkSync(oldCoverPath); }
            catch (e) { console.error("Error deleting old cover image during update:", e); }
        }
        
        const populatedSong = await populateSongDetails(updatedSongDoc);
        res.status(200).json(populatedSong);

    } catch (error) {
        console.error("Error updating song:", error);
         if (error.code === 11000) { 
             return res.status(409).json({ message: "Update failed. Song with this Track ID might already exist.", error: error.message });
        }
        if (req.files) {
            if (req.files.audioFile && req.files.audioFile[0] && updates.audio_url) {
                const newAudioPath = path.join(path.resolve(), 'server/uploads', updates.audio_url.replace(/^\//, ''));
                try { if (fs.existsSync(newAudioPath)) fs.unlinkSync(newAudioPath); } catch (e) { console.error("Error deleting new audio file on update failure:", e); }
            }
            if (req.files.coverImageFile && req.files.coverImageFile[0] && updates.cover_image_url) {
                const newCoverPath = path.join(path.resolve(), 'server/uploads', updates.cover_image_url.replace(/^\//, ''));
                 try { if (fs.existsSync(newCoverPath)) fs.unlinkSync(newCoverPath); } catch (e) { console.error("Error deleting new cover file on update failure:", e); }
            }
        }
        res.status(500).json({ message: "Server error updating song.", error: error.message });
    }
};
export const adminDeleteSong = async (req, res) => { // Copied from previous version
    try {
        const songId = req.params.id; 
         if (!mongoose.Types.ObjectId.isValid(songId)) {
            return res.status(400).json({ error: "Invalid Song ID format" });
        }
        const song = await Song.findById(songId);

        if (!song) {
            return res.status(404).json({ message: "Song not found." });
        }

        const audioFilePath = song.audio_url ? path.join(path.resolve(), 'server/uploads', song.audio_url.replace(/^\//, '')) : null;
        const coverImagePath = song.cover_image_url ? path.join(path.resolve(), 'server/uploads', song.cover_image_url.replace(/^\//, '')) : null;

        await Song.findByIdAndDelete(songId);

        if (audioFilePath) {
             try { if (fs.existsSync(audioFilePath)) fs.unlinkSync(audioFilePath); } 
             catch (e) { console.error("Error deleting audio file for song:", songId, e); }
        }
        if (coverImagePath) {
            try { if (fs.existsSync(coverImagePath)) fs.unlinkSync(coverImagePath); }
            catch (e) { console.error("Error deleting cover image for song:", songId, e); }
        }
        
        res.status(200).json({ message: "Song deleted successfully." });

    } catch (error) {
        console.error("Error deleting song:", error);
        res.status(500).json({ message: "Server error deleting song.", error: error.message });
    }
};

// --- Admin Artist CRUD Functions ---
export const adminCreateArtist = async (req, res) => {
    try {
        const { artistID, name, bio, country } = req.body;
        let imageUrl = '';

        if (!artistID || !name) {
            return res.status(400).json({ message: "Artist ID and Name are required." });
        }
        if (isNaN(parseInt(artistID))) {
            return res.status(400).json({ message: "Artist ID must be a number." });
        }

        if (req.files && req.files.artistImageFile && req.files.artistImageFile[0]) {
            imageUrl = `/artists/${req.files.artistImageFile[0].filename}`; // Path relative to '/uploads' static route
        }

        const newArtist = new Artist({
            artistID: parseInt(artistID),
            name,
            bio: bio || '',
            image_url: imageUrl,
            country: country || '',
            // Add other fields like 'genre' if your Artist schema supports it
        });

        const savedArtist = await newArtist.save();
        res.status(201).json(savedArtist);

    } catch (error) {
        console.error("Error creating artist:", error);
        if (req.files && req.files.artistImageFile && req.files.artistImageFile[0] && imageUrl) {
            const imagePath = path.join(path.resolve(), 'server/uploads', imageUrl.replace(/^\//, ''));
            fs.unlink(imagePath, err => {
                if (err) console.error("Error deleting orphaned artist image on creation failure:", err);
            });
        }
        if (error.code === 11000) { // Duplicate key error
            return res.status(409).json({ message: "Artist with this Artist ID already exists.", error: error.message });
        }
        res.status(500).json({ message: "Server error creating artist.", error: error.message });
    }
};

export const adminUpdateArtist = async (req, res) => {
    try {
        const artistNumericId = parseInt(req.params.id); // This is the numeric artistID
        if (isNaN(artistNumericId)) {
            return res.status(400).json({ message: "Invalid Artist ID format. Must be a number." });
        }

        const updates = req.body;
        let artistToUpdate = await Artist.findOne({ artistID: artistNumericId });

        if (!artistToUpdate) {
            return res.status(404).json({ message: "Artist not found." });
        }

        let oldImagePath;
        if (req.files && req.files.artistImageFile && req.files.artistImageFile[0]) {
            if (artistToUpdate.image_url) { // If there's an old image
                oldImagePath = path.join(path.resolve(), 'server/uploads', artistToUpdate.image_url.replace(/^\//, ''));
            }
            updates.image_url = `/artists/${req.files.artistImageFile[0].filename}`;
        }
        
        // Prevent changing artistID via this route if it's part of updates object
        if (updates.artistID && parseInt(updates.artistID) !== artistToUpdate.artistID) {
            return res.status(400).json({ message: "Artist ID cannot be changed via this method." });
        }
        delete updates.artistID; // Remove it from updates if present

        Object.assign(artistToUpdate, updates);
        const updatedArtist = await artistToUpdate.save();

        if (oldImagePath) { // Delete old image after successful save
            try { if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath); }
            catch (e) { console.error("Error deleting old artist image during update:", e); }
        }

        res.status(200).json(updatedArtist);

    } catch (error) {
        console.error("Error updating artist:", error);
        if (error.code === 11000) { // Duplicate key error (e.g. if name was unique and changed to existing)
             return res.status(409).json({ message: "Update failed due to a conflict (e.g. unique field violation).", error: error.message });
        }
        if (req.files && req.files.artistImageFile && req.files.artistImageFile[0] && updates.image_url) {
            const newImagePath = path.join(path.resolve(), 'server/uploads', updates.image_url.replace(/^\//, ''));
            try { if (fs.existsSync(newImagePath)) fs.unlinkSync(newImagePath); } catch(e){ console.error("Error deleting new artist image on update failure:", e);}
        }
        res.status(500).json({ message: "Server error updating artist.", error: error.message });
    }
};

export const adminDeleteArtist = async (req, res) => {
    try {
        const artistNumericId = parseInt(req.params.id);
        if (isNaN(artistNumericId)) {
            return res.status(400).json({ message: "Invalid Artist ID format. Must be a number." });
        }

        // Check if any songs are associated with this artist
        const songsByArtist = await Song.find({ artist: artistNumericId });
        if (songsByArtist.length > 0) {
            return res.status(400).json({ 
                message: `Cannot delete artist. ${songsByArtist.length} song(s) are associated with this artist. Please update or delete these songs first.`,
                songs: songsByArtist.map(s => ({ _id: s._id, title: s.title })) // Provide info about songs
            });
        }

        const artist = await Artist.findOneAndDelete({ artistID: artistNumericId });

        if (!artist) {
            return res.status(404).json({ message: "Artist not found." });
        }

        if (artist.image_url) {
            const imagePath = path.join(path.resolve(), 'server/uploads', artist.image_url.replace(/^\//, ''));
            try { if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath); }
            catch (e) { console.error("Error deleting artist image file for artistID:", artistNumericId, e); }
        }
        
        res.status(200).json({ message: "Artist deleted successfully." });

    } catch (error) {
        console.error("Error deleting artist:", error);
        res.status(500).json({ message: "Server error deleting artist.", error: error.message });
    }
};


// --- Admin Album CRUD Functions ---
export const adminCreateAlbum = async (req, res) => {
    try {
        const { album_id, title, artist, release_date, genre, description } = req.body; // artist is comma-separated artistIDs
        let coverImageUrl = '';

        if (!album_id || !title || !artist) {
            return res.status(400).json({ message: "Album ID, Title, and Artist ID(s) are required." });
        }
        if (isNaN(parseInt(album_id))) {
            return res.status(400).json({ message: "Album ID must be a number." });
        }
        
        const artistArray = artist.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        if (artistArray.length === 0) {
            return res.status(400).json({ message: "Valid Artist ID(s) (comma-separated numbers) are required." });
        }

        // Optional: Validate if artist IDs exist in the Artist collection
        // const existingArtists = await Artist.find({ artistID: { $in: artistArray } });
        // if (existingArtists.length !== artistArray.length) {
        //     return res.status(400).json({ message: "One or more artist IDs are invalid or do not exist." });
        // }


        if (req.files && req.files.albumImageFile && req.files.albumImageFile[0]) {
            coverImageUrl = `/covers/${req.files.albumImageFile[0].filename}`; // Using 'covers' path
        }
        
        const genreArray = genre ? genre.split(',').map(g => g.trim()).filter(g => g) : [];

        const newAlbum = new Album({
            album_id: parseInt(album_id),
            title,
            artist: artistArray, // Store as an array of numbers (artistIDs)
            release_date: release_date ? new Date(release_date) : undefined,
            genre: genreArray,
            cover_image_url: coverImageUrl,
            description: description || '',
        });

        const savedAlbum = await newAlbum.save();
        res.status(201).json(savedAlbum);

    } catch (error) {
        console.error("Error creating album:", error);
        if (req.files && req.files.albumImageFile && req.files.albumImageFile[0] && coverImageUrl) {
             const imagePath = path.join(path.resolve(), 'server/uploads', coverImageUrl.replace(/^\//, ''));
            fs.unlink(imagePath, err => {
                if (err) console.error("Error deleting orphaned album image on creation failure:", err);
            });
        }
        if (error.code === 11000) {
            return res.status(409).json({ message: "Album with this Album ID already exists.", error: error.message });
        }
        res.status(500).json({ message: "Server error creating album.", error: error.message });
    }
};

export const adminUpdateAlbum = async (req, res) => {
    try {
        const albumNumericId = parseInt(req.params.id); // This is the numeric album_id
        if (isNaN(albumNumericId)) {
            return res.status(400).json({ message: "Invalid Album ID format. Must be a number." });
        }

        const updates = req.body;
        let albumToUpdate = await Album.findOne({ album_id: albumNumericId });

        if (!albumToUpdate) {
            return res.status(404).json({ message: "Album not found." });
        }
        
        let oldImagePath;
        if (req.files && req.files.albumImageFile && req.files.albumImageFile[0]) {
            if (albumToUpdate.cover_image_url) {
                oldImagePath = path.join(path.resolve(), 'server/uploads', albumToUpdate.cover_image_url.replace(/^\//, ''));
            }
            updates.cover_image_url = `/covers/${req.files.albumImageFile[0].filename}`;
        }

        if (updates.artist && typeof updates.artist === 'string') {
            updates.artist = updates.artist.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            if (updates.artist.length === 0) {
                 return res.status(400).json({ message: "Valid Artist ID(s) are required for update." });
            }
        }
        if (updates.genre && typeof updates.genre === 'string') {
            updates.genre = updates.genre.split(',').map(g => g.trim()).filter(g => g);
        } else if (updates.genre === '') {
            updates.genre = [];
        }
        if (updates.release_date) {
            updates.release_date = new Date(updates.release_date);
        } else if (updates.release_date === '') {
            updates.release_date = undefined; // Or null, depending on schema
        }

        // Prevent changing album_id
        if (updates.album_id && parseInt(updates.album_id) !== albumToUpdate.album_id) {
             return res.status(400).json({ message: "Album ID cannot be changed." });
        }
        delete updates.album_id;

        Object.assign(albumToUpdate, updates);
        const updatedAlbum = await albumToUpdate.save();

        if (oldImagePath) {
            try { if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath); }
            catch (e) { console.error("Error deleting old album image during update:", e); }
        }

        res.status(200).json(updatedAlbum);

    } catch (error) {
        console.error("Error updating album:", error);
         if (error.code === 11000) { 
             return res.status(409).json({ message: "Update failed due to a conflict.", error: error.message });
        }
        if (req.files && req.files.albumImageFile && req.files.albumImageFile[0] && updates.cover_image_url) {
            const newImagePath = path.join(path.resolve(), 'server/uploads', updates.cover_image_url.replace(/^\//, ''));
            try { if (fs.existsSync(newImagePath)) fs.unlinkSync(newImagePath); } catch(e){console.error("Error deleting new album image on update failure:", e);}
        }
        res.status(500).json({ message: "Server error updating album.", error: error.message });
    }
};

export const adminDeleteAlbum = async (req, res) => {
    try {
        const albumNumericId = parseInt(req.params.id);
        if (isNaN(albumNumericId)) {
            return res.status(400).json({ message: "Invalid Album ID format. Must be a number." });
        }

        // Check if any songs are associated with this album
        const songsInAlbum = await Song.find({ album: albumNumericId });
        if (songsInAlbum.length > 0) {
            return res.status(400).json({ 
                message: `Cannot delete album. ${songsInAlbum.length} song(s) are associated with this album. Please update or delete these songs first.`,
                songs: songsInAlbum.map(s => ({ _id: s._id, title: s.title }))
            });
        }

        const album = await Album.findOneAndDelete({ album_id: albumNumericId });

        if (!album) {
            return res.status(404).json({ message: "Album not found." });
        }

        if (album.cover_image_url) {
            const imagePath = path.join(path.resolve(), 'server/uploads', album.cover_image_url.replace(/^\//, ''));
            try { if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath); }
            catch (e) { console.error("Error deleting album image file for album_id:", albumNumericId, e); }
        }

        res.status(200).json({ message: "Album deleted successfully." });

    } catch (error) {
        console.error("Error deleting album:", error);
        res.status(500).json({ message: "Server error deleting album.", error: error.message });
    }
};


// --- Existing Public Artist/Album Functions (getArtistById, getAllArtists, etc.) ---
// ... (Keep all existing public functions like getArtistById, getAlbumById, getAllArtists, getAllAlbums, getSongsByArtist, debugArtist as they are)
// For brevity, I'm omitting these here. Ensure they correctly handle numeric IDs.

export const getArtistById = async (req, res) => {
    try {
        const artistId = parseInt(req.params.id); // Expects numeric artistID from route param :id
        if (isNaN(artistId)) {
            return res.status(400).json({error: "Invalid artist ID format. Must be a number."});
        }
        const artist = await Artist.findOne({artistID: artistId});
        if (!artist) {
            return res.status(404).json({error: "Artist not found"});
        }
        res.status(200).json(artist);
    } catch (error) {
        console.error(`Error fetching artist by ID ${req.params.id}:`, error);
        res.status(500).json({error: error.message});
    }
};

export const getAlbumById = async (req, res) => {
    try {
        const albumId = parseInt(req.params.id); // Expects numeric album_id from route param :id
         if (isNaN(albumId)) {
            return res.status(400).json({error: "Invalid album ID format. Must be a number."});
        }
        // const album = await Album.findOne({album_id: albumId});
        // Populate artist details for the album
        const albumDoc = await Album.findOne({album_id: albumId});

        if (!albumDoc) {
            return res.status(404).json({error: "Album not found"});
        }

        const album = albumDoc.toObject();
        if (album.artist && album.artist.length > 0) {
            try {
                const artistIDs = album.artist.map(id => Number(id)).filter(id => !isNaN(id));
                 if (artistIDs.length > 0) {
                    album.artistDetails = await Artist.find({ artistID: { $in: artistIDs } });
                } else {
                    album.artistDetails = [];
                }
            } catch (e) {
                console.error("Error populating artists for album:", e);
                album.artistDetails = [];
            }
        } else {
            album.artistDetails = [];
        }
        res.status(200).json(album);

    } catch (error) {
        console.error(`Error fetching album by ID ${req.params.id}:`, error);
        res.status(500).json({error: error.message});
    }
};

export const getAllArtists = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 200; // Increased default limit for admin views
        const skip = (page - 1) * limit;
        
        const artists = await Artist.find({})
            .sort({ name: 1 }) // Sort by name
            .skip(skip)
            .limit(limit);
            
        const totalArtists = await Artist.countDocuments();
        
        res.status(200).json({
            artists, // Ensure this is the correct structure expected by frontend
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalArtists / limit),
                totalArtists,
                artistsPerPage: limit
            }
        });
    } catch (error) {
        console.error("Error fetching all artists:", error);
        res.status(500).json({error: error.message});
    }
};

export const getAllAlbums = async (req, res) => {
     try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 200; // Increased default limit
        const skip = (page - 1) * limit;
        
        // const albums = await Album.find({}) // Original
        //     .skip(skip)
        //     .limit(limit);

        const albumDocs = await Album.find({})
            .sort({ title: 1 }) // Sort by title
            .skip(skip)
            .limit(limit);
            
        const totalAlbums = await Album.countDocuments();

        // Populate artist details for each album
        const albumsWithArtistDetails = await Promise.all(albumDocs.map(async (albumDoc) => {
            const album = albumDoc.toObject();
            if (album.artist && album.artist.length > 0) {
                 try {
                    const artistIDs = album.artist.map(id => Number(id)).filter(id => !isNaN(id));
                    if (artistIDs.length > 0) {
                        album.artistDetails = await Artist.find({ artistID: { $in: artistIDs } }, { name: 1, artistID: 1, _id: 0 }); // Only fetch name and ID
                    } else {
                        album.artistDetails = [];
                    }
                } catch (e) {
                    console.error("Error populating artists for album list item:", e);
                    album.artistDetails = [];
                }
            } else {
                album.artistDetails = [];
            }
            return album;
        }));
        
        res.status(200).json({
            albums: albumsWithArtistDetails, // Ensure this is the correct structure
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalAlbums / limit),
                totalAlbums,
                albumsPerPage: limit
            }
        });
    } catch (error) {
        console.error("Error fetching all albums:", error);
        res.status(500).json({error: error.message});
    }
};

export const getSongsByArtist = async (req, res) => {
    try {
        let artistId = req.params.artistId;
        let parsedArtistId = parseInt(artistId);
        
        if (isNaN(parsedArtistId)) {
            return res.status(400).json({ error: "Invalid artist ID" });
        }
        const songDocs = await Song.find({ artist: parsedArtistId }).limit(100); 
        const songsWithDetails = await Promise.all(songDocs.map(doc => populateSongDetails(doc)));
        
        res.status(200).json(songsWithDetails);
    } catch (error) {
        console.error(`API: Error getting songs for artist ID ${req.params.artistId}:`, error);
        res.status(500).json({ error: error.message });
    }
};

export const debugArtist = async (req, res) => {
    try {
        const artistId = req.params.id;
        const parsedId = parseInt(artistId);
         res.status(200).json({message: "Debug endpoint for artist (not fully implemented with new population).", originalId: artistId, parsedId});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};