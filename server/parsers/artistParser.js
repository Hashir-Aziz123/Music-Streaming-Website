import fs from 'fs';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import { Song, Artist } from '../db_entities.js'; // assuming Mongoose model

function stripHtmlTags(html) {
    return html.replace(/<[^>]*>/g, '').trim();
}

async function processCSV() {
    const artists = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream('../data/raw_artists.csv')
            .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
            .on('data', (row) => {
                const artist = {
                    artistID: Number(row['artist_id']), // Convert to Number to match schema
                    name: row['artist_name'], // Changed key to 'name' to match schema
                    bio: stripHtmlTags(row['artist_bio'] || ''), // Changed key to 'bio' to match schema
                };
                artists.push(artist);
            })
            .on('end', () => {
                resolve(artists);
            })
            .on('error', reject);
    });
}

async function matchArtistsWithSongs(artists) {
    const results = [];

    for (const artist of artists) {
        const songs = await Song.find({ artist: artist.artistID });

        results.push({
            ...artist,
            songs: songs.map(song => Number(song.trackId)) // This is correct, but need to ensure it's saved properly
        });
    }

    return results;
}

async function main() {
    await mongoose.connect('mongodb://localhost:27017/driftDB');

    try {
        const artists = await processCSV();
        const artistsWithSongs = await matchArtistsWithSongs(artists);

        // Log one artist for debugging
        if (artistsWithSongs.length > 0) {
            console.log('Sample artist to be inserted:', JSON.stringify(artistsWithSongs[0], null, 2));
        }

        await Artist.insertMany(artistsWithSongs);
        console.log('Inserted artists:', artistsWithSongs.length);
    } catch (error) {
        console.error('Error details:', error);
    } finally {
        await mongoose.disconnect();
    }
}

main().catch(console.error);