import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { User } from "../db_entities.js";

const JWTSECRET = 'JWTSECRET';

const registerUser = async (req, res) => {
    try {
        const { username, email, password, dob, country } = req.body;
        console.log(req.body);
        const exisitingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (exisitingUser) return res.status(400).json({'message': 'Username or email already exists'});

        const password_hash = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password_hash, dob, country });
        await user.save();
        
        //Auto-login user
        const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWTSECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true
        });
        
        res.status(201).json({'message': 'User registered and logged in successfully'});
    } catch (err) {
        res.status(500).json({'message': 'Error: ' + err});
    }
}

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({'message': 'User does not exist'});

        const existingUser = await bcrypt.compare(password, user.password_hash);
        if (!existingUser) return res.status(400).json({'message': 'Incorrect password'});

        const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWTSECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true
        });

        res.status(200).json({'message': 'Login successful'});
    } catch (err) {
        res.status(500).json({'message': 'Server error'});
    }
}

export { registerUser, loginUser };