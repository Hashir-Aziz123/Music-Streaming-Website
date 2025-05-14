import express from "express";
import { search, searchMore } from "../controllers/search.js";

const router = express.Router();

// Search across all content types
router.get('/', search);

// Search more results for a specific content type
router.get('/more', searchMore);

export default router;
