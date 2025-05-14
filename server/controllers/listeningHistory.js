import { Listening_History, User, Song } from "../db_entities.js";

export const addListeningRecord = async (req, res) => {
    try {
        const { trackId, duration_listened } = req.body;
        const userId = req.user.id;

        const song = await Song.findOne({ trackId });
        if (!song) {
            return res.status(404).json({ error: "Song not found" });
        }

        const record = await Listening_History.create({
            user: userId,
            song: song._id,
            duration_listened: duration_listened
        });

        res.status(201).json(record);
    } catch (error) {
        console.error('Error adding listening record:', error);
        res.status(400).json({ error: error.message });
    }
};

export const getUserHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        if (userId !== requestingUser.id && requestingUser.role !== 'admin') {
            return res.status(403).json({ 
                error: "Not authorized to view this user's history" 
            });
        }

        const history = await Listening_History.find({ user: userId })
            .populate({
                path: 'song',
                select: 'trackId title artist duration_seconds cover_image_url'
            })
            .sort({ listened_at: -1 })
            .limit(50);

        res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching listening history:', error);
        res.status(400).json({ error: error.message });
    }
};

export const getAllUsersHistory = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                error: "Only administrators can access all users' history" 
            });
        }

        const history = await Listening_History.find()
            .populate({
                path: 'song',
                select: 'trackId title artist duration_seconds'
            })
            .populate({
                path: 'user',
                select: 'username email'
            })
            .sort({ listened_at: -1 })
            .limit(100);

        res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching all listening history:', error);
        res.status(400).json({ error: error.message });
    }
};