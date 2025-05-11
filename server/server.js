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
// temp testing endpoint
app.get('/api/playlists/:id', (req, res) => {
    const playlists = [
        { id: 1, title: "Chill Vibes", creator: "You", imageUrl: "https://placehold.co/400/111/e75454?text=Chill" },
        { id: 2, title: "Workout Mix", creator: "You", imageUrl: "https://placehold.co/400/222/e75454?text=Workout" },
        { id: 3, title: "Focus Flow", creator: "You", imageUrl: "https://placehold.co/400/333/e75454?text=Focus" },
        { id: 4, title: "Throwbacks", creator: "You", imageUrl: "https://placehold.co/400/444/e75454?text=Throwbacks" },
        { id: 5, title: "New Discoveries", creator: "You", imageUrl: "https://placehold.co/400/555/e75454?text=New" }
    ];
    res.send(playlists);
});
app.use('/api', recommendationRoutes);

// connect to db and start listening
mongoose.connect("mongodb://localhost:27017/driftDB")
.then(() => {
    console.log("Connected to DB");
})
.catch((err) => console.log(err));

// listen to requests
app.listen(process.env.PORT, () => console.log(`Listening at port ${process.env.PORT}`));