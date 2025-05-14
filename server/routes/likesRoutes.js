import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
    toggleLikeSong,
    getSongLikedStatus,
    getLikedSongs,
} from "../controllers/likes.js";

const router = express.Router();

// Require authentication for all routes
router.use(verifyToken);

// Get all liked songs for the authenticated user
router.get('/', getLikedSongs);

// Get liked songs for a specific user (only if it's the auth user)
router.get('/user/:userId', getLikedSongs);

// Check if a song is liked by the user
router.get('/song/:songId', getSongLikedStatus);

// Toggle like status for a song
router.post('/song/:songId/toggle', toggleLikeSong);

export default router;
