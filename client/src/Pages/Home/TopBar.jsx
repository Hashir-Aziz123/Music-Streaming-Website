import { Link, useLocation } from 'react-router-dom';
import { Search, Download, Bell, User, Music } from 'lucide-react';
import styles from './TopBar.module.css';
import logo from '../../assets/logo.png';
import PropTypes from 'prop-types';

function TopBar({ onAllSongsClick }) {
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
            </div>            <div className={styles.right}>
                <button 
                    className={styles.allSongsButton}
                    onClick={onAllSongsClick}
                    title="View All Songs"
                >
                    <Music size={18} />
                    <span>All Songs</span>
                </button>
                
                <div className={styles.icon}>
                    <Bell size={20} />
                </div>
                
                <Link to="/profile">
                    <div className={styles.userIcon}>
                        <User size={18} />
                    </div>
                </Link>
            </div>
        </div>
    );
}

TopBar.propTypes = {
    onAllSongsClick: PropTypes.func
};

export default TopBar;
