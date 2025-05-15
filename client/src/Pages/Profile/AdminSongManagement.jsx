import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import styles from './AdminSongManagement.module.css'; 
import { useAuth } from '../../context/AuthContext';
import { Search as SearchIcon, XCircle } from 'lucide-react'; // For search icon and clear button

const SONGS_PER_PAGE = 20; // Define how many songs to load per batch

function AdminSongManagement() {
    const { user } = useAuth();
    const [songs, setSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // For initial load or search
    const [isLoadingMore, setIsLoadingMore] = useState(false); // For loading more songs
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [songToEdit, setSongToEdit] = useState(null);

    const initialSongFormData = {
        trackId: '', title: '', artist: '', album: '', genre: '', duration_seconds: '', description: '',
    };
    const [songFormData, setSongFormData] = useState(initialSongFormData);
    const [audioFile, setAudioFile] = useState(null);
    const [coverImageFile, setCoverImageFile] = useState(null);

    // --- States for pagination and search ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // const API_BASE_URL_ADMIN_SONGS = '/api/songs/admin/songs'; // Endpoint for GETTING songs (plural)
    // const API_BASE_URL_ADMIN_SONG_CRUD = '/api/songs/admin/song'; // Endpoint for POST, PUT, DELETE (singular)

    const API_BASE_URL_ADMIN_SONGS = '/api/songs/admin'; // Endpoint for GETTING songs (plural)
    const API_BASE_URL_ADMIN_SONG_CRUD = '/api/songs/admin/song'; // Endpoint for POST, PUT, DELETE (singular)

    // Debounce search term
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms delay
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    const fetchSongs = useCallback(async (page, search, isNewSearch = false) => {
        if (isNewSearch) {
            setIsLoading(true); // Full loading state for new search
            setSongs([]); // Clear existing songs for a new search
        } else {
            setIsLoadingMore(true); // Loading more state for infinite scroll
        }
        setError(null);
        
        try {
            const response = await axios.get(API_BASE_URL_ADMIN_SONGS, {
                params: { page, limit: SONGS_PER_PAGE, search },
                withCredentials: true,
            });
            
            const { songs: newSongs, pagination } = response.data;

            setSongs(prevSongs => isNewSearch ? newSongs : [...prevSongs, ...newSongs]);
            setCurrentPage(pagination.currentPage);
            setTotalPages(pagination.totalPages);
            setHasMore(pagination.hasNextPage !== undefined ? pagination.hasNextPage : (pagination.currentPage < pagination.totalPages));

        } catch (err) {
            console.error('Failed to fetch songs:', err);
            setError(err.response?.data?.message || 'Failed to load songs.');
            setHasMore(false); // Stop trying to load more on error
        } finally {
            if (isNewSearch) setIsLoading(false);
            else setIsLoadingMore(false);
        }
    }, [API_BASE_URL_ADMIN_SONGS]);

    // Effect for initial load and when debounced search term changes
    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 for new search
        setHasMore(true); // Assume there's more until API confirms
        fetchSongs(1, debouncedSearchTerm, true); // `true` for new search
    }, [debouncedSearchTerm, fetchSongs]);


    // --- Infinite Scroll Logic ---
    const observer = useRef();
    const lastSongElementRef = useCallback(node => {
        if (isLoading || isLoadingMore) return; // Don't observe if already loading
        if (observer.current) observer.current.disconnect(); // Disconnect previous observer

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                // console.log("Visible, loading more...");
                fetchSongs(currentPage + 1, debouncedSearchTerm, false);
            }
        });

        if (node) observer.current.observe(node); // Observe the new last element
    }, [isLoading, isLoadingMore, hasMore, currentPage, debouncedSearchTerm, fetchSongs]);
    

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    
    const clearSearch = () => {
        setSearchTerm('');
        setDebouncedSearchTerm(''); // Immediately trigger fetch for empty search
    };


    // --- Form handling and CRUD operations (largely same as before) ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSongFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleAudioFileChange = (e) => setAudioFile(e.target.files[0]);
    const handleCoverImageFileChange = (e) => setCoverImageFile(e.target.files[0]);

    const resetFormsAndState = (keepSearch = false) => {
        setSongFormData(initialSongFormData);
        setAudioFile(null);
        setCoverImageFile(null);
        setShowAddForm(false);
        setShowEditForm(false);
        setSongToEdit(null);
        setError(null); 
        // setMessage(null); // Message is cleared by displayMessage timeout
        if (!keepSearch) {
           // setSearchTerm(''); // Optionally reset search on cancel/success
           // setDebouncedSearchTerm('');
        }
    };

    const displayMessage = (msg, isError = false) => {
        setMessage(msg);
        if (isError) setError(msg);
        setTimeout(() => {
            setMessage(null);
            if (isError && error === msg) setError(null); // Clear specific error if it matches
        }, 5000);
    };

    const handleSubmitAddSong = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Use main isLoading for form submissions
        setError(null);
        setMessage(null);

        const formDataPayload = new FormData();
        Object.keys(songFormData).forEach(key => formDataPayload.append(key, songFormData[key]));
        if (audioFile) formDataPayload.append('audioFile', audioFile);
        if (coverImageFile) formDataPayload.append('coverImageFile', coverImageFile);
        
        try {
            await axios.post(API_BASE_URL_ADMIN_SONG_CRUD, formDataPayload, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });
            displayMessage('Song added successfully!');
            resetFormsAndState();
            // Re-fetch songs from page 1 with current search term to see the new song
            setCurrentPage(1); 
            fetchSongs(1, debouncedSearchTerm, true); 
        } catch (err) {
            console.error('Failed to add song:', err.response?.data || err.message);
            displayMessage(err.response?.data?.message || 'Failed to add song.', true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenEditForm = (song) => {
        setSongToEdit(song);
        setSongFormData({
            trackId: song.trackId || '',
            title: song.title || '',
            artist: Array.isArray(song.artist) ? song.artist.join(',') : (song.artist || ''),
            album: song.album || '', 
            genre: Array.isArray(song.genre) ? song.genre.join(',') : (song.genre || ''),
            duration_seconds: song.duration_seconds || '',
            description: song.description || '',
        });
        setAudioFile(null); // Reset file inputs for edit
        setCoverImageFile(null);
        setShowEditForm(true);
        setShowAddForm(false);
        setError(null);
        setMessage(null);
    };

    const handleSubmitEditSong = async (e) => {
        e.preventDefault();
        if (!songToEdit || !songToEdit._id) {
            displayMessage('No song selected for editing.', true);
            return;
        }
        setIsLoading(true);
        setError(null);
        setMessage(null);

        const formDataPayload = new FormData();
        Object.keys(songFormData).forEach(key => {
            // trackId is not typically changed, but if it is, ensure it's handled.
            // For this form, we assume trackId might be part of the editable fields.
            if (songFormData[key] !== undefined && songFormData[key] !== null) { // Send only defined values
                 formDataPayload.append(key, songFormData[key]);
            }
        });
        if (audioFile) formDataPayload.append('audioFile', audioFile);
        if (coverImageFile) formDataPayload.append('coverImageFile', coverImageFile);

        try {
            await axios.put(`${API_BASE_URL_ADMIN_SONG_CRUD}/${songToEdit._id}`, formDataPayload, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });
            displayMessage('Song updated successfully!');
            resetFormsAndState();
            // Re-fetch songs from page 1 with current search term to see updated song
            setCurrentPage(1);
            fetchSongs(1, debouncedSearchTerm, true); 
        } catch (err) {
            console.error('Failed to update song:', err.response?.data || err.message);
            displayMessage(err.response?.data?.message || 'Failed to update song.', true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSong = async (songId) => {
        if (!window.confirm('Are you sure you want to delete this song? This action cannot be undone.')) return;
        
        setIsLoading(true); // Use main isLoading as it affects the list
        setError(null);
        setMessage(null);
        try {
            await axios.delete(`${API_BASE_URL_ADMIN_SONG_CRUD}/${songId}`, { withCredentials: true });
            displayMessage('Song deleted successfully.');
            // Instead of full re-fetch, just remove from local state if on current page
            // Or, for simplicity and consistency, re-fetch current view:
            setSongs(prevSongs => prevSongs.filter(s => s._id !== songId));
            // If the deleted song was the last one on a page, or to ensure pagination counts are correct,
            // a re-fetch of the current page might be better, or a full refresh from page 1.
            // For now, simple filter. A full re-fetch from page 1 might be safer for pagination data.
            // fetchSongs(1, debouncedSearchTerm, true); // This ensures total counts are updated.
        } catch (err) {
            console.error('Failed to delete song:', err.response?.data || err.message);
            displayMessage(err.response?.data?.message || 'Failed to delete song.', true);
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderSongForm = (isEditMode) => (
        <form onSubmit={isEditMode ? handleSubmitEditSong : handleSubmitAddSong} className={styles.songForm}>
            <h3 className={styles.formTitle}>{isEditMode ? 'Edit Song' : 'Add New Song'}</h3>
            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label htmlFor="trackId">Track ID (Unique Number):</label>
                    <input type="number" id="trackId" name="trackId" value={songFormData.trackId} onChange={handleInputChange} required disabled={isEditMode && songToEdit?.trackId !== undefined} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="title">Title:</label>
                    <input type="text" id="title" name="title" value={songFormData.title} onChange={handleInputChange} required />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="artist">Artist IDs (comma-separated):</label>
                    <input type="text" id="artist" name="artist" value={songFormData.artist} onChange={handleInputChange} placeholder="e.g., 101,102" required />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="album">Album ID (Number, optional):</label>
                    <input type="number" id="album" name="album" value={songFormData.album} onChange={handleInputChange} placeholder="e.g., 201" />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="genre">Genres (comma-separated, optional):</label>
                    <input type="text" id="genre" name="genre" value={songFormData.genre} onChange={handleInputChange} placeholder="e.g., Pop,Rock" />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="duration_seconds">Duration (seconds):</label>
                    <input type="number" step="0.01" id="duration_seconds" name="duration_seconds" value={songFormData.duration_seconds} onChange={handleInputChange} required />
                </div>
                <div className={styles.formGroupFull}>
                    <label htmlFor="description">Description (optional):</label>
                    <textarea id="description" name="description" value={songFormData.description} onChange={handleInputChange} rows="3"></textarea>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="audioFile">{isEditMode ? "Replace Audio (optional):" : "Audio File:"}</label>
                    <input type="file" id="audioFile" name="audioFile" onChange={handleAudioFileChange} accept=".mp3,.wav,.ogg" />
                    {isEditMode && songToEdit?.audio_url && !audioFile && <small>Current: {songToEdit.audio_url.split('/').pop()}</small>}
                </div>
                {/* <div className={styles.formGroup}>
                    <label htmlFor="coverImageFile">{isEditMode ? "Replace Cover (optional):" : "Cover Image (optional):"}</label>
                    <input type="file" id="coverImageFile" name="coverImageFile" onChange={handleCoverImageFileChange} accept=".jpg,.jpeg,.png,.gif" />
                     {isEditMode && songToEdit?.cover_image_url && !coverImageFile && <small>Current: {songToEdit.cover_image_url.split('/').pop()}</small>}
                </div> */}
            </div>
            <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton} disabled={isLoading || isLoadingMore}>
                    {(isLoading || isLoadingMore) ? 'Saving...' : (isEditMode ? 'Update Song' : 'Add Song')}
                </button>
                <button type="button" className={styles.cancelButton} onClick={() => resetFormsAndState(true)} disabled={isLoading || isLoadingMore}>
                    Cancel
                </button>
            </div>
        </form>
    );

    if (!user || user.role !== 'admin') {
        return <p className={styles.error}>Access Denied. Admin privileges required.</p>;
    }

    return (
        <div className={styles.adminSongManagementContainer}>
            <h2 className={styles.mainTitle}>Song Management</h2>

            {message && <div className={`${styles.message} ${error ? styles.errorMessage : styles.successMessage}`}>{message}</div>}
            
            <div className={styles.controlsHeader}>
                {!showAddForm && !showEditForm && (
                    <button onClick={() => { setShowAddForm(true); setMessage(null); setError(null); setSongFormData(initialSongFormData); }} className={styles.actionButton} disabled={isLoading || isLoadingMore}>
                        Add New Song
                    </button>
                )}
                <div className={styles.searchContainer}>
                    <SearchIcon className={styles.searchIcon} size={20} />
                    <input
                        type="text"
                        placeholder="Search songs by title..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                        disabled={isLoading || isLoadingMore}
                    />
                    {searchTerm && (
                        <button onClick={clearSearch} className={styles.clearSearchButton} aria-label="Clear search">
                            <XCircle size={20} />
                        </button>
                    )}
                </div>
            </div>


            {showAddForm && renderSongForm(false)}
            {showEditForm && songToEdit && renderSongForm(true)}

            <div className={styles.songListSection}>
                <h3 className={styles.sectionTitle}>
                    {debouncedSearchTerm ? `Search Results for "${debouncedSearchTerm}"` : "Existing Songs"}
                </h3>
                
                {isLoading && songs.length === 0 && <p className={styles.loadingText}>Loading songs...</p>}
                {!isLoading && error && songs.length === 0 && <p className={styles.errorMessage}>{error}</p>}
                {!isLoading && !error && songs.length === 0 && !debouncedSearchTerm && <p>No songs found. Add some!</p>}
                {!isLoading && !error && songs.length === 0 && debouncedSearchTerm && <p>No songs found matching "{debouncedSearchTerm}".</p>}
                
                {songs.length > 0 && (
                    <ul className={styles.songList}>
                        {songs.map((song, index) => {
                            // If this is the last song in the current list, attach the ref for IntersectionObserver
                            if (songs.length === index + 1) {
                                return (
                                    <li key={song._id || index} ref={lastSongElementRef} className={styles.songListItem}>
                                        <div className={styles.songInfo}>
                                            <strong className={styles.songTitle}>{song.title}</strong> (Track ID: {song.trackId})
                                            <p className={styles.songDetails}>
                                                By: {song.artistDetails?.map(a => a.name).join(', ') || 'N/A'} | Album: {song.albumDetails?.title || 'N/A'}
                                            </p>
                                            {song.audio_url && <small>Audio: <a href={song.audio_url} target="_blank" rel="noopener noreferrer">{song.audio_url.split('/').pop()}</a></small>}<br/>
                                            {song.cover_image_url && <small>Cover: <a href={song.cover_image_url} target="_blank" rel="noopener noreferrer">{song.cover_image_url.split('/').pop()}</a></small>}
                                        </div>
                                        <div className={styles.songActions}>
                                            <button onClick={() => handleOpenEditForm(song)} className={styles.editButton} disabled={isLoading || isLoadingMore}>Edit</button>
                                            <button onClick={() => handleDeleteSong(song._id)} className={styles.deleteButton} disabled={isLoading || isLoadingMore}>Delete</button>
                                        </div>
                                    </li>
                                );
                            } else {
                                return (
                                     <li key={song._id || index} className={styles.songListItem}>
                                        <div className={styles.songInfo}>
                                            <strong className={styles.songTitle}>{song.title}</strong> (Track ID: {song.trackId})
                                            <p className={styles.songDetails}>
                                                By: {song.artistDetails?.map(a => a.name).join(', ') || 'N/A'} | Album: {song.albumDetails?.title || 'N/A'}
                                            </p>
                                            {song.audio_url && <small>Audio: <a href={song.audio_url} target="_blank" rel="noopener noreferrer">{song.audio_url.split('/').pop()}</a></small>}<br/>
                                            {song.cover_image_url && <small>Cover: <a href={song.cover_image_url} target="_blank" rel="noopener noreferrer">{song.cover_image_url.split('/').pop()}</a></small>}
                                        </div>
                                        <div className={styles.songActions}>
                                            <button onClick={() => handleOpenEditForm(song)} className={styles.editButton} disabled={isLoading || isLoadingMore}>Edit</button>
                                            <button onClick={() => handleDeleteSong(song._id)} className={styles.deleteButton} disabled={isLoading || isLoadingMore}>Delete</button>
                                        </div>
                                    </li>
                                );
                            }
                        })}
                    </ul>
                )}
                {isLoadingMore && <p className={styles.loadingText}>Loading more songs...</p>}
                {!isLoadingMore && !hasMore && songs.length > 0 && <p className={styles.allLoadedText}>All songs loaded.</p>}
            </div>
        </div>
    );
}

export default AdminSongManagement;
