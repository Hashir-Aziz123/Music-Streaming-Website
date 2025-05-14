// ok so we need album_id , title , data_released from csv and we need songs and author from other collection
import fs from 'fs';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import {Song , Album} from '../db_entities.js';

async function  processCSV() {
    const albums = [];

    return new Promise(async (resolve, reject) => {
        fs.createReadStream('../data/raw_albums.csv')
        .pipe(csv({mapHeaders : ({header}) => header.trim() }))
            .on('data', (row) => {
                const album = {
                    album_id: Number(row['album_id']),
                    title: row['album_title'],
                    release_date: row['album_date_released'],

                }
                albums.push(album);
            })
        .on('end', () => {
            resolve(albums);
        })
        .on('error', reject);
    })
}

async function processAlbums(albums) {
    const results = [];

    for (const album of albums) {
        const songs = await Song.find( { album: album.album_id });
        console.log(`Album ${album.album_id}: found ${songs.length} songs`);

        if (songs && Array.isArray(songs) && songs.length > 0)
        {
            results.push(
                {
                    ...album,
                    songs: songs.map(song => Number(song.trackId)),
                    artist: songs[0] ? Number(songs[0].artist) : 999999999 , // inserting random number
                }
            );
        }
    }

    return results;
}

async function main() {
    await mongoose.connect('mongodb://localhost:27017/driftDB');

    try{
        const albums = await processCSV();
        const albumsFinalized = await processAlbums(albums);

        if (albumsFinalized.length > 0) {
            await Album.insertMany(albumsFinalized);
            console.log("Inserted albums: ", albumsFinalized.length);
        }
        else{
            console.log("Album not found.");
        }
    }
    catch (error) {
        console.log(error);
    }
    finally {
        await mongoose.disconnect();
    }
}

main().catch(console.error);