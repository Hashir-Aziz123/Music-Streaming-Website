import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
    addListeningRecord,
    getUserHistory,
    getAllUsersHistory,
    getUserStats
} from "../controllers/listeningHistory.js";

const router = express.Router();

router.use(verifyToken);

router.post('/', addListeningRecord);
router.get('/user/:userId', getUserHistory);
router.get('/all', getAllUsersHistory);
router.get('/stats/:userId', getUserStats);

export default router;