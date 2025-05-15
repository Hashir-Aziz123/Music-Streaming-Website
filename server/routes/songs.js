import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs"; 

import {
    // Public song controllers
    getSongs, getSongById, getSongDetails,
    // Public artist controllers
    getAllArtists, getArtistById, getSongsByArtist, debugArtist,
    // Public album controllers
    getAllAlbums, getAlbumById,
    // Admin Song CRUD
    adminCreateSong, adminUpdateSong, adminDeleteSong, adminGetSongById,
    // Admin Artist CRUD (New)
    adminCreateArtist, adminUpdateArtist, adminDeleteArtist,
    // Admin Album CRUD (New)
    adminCreateAlbum, adminUpdateAlbum, adminDeleteAlbum
} from "../controllers/songs.js"; 

import { verifyToken } from "../middleware/auth.js"; 
import { isAdmin } from "../middleware/adminAuth.js"; 

const router = express.Router();

// --- Multer Setup for File Uploads ---
const baseUploadPath = path.join(path.resolve(), 'server/uploads');
const audioUploadPath = path.join(baseUploadPath, 'songs/fma_small/');
const coverImageUploadPath = path.join(baseUploadPath, 'covers/'); // For song and album covers
const artistImageUploadPath = path.join(baseUploadPath, 'artists/'); // New path for artist images

// Ensure upload directories exist
[audioUploadPath, coverImageUploadPath, artistImageUploadPath].forEach(dirPath => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === "audioFile") {
            cb(null, audioUploadPath);
        } else if (file.fieldname === "coverImageFile" || file.fieldname === "albumImageFile") { // albumImageFile uses 'covers' path
            cb(null, coverImageUploadPath);
        } else if (file.fieldname === "artistImageFile") {
            cb(null, artistImageUploadPath);
        } else {
            cb(new Error("Invalid file fieldname for upload destination"), null);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === "audioFile") {
        if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/wav' || file.mimetype === 'audio/ogg') {
            cb(null, true);
        } else {
            cb(new Error('Only .mp3, .wav, .ogg audio files are allowed for audioFile!'), false);
        }
    } else if (file.fieldname === "coverImageFile" || file.fieldname === "artistImageFile" || file.fieldname === "albumImageFile") {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
            cb(null, true);
        } else {
            cb(new Error('Only .jpeg, .png, .gif image files are allowed for images!'), false);
        }
    } else {
        cb(new Error("Invalid file type for filtering"), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 20 // 20MB limit (adjust as needed)
    },
    fileFilter: fileFilter
});

// === Public Song Routes ===
router.get('/', getSongs); 
router.get('/song/:id', getSongById); // :id is MongoDB ObjectId
router.get('/song/:id/details', getSongDetails);

// === Public Artist Routes ===
router.get('/artists', getAllArtists);
router.get('/artist/:id', getArtistById); // :id is numeric artistID
router.get('/artist/:artistId/songs', getSongsByArtist); // :artistId is numeric artistID
router.get('/debug/artist/:id', debugArtist); // :id is numeric artistID

// === Public Album Routes ===
router.get('/albums', getAllAlbums);
router.get('/album/:id', getAlbumById); // :id is numeric album_id

// === Admin Song CRUD Routes ===
// Note: upload.fields should list all potential file fields for any admin POST/PUT route using it.
const adminUploadFields = upload.fields([
    { name: 'audioFile', maxCount: 1 }, 
    { name: 'coverImageFile', maxCount: 1 }, // For song covers
    { name: 'artistImageFile', maxCount: 1 }, // For artist images
    { name: 'albumImageFile', maxCount: 1 }   // For album covers
]);

router.post('/admin/song', verifyToken, isAdmin, adminUploadFields, adminCreateSong);
// router.post('/admin/song', verifyToken, isAdmin, adminCreateSong);
router.get('/admin', verifyToken, isAdmin, getSongs); // Reusing public getSongs, or create adminGetSongs
router.get('/admin/song/:id', verifyToken, isAdmin, adminGetSongById); // :id is MongoDB ObjectId
// router.put('/admin/song/:id', verifyToken, isAdmin, adminUploadFields, adminUpdateSong); // :id is MongoDB ObjectId
router.put('/admin/song/:id', verifyToken, isAdmin, adminUpdateSong); // :id is MongoDB ObjectId
router.delete('/admin/song/:id', verifyToken, isAdmin, adminDeleteSong); // :id is MongoDB ObjectId


// === Admin Artist CRUD Routes (New) ===
// router.post('/admin/artist', verifyToken, isAdmin, adminUploadFields, adminCreateArtist);
router.post('/admin/artist', verifyToken, isAdmin, adminCreateArtist);
router.get('/admin/artists', verifyToken, isAdmin, getAllArtists); // Reusing public getAllArtists
router.get('/admin/artist/:id', verifyToken, isAdmin, getArtistById); // :id is numeric artistID, reusing public getArtistById
// router.put('/admin/artist/:id', verifyToken, isAdmin, adminUploadFields, adminUpdateArtist); // :id is numeric artistID
router.put('/admin/artist/:id', verifyToken, isAdmin, adminUpdateArtist); // :id is numeric artistID
router.delete('/admin/artist/:id', verifyToken, isAdmin, adminDeleteArtist); // :id is numeric artistID


// === Admin Album CRUD Routes (New) ===
// router.post('/admin/album', verifyToken, isAdmin, adminUploadFields, adminCreateAlbum);
router.post('/admin/album', verifyToken, isAdmin, adminCreateAlbum);
router.get('/admin/albums', verifyToken, isAdmin, getAllAlbums); // Reusing public getAllAlbums
router.get('/admin/album/:id', verifyToken, isAdmin, getAlbumById); // :id is numeric album_id, reusing public getAlbumById
// router.put('/admin/album/:id', verifyToken, isAdmin, adminUploadFields, adminUpdateAlbum); // :id is numeric album_id
router.put('/admin/album/:id', verifyToken, isAdmin, adminUpdateAlbum); // :id is numeric album_id
router.delete('/admin/album/:id', verifyToken, isAdmin, adminDeleteAlbum); // :id is numeric album_id


export default router;
