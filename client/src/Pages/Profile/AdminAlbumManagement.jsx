// src/components/Profile/AdminAlbumManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './AdminAlbumManagement.module.css'; // New CSS module
import { useAuth } from '../../context/AuthContext';

function AdminAlbumManagement() {
    const { user } = useAuth();
    const [albums, setAlbums] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [albumToEdit, setAlbumToEdit] = useState(null);

    // For fetching artists to populate a dropdown or for validation (optional enhancement)
    // const [allArtists, setAllArtists] = useState([]); 

    const initialAlbumFormData = {
        album_id: '', // Numeric, Unique
        title: '',
        artist: '', // Comma-separated Artist IDs
        release_date: '',
        genre: '', // Comma-separated genres
        description: '',
    };
    const [albumFormData, setAlbumFormData] = useState(initialAlbumFormData);
    const [albumImageFile, setAlbumImageFile] = useState(null);

    const API_BASE_URL = '/api/songs/admin/album'; // Admin routes for albums

    const fetchAlbums = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Uses GET /api/songs/admin/albums which maps to getAllAlbums
            const response = await axios.get('/api/songs/admin/albums', { withCredentials: true });
            setAlbums(response.data.albums || []); // Assuming structure { albums: [...] }
        } catch (err) {
            console.error('Failed to fetch albums:', err);
            setError(err.response?.data?.message || 'Failed to load albums.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Optional: Fetch artists for a dropdown or validation aid
    // useEffect(() => {
    //     const fetchAllArtistsForSelect = async () => {
    //         try {
    //             const response = await axios.get('/api/songs/admin/artists', { withCredentials: true });
    //             setAllArtists(response.data.artists || []);
    //         } catch (err) {
    //             console.error('Failed to fetch artists for select:', err);
    //         }
    //     };
    //     if (user && user.role === 'admin') {
    //         fetchAllArtistsForSelect();
    //     }
    // }, [user]);

    useEffect(() => {
        fetchAlbums();
    }, [fetchAlbums]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAlbumFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageFileChange = (e) => {
        setAlbumImageFile(e.target.files[0]);
    };

    const resetFormsAndState = () => {
        setAlbumFormData(initialAlbumFormData);
        setAlbumImageFile(null);
        setShowAddForm(false);
        setShowEditForm(false);
        setAlbumToEdit(null);
        setError(null);
        setMessage(null);
    };
    
    const displayMessage = (msg, isError = false) => {
        setMessage(msg);
        if (isError) setError(msg);
        setTimeout(() => {
            setMessage(null);
            if(isError) setError(null);
        }, 7000);
    };

    const handleSubmitAddAlbum = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        const formData = new FormData();
        Object.keys(albumFormData).forEach(key => {
            formData.append(key, albumFormData[key]);
        });
        if (albumImageFile) {
            formData.append('albumImageFile', albumImageFile);
        }

        try {
            await axios.post(API_BASE_URL, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });
            displayMessage('Album added successfully!');
            resetFormsAndState();
            fetchAlbums();
        } catch (err) {
            console.error('Failed to add album:', err.response?.data || err.message);
            displayMessage(err.response?.data?.message || 'Failed to add album.', true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenEditForm = (album) => {
        setAlbumToEdit(album);
        setAlbumFormData({
            album_id: album.album_id || '', // Not editable in form
            title: album.title || '',
            artist: Array.isArray(album.artist) ? album.artist.join(',') : (album.artist || ''), // artist IDs
            release_date: album.release_date ? new Date(album.release_date).toISOString().split('T')[0] : '',
            genre: Array.isArray(album.genre) ? album.genre.join(',') : (album.genre || ''),
            description: album.description || '',
        });
        setAlbumImageFile(null);
        setShowEditForm(true);
        setShowAddForm(false);
        setError(null);
        setMessage(null);
    };

    const handleSubmitEditAlbum = async (e) => {
        e.preventDefault();
        if (!albumToEdit || !albumToEdit.album_id) {
            displayMessage('No album selected for editing.', true);
            return;
        }
        setIsLoading(true);
        setError(null);
        setMessage(null);

        const formData = new FormData();
        // album_id is in URL, not body for update
        if(albumFormData.title) formData.append('title', albumFormData.title);
        if(albumFormData.artist) formData.append('artist', albumFormData.artist); // comma-separated IDs
        if(albumFormData.release_date) formData.append('release_date', albumFormData.release_date);
        if(albumFormData.genre) formData.append('genre', albumFormData.genre);
        else formData.append('genre', ''); // Send empty string to clear genres
        if(albumFormData.description) formData.append('description', albumFormData.description);
        else formData.append('description', ''); // Send empty string to clear description


        if (albumImageFile) { 
            formData.append('albumImageFile', albumImageFile);
        }

        try {
            await axios.put(`${API_BASE_URL}/${albumToEdit.album_id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });
            displayMessage('Album updated successfully!');
            resetFormsAndState();
            fetchAlbums();
        } catch (err) {
            console.error('Failed to update album:', err.response?.data || err.message);
            displayMessage(err.response?.data?.message || 'Failed to update album.', true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAlbum = async (albumIdNum) => {
        if (!window.confirm('Are you sure you want to delete this album? This may affect associated songs if not handled by the backend.')) {
            return;
        }
        setIsLoading(true);
        setError(null);
        setMessage(null);
        try {
            await axios.delete(`${API_BASE_URL}/${albumIdNum}`, { withCredentials: true });
            displayMessage('Album deleted successfully!');
            fetchAlbums(); 
        } catch (err) {
            console.error('Failed to delete album:', err.response?.data || err.message);
            displayMessage(err.response?.data?.message || 'Failed to delete album. Check if album is associated with songs.', true);
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderAlbumForm = (isEditMode) => (
        <form onSubmit={isEditMode ? handleSubmitEditAlbum : handleSubmitAddAlbum} className={styles.entityForm}>
            <h3 className={styles.formTitle}>{isEditMode ? 'Edit Album' : 'Add New Album'}</h3>
            
            <div className={styles.formGrid}>
                {!isEditMode && (
                    <div className={styles.formGroup}>
                        <label htmlFor="album_id">Album ID (Unique Number):</label>
                        <input type="number" id="album_id" name="album_id" value={albumFormData.album_id} onChange={handleInputChange} required />
                    </div>
                )}
                {isEditMode && albumToEdit && (
                     <div className={styles.formGroup}>
                        <label>Album ID:</label>
                        <input type="text" value={albumToEdit.album_id} disabled className={styles.disabledInput}/>
                    </div>
                )}
                <div className={styles.formGroup}>
                    <label htmlFor="title">Title:</label>
                    <input type="text" id="title" name="title" value={albumFormData.title} onChange={handleInputChange} required />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="artist">Artist IDs (comma-separated):</label>
                    <input type="text" id="artist" name="artist" value={albumFormData.artist} onChange={handleInputChange} placeholder="e.g., 101,102" required />
                    {/* Optional: <select multiple name="artist" value={albumFormData.artist} onChange={handleMultiSelectChange}> {allArtists.map(a => <option key={a.artistID} value={a.artistID}>{a.name}</option>)} </select> */}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="release_date">Release Date (optional):</label>
                    <input type="date" id="release_date" name="release_date" value={albumFormData.release_date} onChange={handleInputChange} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="genre">Genres (comma-separated, optional):</label>
                    <input type="text" id="genre" name="genre" value={albumFormData.genre} onChange={handleInputChange} placeholder="e.g., Pop,Rock" />
                </div>
                 <div className={styles.formGroupFull}>
                    <label htmlFor="description">Description (optional):</label>
                    <textarea id="description" name="description" value={albumFormData.description} onChange={handleInputChange} rows="3"></textarea>
                </div>
                <div className={styles.formGroupFull}>
                    <label htmlFor="albumImageFile">{isEditMode ? "Replace Album Cover (optional):" : "Album Cover (JPG, PNG, GIF, optional):"}</label>
                    <input type="file" id="albumImageFile" name="albumImageFile" onChange={handleImageFileChange} accept=".jpg,.jpeg,.png,.gif" />
                    {isEditMode && albumToEdit?.cover_image_url && !albumImageFile && <small>Current Cover: <a href={albumToEdit.cover_image_url} target="_blank" rel="noopener noreferrer">{albumToEdit.cover_image_url.split('/').pop()}</a></small>}
                </div>
            </div>

            <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton} disabled={isLoading}>
                    {isLoading ? 'Saving...' : (isEditMode ? 'Update Album' : 'Add Album')}
                </button>
                <button type="button" className={styles.cancelButton} onClick={resetFormsAndState} disabled={isLoading}>
                    Cancel
                </button>
            </div>
        </form>
    );

    if (!user || user.role !== 'admin') {
        return <p className={styles.error}>Access Denied. Admin privileges required.</p>;
    }

    return (
        <div className={styles.adminEntityManagementContainer}>
            <h2 className={styles.mainTitle}>Album Management</h2>

            {message && <div className={`${styles.message} ${error ? styles.errorMessage : styles.successMessage}`}>{message}</div>}
            
            {!showAddForm && !showEditForm && (
                <button onClick={() => { setShowAddForm(true); setMessage(null); setError(null); setAlbumFormData(initialAlbumFormData); }} className={styles.actionButton} disabled={isLoading}>
                    Add New Album
                </button>
            )}

            {showAddForm && renderAlbumForm(false)}
            {showEditForm && albumToEdit && renderAlbumForm(true)}

            <div className={styles.entityListSection}>
                <h3 className={styles.sectionTitle}>Existing Albums</h3>
                {isLoading && albums.length === 0 && <p>Loading albums...</p>}
                {!isLoading && error && albums.length === 0 && <p className={styles.errorMessage}>{error}</p>}
                {!isLoading && !error && albums.length === 0 && <p>No albums found.</p>}
                
                {albums.length > 0 && (
                    <ul className={styles.entityList}>
                        {albums.map(album => (
                            <li key={album.album_id} className={styles.entityListItem}>
                                <div className={styles.entityInfo}>
                                     {album.cover_image_url && <img src={album.cover_image_url} alt={album.title} className={styles.entityImage} onError={(e) => e.target.style.display='none'}/>}
                                    <div>
                                        <strong className={styles.entityName}>{album.title}</strong> (ID: {album.album_id})
                                        <p className={styles.entityDetails}>
                                            Artist(s): {album.artistDetails?.map(a => a.name).join(', ') || (Array.isArray(album.artist) ? album.artist.join(', ') : album.artist) || 'N/A'}
                                        </p>
                                        <p className={styles.entityDetails}>Released: {album.release_date ? new Date(album.release_date).toLocaleDateString() : 'N/A'}</p>
                                        <p className={styles.entityDetails}>Genres: {Array.isArray(album.genre) && album.genre.length > 0 ? album.genre.join(', ') : 'N/A'}</p>
                                    </div>
                                </div>
                                <div className={styles.entityActions}>
                                    <button onClick={() => handleOpenEditForm(album)} className={styles.editButton} disabled={isLoading}>Edit</button>
                                    <button onClick={() => handleDeleteAlbum(album.album_id)} className={styles.deleteButton} disabled={isLoading}>Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default AdminAlbumManagement;