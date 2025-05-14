import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Plus, X, Check } from 'lucide-react';
import styles from './AddToPlaylistMenu.module.css';
import { notifyGlobalLikeChange } from '../../context/LikeContext';

function AddToPlaylistMenu({ song, onClose, onPlaylistUpdate }) {
    const [playlists, setPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessages, setSuccessMessages] = useState({});
    const [songsInPlaylists, setSongsInPlaylists] = useState({});
    const { user } = useAuth();

    useEffect(() => {
        const fetchPlaylists = async () => {
            if (!user) return;
            
            try {
                setIsLoading(true);
                const response = await axios.get(`/api/playlists/user/${user.id}`, { withCredentials: true });
                
                // Get detailed information about each playlist
                const playlistsWithSongs = await Promise.all(
                    response.data.map(async (playlist) => {
                        try {
                            const playlistDetails = await axios.get(`/api/playlists/${playlist._id}`, { withCredentials: true });
                            return {
                                ...playlist,
                                songsCount: playlistDetails.data.songs ? playlistDetails.data.songs.length : 0,
                                songs: playlistDetails.data.songs || []
                            };
                        } catch (err) {
                            console.error(`Failed to fetch songs for playlist ${playlist._id}:`, err);
                            return {
                                ...playlist,
                                songsCount: 0,
                                songs: []
                            };
                        }
                    })
                );
                
                setPlaylists(playlistsWithSongs);
                
                // Create a map of playlist IDs to whether they contain the current song
                const songMap = {};
                playlistsWithSongs.forEach(playlist => {
                    songMap[playlist._id] = playlist.songs.some(
                        playlistSong => playlistSong._id === song._id || playlistSong.trackId === song.trackId
                    );
                });
                setSongsInPlaylists(songMap);
            } catch (err) {
                console.error('Error fetching playlists:', err);
                setError('Failed to load your playlists');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlaylists();
    }, [user, song]);    const handleTogglePlaylistSong = async (playlistId) => {
        // Don't process if there's already an action in progress for this playlist
        if (successMessages[playlistId]) return;
        
        try {
            // If song is already in playlist, remove it
            if (songsInPlaylists[playlistId]) {
                await axios.delete(
                    `/api/playlists/${playlistId}/songs/${song.trackId}`, 
                    { withCredentials: true }
                );
                
                // Update the songsInPlaylists state
                setSongsInPlaylists(prev => ({
                    ...prev,
                    [playlistId]: false
                }));
                
                // Update playlists counts
                setPlaylists(prevPlaylists => 
                    prevPlaylists.map(playlist => 
                        playlist._id === playlistId 
                            ? { ...playlist, songsCount: Math.max(0, playlist.songsCount - 1) }
                            : playlist
                    )
                );
                
                // Show success message for removal
                setSuccessMessages(prev => ({
                    ...prev,
                    [playlistId]: "removed"
                }));
            } else {
                // Add the song to the playlist
                await axios.post(
                    `/api/playlists/${playlistId}/songs/${song.trackId}`, 
                    {}, 
                    { withCredentials: true }
                );
                
                // Update the songsInPlaylists state
                setSongsInPlaylists(prev => ({
                    ...prev,
                    [playlistId]: true
                }));
                
                // Update playlists counts
                setPlaylists(prevPlaylists => 
                    prevPlaylists.map(playlist => 
                        playlist._id === playlistId 
                            ? { ...playlist, songsCount: playlist.songsCount + 1 }
                            : playlist
                    )
                );
                
                // Show success message for addition
                setSuccessMessages(prev => ({
                    ...prev,
                    [playlistId]: "added"
                }));
            }
            
            // Clear message after 2 seconds
            setTimeout(() => {
                setSuccessMessages(prev => {
                    const newMessages = { ...prev };
                    delete newMessages[playlistId];
                    return newMessages;
                });
            }, 2000);            // Notify parent component about the update if the callback exists
            if (typeof onPlaylistUpdate === 'function') {
                onPlaylistUpdate(playlistId);
            }
            
            // If this is the Liked Songs playlist, we need to update the like context
            if (playlists.find(p => p._id === playlistId)?.name === "Liked Songs") {
                // Use the global function to notify about like changes
                notifyGlobalLikeChange();
            }
        } catch (err) {
            console.error('Error updating playlist:', err);
            setError(`Failed to ${songsInPlaylists[playlistId] ? 'remove from' : 'add to'} playlist`);
            
            // Clear error after 3 seconds
            setTimeout(() => setError(''), 3000);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.menuContainer} onClick={e => e.stopPropagation()}>
                <div className={styles.menuHeader}>
                    <h3>Manage Playlists</h3>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                
                {error && <div className={styles.errorMessage}>{error}</div>}
                
                <div className={styles.playlistList}>
                    {isLoading ? (
                        <div className={styles.loadingMessage}>Loading your playlists...</div>
                    ) : playlists.length === 0 ? (
                        <div className={styles.emptyMessage}>You don't have any playlists yet</div>
                    ) : (                        playlists.map(playlist => (
                            <div key={playlist._id} className={styles.playlistItem}>
                                <div className={styles.playlistInfo}>
                                    <img 
                                        src={playlist.cover_image_url || "https://placehold.co/400/111/e75454?text=Playlist"} 
                                        alt={playlist.name} 
                                        className={styles.playlistImage}
                                    />
                                    <span className={styles.playlistName}>{playlist.name}</span>
                                    <span className={styles.playlistSongs}>{playlist.songsCount} songs</span>
                                </div>                                <div className={styles.actionContainer}>
                                    {successMessages[playlist._id] && (
                                        <span className={styles.statusMessage}>
                                            {successMessages[playlist._id] === "added" ? "Added!" : "Removed!"}
                                        </span>
                                    )}
                                    <button 
                                        className={`${styles.addButton} ${songsInPlaylists[playlist._id] ? styles.inPlaylist : ''}`}
                                        onClick={() => handleTogglePlaylistSong(playlist._id)}
                                        disabled={successMessages[playlist._id] === "added" || successMessages[playlist._id] === "removed"}
                                        title={songsInPlaylists[playlist._id] ? "Remove from playlist" : "Add to playlist"}
                                    >
                                        {songsInPlaylists[playlist._id] ? (
                                            <Check size={18} className={styles.checkIcon} />
                                        ) : (
                                            <Plus size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default AddToPlaylistMenu;
