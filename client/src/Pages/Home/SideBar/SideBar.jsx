import styles from "./SideBar.module.css";
import modernLogo2 from "../../../assets/modernLogo2.png";
import { Search } from "lucide-react";
import { useState } from "react";

function SideBar() {
    const [activeTab, setActiveTab] = useState("Playlists");

    const filters = ["Playlists", "Artists", "Albums"];

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className={styles.sideBarContainer}>
            <div className={styles.createButtonContainer}>
                <h2 className={styles.libraryTitle}>Your Library</h2>
                <button  className={styles.createSelectBox}>Create +</button>
                {/*<select className={styles.createSelectBox}>*/}
                {/*    <option>+ Create</option>*/}
                {/*</select>*/}
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
                    <div className={styles.left}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab.toLowerCase()}...`}
                            className={styles.searchInput}
                        />
                    </div>
                </div>
                <div className={styles.orderButtonContainer}>
                    <select className={styles.orderSelectBox}>
                        <option>Recent</option>
                        <option>Alphabetical</option>
                        <option>Recently Added</option>
                    </select>
                </div>
            </div>

            {/* Scrollable List Section */}
            <div className={styles.scrollSection}>
                {/* You'll populate this dynamically later */}
                <ul className={styles.itemList}>
                    <li><img src={"https://www.billboard.com/wp-content/uploads/media/tyler-the-creator-igor-album-art-2019-billboard-embed.jpg?w=600"}/>
                        Study Music
                    </li>
                    <li><img src={"https://www.billboard.com/wp-content/uploads/media/tyler-the-creator-igor-album-art-2019-billboard-embed.jpg?w=600"}/>
                        Study Music
                    </li>
                    <li><img src={"https://www.billboard.com/wp-content/uploads/media/tyler-the-creator-igor-album-art-2019-billboard-embed.jpg?w=600"}/>
                        Study Music
                    </li>
                    <li><img src={"https://www.billboard.com/wp-content/uploads/media/tyler-the-creator-igor-album-art-2019-billboard-embed.jpg?w=600"}/>
                        Study Music
                    </li>
                    <li><img src={"https://www.billboard.com/wp-content/uploads/media/tyler-the-creator-igor-album-art-2019-billboard-embed.jpg?w=600"}/>
                        Study Music
                    </li>
                    <li><img src={"https://www.billboard.com/wp-content/uploads/media/tyler-the-creator-igor-album-art-2019-billboard-embed.jpg?w=600"}/>
                        Study Music
                    </li>
                    <li><img src={"https://www.billboard.com/wp-content/uploads/media/tyler-the-creator-igor-album-art-2019-billboard-embed.jpg?w=600"}/>
                        Study Music
                    </li>
                    <li><img src={"https://www.billboard.com/wp-content/uploads/media/tyler-the-creator-igor-album-art-2019-billboard-embed.jpg?w=600"}/>
                        Study Music
                    </li>
                    <li><img src={"https://www.billboard.com/wp-content/uploads/media/tyler-the-creator-igor-album-art-2019-billboard-embed.jpg?w=600"}/>
                        Study Music
                    </li>
                    <li><img src={"https://www.billboard.com/wp-content/uploads/media/tyler-the-creator-igor-album-art-2019-billboard-embed.jpg?w=600"}/>
                        Study Music
                    </li>
                    <li><img src={"https://www.billboard.com/wp-content/uploads/media/tyler-the-creator-igor-album-art-2019-billboard-embed.jpg?w=600"}/>
                        Study Music
                    </li>
                    <li><img src={"https://www.billboard.com/wp-content/uploads/media/tyler-the-creator-igor-album-art-2019-billboard-embed.jpg?w=600"}/>
                        Study Music
                    </li>
                    <li><img src={"https://www.billboard.com/wp-content/uploads/media/tyler-the-creator-igor-album-art-2019-billboard-embed.jpg?w=600"}/>
                        Study Music
                    </li>
                    <li><img src={"https://www.billboard.com/wp-content/uploads/media/tyler-the-creator-igor-album-art-2019-billboard-embed.jpg?w=600"}/>
                        Study Music
                    </li>
                    <li><img src={"https://www.billboard.com/wp-content/uploads/media/tyler-the-creator-igor-album-art-2019-billboard-embed.jpg?w=600"}/>
                        Study Music
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default SideBar;