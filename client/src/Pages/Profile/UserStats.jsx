import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';
import MusicNotes from './MusicNotes.jsx';
import styles from "./UserStats.module.css";
import CustomCard from "./CustomCard.jsx";

function ProfileUserStats({playlistsNum}) {

    const genreData = [
        { genre: 'Lo-fi', listens: 40 },
        { genre: 'Jazz', listens: 30 },
        { genre: 'Hip-Hop', listens: 20 },
    ];

    const artistData = [
        { artist: 'Joji', listens: 50 },
        { artist: 'Frank Ocean', listens: 35 },
        { artist: 'Mac Miller', listens: 25 },
    ];

    // Song data
    const song1 = { title:"Blink",imgSrc:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_AGs18turPNgvuxXhIxC8qPknNr3XeebIDQ&s", artist : "Oberflow" , album: "SkinnyLambs" , releaseYear: "2001" , timesListened: 22};
    const song2 = { title:"Blood",imgSrc:"https://images.squarespace-cdn.com/content/v1/5ab91f0fe17ba31599313b09/1582169435029-UQKFLRGHQNOMPWKTIFYS/00b.png", artist : "3Blue1Brown" , album: "Barebell", releaseYear: "2008" , timesListened: 19};
    const song3 = { title:"Bluh",imgSrc:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREDC_xpD3U0UR3Df7OSlts-jKafIiVlR7yAw&s", artist : "Nirvana" , album: "Barbytes" , releaseYear: "2004" , timesListened: 12};

    return (
        <section className={styles.userStatsContainer}>
            {/* Top Songs Section */}
            <div className={styles.statsSection}>
                <div className={styles.sectionHeader}>
                    <h3>Top Songs</h3>
                    <button className={styles.moreButton}>See All</button>
                </div>
                <div className={styles.songGrid}>
                    <CustomCard {...song1} />
                    <CustomCard {...song2} />
                    <CustomCard {...song3} />
                </div>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                {/* Genres Chart */}
                <div className={styles.chartBlock}>
                    <div className={styles.blockHeader}>
                        <h3>Top Genres</h3>
                        <span className={styles.periodTag}>This Month</span>
                    </div>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart
                                data={genreData}
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
                                    ticks={[0, 10, 20, 30, 40, 50]}
                                    domain={[0, 'dataMax + 5']}
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
                        <span className={styles.periodTag}>This Month</span>
                    </div>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart
                                data={artistData}
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
                                    ticks={[0, 10, 20, 30, 40, 50]}
                                    domain={[0, 'dataMax + 5']}
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
                {/* Listening Hours */}
                <div className={styles.infoBlock}>
                    <div className={styles.blockHeader}>
                        <h3>Listening Hours</h3>
                        <div className={styles.levelBadge}>Level 6</div>
                    </div>
                    <div className={styles.infoContent}>
                        <MusicNotes />
                        <div className={styles.statRows}>
                            <div className={styles.statRow}>
                                <span className={styles.statLabel}>Today</span>
                                <span className={styles.statValue}>3h</span>
                            </div>
                            <div className={styles.statRow}>
                                <span className={styles.statLabel}>This Month</span>
                                <span className={styles.statValue}>38h</span>
                            </div>
                            <div className={styles.statRow}>
                                <span className={styles.statLabel}>This Year</span>
                                <span className={styles.statValue}>136h</span>
                            </div>
                        </div>
                        <div className={styles.levelProgressContainer}>
                            <div className={styles.levelInfo}>
                                <span>Audiophile</span>
                                <span>150h to next level</span>
                            </div>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: '60%' }}></div>
                            </div>
                        </div>
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
                                <span className={styles.achievementValue}>325</span>
                                <span className={styles.achievementLabel}>Songs Listened</span>
                            </div>
                            <div className={styles.achievementItem}>
                                <div className={styles.achievementIcon}>
                                    <i className="fas fa-user-friends"></i>
                                </div>
                                <span className={styles.achievementValue}>82</span>
                                <span className={styles.achievementLabel}>Artists Explored</span>
                            </div>
                            <div className={styles.achievementItem}>
                                <div className={styles.achievementIcon}>
                                    <i className="fas fa-tags"></i>
                                </div>
                                <span className={styles.achievementValue}>31</span>
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