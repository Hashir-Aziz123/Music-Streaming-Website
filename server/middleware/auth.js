import jwt from 'jsonwebtoken';
import { User } from '../db_entities.js';

const JWTSECRET = 'JWTSECRET';

export const verifyToken = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(400).json({message: 'Access denied: No JWT provided'});

    try {
        const decoded = jwt.verify(token, JWTSECRET);
        const user = await User.findById(decoded.id).select('-passwordhash');

        if (!user) {
            res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            dob: user.dob,
            country: user.country
        };

        next();
    } catch(err) {
        console.error('JWT verification error:', err.message);
        res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
        if (err.name === 'TokenExpiredError')
            return res.status(401).json({ message: 'Session expired' });
        return res.status(403).json({ message: 'Invalid token' });
    }
}