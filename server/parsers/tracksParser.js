import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import csv from "csv-parser";
import mongoose from "mongoose";
import { Song } from "../db_entities.js";
import { promisify } from "util";
import { fileURLToPath } from "url";

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const zipFilePath = path.join(__dirname, "../fma_small2.zip");
const extractPath = path.join(__dirname, "../uploads/songs");
const csvFilePath = path.join(__dirname, "../data/clean_tracks.csv");


async function unzipSongs() {
    await fs.createReadStream(zipFilePath)
        .pipe(unzipper.Extract({ path: extractPath }))
        .promise();
    console.log("✅ ZIP file extracted.");
}

async function parseAndUploadSongs() {
    const results = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on("data", (row) => {
                try {
                    const trackId = row["track_id"]?.trim();
                    const title = row["track_title"]?.trim();
                    const duration = parseInt(row["track_duration"]);
                    const genreRaw = row["track_genre_top"];
                    const artistId = row["artist_id"]?.trim();
                    const albumId = row["album_id"]?.trim();
                    const trackIdStr = trackId.padStart(6, '0');
                    const audioPath = path.join(extractPath, "fma_small" , `${trackIdStr}.mp3`);
                    const webAudioPath = `/uploads/songs/fma_small/${trackIdStr}.mp3`;

                    // Skip if required data is missing
                    if (!trackId || !title || isNaN(duration) ) {
                        console.warn("⚠️ Skipping row due to missing required fields:", {
                            trackId, title, duration , genreRaw
                        });
                        return;
                    }

                    if (!fs.existsSync(audioPath)) {
                        console.warn(`⚠️ Missing audio file: ${audioPath}`);
                        return;
                    }

                    // Parse genres safely
                    // let genreArray = [];
                    // try {
                    //     genreArray = genreRaw
                    //         ? JSON.parse(genreRaw.replace(/'/g, '"'))
                    //         : [];
                    // } catch (e) {
                    //     console.warn(`⚠️ Genre parsing failed for track_id ${trackId}:`, genreRaw);
                    // }

                    results.push({
                        trackId: parseInt(trackIdStr),
                        title,
                        artist: [artistId],
                        album: albumId || undefined,
                        genre: genreRaw,
                        duration_seconds: duration,
                        audio_url: webAudioPath
                    });

                } catch (err) {
                    console.error("❌ Error parsing row:", err);
                    console.log("Row data:", row);
                }
            })
            .on("end", async () => {
                try {
                    if (results.length > 0) {
                        await Song.insertMany(results);
                        console.log(`✅ Inserted ${results.length} songs into MongoDB`);
                    } else {
                        console.log("⚠️ No valid songs to insert.");
                    }
                    resolve();
                } catch (err) {
                    console.error("❌ Error inserting into MongoDB:", err);
                    reject(err);
                }
            })
            .on("error", (err) => {
                console.error("❌ CSV Parsing Error:", err);
                reject(err);
            });
    });
}

async function main() {
    try {
        await mongoose.connect("mongodb://localhost:27017/driftDB", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        await unzipSongs();
        await parseAndUploadSongs();

        await mongoose.disconnect();
    } catch (err) {
        console.error("❌ Error:", err);
    }
}

main();
