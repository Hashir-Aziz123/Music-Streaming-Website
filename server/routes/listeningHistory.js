import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
    addListeningRecord,
    getUserHistory,
    getAllUsersHistory,
    getUserStats,
    getGlobalStats
} from "../controllers/listeningHistory.js";

const router = express.Router();

router.use(verifyToken);

router.post('/', addListeningRecord);
router.get('/user/:userId', getUserHistory);
router.get('/all', getAllUsersHistory);
router.get('/stats/:userId', getUserStats);
router.get('/global-stats', getGlobalStats);

export default router;