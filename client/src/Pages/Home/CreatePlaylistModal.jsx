import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import styles from "./CreatePlaylistModal.module.css";
import { X } from "lucide-react";

function CreatePlaylistModal({ onClose, onPlaylistCreated }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            setError("Playlist name is required");
            return;
        }
        
        try {
            setIsLoading(true);
            setError("");
            
            const response = await axios.post(
                "/api/playlists/create", 
                { 
                    name, 
                    description, 
                    is_public: isPublic 
                },
                { withCredentials: true }
            );
            
            if (response.status === 201) {
                setName("");
                setDescription("");
                setIsPublic(true);
                onPlaylistCreated(response.data); // Pass the newly created playlist back
                onClose();
            }
        } catch (err) {
            console.error("Failed to create playlist:", err);
            setError(err.response?.data?.error || "Failed to create playlist");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Create Playlist</h2>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <p className={styles.errorText}>{error}</p>}
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="playlistName">Name</label>
                        <input
                            type="text"
                            id="playlistName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Playlist"
                            required
                            autoFocus
                        />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add an optional description"
                            rows={3}
                        />
                    </div>
                    
                    <div className={styles.formCheck}>
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                        />
                        <label htmlFor="isPublic">Make this playlist public</label>
                    </div>
                    
                    <div className={styles.formActions}>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className={styles.cancelButton}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className={styles.createButton}
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating..." : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreatePlaylistModal;
