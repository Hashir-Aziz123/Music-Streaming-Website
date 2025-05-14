import mongoose from 'mongoose';
import {Song, User , Listening_History } from '../db_entities.js';
import {generateListeningSummary} from "../services/summaryService.js";

async function insertSampleListeningHistory() {
    try {
        await mongoose.connect( "mongodb://localhost:27017/driftDB", { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        const users = await User.find().limit(3); // Get 3 users
        const songs = await Song.find().limit(5); // Get 5 songs

        if (users.length === 0 || songs.length === 0) {
            console.warn('Please make sure you have at least 3 users and 5 songs in your database.');
            await mongoose.disconnect();
            return; // Exit the function
        }

        const listeningHistoryData = [
            {
                user: users[0]._id,
                song: songs[0]._id,
                listened_at: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
                duration_listened: 200
            },
            {
                user: users[1]._id,
                song: songs[1]._id,
                listened_at: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                duration_listened: 150
            },
            {
                user: users[0]._id,
                song: songs[2]._id,
                listened_at: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
                duration_listened: 240
            },
            {
                user: users[2]._id,
                song: songs[0]._id,
                listened_at: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                duration_listened: 185
            },
            {
                user: users[1]._id,
                song: songs[3]._id,
                listened_at: new Date(Date.now() - 1000 * 60 * 45),
                duration_listened: 210
            },
            {
                user: users[0]._id,
                song: songs[4]._id,
                listened_at: new Date(Date.now() - 1000 * 60 * 20),
                duration_listened: 150
            },
            {
                user: users[2]._id,
                song: songs[1]._id,
                listened_at: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
                duration_listened: 240
            },
            {
                user: users[1]._id,
                song: songs[2]._id,
                listened_at: new Date(Date.now() - 1000 * 60 * 50),
                duration_listened: 195
            },
            {
                user: users[0]._id,
                song: songs[3]._id,
                listened_at: new Date(Date.now() - 1000 * 60 * 10),
                duration_listened: 165
            },
            {
                user: users[2]._id,
                song: songs[4]._id,
                listened_at: new Date(),
                duration_listened: 220
            }
        ];

        // const result = await Listening_History.insertMany(listeningHistoryData);
        // console.log('Inserted', result.length, 'records');
        const result = await generateListeningSummary(users[1]._id);
        console.log(result);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');

    } catch (error) {
        console.error('Error:', error);
    }
}

// 9. Run the function
await insertSampleListeningHistory();