import { useState  , useEffect } from "react";
import PlaylistCard from "./PlaylistCard.jsx";
import styles from "./RecommendationView.module.css";
import homeStyles from "./Home.module.css"; // Import styles from Home.module.css
import ScrollableSection from "./ScrollableSection.jsx";
import axios from 'axios';

const COVER_IMG = "https://placehold.co/400/111/e75454?text=Playlist";

function RecommendationView({
    isLoading, 
    handlePlayClick, 
    currentSong, 
    isPlaying, 
    artistsMap, 
    albumsMap, 
    user, 
    songsNumber,
    onGenreClick, // New prop for handling genre clicks
    onArtistClick // New prop for handling artist clicks
}) {
        // Removed the filters since we're using the actual data from API

    const [recommendedSongs, setRecommendedSongs] = useState([]);
    const [topArtists, setTopArtists] = useState([]);
    const [topGenres, setTopGenres] = useState([]);
    const [artistSongs, setArtistSongs] = useState({});
    const [genreSongs, setGenreSongs] = useState({});
    const [top35Songs, setTop35Songs] = useState({});

    async function handleRecommendations() {
    try {
        const userId = user.user.id;
        const response = await axios.get(`/api/recommendations/${userId}`);
        const songsData = response.data;
        
        // Process songs
        setRecommendedSongs(songsData);
        setTop35Songs(songsData.slice(0, 35));

        const artistCount = {};
        const genreCount = {};
        const artistToSongs = {};
        const genreToSongs = {};

        // Step 1: Group by artist & genre
        songsData.forEach(song => {
            // Handle artist grouping - use artistDetails instead of artist array
            if (song.artistDetails && song.artistDetails.length > 0) {
                const artistDetail = song.artistDetails[0];
                const artistId = artistDetail.artistID;
                
                artistCount[artistId] = (artistCount[artistId] || 0) + 1;
                if (!artistToSongs[artistId]) {
                    artistToSongs[artistId] = [];
                }
                artistToSongs[artistId].push(song);
            }

            // Handle genre grouping
            if (song.genre) {
                song.genre.forEach(genreName => {
                    genreCount[genreName] = (genreCount[genreName] || 0) + 1;
                    if (!genreToSongs[genreName]) {
                        genreToSongs[genreName] = [];
                    }
                    genreToSongs[genreName].push(song);
                });
            }
        });

        // Get top artists and genres
        const topArtists = Object.entries(artistCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([artistId]) => parseInt(artistId));

        const topGenres = Object.entries(genreCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([genre]) => genre);

        // Update state
        setTopArtists(topArtists);
        setTopGenres(topGenres);
        setArtistSongs(artistToSongs);
        setGenreSongs(genreToSongs);

    } catch (error) {
        console.error('Error fetching recommendations:', error);
    }
}

        useEffect(() => {
            handleRecommendations()
                .then(() => "wohoo it works maybe idk");
        }, [user.user._id] )

        useEffect( () => {
            if (songsNumber % 20 === 0) {
               handleRecommendations()
                   .then(() => "wohooo it works maybe idk");
            }
        }, [songsNumber] );
    if (isLoading) return <div className={styles.loadingIndicator}>Loading recommendations...</div>;

    // Helper function to get artist name from artistsMap
    // const getArtistName = (artistId) => {
    //     return artistsMap[artistId]?.name || "Unknown Artist";
    // };

    const getArtistName = (song) => {
        // Check if song exists and has artistDetails
        if (song && song.artistDetails && song.artistDetails[0] && song.artistDetails[0].name) {
            return song.artistDetails[0].name;
        }
        // Fallback to artistsMap using the artist ID
        if (song && song.artist && song.artist[0]) {
            return artistsMap[song.artist[0]]?.name || "Unknown Artist";
        }
        return "Unknown Artist";
    };

    // Helper function to create a song card
    const createSongCard = (song, index) => {
        const isCurrentlyPlaying = currentSong && currentSong._id === song._id;

        return (
            // <div 
            //     key={`${song._id}-${index}`} 
            //     className={`${homeStyles.songCard} ${isCurrentlyPlaying ? homeStyles.playing : ''}`}
            //     onClick={(e) => {
            //         e.stopPropagation();
            //         handlePlayClick(song);
            //     }}
            // >
            <div 
                key={`${song._id}-${index}`} 
                className={`${homeStyles.songCard} ${isCurrentlyPlaying ? homeStyles.playing : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    handlePlayClick(song);
                }}
            >
                <div className={homeStyles.songImageContainer}>
                    <img 
                        src={song.cover_image_url || albumsMap[song.album]?.cover_image_url || "https://placehold.co/400x400/111/e75454?text=Song"} 
                        alt={song.title} 
                        className={homeStyles.songImage} 
                    />
                    <div className={`${homeStyles.playButtonOverlay} ${isCurrentlyPlaying ? homeStyles.playing : ''}`}>
                        {isCurrentlyPlaying && isPlaying ? (
                            <div className={homeStyles.playingAnimation}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        ) : (
                            <svg className={homeStyles.playIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </div>
                </div>
                <div className={homeStyles.songInfo}>
                    <div className={homeStyles.songTitle}>{song.title}</div>
                    <div className={homeStyles.songArtist}>{getArtistName(song)}</div>
                    {/* <div className={homeStyles.songAlbum}>{albumsMap[song.album]?.title || "Unknown Album"}</div> */}
                </div>
            </div>
        );
    };    // Helper function to create a genre card
    const createGenreCard = (genre, songs) => {
        if (!songs || songs.length === 0) return null;

        return (
            <div 
                key={genre} 
                className={`${homeStyles.songCard}`}
                onClick={() => onGenreClick(genre, songs)}
            >
                <div className={homeStyles.songImageContainer}>
                    <img 
                        src="https://placehold.co/400/111/e75454?text=Genre"
                        alt={genre}
                        className={homeStyles.songImage}
                    />
                    <div className={homeStyles.playButtonOverlay}>
                        <svg className={homeStyles.playIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
                <div className={homeStyles.songInfo}>
                    <div className={homeStyles.songTitle}>{genre}</div>
                    <div className={homeStyles.songArtist}>{songs.length} songs</div>
                    <div className={homeStyles.songAlbum}>Genre Playlist</div>
                </div>
            </div>
        );
    };

    // const getArtistNameById = (artistId) => {
    //     if (!artistId) return "Unknown Artist";
    //     return artistsMap[artistId]?.name || "Unknown Artist";
    // };

    const createArtistCard = (artistId, songs) => {
        if (!songs || songs.length === 0) return null;
        
        // Find the first song that has artist details
        const songWithArtist = songs.find(song => 
            song.artistDetails && 
            song.artistDetails.find(artist => artist.artistID === artistId)
        );

        // Get artist details from the song
        const artistDetails = songWithArtist?.artistDetails?.find(artist => 
            artist.artistID === artistId
        );

        const artistName = artistDetails?.name || "Unknown Artist";
        const artistImageUrl = artistDetails?.image_url;

        return (
            <div 
                key={artistId} 
                className={`${homeStyles.songCard}`}
                onClick={() => onArtistClick(artistId, songs)}
            >
                <div className={homeStyles.songImageContainer}>
                    <img 
                        src={artistImageUrl || "https://placehold.co/400/111/e75454?text=Artist"}
                        alt={artistName}
                        className={homeStyles.songImage}
                    />
                    <div className={homeStyles.playButtonOverlay}>
                        <svg className={homeStyles.playIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
                <div className={homeStyles.songInfo}>
                    <div className={homeStyles.songTitle}>{artistName}</div>
                    <div className={homeStyles.songArtist}>{songs.length} songs</div>
                    <div className={homeStyles.songAlbum}>Artist Playlist</div>
                </div>
            </div>
        );
    };
    
    return (
        <div className={styles.recommendationContainer}>
            <div className={styles.welcomeSection}>
                <h1 className={styles.welcomeTitle}>Welcome back, {user.user.username}!</h1>
                <p className={styles.welcomeSubtitle}>
                    Here are some personalized recommendations based on your listening history
                </p>
            </div>            {recommendedSongs.length > 0 && (
                <ScrollableSection 
                    title="Your Weekly Top Picks"
                    items={recommendedSongs.slice(0, 12).map((song, index) => createSongCard(song, index))}
                    layoutMode="grid"
                />
            )}

            {topArtists.length > 0 && (
                <ScrollableSection 
                    title="Artists You Might Like"
                    items={topArtists.slice(0, 10).map(artist => createArtistCard(artist, artistSongs[artist]))}
                    layoutMode="scroll"
                />
            )}
            
            {topGenres.length > 0 && (
                <ScrollableSection 
                    title="Genres For You"
                    items={topGenres.slice(0, 10).map(genre => createGenreCard(genre, genreSongs[genre]))}
                    layoutMode="scroll"
                />
            )}
        </div>
    );
}

export default RecommendationView;
