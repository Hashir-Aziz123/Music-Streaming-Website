import styles from './TopBar.module.css';
import { Search, Download, User } from 'lucide-react';
import logo from '../../assets/logo.png';

function TopBar() {
    return (
        <div className={styles.topBar}>
            <div className={styles.left}>
                <img src={logo}  className={styles.logo}></img>
                <Search size={20} className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="What do you want to play?"
                    className={styles.searchInput}
                />
            </div>

            <div className={styles.right}>
                <Download size={20} className={styles.icon} />
                <div className={styles.avatar}>H</div>
            </div>
        </div>
    );
}

export default TopBar;
