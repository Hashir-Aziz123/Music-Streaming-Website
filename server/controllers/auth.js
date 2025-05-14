// /controllers/auth.js

// import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import cookieParser from "cookie-parser";
import { User, Playlist, Listening_History } from "../db_entities.js";

const JWTSECRET = 'JWTSECRET';

// const updateProfile = async (req, res) => {
//     try {
//         const { username, email, dob, country } = req.body;
//         // current user id: req.user.id
//         console.log(req.body);

//         const currentUser = await User.findOne({ _id: req.user.id });
        
//     }
// }

const updateProfile = async (req, res) => {
    try {
        const { username, email, dob, country } = req.body;
        const userId = req.user.id;

        if (!username || !email) {
            return res.status(400).json({ message: 'Username and email are required' });
        }

        const existingUser = await User.findOne({
            $and: [
                { _id: { $ne: userId } },
                { $or: [{ username }, { email }] }
            ]
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: 'Username or email already taken by another user' 
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                username,
                email,
                dob: dob || undefined,
                country: country || undefined
            },
            { 
                new: true,
                select: '-password_hash' 
            }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (username !== req.user.username) {
            const newToken = jwt.sign(
                { 
                    id: updatedUser._id, 
                    username: updatedUser.username, 
                    role: updatedUser.role 
                }, 
                JWTSECRET, 
                { expiresIn: '1h' }
            );
            
            res.cookie('token', newToken, {
                httpOnly: true,
                // secure: process.env.NODE_ENV === 'production',
                // sameSite: 'lax',
                // maxAge: 3600000 // 1 hour
            });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                dob: updatedUser.dob,
                country: updatedUser.country
            }
        });

    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ message: 'Server error during profile update' });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                message: 'Current password and new password are required' 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const new_password_hash = await bcrypt.hash(newPassword, 10);
        user.password_hash = new_password_hash;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });

    } catch (err) {
        console.error('Password update error:', err);
        res.status(500).json({ message: 'Server error during password update' });
    }
};

const registerUser = async (req, res) => {
    try {
        const { username, email, password, dob, country } = req.body;
        console.log(req.body);

        if (!username || !email || !password)
            return res.status(400).json({ message: 'Username, email and password are required' });

        const exisitingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (exisitingUser)
            return res.status(400).json({ message: 'Username or email already exists' });

        const password_hash = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password_hash, dob, country });
        await user.save();
        
        //Auto-login user
        const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWTSECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true
        });
        
        res.status(201).json({
            message: 'User registered and logged in successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                dob: user.dob,
                country: user.country
            }
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({message: 'Server error during registration'});
    }
}

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password)
            return res.status(400).json({ message: 'Username and password are required' });

        const user = await User.findOne({ username });
        if (!user)
            return res.status(400).json({ message: 'User does not exist' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch)
            return res.status(400).json({ message: 'Incorrect password' });

        const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWTSECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true
        });

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                dob: user.dob,
                country: user.country
            }
        });
    } catch (err) {
        console.error('Login error:', err)
        res.status(500).json({ message: 'Server error' });
    }
}

const logoutUser = async (req, res) => {
    try {
        res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
        res.status(302).set('Location', '/').send('Succesfully logged out. Redirecting...');
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

const checkAuthStatus = async (req, res) => {
    res.status(200).send({ message: 'Authenticated', user: req.user });
}

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        const isAdmin = requestingUser.role === 'admin';
        const isOwner = requestingUser.id.toString() === userId;

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ 
                message: 'Not authorized to delete this user' 
            });
        }

        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found' });
        }

        await Promise.all([
            Playlist.deleteMany({ _id: { $in: userToDelete.playlists } }),
            Listening_History.deleteMany({ user: userId }),
            User.findByIdAndDelete(userId)
        ]);

        if (isOwner) {
            res.cookie('token', '', { 
                httpOnly: true, 
                expires: new Date(0),
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production'
            });
        }

        res.status(200).json({ 
            message: 'User and associated data deleted successfully' 
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ 
            message: 'Server error while deleting user',
            error: error.message 
        });
    }
};

export { registerUser, loginUser, logoutUser, updateProfile, updatePassword, checkAuthStatus, deleteUser };