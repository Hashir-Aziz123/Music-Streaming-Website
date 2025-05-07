import express from "express";
import {
    getAllArtists,
    getArtistById
} from "../controllers/artists.js";

const router = express.Router();

router.get('/', getAllArtists);
router.get('/:id', getArtistById);

export default router;