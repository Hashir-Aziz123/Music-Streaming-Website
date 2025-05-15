import {Song, UserSongScore} from "../db_entities.js";
import {buildUserHistoryMap, calculateUserSongScore} from "./songScoringEngine.js";
import {generateListeningSummary} from "./summaryService.js";
import axios from 'axios';

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


// export async function getTopRecommendations(userId) {
//     try {
//         const topScores = await UserSongScore.find({ userId: userId })
//             .sort({ score: -1 })
//             .limit(LIMIT);

//         // Only return actual Song documents that were successfully populated
//         const trackIds = topScores
//             .filter(entry => entry.trackId )
//             .map(entry => entry.trackId); // this is now the full Song document
        
//         const songs = await Song.find({trackId: {$in: trackIds}});

//         // const songsWithNewProperty = await Promise.all(songs.map(async song => {
//         const songsWithNewProperty = songs.map((song) => {
//             const songObj = song.toObject(); // Convert mongoose document to plain object
//             // const songArtistId = songObj.artist[0];
//             // const artistDetails = await axios.get(`http://localhost:3000/api/songs/artist/${songArtistId}`);
//             // songObj.artistDetails = [artistDetails];
//             songObj.artistDetails = [{
//                 _id: "681a4fb55c073f62fa1b8e26",
//                 artistID: 5994,
//                 name: "Lezet",
//                 bio: "\"Someone's comment about the sound of Lezet was \"like Zorn without saxophone\"...And indeed, Lezet's work could remind the results of \"the game theory\", which John Zorn exercised on his debut \"Locus Solus\"\", for example...The fact that LEZET don't use only live instruments will probably disconnect it from the avantgarde free jazz scene, but I suppose the coming under some specific style wasn't the intent in this case anyway. It's about free experiments with sound captures in search for the surprises.And it can't be pretentious as such... \" (extract taken from issue2 of the \"Black Syrup\" zine (Serbia,2007)",
//                 songs: [
//                     26583,
//                     26600,
//                     26605,
//                     47826,
//                     91894,
//                     91897,
//                     91899,
//                     91900,
//                     126510,
//                     128825,
//                     128827,
//                     128828
//                 ],
//                 __v: 0
//             }];
//             songObj.artist = [5994];
//             return songObj;
//         });


//         // songsWithNewProperty[0].artist = [5994];

//         return songsWithNewProperty;

//         // return await Song.find({trackId: {$in: trackIds}});
//     } catch (error) {
//         console.error("Error in getTopRecommendations:", error);
//         throw error;
//     }
// }

export async function getTopRecommendations(userId) {
    try {
        const topScores = await UserSongScore.find({ userId: userId })
            .sort({ score: -1 })
            .limit(LIMIT);

        const trackIds = topScores
            .filter(entry => entry.trackId)
            .map(entry => entry.trackId);
        
        const songs = await Song.find({trackId: {$in: trackIds}});

        // Use Promise.all to handle all axios requests in parallel
        const songsWithNewProperty = await Promise.all(songs.map(async song => {
            const songObj = song.toObject();
            const songArtistId = songObj.artist[0];
            try {
                const response = await axios.get(`http://localhost:3000/api/songs/artist/${songArtistId}`);
                songObj.artistDetails = [response.data]; // Use response.data to get the actual artist details
            } catch (error) {
                console.error(`Error fetching artist details for artist ${songArtistId}:`, error);
                songObj.artistDetails = []; // Set empty array if request fails
            }
            return songObj;
        }));

        return songsWithNewProperty;

    } catch (error) {
        console.error("Error in getTopRecommendations:", error);
        throw error;
    }
}

/* NOT WORKING
 {
        "_id": "681a4eb97cc70cac90017ffd",
        "trackId": 1196,
        "title": "2 Blonde Braids",
        "artist": [
            215
        ],
        "album": 320,
        "genre": [
            "Folk"
        ],
        "duration_seconds": 221,
        "audio_url": "/uploads/songs/fma_small/001196.mp3",
        "cover_image_url": "",
        "likes_count": 0,
        "play_count": 0,
        "description": "",
        "uploaded_at": "2025-05-06T18:02:33.843Z",
        "__v": 0,
        "artistDetails": [
            {
                "_id": "681a4fb55c073f62fa1b7bcd",
                "artistID": 215,
                "name": "Mount Eerie",
                "bio": "Some years ago Phil Elvrum put an end to his much lauded Microphones project and named his new one-man-band after an area in Anacortes, WA called Mount Eerie. Since then his songs have become more natural and the recordings less meticulous and fetishistic. In a good way. (-via Marcus Estes at WFMU's Beware of the Blog)\n(photo by Flickr user niccaela Some Rights Reserved)",
                "songs": [
                    1193,
                    1195,
                    1196,
                    1197
                ],
                "__v": 0
            }
        ]
    },
*/

/* WORKING
{
        "_id": "681a4eb97cc70cac90017ffd",
        "trackId": 1196,
        "title": "2 Blonde Braids",
        "artist": [
            5994
        ],
        "album": 320,
        "genre": [
            "Folk"
        ],
        "duration_seconds": 221,
        "audio_url": "/uploads/songs/fma_small/001196.mp3",
        "cover_image_url": "",
        "likes_count": 0,
        "play_count": 0,
        "description": "",
        "uploaded_at": "2025-05-06T18:02:33.843Z",
        "__v": 0,
        "artistDetails": [
            {
                "_id": "681a4fb55c073f62fa1b8e26",
                "artistID": 5994,
                "name": "Lezet",
                "bio": "\"Someone's comment about the sound of Lezet was \"like Zorn without saxophone\"...And indeed, Lezet's work could remind the results of \"the game theory\", which John Zorn exercised on his debut \"Locus Solus\"\", for example...The fact that LEZET don't use only live instruments will probably disconnect it from the avantgarde free jazz scene, but I suppose the coming under some specific style wasn't the intent in this case anyway. It's about free experiments with sound captures in search for the surprises.And it can't be pretentious as such... \" (extract taken from issue2 of the \"Black Syrup\" zine (Serbia,2007)",
                "songs": [
                    26583,
                    26600,
                    26605,
                    47826,
                    91894,
                    91897,
                    91899,
                    91900,
                    126510,
                    128825,
                    128827,
                    128828
                ],
                "__v": 0
            }
        ]
    },
*/

/*
    "artistDetails": [
        {
            "_id": "681a4fb55c073f62fa1b8e26",
            "artistID": 5994,
            "name": "Lezet",
            "bio": "\"Someone's comment about the sound of Lezet was \"like Zorn without saxophone\"...And indeed, Lezet's work could remind the results of \"the game theory\", which John Zorn exercised on his debut \"Locus Solus\"\", for example...The fact that LEZET don't use only live instruments will probably disconnect it from the avantgarde free jazz scene, but I suppose the coming under some specific style wasn't the intent in this case anyway. It's about free experiments with sound captures in search for the surprises.And it can't be pretentious as such... \" (extract taken from issue2 of the \"Black Syrup\" zine (Serbia,2007)",
            "songs": [
                26583,
                26600,
                26605,
                47826,
                91894,
                91897,
                91899,
                91900,
                126510,
                128825,
                128827,
                128828
            ],
            "__v": 0
        }
    ]
*/