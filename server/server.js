import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from 'cors';

import songRoutes from './routes/songs.js';
import authRoutes from './routes/auth.js';

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

app.use('/api/songs', songRoutes);
app.use('/api/auth', authRoutes);

// connect to db and start listening
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true,})
.then(() => {
    console.log("Connected to DB");
})
.catch((err) => console.log(err));

// listen to requests
app.listen(process.env.PORT, () => console.log(`Listening at port ${process.env.PORT}`));