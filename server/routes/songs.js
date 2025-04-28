import express from "express";

import { 
    getSongs, 
    getSongById, 
    insertSong 
} from "../controllers/songs.js";

const router = express.Router();

router.get('/', getSongs);
router.get('/:id', getSongById);
router.post('/', insertSong);

export default router;