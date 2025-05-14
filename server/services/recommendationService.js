import {Song, UserSongScore} from "../db_entities.js";
import {buildUserHistoryMap, calculateUserSongScore} from "./songScoringEngine.js";
import {generateListeningSummary} from "./summaryService.js";

const LIMIT = 200;

export async function recommendSongsForUser(user) {
    try {
        const userSummary = await generateListeningSummary(user);
        user.topGenres = userSummary.topGenres;
        user.topArtists = userSummary.topArtists;
        user.mostPlayedSongs = userSummary.mostPlayedSongs;
        user.avgSongDurationSeconds = userSummary.avgSongDurationSeconds;


        const allSongs = await Song.find({});
        const userHistoryMap = await buildUserHistoryMap(user._id);

        // Calculate scores for all songs using Promise.all for parallel processing
        const scoredSongs = await Promise.all(
            allSongs.map(async (song) => {
                const score = await calculateUserSongScore(user, song, userHistoryMap);
                return { song, score };
            })
        );

        const sortedSongs = scoredSongs
            .sort((a, b) => b.score - a.score)
            .slice(0, LIMIT);

        // Prepare bulk write operations for updating UserSongScore
        const bulkOps = sortedSongs.map(item => ({
            updateOne: {
                filter: { userId: user._id, trackId: item.song.trackId }, // Use song._id
                update: {
                    $set: {
                        score: item.score,
                        computedAt: new Date()
                    }
                },
                upsert: true
            }
        }));


        if (bulkOps.length > 0) {
            await UserSongScore.bulkWrite(bulkOps);
        }

        return sortedSongs;

    } catch (error) {
        console.error("Error generating recommendations:", error);
        throw error;
    }
}


export async function getTopRecommendations(userId) {
    try {
        const topScores = await UserSongScore.find({ userId: userId })
            .sort({ score: -1 })
            .limit(LIMIT);

        // Only return actual Song documents that were successfully populated
        const trackIds = topScores
            .filter(entry => entry.trackId )
            .map(entry => entry.trackId); // this is now the full Song document

        return await Song.find({trackId: {$in: trackIds}}) ;
    } catch (error) {
        console.error("Error in getTopRecommendations:", error);
        throw error;
    }
}


