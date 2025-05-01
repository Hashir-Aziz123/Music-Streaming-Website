import { Search, Plus } from "lucide-react";
import { useState } from "react";
import styles from "./SideBar.module.css";

function SideBar() {
    const [activeTab, setActiveTab] = useState("Playlists");
    const [searchTerm, setSearchTerm] = useState("");

    const filters = ["Playlists", "Artists", "Albums"];

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    // Sample items for demonstration
    const playlists = [
        { id: 1, title: "Chill Vibes", creator: "You", imageUrl: "https://placehold.co/400/111/e75454?text=Chill" },
        { id: 2, title: "Workout Mix", creator: "You", imageUrl: "https://placehold.co/400/222/e75454?text=Workout" },
        { id: 3, title: "Focus Flow", creator: "You", imageUrl: "https://placehold.co/400/333/e75454?text=Focus" },
        { id: 4, title: "Throwbacks", creator: "You", imageUrl: "https://placehold.co/400/444/e75454?text=Throwbacks" },
        { id: 5, title: "New Discoveries", creator: "You", imageUrl: "https://placehold.co/400/555/e75454?text=New" }
    ];

    return (
        <div className={styles.sideBarContainer}>
            <div className={styles.libraryHeader}>
                <h2 className={styles.libraryTitle}>Your Library</h2>
                <button className={styles.createButton} aria-label="Create playlist or folder">
                    <Plus size={20} />
                </button>
            </div>

            {/* Filter Buttons */}
            <div className={styles.selectors}>
                {filters.map((filter) => (
                    <button
                        key={filter}
                        className={`${styles.filterBtn} ${activeTab === filter ? styles.active : ""}`}
                        onClick={() => handleTabClick(filter)}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Search and Order */}
            <div className={styles.options}>
                <div className={styles.searchBar}>
                    <div className={styles.searchContainer}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder={`Search in ${activeTab.toLowerCase()}`}
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className={styles.orderSelectContainer}>
                    <select className={styles.orderSelect}>
                        <option value="recent">Recent</option>
                        <option value="alphabetical">A-Z</option>
                        <option value="creator">Creator</option>
                    </select>
                </div>
            </div>

            {/* Scrollable List Section */}
            <div className={styles.scrollSection}>
                <ul className={styles.itemList}>
                    {playlists.map((item) => (
                        <li key={item.id}>
                            <img src={item.imageUrl} alt={`${item.title} cover`} />
                            <div className={styles.itemContent}>
                                <div className={styles.itemTitle}>{item.title}</div>
                                <div className={styles.itemSubtitle}>Playlist • {item.creator}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default SideBar;