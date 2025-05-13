import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addSongToPlaylist,
    removeSongFromPlaylist,
    updatePlaylist,
    deletePlaylist
} from "../controllers/playlists.js";

const router = express.Router();

router.use(verifyToken);

router.post('/create', createPlaylist);
router.get('/user/:userId', getUserPlaylists);
router.get('/:id', getPlaylistById);
router.patch('/:id', updatePlaylist);
router.delete('/:id', deletePlaylist);

router.post('/:playlistId/songs/:songId', addSongToPlaylist);
router.delete('/:playlistId/songs/:songId', removeSongFromPlaylist);

export default router;