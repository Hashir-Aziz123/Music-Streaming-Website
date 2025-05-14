import mongoose from "mongoose";

const song_schema = new mongoose.Schema(
    {
        trackId:
            {
                type: Number,
                required:true
            },
        title:
            {
                type: String,
                index: true,
                required: true
            },
        artist:
            [
                {
                    type: Number,
                    required: true,
                    index: true
                }
            ],
        album:
            {
                type: Number,
                default: ""
            },
        genre:
            [
                {
                    type: String,
                    default: "",
                    index: true
                }
            ],
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
                maxlength: 500,
                default: ""
            }
    }
);


const playlist_schema = new mongoose.Schema(
    {
        name:
            {
                type: String,
                required: true,
                trim: true
            },
        description:
            {
                type: String,
                default: ""
            },
        cover_image_url:
            {
                type: String,
                default: ""
            },
        songs:
            [
                {
                    type: Number,
                    ref: 'Song'
                }
            ],        is_public:
            {
                type: Boolean,
                default: true
            },
        is_system:
            {
                type: Boolean,
                default: false
            }
    },
    {
        timestamps: true
    }
);

const album_schema = new mongoose.Schema(
    {
        album_id:
            {
                type: Number,
                required: true
            },
        title:
            {
                type: String,
                required: true,
                index: true,
                trim: true
            },
        artist:
            {
                type: Number,
                required: true
            },
        cover_image_url:
            {
                type: String,
                default: ""
            },
        release_date:
            {
                type: Date,
            },
        songs:
            [
                {
                    type: [Number],
                    ref: 'Song'
                }
            ],
    },
    {
        timestamps: true
    }
);

const artist_schema = new mongoose.Schema(
    {
        artistID:
            {
                type: Number,
                index:true,
                required: true
            },
        name:
            {
                type: String,
                required: true,
                index: true
            },
        bio:
            {
                type: String,
            },
        songs: [ Number]
    }
);


const user_schema = new mongoose.Schema(
    {
        username:
            {
                type: String,
                required: true,
                unique: true,
                trim: true
            },
        email:
            {
                type: String,
                required: true,
                unique: true,
                trim: true,
                lowercase: true
            },
        password_hash:
            {
                type: String,
                required: true
            },
        profile_picture_url:
            {
                type: String,
                default: ""
            },
        date_joined:
            {
                type: Date,
                default: Date.now
            },
        playlists:
            [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Playlist'
                }
            ],
        bio:
            {
                type: String,
                default: ""
            },
        role:
            {
                type: String,
                enum: ['endUser', 'admin']
            },
        dob:
            {
                type: Date,
                required: true
            },
        country:
            {
                type: String,
                trim: true,
                required: true
            },

        //     new attributes for keeping listening habit summary
        topGenres: [String],
        topArtists: [String],
        liked_songs:
            [
                {
                    type: Number,
                    ref: 'Song'
                }
            ],
        mostPlayedSongs:
        [
            [
                {
                    type: Number,
                    ref: 'Song'
                }
            ]
        ],
        avgSongDurationSeconds: Number

    }
);


const listening_history_schema = new mongoose.Schema(
    {
        user:
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
        song:
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Song',
                required: true
            },
        listened_at:
            {
                type: Date,
                default: Date.now
            },
        duration_listened:
            {
                type: Number, // in seconds
                default: 0
            }
    }
);

const user_song_score_schema = new mongoose.Schema({
    userId:
        {
            type: String,
            index: true,
            ref: 'User'
        },
    trackId:
        {
            type: Number,
            ref: 'Song'
        },
    score: Number,
    computedAt:
        {
            type: Date,
            default: Date.now
        }

});

const UserSongScore = mongoose.model('UserSongScore', user_song_score_schema);
const Artist = mongoose.model('Artist', artist_schema);
const Listening_History = mongoose.model('ListeningHistory', listening_history_schema);
const Album = mongoose.model('Album', album_schema);
const Playlist = mongoose.model('Playlist', playlist_schema);
const User = mongoose.model("User", user_schema);
const Song = mongoose.model('Song', song_schema);

export {Song, User, Playlist, Album, Listening_History , Artist , UserSongScore};