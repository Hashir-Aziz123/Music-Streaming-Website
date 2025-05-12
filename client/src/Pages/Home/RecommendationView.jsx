import React from "react";
import PlaylistCard from "./PlaylistCard.jsx";
import styles from "./RecommendationView.module.css";
import ScrollableSection from "./ScrollableSection.jsx";



function RecommendationView({ recommendedSongs, isLoading, handlePlayClick, currentSong, isPlaying, artistsMap, albumsMap }) {
    if (isLoading) return <p>Loading recommendations...</p>;


    return (
        <div className={styles.recommendationContainer}>


            {/* Weekly Recommendation */}
            <div className={styles.weeklyRecommendation}>
                <div>
                    <h1>Weekly Recommend</h1>
                </div>
                {/*<div className={styles.bigCard}>*/}
                {/*    <PlaylistCard title="Rock Vibes" imgSrc="/images/rock.jpg" subtitle="32 songs" />*/}
                {/*</div>*/}
                <div className={styles.weeklyRecommendationBarSpace}>
                    <div className={styles.weeklyRecommendationBar}>Popular</div>
                    <div className={styles.weeklyRecommendationBar}>Most liked</div>
                    <div className={styles.weeklyRecommendationBar}>All time hits</div>
                    <div className={styles.weeklyRecommendationBar}>Weekly Recommend</div>
                </div>

            </div>

            {/* Scroll Sections */}
            <ScrollableSection title="Favorite Genres"
                               items={[
                                   <PlaylistCard title="Rock Vibes" imgSrc="/images/rock.jpg" subtitle="32 songs" />,
                                   <PlaylistCard title="Lo-Fi Beats" imgSrc="/images/lofi.jpg" subtitle="Chill tracks" />,
                                   <PlaylistCard title="Top EDM" imgSrc="/images/edm.jpg" subtitle="45 songs" />,
                                   <PlaylistCard title="Acoustic Mornings" imgSrc="/images/acoustic.jpg" subtitle="Soft & calm" />,
                                   <PlaylistCard title="Rock Vibes" imgSrc="/images/rock.jpg" subtitle="32 songs" />,
                                   <PlaylistCard title="Lo-Fi Beats" imgSrc="/images/lofi.jpg" subtitle="Chill tracks" />,
                                   <PlaylistCard title="Top EDM" imgSrc="/images/edm.jpg" subtitle="45 songs" />,
                                   <PlaylistCard title="Acoustic Mornings" imgSrc="/images/acoustic.jpg" subtitle="Soft & calm" />,
                                   <PlaylistCard title="Rock Vibes" imgSrc="/images/rock.jpg" subtitle="32 songs" />,
                                   <PlaylistCard title="Lo-Fi Beats" imgSrc="/images/lofi.jpg" subtitle="Chill tracks" />,
                                   <PlaylistCard title="Top EDM" imgSrc="/images/edm.jpg" subtitle="45 songs" />,
                                   <PlaylistCard title="Acoustic Mornings" imgSrc="/images/acoustic.jpg" subtitle="Soft & calm" />,
                                   <PlaylistCard title="Rock Vibes" imgSrc="/images/rock.jpg" subtitle="32 songs" />,
                                   <PlaylistCard title="Lo-Fi Beats" imgSrc="/images/lofi.jpg" subtitle="Chill tracks" />,
                                   <PlaylistCard title="Top EDM" imgSrc="/images/edm.jpg" subtitle="45 songs" />,
                                   <PlaylistCard title="Acoustic Mornings" imgSrc="/images/acoustic.jpg" subtitle="Soft & calm" />
                               ]} />
            <ScrollableSection title="Favorite Artists"
                               items={[
                                   <PlaylistCard title="Rock Vibes" imgSrc="/images/rock.jpg" subtitle="32 songs" />,
                                   <PlaylistCard title="Lo-Fi Beats" imgSrc="/images/lofi.jpg" subtitle="Chill tracks" />,
                                   <PlaylistCard title="Top EDM" imgSrc="/images/edm.jpg" subtitle="45 songs" />,
                                   <PlaylistCard title="Acoustic Mornings" imgSrc="/images/acoustic.jpg" subtitle="Soft & calm" />
                               ]} />
            <ScrollableSection title="Popular Right Now"
                               items={[
                                   <PlaylistCard title="Rock Vibes" imgSrc="/images/rock.jpg" subtitle="32 songs" />,
                                   <PlaylistCard title="Lo-Fi Beats" imgSrc="/images/lofi.jpg" subtitle="Chill tracks" />,
                                   <PlaylistCard title="Top EDM" imgSrc="/images/edm.jpg" subtitle="45 songs" />,
                                   <PlaylistCard title="Acoustic Mornings" imgSrc="/images/acoustic.jpg" subtitle="Soft & calm" />
                               ]} />
        </div>
    );
}

export default RecommendationView;
