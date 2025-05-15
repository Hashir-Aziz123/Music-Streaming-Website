import { Listening_History, User, Song, Artist } from "../db_entities.js";
import axios from 'axios';

export const addListeningRecord = async (req, res) => {
    try {
        const { trackId, duration_listened } = req.body;
        const userId = req.user.id;

        const song = await Song.findOne({ trackId });
        if (!song) {
            return res.status(404).json({ error: "Song not found" });
        }

        const record = await Listening_History.create({
            user: userId,
            song: song._id,
            duration_listened: duration_listened
        });

        res.status(201).json(record);
    } catch (error) {
        console.error('Error adding listening record:', error);
        res.status(400).json({ error: error.message });
    }
};

export const getUserHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        if (userId !== requestingUser.id && requestingUser.role !== 'admin') {
            return res.status(403).json({ 
                error: "Not authorized to view this user's history" 
            });
        }

        const history = await Listening_History.find({ user: userId })
            .populate({
                path: 'song',
                select: 'trackId title artist duration_seconds cover_image_url'
            })
            .sort({ listened_at: -1 })
            .limit(50);

        res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching listening history:', error);
        res.status(400).json({ error: error.message });
    }
};

export const getAllUsersHistory = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                error: "Only administrators can access all users' history" 
            });
        }

        const history = await Listening_History.find()
            .populate({
                path: 'song',
                select: 'trackId title artist duration_seconds'
            })
            .populate({
                path: 'user',
                select: 'username email'
            })
            .sort({ listened_at: -1 })
            .limit(100);

        res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching all listening history:', error);
        res.status(400).json({ error: error.message });
    }
};

