import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Music, X } from 'lucide-react';
import styles from './TopBar.module.css';
import logo from '../../../assets/logo_no_text.png';
import PropTypes from 'prop-types';

function TopBar({ onAllSongsClick, onSearch }) {
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };
    
    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            onSearch(searchQuery);
        }
    };
    
    const clearSearch = () => {
        setSearchQuery('');
        // If there was an active search, return to the default view
        if (onSearch) {
            onSearch('');
        }
    };
    
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
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyPress={handleSearchSubmit}
                    />
                    {searchQuery && (
                        <button 
                            className={styles.clearSearchButton} 
                            onClick={clearSearch}
                            aria-label="Clear search"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>
            <div className={styles.right}>
                <button 
                    className={styles.allSongsButton}
                    onClick={onAllSongsClick}
                    title="View All Songs"
                >
                    <Music size={18} />
                    <span>All Songs</span>
                </button>
                
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
    onAllSongsClick: PropTypes.func,
    onSearch: PropTypes.func
};

export default TopBar;
