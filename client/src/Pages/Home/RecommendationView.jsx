import React, { useState } from "react";
import PlaylistCard from "./PlaylistCard.jsx";
import styles from "./RecommendationView.module.css";
import ScrollableSection from "./ScrollableSection.jsx";

const COVER_IMG = "https://placehold.co/400/111/e75454?text=Playlist"; // "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQPZcjVw-tHtbV1BTXhSy86q-bARMButrtbA&s";

function RecommendationView({ recommendedSongs, isLoading, handlePlayClick, currentSong, isPlaying, artistsMap, albumsMap }) {
    const [activeFilter, setActiveFilter] = useState("Weekly Recommend");
    
    const filters = ["Popular", "Most Liked", "All Time Hits", "Weekly Recommend"];
    
    const handleFilterClick = (filter) => {
        setActiveFilter(filter);
        // Here you would typically fetch or filter content based on the selected filter
    };
    
    if (isLoading) return <div className={styles.loadingIndicator}>Loading recommendations...</div>;

    return (
        <div className={styles.recommendationContainer}>
            {/* Weekly Recommendation */}
            <div className={styles.weeklyRecommendation}>
                <h2>Weekly Recommend</h2>
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
