import {Artist, Listening_History} from "../db_entities.js";
import {populate} from "dotenv";

export async function generateListeningSummary(userID) {

    const history = await Listening_History.find( { user : userID}).populate("song").exec();

    if (!history.length) {
        return {
            topGenres: [],
            topArtists: [],
            mostPlayedSongs: [],
            avgSongDurationSeconds: 0
        };
    }


    const genreCount = {};
    const artistCount = {};
    const songCount = {};
    let totalDuration = 0;

    for (const entry of history) {
        const song = entry.song;

        for (const genre of song.genre) {
            genreCount[genre] = (genreCount[genre] || 0) + 1;
        }

        for (const artistId of song.artist) {
            artistCount[artistId] = (artistCount[artistId] || 0) + 1;
        }

        songCount[song.trackId] = (songCount[song.trackId] || 0) + 1;

        totalDuration += song.duration_seconds;
    }

    const sortObject = (obj) =>
        Object.entries(obj)
            .sort((a, b) => b[1] - a[1])
            .map(([key]) => key);

    const topArtistIDs = sortObject(artistCount).slice(0, 5);

    const artists = await Artist.find({ artistID: { $in: topArtistIDs.map(Number) } });

    const artistIdToName = {};
    for (const artist of artists) {
        artistIdToName[artist.artistID] = artist.name;
    }

    // Convert topArtistIDs to names (fallback to ID if not found)
    const topArtistNames = topArtistIDs.map(
        (id) => artistIdToName[id] || `Unknown Artist (${id})`
    );

    return {
        topGenres: sortObject(genreCount).slice(0, 5),
        topArtists: topArtistNames,
        mostPlayedSongs: sortObject(songCount).slice(0, 20),
        avgSongDurationSeconds: Math.round(totalDuration / history.length)
    };

}