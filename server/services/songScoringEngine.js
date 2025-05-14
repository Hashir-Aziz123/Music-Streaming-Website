import {Listening_History } from "../db_entities.js";

const normalize = (value , min , max) => {
    if (max === min)
        return 0.5
    return (value - min) / (max - min);
}


export async function calculateUserSongScore(user , song , userHistoryMap ) {
    const { topGenres, topArtists, avgSongDurationSeconds } = user;
    let score = 0;

    const genreMatchCount = song.genre.filter( g=> topGenres.includes(g)).length;
    const genreScore = genreMatchCount / song.genre.length || 0;

    const artistMatchCount = song.artist.filter( a=> topArtists.includes(a)).length;
    const artistScore = artistMatchCount / song.artist.length || 0;

    const durationDiff = Math.abs(song.duration_seconds - avgSongDurationSeconds);
    const durationScore = 1 - normalize(durationDiff , 0 ,120);

    const rawPopularity = song.play_count + song.likes_count * 2;
    const popularityScore = normalize(Math.log2(rawPopularity + 1), 0, 10);

    const daysSinceUpload = (Date.now() - song.uploaded_at.getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = 1 - normalize(daysSinceUpload, 0, 180);

    const userPlays = userHistoryMap[song._id.toString()] || 0;
    const repetitionPenalty = normalize(userPlays, 0, 10);

    score =
        0.30 * genreScore +
        0.25 * artistScore +
        0.10 * durationScore +
        0.15 * popularityScore +
        0.10 * recencyScore -
        0.10 * repetitionPenalty;

    return parseFloat(score.toFixed(4));
}

export async function buildUserHistoryMap(userId){
    const history = await Listening_History.find({user:userId}).populate("song").exec();

    const map =  {};
    for ( const entry of history){
        const songId = entry.song._id.toString();
        map[songId] = (map[songId] || 0) + 1;
    }

    return map;
}