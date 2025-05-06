import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from "url";

import songRoutes from './routes/songs.js';
import authRoutes from './routes/auth.js';

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
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

// for static files
app.use('/uploads', express.static(`${__dirname}/uploads`));

app.use('/api/songs', songRoutes);
app.use('/api/auth', authRoutes);

// connect to db and start listening
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("Connected to DB");
})
.catch((err) => console.log(err));

// listen to requests
app.listen(process.env.PORT, () => console.log(`Listening at port ${process.env.PORT}`));