import express from "express";
import {logListening} from "../controllers/listeningController.js";

const router = express.Router();
router.post('/log' , logListening);
export default router;