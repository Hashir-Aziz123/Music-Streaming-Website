import express from "express";
import {
    getSongs, 
    getSongById, 
    insertSong, 
    getArtistById, 
    getAlbumById,
    getSongDetails,
    getAllArtists,
    getAllAlbums,
    getSongsByArtist,
    debugArtist
} from "../controllers/songs.js";

const router = express.Router();

// Song routes
router.get('/', getSongs);
router.get('/song/:id', getSongById);
router.get('/song/:id/details', getSongDetails);
router.post('/', insertSong);

// Artist routes
router.get('/artists', getAllArtists);
router.get('/artist/:id', getArtistById);
router.get('/artist/:artistId/songs', getSongsByArtist);
router.get('/debug/artist/:id', debugArtist);

// Album routes
router.get('/albums', getAllAlbums);
router.get('/album/:id', getAlbumById);

export default router;