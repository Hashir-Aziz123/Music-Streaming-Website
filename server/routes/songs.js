import express from "express";
import {
    getSongs, 
    getSongById, 
    insertSong, 
    getArtistById, 
    getAlbumById,
    getSongDetails,
    getAllArtists,
    getAllAlbums
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

// Album routes
router.get('/albums', getAllAlbums);
router.get('/album/:id', getAlbumById);

export default router;