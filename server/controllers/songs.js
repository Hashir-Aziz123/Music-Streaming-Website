import { Song } from "../db_entities.js";

export const getSongs = async (req, res) => {
    try {
        const songs = await Song.find({});
        res.status(200).json(songs);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getSongById = async (req, res) => {
    return res.status(404).send('lol no');
};

export const insertSong = async (req, res) => {
    try {
        const song = await Song.create(req.body);
        res.status(200).json(song);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};