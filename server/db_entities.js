import mongoose from "mongoose";

const song_schema = new mongoose.Schema({
        title:
        {
            type: String,
            index: true,
            required: true
        },
        artist:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Artist",
            required: true,
            index: true
        },
        album:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Album",
            default: ""
        },
        genre:
        {
            type: String,
            default: "",
            index: true
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
            type: String,
            default: ""
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
            type: String,
            maxlength:500,
            default: ""
        }
    }
);


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password_hash: {
        type: String,
        required: true
    },
    profile_picture_url: {
        type: String,
        default: ""
    },
    date_joined: {
        type: Date,
        default: Date.now
    },
    liked_songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],
    role: {
        type: String,
        required: true
    }
});

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    cover_image_url: {
        type: String,
        default: ""
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],
    is_public: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const albumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true,
        trim: true
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist',
        required: true
    },
    cover_image_url: {
        type: String,
        default: ""
    },
    release_date: {
        type: Date,
        required: true
    },
    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],
    description: {
        type: String,
        default: ""
    }
}, { timestamps: true });


const artistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true,
        trim: true
    },
    bio: {
        type: String,
        default: ""
    },
    profile_picture_url: {
        type: String,
        default: ""
    },
});

const listeningHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    song: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song',
        required: true
    },
    listened_at: {
        type: Date,
        default: Date.now
    },
    duration_listened: {
        type: Number, // in seconds
        default: 0
    }
});

const ListeningHistory = mongoose.model('ListeningHistory', listeningHistorySchema);
const Artist = mongoose.model('Artist', artistSchema);
const Album = mongoose.model('Album', albumSchema);
const Playlist = mongoose.model('Playlist', playlistSchema);
const User = mongoose.model("User", userSchema);
const Song = mongoose.model('Song', song_schema);

export {Song, User, Playlist, Album, ListeningHistory, Artist};