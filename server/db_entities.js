import mongoose from "mongoose";

const song_schema = new mongoose.Schema({
        title:
        {
            type: String,
            required: true
        },
        artist:
        {
            type: String,
            required: true
        },
        album:
        {
            type: String
        },
        genre:
        {
            type: String
        },
        duration_seconds:
        {
            type: Number,
            required: true
        },
        audio_url:
        {
            type: String,
            required: true
        },
        cover_image_url:
        {
            type: String
        },
        uploaded_at:
        {
            type: Date,
            default: Date.now
        },
        likes_count:
        {
            type: Number,
            default: 0
        },
        play_count:
        {
            type: Number,
            default: 0
        },
        description:
        {
            type: String
        }
    }
);

const Song = mongoose.model('Song', song_schema);
export {Song};