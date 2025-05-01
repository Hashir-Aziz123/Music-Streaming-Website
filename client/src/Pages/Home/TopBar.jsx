import { Link, useLocation } from 'react-router-dom';
import { Search, Download, Bell, User } from 'lucide-react';
import styles from './TopBar.module.css';
import logo from '../../assets/logo.png';

function TopBar() {
    const location = useLocation();
    
    return (
        <div className={styles.topBar}>
            <div className={styles.left}>
                <Link to='/'>
                    <img src={logo} className={styles.logo} alt="Drift Logo" />
                </Link>
                
                <div className={styles.searchContainer}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="What do you want to listen to?"
                        className={styles.searchInput}
                    />
                </div>
            </div>

            <div className={styles.right}>
                <div className={styles.icon}>
                    <Download size={20} />
                </div>
                
                <div className={styles.icon}>
                    <Bell size={20} />
                </div>
                
                <Link to="/profile/1">
                    <div className={styles.userIcon}>
                        <User size={18} />
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default TopBar;