export const getUserStats = async (req, res) => {
    try {
        const userId = req.params.userId;

        const now = new Date();
        const last24Hours = new Date(now - 24 * 60 * 60 * 1000);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        
        const history = await Listening_History.find({ user: userId })
            .populate({
                path: 'song',
                select: 'trackId title artist genre duration_seconds'
            });
        
        const dailyListening = history
            .filter(record => new Date(record.listened_at) >= last24Hours)
            .reduce((acc, record) => acc + record.duration_listened, 0);

        const monthlyListening = history
            .filter(record => new Date(record.listened_at) >= lastMonth)
            .reduce((acc, record) => acc + record.duration_listened, 0);

        const yearlyListening = history
            .filter(record => new Date(record.listened_at) >= lastYear)
            .reduce((acc, record) => acc + record.duration_listened, 0);

        const totalListeningTime = history.reduce((acc, record) => 
            acc + record.duration_listened, 0);

        const songMap = new Map();
        history.forEach(record => {
            const songId = record.song.trackId;
            if (!songMap.has(songId)) {
                songMap.set(songId, {
                    song: record.song,
                    totalTime: 0,
                    playCount: 0
                });
            }
            const songStats = songMap.get(songId);
            songStats.totalTime += record.duration_listened;
            songStats.playCount += 1;
        });

        // const topSongs = Array.from(songMap.values())
        //     .sort((a, b) => b.playCount - a.playCount)
        //     .slice(0, 5);

        const topSongs = await Promise.all(
            Array.from(songMap.values())
                .sort((a, b) => b.playCount - a.playCount)
                .slice(0, 10)
                .map(async (item) => {
                    // Get artist details for each song
                    const artists = await Promise.all(
                        item.song.artist.map(async (artistId) => {
                            const artist = await Artist.findOne({ artistID: artistId });
                            return artist ? artist.name : 'Unknown Artist';
                        })
                    );

                    return {
                        _id: item.song._id,
                        title: item.song.title,
                        artist: artists,
                        timesListened: item.playCount
                    };
                })
        );

        const genreMap = new Map();
        history.forEach(record => {
            record.song.genre.forEach(genre => {
                genreMap.set(genre, (genreMap.get(genre) || 0) + record.duration_listened);
            });
        });

        const topGenres = Array.from(genreMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([genre, duration]) => ({
                genre,
                listens: Math.round(duration / 60)
            }));

        const artistMap = new Map();
        history.forEach(record => {
            record.song.artist.forEach(artistId => {
                artistMap.set(artistId, {
                    artistId,
                    duration: (artistMap.get(artistId)?.duration || 0) + record.duration_listened
                });
            });
        });

        const topArtistIds = Array.from(artistMap.values())
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 5);

        const topArtists = await Promise.all(
            topArtistIds.map(async ({ artistId, duration }) => {
                try {
                    const response = await axios.get(`http://localhost:5173/api/songs/artist/${artistId}`);
                    return {
                        artist: response.data.name,
                        listens: Math.round(duration / 60)
                    };
                } catch (err) {
                    console.error(`Failed to fetch artist ${artistId}:`, err);
                    return {
                        artist: `Artist ${artistId}`,
                        listens: Math.round(duration / 60)
                    };
                }
            })
        );

        // res.status(200).json({
        //     totalListeningTime,
        //     topSongs: topSongs.map(item => ({
        //         title: item.song.title,
        //         artist: item.song.artist,
        //         timesListened: item.playCount
        //     })),
        //     topGenres,
        //     topArtists,
        //     totalSongs: songMap.size,
        //     totalArtists: artistMap.size,
        //     totalGenres: genreMap.size,
        //     listeningStats: {
        //         daily: Math.round(dailyListening / 60),   // Convert seconds to minutes
        //         monthly: Math.round(monthlyListening / 60),
        //         yearly: Math.round(yearlyListening / 60)
        //     }
        // }
        res.status(200).json({
            totalListeningTime,
            topSongs,
            topGenres,
            topArtists,
            totalSongs: songMap.size,
            totalArtists: artistMap.size,
            totalGenres: genreMap.size,
            listeningStats: {
                daily: Math.round(dailyListening / 60),
                monthly: Math.round(monthlyListening / 60),
                yearly: Math.round(yearlyListening / 60)
            }
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getGlobalStats = async (req, res) => {
    try {
        // Ensure only admin can access
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied. Admin role required." });
        }

        const allHistory = await Listening_History.find({})
            .populate({
                path: 'song',
                select: 'trackId title artist genre duration_seconds' // Ensure 'artist' is populated if it's an ID/ref
            });

        if (!allHistory || allHistory.length === 0) {
            return res.status(200).json({
                message: "No listening history found to generate global stats.",
                topSongs: [],
                topGenres: [],
                topArtists: [],
                totalPlays: 0,
                uniqueSongsPlayed: 0,
                uniqueArtistsListened: 0,
                uniqueGenresListened: 0,
            });
        }

        let totalPlays = allHistory.length;
        const songMap = new Map();
        const genreMap = new Map();
        const artistMap = new Map();

        for (const record of allHistory) {
            if (!record.song) continue; // Skip if song is null

            const songId = record.song.trackId;
            const songTitle = record.song.title;
            const songArtists = record.song.artist; // This could be an array of IDs or names
            const songGenres = record.song.genre;

            // Aggregate song plays
            songMap.set(songId, (songMap.get(songId) || 0) + 1);

            // Aggregate genre plays
            if (songGenres && Array.isArray(songGenres)) {
                songGenres.forEach(genre => {
                    genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
                });
            }

            // Aggregate artist plays
            // Assuming record.song.artist is an array of artist IDs
            // We need to fetch artist names for these IDs
            if (songArtists && Array.isArray(songArtists)) {
                for (const artistId of songArtists) {
                    // If artistId is a number (ID)
                    if (typeof artistId === 'number') {
                        artistMap.set(artistId, (artistMap.get(artistId) || 0) + 1);
                    }
                    // If artistId is an object (e.g. from populate)
                    else if (typeof artistId === 'object' && artistId.artistID) {
                         artistMap.set(artistId.artistID, (artistMap.get(artistId.artistID) || 0) + 1);
                    }
                     // If artists are stored as strings directly (less ideal but possible)
                    else if (typeof artistId === 'string') {
                         artistMap.set(artistId, (artistMap.get(artistId) || 0) + 1); // Assuming artistId is the name
                    }
                }
            }
        }

        // Get top songs (fetch titles for top song IDs)
        const topSongEntries = Array.from(songMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const topSongs = await Promise.all(topSongEntries.map(async ([trackId, listens]) => {
            const songData = await Song.findOne({ trackId }).select('title artist');
            if (!songData) return { title: `Track ID: ${trackId}`, listens, artist: "Unknown" };
            // Fetch artist names if songData.artist contains IDs
            let artistNames = "Unknown";
            if (songData.artist && Array.isArray(songData.artist)) {
                const artistsDetails = await Artist.find({ artistID: { $in: songData.artist } }).select('name');
                artistNames = artistsDetails.map(a => a.name).join(', ') || "Unknown";
            }
            return { title: songData.title, artist: artistNames, listens };
        }));


        // Get top genres
        const topGenres = Array.from(genreMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5) // Show top 5 genres
            .map(([genre, listens]) => ({ genre, listens }));

        // Get top artists (fetch names for top artist IDs)
        const topArtistEntries = Array.from(artistMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5); // Show top 5 artists

        const topArtists = await Promise.all(topArtistEntries.map(async ([artistIdentifier, listens]) => {
            let artistName = `Artist ID: ${artistIdentifier}`; // Default if name can't be found
            // Check if identifier is a number (ID) or string (name)
            if (typeof artistIdentifier === 'number') {
                 const artistData = await Artist.findOne({ artistID: artistIdentifier }).select('name');
                 if (artistData) artistName = artistData.name;
            } else if (typeof artistIdentifier === 'string') {
                // If it's already a name (less likely if IDs are stored, but handling just in case)
                artistName = artistIdentifier;
            }
            return { artist: artistName, listens };
        }));

        res.status(200).json({
            topSongs,
            topGenres,
            topArtists,
            totalPlays,
            uniqueSongsPlayed: songMap.size,
            uniqueArtistsListened: artistMap.size,
            uniqueGenresListened: genreMap.size,
        });

    } catch (error) {
        console.error('Error fetching global stats:', error);
        res.status(500).json({ error: "Failed to fetch global stats: " + error.message });
    }
};