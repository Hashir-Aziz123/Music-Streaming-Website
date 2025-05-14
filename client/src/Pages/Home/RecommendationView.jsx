import { useState  , useEffect } from "react";
import PlaylistCard from "./PlaylistCard.jsx";
import styles from "./RecommendationView.module.css";
import ScrollableSection from "./ScrollableSection.jsx";
import axios from 'axios';

const COVER_IMG = "https://placehold.co/400/111/e75454?text=Playlist"; // "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQPZcjVw-tHtbV1BTXhSy86q-bARMButrtbA&s";

function RecommendationView({  isLoading, handlePlayClick, currentSong, isPlaying, artistsMap, albumsMap , user , songsNumber }) {
    const [activeFilter, setActiveFilter] = useState("Weekly Recommend");

    const filters = ["Popular", "Most Liked", "All Time Hits", "Weekly Recommend"];

    const handleFilterClick = (filter) => {
        setActiveFilter(filter);
        // Here you would typically fetch or filter content based on the selected filter
    };

    const [recommendedSongs, setRecommendedSongs] = useState([]);
    const [topArtists, setTopArtists] = useState([]);
    const [topGenres, setTopGenres] = useState([]);
    const [artistSongs, setArtistSongs] = useState({});
    const [genreSongs, setGenreSongs] = useState({});
    const [top35Songs, setTop35Songs] = useState({});

    async function handleRecommendations() {
        try {
            const userId = user.user.id;
            console.log(userId);
            const response = await axios.get(`/api/recommendations/${userId}`);
            console.log(response);

            // Process the data directly from response.data instead of using recommendedSongs state
            const songsData = response.data;
            const topSongs = songsData.slice(0,35)
            setTop35Songs(topSongs);

            setRecommendedSongs(songsData);

            const artistCount = {};
            const genreCount = {};
            const artistToSongs = {};
            const genreToSongs = {};

            // Step 1: Group by artist & genre
            songsData.forEach(song => {
                const { artist, genre } = song;

                // Artist logic
                if (artist) {
                    artistCount[artist] = (artistCount[artist] || 0) + 1;
                    if (!artistToSongs[artist]) artistToSongs[artist] = [];
                    artistToSongs[artist].push(song);
                }

                // Genre logic
                if (genre) {
                    genreCount[genre] = (genreCount[genre] || 0) + 1;
                    if (!genreToSongs[genre]) genreToSongs[genre] = [];
                    genreToSongs[genre].push(song);
                }
            });

            // Step 2: Get top 8 artists and genres
            const topArtists = Object.entries(artistCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([artist]) => artist);

            const topGenres = Object.entries(genreCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([genre]) => genre);

            // Step 3: Create separate arrays
            const topArtistSongs = {};
            topArtists.forEach(artist => {
                topArtistSongs[artist] = artistToSongs[artist];
            });

            const topGenreSongs = {};
            topGenres.forEach(genre => {
                topGenreSongs[genre] = genreToSongs[genre];
            });

            console.log("Top 8 Artists:", topArtists);
            console.log("Top 8 Genres:", topGenres);
            console.log("Songs by each top artist:", topArtistSongs);
            console.log("Songs by each top genre:", topGenreSongs);

            // You might want to save these processed results to state as well
            setTopArtists(topArtists);
            setTopGenres(topGenres);
            setArtistSongs(topArtistSongs);
            setGenreSongs(topGenreSongs);

        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    }

        useEffect(() => {
            handleRecommendations( )
                .then(() => "wohoo it works maybe idk");
        }, [ user.user._id] )

        useEffect( () => {
            if (songsNumber % 20 === 0) {
               handleRecommendations()
                   .then(() => "wohooo it works maybe idk");
            }
        } , [ songsNumber] );


    if (isLoading) return <div className={styles.loadingIndicator}>Loading recommendations...</div>;

    return (
        <div className={styles.recommendationContainer}>
            {/* Weekly Recommendation */}
            <div className={styles.weeklyRecommendation}>
                <h2>Drift's Recommendations</h2>
                <div className={styles.weeklyRecommendationBarSpace}>
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            className={`${styles.weeklyRecommendationBar} ${activeFilter === filter ? styles.active : ""}`}
                            onClick={() => handleFilterClick(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scroll Sections */}
            <ScrollableSection title="Favorite Genres"
                items={[
                    <PlaylistCard key="rock1" title="Rock Vibes" imgSrc={COVER_IMG} subtitle="32 songs" />, 
                    <PlaylistCard key="lofi1" title="Lo-Fi Beats" imgSrc={COVER_IMG} subtitle="Chill tracks" />, 
                    <PlaylistCard key="edm1" title="Top EDM" imgSrc={COVER_IMG} subtitle="45 songs" />, 
                    <PlaylistCard key="acoustic1" title="Acoustic Mornings" imgSrc={COVER_IMG} subtitle="Soft & calm" />, 
                    <PlaylistCard key="rock2" title="Rock Vibes" imgSrc={COVER_IMG} subtitle="32 songs" />, 
                    <PlaylistCard key="lofi2" title="Lo-Fi Beats" imgSrc={COVER_IMG} subtitle="Chill tracks" />,
                    <PlaylistCard key="acoustic1" title="Acoustic Mornings" imgSrc={COVER_IMG} subtitle="Soft & calm" />,
                    <PlaylistCard key="rock2" title="Rock Vibes" imgSrc={COVER_IMG} subtitle="32 songs" />,
                    <PlaylistCard key="lofi2" title="Lo-Fi Beats" imgSrc={COVER_IMG} subtitle="Chill tracks" />
                ]} 
            />

            <ScrollableSection title="Favorite Artists"
                items={[
                    <PlaylistCard key="artist1" title="Rock Vibes" imgSrc={COVER_IMG} subtitle="32 songs" />, 
                    <PlaylistCard key="artist2" title="Lo-Fi Beats" imgSrc={COVER_IMG} subtitle="Chill tracks" />, 
                    <PlaylistCard key="artist3" title="Top EDM" imgSrc={COVER_IMG} subtitle="45 songs" />, 
                    <PlaylistCard key="artist4" title="Acoustic Mornings" imgSrc={COVER_IMG} subtitle="Soft & calm" />
                ]} 
            />

            <ScrollableSection title="Popular Right Now"
                items={[
                    <PlaylistCard key="pop1" title="Rock Vibes" imgSrc={COVER_IMG} subtitle="32 songs" />, 
                    <PlaylistCard key="pop2" title="Lo-Fi Beats" imgSrc={COVER_IMG} subtitle="Chill tracks" />, 
                    <PlaylistCard key="pop3" title="Top EDM" imgSrc={COVER_IMG} subtitle="45 songs" />, 
                    <PlaylistCard key="pop4" title="Acoustic Mornings" imgSrc={COVER_IMG} subtitle="Soft & calm" />
                ]} 
            />
        </div>
    );
}

export default RecommendationView;
