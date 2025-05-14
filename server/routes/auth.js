import express from 'express';

import { verifyToken } from '../middleware/auth.js';
import {
    registerUser,
    loginUser,
    logoutUser,
    updateProfile,
    updatePassword,
    checkAuthStatus,
    deleteUser
} from '../controllers/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/status', verifyToken, checkAuthStatus);
router.post('/update', verifyToken, updateProfile);
router.post('/update/password', verifyToken, updatePassword);
router.post('/delete/:userId', verifyToken, deleteUser);

export default router;