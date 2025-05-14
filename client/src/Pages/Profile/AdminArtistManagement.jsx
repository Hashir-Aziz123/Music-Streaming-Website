// src/components/Profile/AdminArtistManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './AdminArtistManagement.module.css'; // New CSS module
import { useAuth } from '../../context/AuthContext';

function AdminArtistManagement() {
    const { user } = useAuth();
    const [artists, setArtists] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [artistToEdit, setArtistToEdit] = useState(null);

    const initialArtistFormData = {
        artistID: '', // Numeric, Unique
        name: '',
        bio: '',
        country: '',
        // image_url will be handled by file upload
    };
    const [artistFormData, setArtistFormData] = useState(initialArtistFormData);
    const [artistImageFile, setArtistImageFile] = useState(null);

    const API_BASE_URL = '/api/songs/admin/artist'; // Admin routes for artists

    const fetchArtists = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Uses GET /api/songs/admin/artists which maps to getAllArtists
            const response = await axios.get('/api/songs/admin/artists', { withCredentials: true });
            setArtists(response.data.artists || []); // Assuming structure { artists: [...] }
        } catch (err) {
            console.error('Failed to fetch artists:', err);
            setError(err.response?.data?.message || 'Failed to load artists.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArtists();
    }, [fetchArtists]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setArtistFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageFileChange = (e) => {
        setArtistImageFile(e.target.files[0]);
    };

    const resetFormsAndState = () => {
        setArtistFormData(initialArtistFormData);
        setArtistImageFile(null);
        setShowAddForm(false);
        setShowEditForm(false);
        setArtistToEdit(null);
        setError(null);
        setMessage(null); // Clear messages
    };
    
    const displayMessage = (msg, isError = false) => {
        setMessage(msg);
        if (isError) setError(msg);
        setTimeout(() => {
            setMessage(null);
            if(isError) setError(null);
        }, 7000); // Longer display for errors potentially
    };


    const handleSubmitAddArtist = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        const formData = new FormData();
        Object.keys(artistFormData).forEach(key => {
            formData.append(key, artistFormData[key]);
        });
        if (artistImageFile) {
            formData.append('artistImageFile', artistImageFile);
        }

        try {
            await axios.post(API_BASE_URL, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });
            displayMessage('Artist added successfully!');
            resetFormsAndState();
            fetchArtists();
        } catch (err) {
            console.error('Failed to add artist:', err.response?.data || err.message);
            displayMessage(err.response?.data?.message || 'Failed to add artist.', true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenEditForm = (artist) => {
        setArtistToEdit(artist);
        setArtistFormData({
            artistID: artist.artistID || '', // Should not be editable in form, but good to have
            name: artist.name || '',
            bio: artist.bio || '',
            country: artist.country || '',
        });
        setArtistImageFile(null); // Reset file input for edit
        setShowEditForm(true);
        setShowAddForm(false);
        setError(null);
        setMessage(null);
    };

    const handleSubmitEditArtist = async (e) => {
        e.preventDefault();
        if (!artistToEdit || !artistToEdit.artistID) {
            displayMessage('No artist selected for editing.', true);
            return;
        }
        setIsLoading(true);
        setError(null);
        setMessage(null);

        const formData = new FormData();
        // Only send non-empty fields for update, artistID is in URL
        if (artistFormData.name) formData.append('name', artistFormData.name);
        if (artistFormData.bio) formData.append('bio', artistFormData.bio);
        if (artistFormData.country) formData.append('country', artistFormData.country);
        // artistID is not sent in body, it's in URL. Backend should prevent its change.

        if (artistImageFile) { // Only append if a new file is selected
            formData.append('artistImageFile', artistImageFile);
        }

        try {
            await axios.put(`${API_BASE_URL}/${artistToEdit.artistID}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });
            displayMessage('Artist updated successfully!');
            resetFormsAndState();
            fetchArtists();
        } catch (err) {
            console.error('Failed to update artist:', err.response?.data || err.message);
            displayMessage(err.response?.data?.message || 'Failed to update artist.', true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteArtist = async (artistIdNum) => {
        if (!window.confirm('Are you sure you want to delete this artist? This may affect associated songs if not handled by the backend.')) {
            return;
        }
        setIsLoading(true);
        setError(null);
        setMessage(null);
        try {
            await axios.delete(`${API_BASE_URL}/${artistIdNum}`, { withCredentials: true });
            displayMessage('Artist deleted successfully!');
            fetchArtists(); 
        } catch (err) {
            console.error('Failed to delete artist:', err.response?.data || err.message);
            displayMessage(err.response?.data?.message || 'Failed to delete artist. Check if artist is associated with songs.', true);
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderArtistForm = (isEditMode) => (
        <form onSubmit={isEditMode ? handleSubmitEditArtist : handleSubmitAddArtist} className={styles.entityForm}>
            <h3 className={styles.formTitle}>{isEditMode ? 'Edit Artist' : 'Add New Artist'}</h3>
            
            <div className={styles.formGrid}>
                {!isEditMode && (
                    <div className={styles.formGroup}>
                        <label htmlFor="artistID">Artist ID (Unique Number):</label>
                        <input type="number" id="artistID" name="artistID" value={artistFormData.artistID} onChange={handleInputChange} required />
                    </div>
                )}
                 {isEditMode && artistToEdit && (
                    <div className={styles.formGroup}>
                        <label>Artist ID:</label>
                        <input type="text" value={artistToEdit.artistID} disabled className={styles.disabledInput}/>
                    </div>
                )}
                <div className={styles.formGroup}>
                    <label htmlFor="name">Name:</label>
                    <input type="text" id="name" name="name" value={artistFormData.name} onChange={handleInputChange} required />
                </div>
                 <div className={styles.formGroup}>
                    <label htmlFor="country">Country (optional):</label>
                    <input type="text" id="country" name="country" value={artistFormData.country} onChange={handleInputChange} placeholder="e.g., USA, UK" />
                </div>
                <div className={styles.formGroupFull}>
                    <label htmlFor="bio">Bio (optional):</label>
                    <textarea id="bio" name="bio" value={artistFormData.bio} onChange={handleInputChange} rows="4"></textarea>
                </div>
                <div className={styles.formGroupFull}>
                    <label htmlFor="artistImageFile">{isEditMode ? "Replace Artist Image (optional):" : "Artist Image (JPG, PNG, GIF, optional):"}</label>
                    <input type="file" id="artistImageFile" name="artistImageFile" onChange={handleImageFileChange} accept=".jpg,.jpeg,.png,.gif" />
                    {isEditMode && artistToEdit?.image_url && !artistImageFile && <small>Current Image: <a href={artistToEdit.image_url} target="_blank" rel="noopener noreferrer">{artistToEdit.image_url.split('/').pop()}</a></small>}
                </div>
            </div>

            <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton} disabled={isLoading}>
                    {isLoading ? 'Saving...' : (isEditMode ? 'Update Artist' : 'Add Artist')}
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
            <h2 className={styles.mainTitle}>Artist Management</h2>

            {message && <div className={`${styles.message} ${error ? styles.errorMessage : styles.successMessage}`}>{message}</div>}
            
            {!showAddForm && !showEditForm && (
                <button onClick={() => { setShowAddForm(true); setMessage(null); setError(null); setArtistFormData(initialArtistFormData);}} className={styles.actionButton} disabled={isLoading}>
                    Add New Artist
                </button>
            )}

            {showAddForm && renderArtistForm(false)}
            {showEditForm && artistToEdit && renderArtistForm(true)}

            <div className={styles.entityListSection}>
                <h3 className={styles.sectionTitle}>Existing Artists</h3>
                {isLoading && artists.length === 0 && <p>Loading artists...</p>}
                {!isLoading && error && artists.length === 0 && <p className={styles.errorMessage}>{error}</p>}
                {!isLoading && !error && artists.length === 0 && <p>No artists found.</p>}
                
                {artists.length > 0 && (
                    <ul className={styles.entityList}>
                        {artists.map(artist => (
                            <li key={artist.artistID} className={styles.entityListItem}>
                                <div className={styles.entityInfo}>
                                    {artist.image_url && <img src={artist.image_url} alt={artist.name} className={styles.entityImage} onError={(e) => e.target.style.display='none'}/>}
                                    <div>
                                        <strong className={styles.entityName}>{artist.name}</strong> (ID: {artist.artistID})
                                        <p className={styles.entityDetails}>Country: {artist.country || 'N/A'}</p>
                                        <p className={styles.entityDetailsBio}>{artist.bio ? `${artist.bio.substring(0,100)}...` : 'No bio available.'}</p>
                                    </div>
                                </div>
                                <div className={styles.entityActions}>
                                    <button onClick={() => handleOpenEditForm(artist)} className={styles.editButton} disabled={isLoading}>Edit</button>
                                    <button onClick={() => handleDeleteArtist(artist.artistID)} className={styles.deleteButton} disabled={isLoading}>Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default AdminArtistManagement;