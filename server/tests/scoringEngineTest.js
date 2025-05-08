import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


import { User, Song } from "../db_entities.js";
import { calculateUserSongScore, buildUserHistoryMap } from "../services/songScoringEngine.js";

async function testSongScoring() {
    try {
        await mongoose.connect("mongodb://localhost:27017/driftDB");
        console.log("Connected to DB");

        // 🔧 Replace with valid IDs from your DB
        const userId = "681b690549be81240cd1c847";
        const songId = "681723285f579aea170f39cb";

        const user = await User.findById(userId);
        user.avgSongDurationSeconds = 120; // for test cause not intitalized in db
        const song = await Song.findById(songId);

        if (!user || !song) {
            console.log("User or song not found. Check your IDs.");
            return;
        }

        const historyMap = await buildUserHistoryMap(userId);

        const score = await calculateUserSongScore(user, song, historyMap);
        console.log(`Score for song "${song.title}" for user "${user.username}":`, score);
    } catch (err) {
        console.error("Test failed:", err);
    } finally {
        await mongoose.disconnect();
    }
}

testSongScoring();
