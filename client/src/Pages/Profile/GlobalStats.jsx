// src/components/Profile/GlobalStats.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, LabelList, Tooltip, Legend } from 'recharts';
import styles from './UserStats.module.css'; // You can reuse or create new styles
import CustomCard from "./CustomCard.jsx"; // Assuming CustomCard can be reused or adapted

function GlobalStats() {
    const [globalStats, setGlobalStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGlobalStats = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await axios.get('/api/history/global-stats', {
                    withCredentials: true, // Important for sending cookies for auth
                });
                setGlobalStats(response.data);
            } catch (err) {
                console.error('Failed to fetch global stats:', err);
                setError(err.response?.data?.error || 'Failed to load global statistics. You may not have the required permissions.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchGlobalStats();
    }, []);

    const getMaxYAxisValue = (data, key = 'listens') => {
        if (!data || data.length === 0) return 10; // Default if no data
        const maxValue = Math.max(...data.map(item => item[key]));
        return Math.ceil(maxValue * 1.2) || 10; // Add 20% padding, default to 10 if maxValue is 0
    };

    const generateYAxisTicks = (maxValue) => {
        if (maxValue <= 0) return [0];
        const tickCount = 5;
        const step = Math.ceil(maxValue / tickCount);
        return Array.from({ length: tickCount + 1 }, (_, i) => i * step);
    };

    if (isLoading) {
        return <div className={styles.loading}>Loading global statistics...</div>;
    }

    if (error) {
        return <div className={styles.error}>Error: {error}</div>;
    }

    if (!globalStats) {
        return <div className={styles.noData}>No global statistics available.</div>;
    }

    return (
        <section className={styles.userStatsContainer}>
            <h2 className={styles.sectionTitle}>Global Site Statistics</h2>

            {/* General Stats */}
            <div className={styles.statsInfoRow} style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                <div className={styles.infoBlock} style={{ flexBasis: '45%', marginBottom: '20px' }}>
                    <div className={styles.blockHeader}><h3>Overview</h3></div>
                    <div className={styles.infoContent}>
                        <div className={styles.statRows}>
                            <div className={styles.statRow}><span className={styles.statLabel}>Total Plays Across Site:</span> <span className={styles.statValue}>{globalStats.totalPlays ?? 0}</span></div>
                            <div className={styles.statRow}><span className={styles.statLabel}>Unique Songs Played:</span> <span className={styles.statValue}>{globalStats.uniqueSongsPlayed ?? 0}</span></div>
                            <div className={styles.statRow}><span className={styles.statLabel}>Unique Artists Listened:</span> <span className={styles.statValue}>{globalStats.uniqueArtistsListened ?? 0}</span></div>
                            <div className={styles.statRow}><span className={styles.statLabel}>Unique Genres Listened:</span> <span className={styles.statValue}>{globalStats.uniqueGenresListened ?? 0}</span></div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Top Songs Section */}
            {globalStats.topSongs && globalStats.topSongs.length > 0 && (
                <div className={styles.statsSection}>
                    <div className={styles.sectionHeader}>
                        <h3>Top Songs (Site-Wide)</h3>
                    </div>
                    <div className={styles.songGrid}>
                        {globalStats.topSongs.map((song, index) => (
                            <CustomCard
                                key={index} // Use a unique key if song._id is available
                                title={song.title}
                                artist={song.artist} // Assuming artist is a string here
                                timesListened={song.listens} // Or a relevant field
                                // imageUrl={song.cover_image_url} // If available
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Charts Grid */}
            <div className={styles.statsGrid}>
                {/* Top Genres Chart */}
                {globalStats.topGenres && globalStats.topGenres.length > 0 && (
                    <div className={styles.chartBlock}>
                        <div className={styles.blockHeader}>
                            <h3>Top Genres (Site-Wide)</h3>
                            <span className={styles.periodTag}>All Time</span>
                        </div>
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={globalStats.topGenres} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} />
                                    <XAxis dataKey="genre" stroke="#e75454" tick={{ fill: '#fff', fontSize: 12 }} angle={-30} textAnchor="end" interval={0} />
                                    <YAxis stroke="#e75454" tick={{ fill: '#b3b3b3', fontSize: 12 }} domain={[0, getMaxYAxisValue(globalStats.topGenres)]} ticks={generateYAxisTicks(getMaxYAxisValue(globalStats.topGenres))} />
                                    <Tooltip />
                                    <Bar dataKey="listens" fill="#e75454" radius={[4, 4, 0, 0]}>
                                        <LabelList dataKey="listens" position="top" fill="#fff" fontSize={10} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Top Artists Chart */}
                {globalStats.topArtists && globalStats.topArtists.length > 0 && (
                    <div className={styles.chartBlock}>
                        <div className={styles.blockHeader}>
                            <h3>Top Artists (Site-Wide)</h3>
                            <span className={styles.periodTag}>All Time</span>
                        </div>
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={globalStats.topArtists} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} />
                                    <XAxis dataKey="artist" stroke="#e75454" tick={{ fill: '#fff', fontSize: 12 }} angle={-30} textAnchor="end" interval={0} />
                                    <YAxis stroke="#e75454" tick={{ fill: '#b3b3b3', fontSize: 12 }} domain={[0, getMaxYAxisValue(globalStats.topArtists)]} ticks={generateYAxisTicks(getMaxYAxisValue(globalStats.topArtists))} />
                                    <Tooltip />
                                    <Bar dataKey="listens" fill="#54e78e" radius={[4, 4, 0, 0]}> {/* Different color for distinction */}
                                        <LabelList dataKey="listens" position="top" fill="#fff" fontSize={10} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default GlobalStats;