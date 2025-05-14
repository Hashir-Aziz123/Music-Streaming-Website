import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';
import MusicNotes from './MusicNotes.jsx';
import styles from "./UserStats.module.css";
import CustomCard from "./CustomCard.jsx";
import {useState, useEffect} from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

function ProfileUserStats({playlistsNum}) {
    const getMaxYAxisValue = (data) => {
        const maxValue = Math.max(...data.map(item => item.listens));
        return Math.ceil(maxValue * 1.2); // Add 20% padding to the top
    };

    // Helper function to generate Y-axis ticks
    const generateYAxisTicks = (maxValue) => {
        const tickCount = 5;
        const step = Math.ceil(maxValue / tickCount);
        return Array.from({length: tickCount + 1}, (_, i) => i * step);
    };

    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`/api/history/stats/${user.id}`, {
                    withCredentials: true
                });
                setStats(response.data);
            } catch (err) {
                console.error('Failed to fetch user stats:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchStats();
    }, [user]);

    if (isLoading) {
        return <div>Loading stats...</div>;
    }

    return (
        <section className={styles.userStatsContainer}>
            {/* Top Songs Section */}
            <div className={styles.statsSection}>
                <div className={styles.sectionHeader}>
                    <h3>Top Songs</h3>
                    <button className={styles.moreButton}>See All</button>
                </div>
                <div className={styles.songGrid}>
                    {stats.topSongs.map(song => (
                        <CustomCard
                            key={song._id}
                            title={song.title}
                            artist={song.artist.join(', ')}
                            timesListened={song.timesListened}
                        />
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                {/* Genres Chart */}
                <div className={styles.chartBlock}>
                    <div className={styles.blockHeader}>
                        <h3>Top Genres</h3>
                        <span className={styles.periodTag}>All Time</span>
                    </div>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart
                                data={stats.topGenres} // genreData
                                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                barCategoryGap={8}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#333"
                                    horizontal={true}
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="genre"
                                    stroke="#e75454"
                                    tick={{ fill: '#fff', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#e75454"
                                    tick={{ fill: '#b3b3b3', fontSize: 12 }}
                                    tickFormatter={(tick) => `${tick}`}
                                    axisLine={false}
                                    tickLine={false}
                                    ticks={generateYAxisTicks(getMaxYAxisValue(stats.topGenres))}
                                    domain={[0, getMaxYAxisValue(stats.topGenres)]}
                                />
                                <Bar
                                    dataKey="listens"
                                    fill="#e75454"
                                    radius={[4, 4, 0, 0]}
                                    animationDuration={1500}
                                >
                                    <LabelList
                                        dataKey="listens"
                                        position="top"
                                        fill="#fff"
                                        fontSize={10}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Artists Chart */}
                <div className={styles.chartBlock}>
                    <div className={styles.blockHeader}>
                        <h3>Top Artists</h3>
                        <span className={styles.periodTag}>All Time</span>
                    </div>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart
                                data={stats.topArtists} //artistData
                                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                barCategoryGap={8}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#333"
                                    horizontal={true}
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="artist"
                                    stroke="#e75454"
                                    tick={{ fill: '#fff', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#e75454"
                                    tick={{ fill: '#b3b3b3', fontSize: 12 }}
                                    tickFormatter={(tick) => `${tick}`}
                                    axisLine={false}
                                    tickLine={false}
                                    ticks={generateYAxisTicks(getMaxYAxisValue(stats.topArtists))}
                                    domain={[0, getMaxYAxisValue(stats.topArtists)]}
                                />
                                <Bar
                                    dataKey="listens"
                                    fill="#e75454"
                                    radius={[4, 4, 0, 0]}
                                    animationDuration={1500}
                                >
                                    <LabelList
                                        dataKey="listens"
                                        position="top"
                                        fill="#fff"
                                        fontSize={10}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            {/* Stats Info Row */}
            <div className={styles.statsInfoRow}>
                {/* Listening Minutes */}
                <div className={styles.infoBlock}>
                    <div className={styles.blockHeader}>
                        <h3>Listening Minutes</h3>
                        {/* <div className={styles.levelBadge}>Level 4</div> */}
                    </div>
                    <div className={styles.infoContent}>
                        <MusicNotes />
                        
                        <div className={styles.statRows}>
                            <div className={styles.statRow}>
                                <span className={styles.statLabel}>Today</span>
                                <span className={styles.statValue}>{stats?.listeningStats?.daily || 0}</span>
                            </div>
                            <div className={styles.statRow}>
                                <span className={styles.statLabel}>This month</span>
                                <span className={styles.statValue}>{stats?.listeningStats?.monthly || 0}</span>
                            </div>
                            <div className={styles.statRow}>
                                <span className={styles.statLabel}>This Year</span>
                                <span className={styles.statValue}>{stats?.listeningStats?.yearly || 0}</span>
                            </div>
                        </div>
                        {/* <div className={styles.levelProgressContainer}>
                            <div className={styles.levelInfo}>
                                <span>Audiophile</span>
                                <span>150h to next level</span>
                            </div>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: '60%' }}></div>
                            </div>
                        </div> */}
                        {/* <div className={styles.statRows}>
                            <div className={styles.statRow}>
                                <span className={styles.statLabel}>Total Hours</span>
                                <span className={styles.statValue}>
                                    {Math.floor(stats.totalListeningTime / 3600)}h
                                </span>
                            </div>
                        </div> */}
                    </div>
                </div>

                {/* Achievements */}
                <div className={styles.infoBlock}>
                    <div className={styles.blockHeader}>
                        <h3>Achievements</h3>
                    </div>
                    <div className={styles.infoContent}>
                        <div className={styles.achievementsGrid}>
                            <div className={styles.achievementItem}>
                                <div className={styles.achievementIcon}>
                                    <i className="fas fa-list-ul"></i>
                                </div>
                                <span className={styles.achievementValue}>{playlistsNum}</span>
                                <span className={styles.achievementLabel}>Playlists Created</span>
                            </div>
                            <div className={styles.achievementItem}>
                                <div className={styles.achievementIcon}>
                                    <i className="fas fa-music"></i>
                                </div>
                                <span className={styles.achievementValue}>{stats.totalSongs}</span>
                                <span className={styles.achievementLabel}>Songs Listened</span>
                            </div>
                            <div className={styles.achievementItem}>
                                <div className={styles.achievementIcon}>
                                    <i className="fas fa-user-friends"></i>
                                </div>
                                <span className={styles.achievementValue}>{stats.totalArtists}</span>
                                <span className={styles.achievementLabel}>Artists Explored</span>
                            </div>
                            <div className={styles.achievementItem}>
                                <div className={styles.achievementIcon}>
                                    <i className="fas fa-tags"></i>
                                </div>
                                <span className={styles.achievementValue}>{stats.totalGenres}</span>
                                <span className={styles.achievementLabel}>Genres Scoured</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ProfileUserStats;