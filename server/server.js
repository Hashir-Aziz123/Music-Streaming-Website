import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import {Song} from "./db_entities.js";

dotenv.config();

// create app and use middlewares
const app = express();
// app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

// song-related routes
// get a bunch of songs (currently all songs are sent. probably send pages of songs?)
app.get('/api/songs', async (req, res) => {
    const songs = await Song.find({});
    res.status(200).json(songs);
});

// get a single song (still to be implemented)
app.get('/api/songs/:id', (req, res) => {

});

// insert a single song (still to be implemented)
app.post('/api/songs', async (req, res) => {
    try {
        const song = await Song.create(req.body);
        res.status(200).json(song);
    }
    catch (error) {
        res.status(400).json({error: error.message});
    }
});

// connect to db and start listening
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true,})
.then(() => {
    console.log("Connected to DB");
    
    // remove this
    /*
    async function foo ()
    {
        let songs = [
            {
                title: "SoundHelix Song 1",
                artist: "T. Schürger",
                album: "SoundHelix Examples",
                duration_seconds: 373,
                cover_image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi1.sndcdn.com%2Favatars-000311378190-t4oy7m-t1080x1080.jpg&f=1&nofb=1&ipt=b513da7e2753bd03c02d306017b002ea4547325c38759f0af14f99a4bdc39008",
                audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                decription: "Algorithmic generated songs by SoundHelix."
            },
            {
                title: "SoundHelix Song 2",
                artist: "T. Schürger",
                album: "SoundHelix Examples",
                duration_seconds: 426,
                cover_image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi1.sndcdn.com%2Favatars-000311378190-t4oy7m-t1080x1080.jpg&f=1&nofb=1&ipt=b513da7e2753bd03c02d306017b002ea4547325c38759f0af14f99a4bdc39008",
                audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                decription: "Algorithmic generated songs by SoundHelix."
            },
            {
                title: "SoundHelix Song 3",
                artist: "T. Schürger",
                album: "SoundHelix Examples",
                duration_seconds: 344,
                cover_image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi1.sndcdn.com%2Favatars-000311378190-t4oy7m-t1080x1080.jpg&f=1&nofb=1&ipt=b513da7e2753bd03c02d306017b002ea4547325c38759f0af14f99a4bdc39008",
                audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
                decription: "Algorithmic generated songs by SoundHelix."
            },
            {
                title: "SoundHelix Song 4",
                artist: "T. Schürger",
                album: "SoundHelix Examples",
                duration_seconds: 303,
                cover_image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi1.sndcdn.com%2Favatars-000311378190-t4oy7m-t1080x1080.jpg&f=1&nofb=1&ipt=b513da7e2753bd03c02d306017b002ea4547325c38759f0af14f99a4bdc39008",
                audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
                decription: "Algorithmic generated songs by SoundHelix."
            },
            {
                title: "SoundHelix Song 5",
                artist: "T. Schürger",
                album: "SoundHelix Examples",
                duration_seconds: 354,
                cover_image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi1.sndcdn.com%2Favatars-000311378190-t4oy7m-t1080x1080.jpg&f=1&nofb=1&ipt=b513da7e2753bd03c02d306017b002ea4547325c38759f0af14f99a4bdc39008",
                audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
                decription: "Algorithmic generated songs by SoundHelix."
            },
            {
                title: "SoundHelix Song 6",
                artist: "T. Schürger",
                album: "SoundHelix Examples",
                duration_seconds: 280,
                cover_image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi1.sndcdn.com%2Favatars-000311378190-t4oy7m-t1080x1080.jpg&f=1&nofb=1&ipt=b513da7e2753bd03c02d306017b002ea4547325c38759f0af14f99a4bdc39008",
                audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
                decription: "Algorithmic generated songs by SoundHelix."
            },
            {
                title: "SoundHelix Song 7",
                artist: "T. Schürger",
                album: "SoundHelix Examples",
                duration_seconds: 421,
                cover_image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi1.sndcdn.com%2Favatars-000311378190-t4oy7m-t1080x1080.jpg&f=1&nofb=1&ipt=b513da7e2753bd03c02d306017b002ea4547325c38759f0af14f99a4bdc39008",
                audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
                decription: "Algorithmic generated songs by SoundHelix."
            },
        ];

        for (let i = 0; i < songs.length; i++)
        {
            let song = await Song.create(songs[i]);
        }

        console.log('songs inserted for testing');
    }
    foo().catch(error => console.error("Error seeding database:", error));
    */
})
.catch((err) => console.log(err));

// listen to requests
app.listen(process.env.PORT, () => console.log(`Listening at port ${process.env.PORT}`));
