import styles from "./Home.module.css";
import TopBar from "./TopBar/TopBar.jsx";
import CurrentlyPlayingSection from "./CurrentlyPlayingSection/CurrentlyPlayingSection.jsx";
import SideBar from "./SideBar/SideBar.jsx";
import MediaControlBar from "./MediaControlBar/MediaControlBar.jsx";

function Home() {

    const demoSong = {
        albumArt: "https://i1.sndcdn.com/artworks-wLxNpXvbCP51ZObl-GesejA-t500x500.jpg",
        title: "Blinding Lights",
        artist: "The Weeknd",
        credits: ["Written by Abel Tesfaye", "Produced by Max Martin", "Co-produced by Oscar Holter"],
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.topSection}>
                <TopBar></TopBar>
            </div>

            <div className={styles.midSection}>
                <div className={styles.leftMiddle}>
                    <SideBar></SideBar>
                </div>
                <div className={styles.centerMiddle}>
                    <p></p>
                </div>
                <div className={styles.rightMiddle}>
                    <CurrentlyPlayingSection   title={demoSong.title}
                                               artist={demoSong.artist}
                                               albumArt={demoSong.albumArt}
                                               credits={demoSong.credits}></CurrentlyPlayingSection>
                </div>
            </div>
            <div className={styles.bottomSection}>
                <MediaControlBar></MediaControlBar>
            </div>
        </div>
    )
}

export default Home;