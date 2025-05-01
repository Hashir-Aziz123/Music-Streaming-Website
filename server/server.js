import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";    
import songRoutes from './routes/songs.js';

dotenv.config();

// create app and use middlewares
const app = express();
// app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

app.use('/api/songs', songRoutes);

// connect to db and start listening
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true,})
.then(() => {
    console.log("Connected to DB");
})
.catch((err) => console.log(err));

// listen to requests
app.listen(process.env.PORT, () => console.log(`Listening at port ${process.env.PORT}`));