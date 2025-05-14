import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from "url";

import songRoutes from './routes/songs.js';
import authRoutes from './routes/auth.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import playlistRoutes from './routes/playlists.js';
import listeningHistoryRoutes from './routes/listeningHistory.js';
import libraryRoutes from './routes/libraryRoutes.js';
import likesRoutes from './routes/likesRoutes.js';
import listeningRoute from "./routes/listeningRoute.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// create app and use middlewares
const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

// for static files
app.use('/uploads', express.static(`${__dirname}/uploads`));

app.use('/api/songs', songRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/listening', listeningRoute)
app.use('/api/library', libraryRoutes);
app.use('/api/history', listeningHistoryRoutes);
app.use('/api/likes', likesRoutes);

// connect to db and start listening
mongoose.connect("mongodb://localhost:27017/driftDB")
.then(() => {
    console.log("Connected to DB");
})
.catch((err) => console.log(err));

// listen to requests
app.listen(process.env.PORT, () => console.log(`Listening at port ${process.env.PORT}`));