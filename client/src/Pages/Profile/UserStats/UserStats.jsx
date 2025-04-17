import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';
import MusicNotes from '../MusicNotes/MusicNotes.jsx';
import styles from "./UserStats.module.css";
import CustomCard from "../CustomCard/CustomCard.jsx";

function ProfileUserStats() {

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

    // --- Song data remains the same ---
    const song1 = { title:"Bluh",imgSrc:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREDC_xpD3U0UR3Df7OSlts-jKafIiVlR7yAw&s", artist : "Nirvana" , album: "Barbytes" , releaseYear: "2004" , timesListened: 12};
    const song2 = { title:"Blood",imgSrc:"https://images.squarespace-cdn.com/content/v1/5ab91f0fe17ba31599313b09/1582169435029-UQKFLRGHQNOMPWKTIFYS/00b.png", artist : "3Blue1Brown" , album: "Barebell", releaseYear: "2008" , timesListened: 19};
    const song3 = { title:"Blink",imgSrc:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_AGs18turPNgvuxXhIxC8qPknNr3XeebIDQ&s", artist : "Oberflow" , album: "SkinnyLambs" , releaseYear: "2001" , timesListened: 22};


    return (
        <section className={styles.userStatsGrid}>

            {/* --- Top Genres Chart --- */}
            <div className={styles.statBlock} style={{ gridArea: "box1" }}>
                <h3>Top Genres</h3>
                {/* Increased height */}
                <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                            data={genreData}
                            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            // Set gap between categories to 0
                            barCategoryGap={0}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#555"
                                horizontal={true}
                                vertical={false}
                            />
                            <XAxis
                                dataKey="genre"
                                stroke="#8884d8"
                                tick={{ fill: '#fff', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#8884d8"
                                tick={{ fill: '#fff', fontSize: 12 }}
                                tickFormatter={(tick) => `${tick}`}
                                axisLine={false}
                                tickLine={false}
                                ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40]}
                                domain={[0, 'dataMax + 5']}
                            />
                            <Tooltip
                                cursor={false}
                                contentStyle={{ backgroundColor: '#222', borderRadius: '10px', border: 'none' }}
                                labelStyle={{ color: '#f72585' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar
                                dataKey="listens"
                                fill="#F72585"
                                radius={[10, 10, 0, 0]}
                                // Add stroke for separation line
                                stroke="#000" // Black color for the line
                                strokeWidth={2} // Width of the line (adjust as needed)
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

            {/* --- Top Artists Chart --- */}
            <div className={styles.statBlock} style={{ gridArea: "box2" }}>
                <h3>Top Artists</h3>
                {/* Increased height */}
                <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={250} >
                        <BarChart
                            data={artistData}
                            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            // Set gap between categories to 0
                            barCategoryGap={0}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#555"
                                horizontal={true}
                                vertical={false}
                            />
                            <XAxis
                                dataKey="artist"
                                stroke="#8884d8"
                                tick={{ fill: '#fff', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#8884d8"
                                tick={{ fill: '#fff', fontSize: 12 }}
                                tickFormatter={(tick) => `${tick}`}
                                axisLine={false}
                                tickLine={false}
                                ticks={[0, 10, 20, 30, 40, 50]}
                                domain={[0, 'dataMax + 5']}
                            />
                            <Tooltip
                                cursor={false}
                                contentStyle={{ backgroundColor: '#222', borderRadius: '10px', border: 'none' }}
                                labelStyle={{ color: '#f72585' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar
                                dataKey="listens"
                                fill="#F72585"
                                radius={[10, 10, 0, 0]}
                                // Add stroke for separation line
                                stroke="#000" // Black color for the line
                                strokeWidth={2} // Width of the line (adjust as needed)
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


            {/* --- Rest of your component --- */}
            {/* ... (rest of your JSX remains the same) ... */}
            <div className={styles.songBlock} style={{ gridArea: "box3" }}>
                <h3>Top Songs</h3>
                <div className={styles.songFlexBox} >
                    <CustomCard {...song1}></CustomCard>
                    <CustomCard {...song2}></CustomCard>
                    <CustomCard {...song3}></CustomCard>
                </div>
            </div>

            <div className={styles.statBlock} style={{gridArea: "box4"}}>
                <MusicNotes />
                <h3>Listening Hours</h3>
                <h4>Level 6 : Audiophile</h4>
                <h4>Today</h4>
                <p>3h</p>
                <h4>This Month</h4>
                <p>38h</p>
                <h4>This year</h4>
                <p>136h</p>
            </div>

            <div className={styles.statBlock} style={{gridArea: "box5"}}>
                <h3>Achievements</h3>
                <h4>Playlists Created</h4>
                <p>20</p>
                <h4>Songs listened</h4>
                <p>325</p>
                <h4>Artists explored</h4>
                <p>82</p>
                <h4>Genres scoured</h4>
                <p>31</p>
            </div>
        </section>
    );
}

export default ProfileUserStats;