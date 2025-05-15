import {useEffect, useState, useRef, useCallback} from "react";
import styles from "./Home.module.css";
import TopBar from "./TopBar.jsx";
import CurrentlyPlayingSection from "./CurrentlyPlayingSection.jsx";
import SideBar from "./SideBar.jsx";
import MediaControlBar from "./MediaControlBar.jsx";
import AllSongsView, { LoadingIndicator } from "./AllSongsView.jsx";
import AlbumView from "./AlbumView.jsx";
import ArtistView from "./ArtistView.jsx";
import RecommendationView from "./RecommendationView.jsx";
import PlaylistView from "./PlaylistView.jsx";
import CreatePlaylistModal from "./CreatePlaylistModal.jsx";
import SearchResultsView from "./SearchResultsView.jsx";
import {useAuth} from "../../context/AuthContext.jsx";
import axios from "axios";
import {PlaybackProvider, usePlayback} from "../../context/PlaybackContext.jsx";

function Home() {
    const [user, setUser] = useState(useAuth());
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [previousSong, setPreviousSong] = useState(null);
    const [currentSong, setCurrentSong] = useState(null);
    const [songsPlayed, setSongsPlayed] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [artistsMap, setArtistsMap] = useState({});
    const [albumsMap, setAlbumsMap] = useState({});
    const [playlistRefreshTrigger, setPlaylistRefreshTrigger] = useState(0);
    const [selectedPlaylistRefreshTrigger, setSelectedPlaylistRefreshTrigger] = useState(0);
    
    // Playlist playback states
    const [playlistMode, setPlaylistMode] = useState(false);
    const [currentPlaylist, setCurrentPlaylist] = useState(null);
    const [playlistSongs, setPlaylistSongs] = useState([]);
    const [playbackQueue, setPlaybackQueue] = useState([]);
    const [shuffleMode, setShuffleMode] = useState(false);
    const [repeatMode, setRepeatMode] = useState(false);
    
    // Album view states
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [albumSongs, setAlbumSongs] = useState([]);
    const [loadingAlbum, setLoadingAlbum] = useState(false);
    
    // Artist view states
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [artistSongs, setArtistSongs] = useState([]);
    const [artistAlbums, setArtistAlbums] = useState([]);
    const [loadingArtist, setLoadingArtist] = useState(false);
    
    // Recommendation view states
    const [showRecommendations, setShowRecommendations] = useState(true);
    const [recommendedSongs, setRecommendedSongs] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    
    // New states for genre and recommendation artist views
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [genreSongs, setGenreSongs] = useState([]);
    const [selectedRecommendedArtist, setSelectedRecommendedArtist] = useState(null);
    const [recommendedArtistSongs, setRecommendedArtistSongs] = useState([]);
      
    // All songs view state
    const [showAllSongs, setShowAllSongs] = useState(false);

    // Playlist view states
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
    
    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);

    // Pagination states
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const observer = useRef();
    const lastSongElementRef = useRef(null);

    // tracking time duration
    const { currentTime } = usePlayback();



    // log function
    async function logListening({ userId, songId, duration_listened }) {
        try {
            const response = await axios.post('/api/listening/log', {
                userId,
                songId,
                duration_listened,
            });
            console.log('Listening logged:', response.data);
        } catch (error) {
            console.error('Error logging listening:', error);
        }
    }

    useEffect(() => {
        if (previousSong && previousSong._id) {
            const songId = previousSong._id;
            const userIdToSend = user?.user?.id;

            console.log(currentTime);
            const listenedDuration = Math.floor( currentTime ); // capture once
            console.log(listenedDuration);

            setSongsPlayed(prev => prev + 1);

            if (userIdToSend) {
                logListening({
                    userId: userIdToSend,
                    songId,
                    duration_listened: listenedDuration || 0,
                })
                    .then(() => console.log("Listening logged:", songId, previousSong.title, "Duration:", listenedDuration))
                    .catch((error) => console.error("Error logging listening:", error));
            } else {
                console.warn("Skipping logListening: No userId");
            }
        }
    }, [previousSong, user]); // Do NOT add currentTime


    // Function to fetch songs with pagination
    const fetchSongs = useCallback(async (pageNum = 1, append = false) => {
        try {
            setLoadingMore(pageNum > 1);
            
            let response = await fetch(`http://localhost:3000/api/songs?page=${pageNum}&limit=20`);
            let json = await response.json();
    
            if (response.ok) {
                const songsData = json.songs || json;
                
                // Update pagination info
                if (json.pagination) {
                    setHasMore(json.pagination.currentPage < json.pagination.totalPages);
                } else {
                    setHasMore(songsData.length > 0);
                }
                
                // If appending, add to existing songs, otherwise replace
                if (append) {
                    setSongs(prev => [...prev, ...songsData]);
                } else {
                    setSongs(songsData);
                }
                
                // After getting songs, fetch artist and album details
                await fetchArtistsAndAlbums(songsData);
            }
            else {
                setError("Failed to retrieve songs");
            }
        }
        catch (err) {
            console.error("Error fetching songs:", err);
            setError("Error connecting to the server");
        }
        finally {
            setLoading(pageNum === 1 ? false : loading);
            setLoadingMore(false);
        }
    }, [loading]);
    
    // Initial load of songs
    useEffect(() => {
        fetchSongs(1, false);
        
        // Load recommendations on component mount
        loadRecommendations("681b690549be81240cd1c847"); // Using a default userID
    }, [fetchSongs]);

    // Setup intersection observer for infinite scroll
    const lastSongRef = useCallback(node => {
        if (loading || loadingMore) return;
        
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loadingMore) {
                setPage(prevPage => {
                    const nextPage = prevPage + 1;
                    fetchSongs(nextPage, true);
                    return nextPage;
                });
            }
        }, { threshold: 0.5 });
        
        if (node) observer.current.observe(node);
        lastSongElementRef.current = node;
    }, [loading, loadingMore, hasMore, fetchSongs]);
      // Function to handle album selection and fetching album songs
    const handleAlbumClick = async (albumId) => {
        try {
            console.log(`AlbumView: Handling click for album ID ${albumId} (${typeof albumId})`);
            
            // Ensure albumId is properly parsed if it's a string
            const parsedAlbumId = typeof albumId === 'string' ? parseInt(albumId) : albumId;
            console.log(`AlbumView: Using parsed album ID ${parsedAlbumId}`);
            
            // Reset artist view if active
            setSelectedArtist(null);
            setArtistSongs([]);
            setArtistAlbums([]);
            // Reset playlist view if active
            setSelectedPlaylist(null);
            
            setLoadingAlbum(true);
            setSelectedAlbum(parsedAlbumId);
            
            // Get album details if not already in our map
            if (!albumsMap[parsedAlbumId]) {
                console.log(`AlbumView: Fetching album details for ID ${parsedAlbumId}`);
                
                // Try both URL formats
                let albumData = null;
                const urls = [
                    `http://localhost:3000/songs/album/${parsedAlbumId}`,
                    `http://localhost:3000/api/songs/album/${parsedAlbumId}`
                ];
                
                for (const url of urls) {
                    if (albumData) break;
                    
                    try {
                        console.log(`AlbumView: Trying to fetch from ${url}`);
                        const response = await fetch(url);
                        if (response.ok) {
                            albumData = await response.json();
                            console.log(`AlbumView: Successfully fetched album ${albumData.title} (ID: ${parsedAlbumId})`);
                        } else {
                            console.log(`AlbumView: Failed to fetch album ${parsedAlbumId} from ${url}, status ${response.status}`);
                        }
                    } catch (err) {
                        console.error(`Error fetching album ${parsedAlbumId} from ${url}:`, err);
                    }
                }
                
                if (albumData) {
                    setAlbumsMap(prev => ({...prev, [parsedAlbumId]: albumData}));
                } else {
                    console.error(`AlbumView: Could not fetch album ${parsedAlbumId} from any endpoint`);
                }
            } else {
                console.log(`AlbumView: Using cached album details for ID ${parsedAlbumId}: ${albumsMap[parsedAlbumId].title}`);
            }
            
            // Try to fetch songs directly for this album from an API endpoint
            let albumSongsFetched = [];
            try {
                // Check for endpoint to fetch album songs directly
                console.log(`AlbumView: Fetching songs for album ID ${parsedAlbumId}`);
                const urls = [
                    `http://localhost:3000/songs?albumId=${parsedAlbumId}`,
                    `http://localhost:3000/api/songs?albumId=${parsedAlbumId}`
                ];
                
                for (const url of urls) {
                    if (albumSongsFetched.length > 0) break;
                    
                    try {
                        const response = await fetch(url);
                        if (response.ok) {
                            const data = await response.json();
                            albumSongsFetched = data.songs || [];
                            console.log(`AlbumView: Fetched ${albumSongsFetched.length} songs for album ${parsedAlbumId} from ${url}`);
                        }
                    } catch (err) {
                        console.error(`Error fetching album songs from ${url}:`, err);
                    }
                }
            } catch (err) {
                console.error(`Error in album songs fetching process:`, err);
            }
            
            // As a fallback, also filter from current songs list
            const filteredSongs = songs.filter(song => song.album === parsedAlbumId);
            console.log(`AlbumView: Found ${filteredSongs.length} songs from local state for album ${parsedAlbumId}`);
            
            // Combine and deduplicate songs
            const combinedSongs = [...albumSongsFetched];
            
            // Add any songs from the filtered list that aren't already in the fetched list
            filteredSongs.forEach(song => {
                if (!combinedSongs.some(s => s._id === song._id)) {
                    combinedSongs.push(song);
                }
            });
            
            console.log(`AlbumView: Setting ${combinedSongs.length} total songs for album ${parsedAlbumId}`);
            setAlbumSongs(combinedSongs);
        } catch (error) {
            console.error("Error fetching album songs:", error);
        } finally {
            setLoadingAlbum(false);
        }
    };
      // Function to handle artist selection and fetching artist songs and albums
    const handleArtistClick = async (artistId) => {
        try {
            console.log(`ArtistView: Handling click for artist ID ${artistId} (${typeof artistId})`);
            
            // Ensure artistId is an integer as the server expects
            const parsedArtistId = typeof artistId === 'string' ? parseInt(artistId) : artistId;
            console.log(`ArtistView: Using parsed artist ID ${parsedArtistId} (${typeof parsedArtistId})`);
            
            // Reset album view if active
            setSelectedAlbum(null);
            setAlbumSongs([]);
            // Reset playlist view if active
            setSelectedPlaylist(null);
            
            setLoadingArtist(true);
            setSelectedArtist(parsedArtistId);
              // Get artist details if not already in our map
            if (!artistsMap[parsedArtistId]) {
                const response = await fetch(`http://localhost:3000/songs/artist/${parsedArtistId}`);
                if (response.ok) {
                    const artistData = await response.json();
                    console.log(`ArtistView: Fetched artist details for ID ${parsedArtistId}: ${artistData.name}`);
                    setArtistsMap(prev => ({...prev, [parsedArtistId]: artistData}));
                } else {
                    console.log(`ArtistView: Failed to fetch artist details for ID ${parsedArtistId}, status ${response.status}`);
                    
                    // Try alternative URL format as a fallback
                    const altResponse = await fetch(`http://localhost:3000/api/songs/artist/${parsedArtistId}`);
                    if (altResponse.ok) {
                        const artistData = await altResponse.json();
                        console.log(`ArtistView: Fetched artist details from alternative URL for ID ${parsedArtistId}: ${artistData.name}`);
                        setArtistsMap(prev => ({...prev, [parsedArtistId]: artistData}));
                    } else {
                        console.log(`ArtistView: Alternative URL also failed for artist ID ${parsedArtistId}, status ${altResponse.status}`);
                    }
                }
            } else {
                console.log(`ArtistView: Using cached artist details for ID ${parsedArtistId}: ${artistsMap[parsedArtistId].name}`);
            }// Fetch songs for this artist directly from the server using our dedicated endpoint
            // This ensures we get all songs for the artist, not just ones in the current view
            let artistSongsFetched = [];
            try {            // Try all combinations of URLs to ensure we get data
                console.log(`Fetching songs for artist ID ${parsedArtistId} via all possible endpoints`);
                
                // Try each endpoint until one succeeds
                const endpoints = [
                    `http://localhost:3000/songs/artist/${parsedArtistId}/songs`,
                    `http://localhost:3000/api/songs/artist/${parsedArtistId}/songs`,
                    `http://localhost:3000/songs?artistId=${parsedArtistId}`,
                    `http://localhost:3000/api/songs?artistId=${parsedArtistId}`
                ];
                
                let successfulFetch = false;
                
                for (const endpoint of endpoints) {
                    if (successfulFetch) break;
                    
                    try {
                        console.log(`Trying endpoint: ${endpoint}`);
                        const response = await fetch(endpoint);
                        
                        if (response.ok) {
                            const data = await response.json();
                            if (endpoint.includes('?artistId=')) {
                                // For query parameter endpoints that return a songs array inside data
                                artistSongsFetched = data.songs || [];
                            } else {
                                // For direct endpoints that return the array directly
                                artistSongsFetched = data || [];
                            }
                            
                            console.log(`Success! Fetched ${artistSongsFetched.length} songs from ${endpoint}`);
                            
                            if (artistSongsFetched.length > 0) {
                                console.log(`First few songs: ${artistSongsFetched.slice(0, 3).map(s => s.title).join(', ')}${artistSongsFetched.length > 3 ? '...' : ''}`);
                                successfulFetch = true;
                            } else {
                                console.log(`Endpoint ${endpoint} returned empty result, trying next...`);
                            }
                        } else {
                            console.log(`Endpoint ${endpoint} failed with status ${response.status}, trying next...`);
                        }
                    } catch (err) {
                        console.error(`Error fetching from ${endpoint}:`, err);
                    }
                }
                
                if (!successfulFetch) {
                    console.error(`All endpoints failed for artist ID ${parsedArtistId}`);
                }
            } catch (err) {
                console.error("Error fetching artist songs from API:", err);
            }
              // As a fallback, also include songs from the current list
            const artistSongsFiltered = songs.filter(song => {
                if (Array.isArray(song.artist)) {
                    return song.artist.includes(parsedArtistId);
                }
                return song.artist === parsedArtistId;
            });
            
            console.log(`ArtistView: Found ${artistSongsFiltered.length} songs from local state`);
              // Combine and deduplicate songs
            const combinedSongs = [...artistSongsFetched];
            
            // Add any songs from the filtered list that aren't already in the fetched list
            artistSongsFiltered.forEach(song => {
                if (!combinedSongs.some(s => s._id === song._id)) {
                    combinedSongs.push(song);
                }
            });
            
            console.log(`ArtistView: Found ${artistSongsFetched.length} songs from API and ${artistSongsFiltered.length} from local state`);
            console.log(`ArtistView: Setting ${combinedSongs.length} total songs for artist ${parsedArtistId}`);
            
            // If we still have no songs, log a more detailed error
            if (combinedSongs.length === 0) {
                console.error(`ArtistView: No songs found for artist ${parsedArtistId} via any method`);
                // Check if we have any songs in the global state
                console.log(`ArtistView: Total songs in global state: ${songs.length}`);
                
                // Check if we can find any songs with this artist in our global state
                const anySongsWithArtist = songs.filter(song => {
                    if (Array.isArray(song.artist)) {
                        return song.artist.some(a => {
                            if (typeof a === 'object') return a._id === parsedArtistId || a.artistID === parsedArtistId;
                            return a === parsedArtistId;
                        });
                    }
                    
                    if (typeof song.artist === 'object') {
                        return song.artist._id === parsedArtistId || song.artist.artistID === parsedArtistId;
                    }
                    
                    return song.artist === parsedArtistId;
                });
                console.log(`ArtistView: Found ${anySongsWithArtist.length} songs with any match for artist ${parsedArtistId}`);
            }
              setArtistSongs(combinedSongs);
            
            // Find albums by this artist from all songs
            const albumIds = new Set();
            combinedSongs.forEach(song => {
                if (song.album) {
                    albumIds.add(song.album);
                }
            });
            
            console.log(`ArtistView: Found ${albumIds.size} unique albums for artist ${parsedArtistId}`);
            
            // Fetch any album details we don't already have
            const artistAlbumsFiltered = [];
              for (const albumId of albumIds) {
                if (!albumsMap[albumId]) {
                    try {
                        // Try both URL formats to ensure we can get the album data
                        console.log(`ArtistView: Fetching album ${albumId}`);
                        let albumData = null;
                        let foundAlbum = false;
                        
                        // Try with and without /api prefix
                        const urls = [
                            `http://localhost:3000/songs/album/${albumId}`,
                            `http://localhost:3000/api/songs/album/${albumId}`
                        ];
                        
                        for (const url of urls) {
                            if (foundAlbum) break;
                            
                            try {
                                const response = await fetch(url);
                                if (response.ok) {
                                    albumData = await response.json();
                                    foundAlbum = true;
                                    console.log(`ArtistView: Successfully fetched album ${albumData.title} (ID: ${albumId}) from ${url}`);
                                } else {
                                    console.log(`ArtistView: Failed to fetch album ${albumId} from ${url}, status ${response.status}`);
                                }
                            } catch (urlError) {
                                console.error(`Error fetching album ${albumId} from ${url}:`, urlError);
                            }
                        }
                        
                        if (albumData) {
                            setAlbumsMap(prev => ({...prev, [albumId]: albumData}));
                            artistAlbumsFiltered.push(albumData);
                        } else {
                            console.error(`ArtistView: Could not fetch album ${albumId} from any endpoint`);
                        }
                    } catch (err) {
                        console.error(`Error in album fetching process for ${albumId}:`, err);
                    }
                } else {
                    console.log(`ArtistView: Using cached album ${albumsMap[albumId].title} (ID: ${albumId})`);
                    artistAlbumsFiltered.push(albumsMap[albumId]);
                }
            }
            
            setArtistAlbums(artistAlbumsFiltered);
              } catch (error) {
            console.error("Error fetching artist data:", error);
        } finally {
            console.log(`ArtistView: Finished loading, found ${artistSongs.length} songs and ${artistAlbums.length} albums`);
            setLoadingArtist(false);
        }
    };
      // Function to handle genre selection from RecommendationView
    const handleGenreClick = (genre, songs) => {
        console.log(`GenreView: Handling click for genre ${genre} with ${songs.length} songs`);
        
        // Reset other views
        setSelectedAlbum(null);
        setAlbumSongs([]);
        setSelectedArtist(null);
        setArtistSongs([]);
        setArtistAlbums([]);
        setSelectedPlaylist(null);
        setSelectedRecommendedArtist(null);
        setRecommendedArtistSongs([]);
        setShowRecommendations(false);
        setShowAllSongs(false);
        
        // Set selected genre and its songs
        setSelectedGenre(genre);
        setGenreSongs(songs);
    };
    
    // Function to handle artist selection from RecommendationView
    const handleRecommendedArtistClick = (artistId, songs) => {
        console.log(`RecommendedArtistView: Handling click for artist ID ${artistId} with ${songs.length} songs`);
        
        // Reset other views
        setSelectedAlbum(null);
        setAlbumSongs([]);
        setSelectedArtist(null);
        setArtistSongs([]);
        setArtistAlbums([]);
        setSelectedPlaylist(null);
        setSelectedGenre(null);
        setGenreSongs([]);
        setShowRecommendations(false);
        setShowAllSongs(false);
        
        // Set selected artist and its songs
        setSelectedRecommendedArtist(artistId);
        setRecommendedArtistSongs(songs);
    };

    // Function to handle back button for all detailed views
    const handleBackToAllSongs = () => {
        setSelectedAlbum(null);
        setAlbumSongs([]);
        setSelectedArtist(null);
        setArtistSongs([]);
        setArtistAlbums([]);
        setSelectedPlaylist(null);
        setSelectedGenre(null);
        setGenreSongs([]);
        setSelectedRecommendedArtist(null);
        setRecommendedArtistSongs([]);
        setShowAllSongs(false);
        setSearchQuery(""); // Clear search query
        setSearchResults(null); // Clear search results
        setShowRecommendations(true);
    };
    
    // Function to handle going to all songs view
    const handleAllSongsClick = () => {
        setSelectedAlbum(null);
        setAlbumSongs([]);
        setSelectedArtist(null);
        setArtistSongs([]);
        setArtistAlbums([]);
        setSelectedPlaylist(null);
        setShowRecommendations(false);
        setShowAllSongs(true);
    };
    
    // Function to handle playlist selection
    const handlePlaylistClick = (playlist) => {
        // Reset other views if active
        setSelectedAlbum(null);
        setAlbumSongs([]);
        setSelectedArtist(null);
        setArtistSongs([]);
        setArtistAlbums([]);
        
        // Set selected playlist
        setSelectedPlaylist(playlist);
    };
    
    // Function to handle playlist creation success
    const handlePlaylistCreated = (newPlaylist) => {
        // Close the modal
        setShowCreatePlaylistModal(false);
        
        // Set the refresh trigger to force SideBar to reload playlists
        setPlaylistRefreshTrigger(prev => prev + 1);
        
        // Optionally, automatically select the newly created playlist
        setSelectedPlaylist(newPlaylist);
    };
    
    // Function to handle when songs are added to a playlist
    const handlePlaylistSongsUpdate = (playlistId) => {
        // Increment the playlist refresh trigger to force a sidebar reload
        setPlaylistRefreshTrigger(prev => prev + 1);
        
        // If the updated playlist is the one currently being viewed, refresh it
        if (selectedPlaylist && selectedPlaylist._id === playlistId) {
            setSelectedPlaylistRefreshTrigger(prev => prev + 1);
        }
    };
    
    // Function to handle playlist deletion
    const handlePlaylistDelete = (playlistId) => {
        // Reset selected playlist if it's the one being deleted
        if (selectedPlaylist && selectedPlaylist._id === playlistId) {
            setSelectedPlaylist(null);
        }
        
        // Increment the playlist refresh trigger to force a reload of the sidebar
        setPlaylistRefreshTrigger(prev => prev + 1);
    };

    // Fetch artists and albums details
    const fetchArtistsAndAlbums = async (songsData) => {
        try {
            // Create sets of unique artist IDs and album IDs
            const artistIds = new Set();
            const albumIds = new Set();
            
            songsData.forEach(song => {
                // Add artist IDs to the set
                if (Array.isArray(song.artist)) {
                    song.artist.forEach(artistId => artistIds.add(artistId));
                } else if (song.artist) {
                    artistIds.add(song.artist);
                }
                
                // Add album ID to the set
                if (song.album) {
                    albumIds.add(song.album);
                }
            });
            
            // Fetch artist details
            const artistsData = {};
            for (const artistId of artistIds) {
                try {
                    const response = await fetch(`http://localhost:3000/api/songs/artist/${artistId}`);
                    if (response.ok) {
                        const artistData = await response.json();
                        artistsData[artistId] = artistData;
                    }
                } catch (err) {
                    console.error(`Error fetching artist ${artistId}:`, err);
                }
            }
            
            // Fetch album details
            const albumsData = {};
            for (const albumId of albumIds) {
                try {
                    const response = await fetch(`http://localhost:3000/api/songs/album/${albumId}`);
                    if (response.ok) {
                        const albumData = await response.json();
                        albumsData[albumId] = albumData;
                    }
                } catch (err) {
                    console.error(`Error fetching album ${albumId}:`, err);
                }
            }
            
            setArtistsMap(prevArtistsMap => ({...prevArtistsMap, ...artistsData}));
            setAlbumsMap(prevAlbumsMap => ({...prevAlbumsMap, ...albumsData}));
            
        } catch (err) {
            console.error("Error fetching artist and album details:", err);
        }
    };
    
    const handlePlayClick = (song, fromPlaylist = false) => {
        if (currentSong && song._id === currentSong._id) {
            // If clicking the same song that's already selected, toggle play/pause
            setIsPlaying(!isPlaying);
        } else {
            // If clicking a new song, set it as current and start playing
            setPreviousSong(currentSong || null);
            setCurrentSong(song);
            setIsPlaying(true);
            
            // Clear playlist mode if playing a song not from playlist
            if (!fromPlaylist && playlistMode) {
                setPlaylistMode(false);
                setPlaybackQueue([]);
            }
        }
    };

    //recommendation view logic
    const loadRecommendations = async (userId) => {
        try {
            setLoadingRecommendations(true);
            const response = await fetch(`http://localhost:3000/api/recommendations/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setRecommendedSongs(data || []);
            }
        } catch (error) {
            console.error("Error fetching recommendations:", error);
        } finally {
            setLoadingRecommendations(false);
        }
    };    // Function to determine which view to render
    const renderContentView = () => {
        if (selectedPlaylist) {
            return (
                <PlaylistView
                    playlist={selectedPlaylist}
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    handlePlayClick={handlePlayClick}
                    handleBackToAllSongs={handleBackToAllSongs}
                    artistsMap={artistsMap}
                    albumsMap={albumsMap}
                    isOwner={true}
                    onPlaylistUpdate={handlePlaylistSongsUpdate}
                    onPlaylistDelete={handlePlaylistDelete}
                    refreshTrigger={selectedPlaylistRefreshTrigger}
                    // Playlist functionality props
                    playlistMode={playlistMode && currentPlaylist?._id === selectedPlaylist?._id}
                    handlePlayPlaylist={handlePlayPlaylist}
                    shuffleMode={shuffleMode}
                    repeatMode={repeatMode}
                    toggleShuffle={toggleShuffle}
                    toggleRepeat={toggleRepeat}
                />
            );
        } else if (selectedGenre) {
            // Custom playlist-like view for genres
            const genrePlaylist = {
                _id: `genre-${selectedGenre}`,
                name: `${selectedGenre} Genre`,
                description: `Songs in the ${selectedGenre} genre`,
                is_public: true,
                cover_image_url: genreSongs[0]?.cover_image_url || "https://placehold.co/400/111/e75454?text=Genre",
            };
            
            return (
                <PlaylistView
                    playlist={genrePlaylist}
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    handlePlayClick={handlePlayClick}
                    handleBackToAllSongs={handleBackToAllSongs}
                    artistsMap={artistsMap}
                    albumsMap={albumsMap}
                    isOwner={false}
                    // Playlist functionality props
                    playlistMode={playlistMode && currentPlaylist?._id === genrePlaylist._id}
                    handlePlayPlaylist={handlePlayPlaylist}
                    shuffleMode={shuffleMode}
                    repeatMode={repeatMode}
                    toggleShuffle={toggleShuffle}
                    toggleRepeat={toggleRepeat}
                    // Override playlist songs with genre songs
                    playlistSongsOverride={genreSongs}
                />
            );
        } else if (selectedRecommendedArtist) {
    // Get artist details from the first song's artistDetails
    const firstSong = recommendedArtistSongs[0];
    const artistDetails = firstSong?.artistDetails?.find(
        artist => artist.artistID === selectedRecommendedArtist
    );
    const artistName = artistDetails?.name || artistsMap[selectedRecommendedArtist]?.name || "Unknown Artist";
    const artistImage = artistDetails?.image_url || 
                    recommendedArtistSongs[0]?.cover_image_url || 
                    "https://placehold.co/400/111/e75454?text=Artist";
    
    // Custom playlist-like view for recommended artist songs
    const artistPlaylist = {
        _id: `artist-${selectedRecommendedArtist}`,
        name: artistName,
        description: `Songs by ${artistName}`,
        is_public: true,
        cover_image_url: artistImage,
    };
    
    return (
        <PlaylistView
            playlist={artistPlaylist}
            currentSong={currentSong}
            isPlaying={isPlaying}
            handlePlayClick={handlePlayClick}
            handleBackToAllSongs={handleBackToAllSongs}
            artistsMap={artistsMap}
            albumsMap={albumsMap}
            isOwner={false}
            playlistMode={playlistMode && currentPlaylist?._id === artistPlaylist._id}
            handlePlayPlaylist={handlePlayPlaylist}
            shuffleMode={shuffleMode}
            repeatMode={repeatMode}
            toggleShuffle={toggleShuffle}
            toggleRepeat={toggleRepeat}
            playlistSongsOverride={recommendedArtistSongs}
        />
    );
} else if (selectedArtist) {
            return (
                <ArtistView 
                    artist={artistsMap[selectedArtist]}
                    artistSongs={artistSongs}
                    artistAlbums={artistAlbums}
                    loadingArtist={loadingArtist}
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    artistsMap={artistsMap}
                    albumsMap={albumsMap}
                    handleBackToAllSongs={handleBackToAllSongs}
                    handlePlayClick={handlePlayClick}
                    handleAlbumClick={handleAlbumClick}
                />
            );
        } else if (selectedAlbum) {
            return (
                <AlbumView 
                    album={albumsMap[selectedAlbum]}
                    albumSongs={albumSongs}
                    loadingAlbum={loadingAlbum}
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    artistsMap={artistsMap}
                    handleBackToAllSongs={handleBackToAllSongs}
                    handlePlayClick={handlePlayClick}
                />
            );        } else if (showAllSongs) {
            return (
                <AllSongsView
                    songs={songs}
                    artistsMap={artistsMap}
                    albumsMap={albumsMap}
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    lastSongRef={lastSongRef}
                    loadingMore={loadingMore}
                    hasMore={hasMore}
                    handlePlayClick={handlePlayClick}
                    handleAlbumClick={handleAlbumClick}
                    handleArtistClick={handleArtistClick}
                    handleBackToAllSongs={handleBackToAllSongs}
                />
            );
        } else {
            // Default to recommendation view
            return (
                <RecommendationView
                    isLoading={loadingRecommendations}
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    handlePlayClick={handlePlayClick}
                    artistsMap={artistsMap}
                    albumsMap={albumsMap}
                    user={user}
                    songsNumber={songsPlayed}
                    onGenreClick={handleGenreClick}
                    onArtistClick={handleRecommendedArtistClick}
                />
            );
        }
    };

    // Function to handle playlist playback
    const handlePlayPlaylist = (playlist, songs, startIndex = 0) => {
        if (!songs || songs.length === 0) return;
        
        // Set the current playlist
        setCurrentPlaylist(playlist);
        setPlaylistSongs(songs);
        
        // Generate the playback queue
        generatePlaybackQueue(songs, startIndex);
        
        // Set the first song in queue as current
        setPreviousSong(currentSong)
        setCurrentSong(songs[startIndex]);
        setIsPlaying(true);
        
        // Set playlist mode
        setPlaylistMode(true);
    };
    
    // Generate playback queue based on shuffle mode
    const generatePlaybackQueue = (songs, startIndex = 0) => {
        if (shuffleMode) {
            // Create shuffled queue with Fisher-Yates shuffle algorithm
            const shuffled = [...songs];
            
            // Move the starting song to the beginning if specified
            if (startIndex > 0 && startIndex < songs.length) {
                // Remove the song from its current position
                const startSong = shuffled.splice(startIndex, 1)[0];
                // Put it at the beginning
                shuffled.unshift(startSong);
            }
            
            // Shuffle the rest of the array (excluding the first song)
            for (let i = shuffled.length - 1; i > 0; i--) {
                // Don't include the first song in shuffling if we have a startIndex
                const j = startIndex > 0 ? 
                    Math.floor(Math.random() * i) + 1 : // Start at 1 to preserve first song
                    Math.floor(Math.random() * (i + 1)); // Regular shuffle
                    
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            setPlaybackQueue(shuffled);
        } else {
            // In order playback
            setPlaybackQueue([...songs]);
        }
    };
    
    // Handle next song function
    const handleNextSong = () => {
        if (!playlistMode || playbackQueue.length === 0) return;
        
        const currentIndex = playbackQueue.findIndex(song => song._id === currentSong._id);
        if (currentIndex === -1) return;
        
        // Check if we're at the end of the queue
        if (currentIndex === playbackQueue.length - 1) {
            if (repeatMode) {
                // If repeat mode is on, start again from the beginning
                // Re-generate the queue if shuffle is enabled to get a new order
                if (shuffleMode) {
                    generatePlaybackQueue(playlistSongs);
                    setPreviousSong(currentSong)
                    setCurrentSong(playbackQueue[0]);
                } else {
                    // Just go back to the first song
                    setPreviousSong(currentSong)
                    setCurrentSong(playbackQueue[0]);
                }
            } else {
                // If repeat mode is off, stop playing
                setPreviousSong(currentSong)
                setIsPlaying(false);
            }
        } else {
            // Play the next song in the queue
            setPreviousSong(currentSong)
            setCurrentSong(playbackQueue[currentIndex + 1]);
        }
    };
    
    // Handle previous song function
    const handlePreviousSong = () => {
        if (!playlistMode || playbackQueue.length === 0) return;
        
        const currentIndex = playbackQueue.findIndex(song => song._id === currentSong._id);
        if (currentIndex === -1) return;
        
        if (currentIndex === 0) {
            if (repeatMode) {
                // If repeat mode is on, go to the last song in the queue
                setPreviousSong(currentSong)
                setCurrentSong(playbackQueue[playbackQueue.length - 1]);
            }
            // Otherwise stay on the first song
        } else {
            // Go to the previous song
            setPreviousSong(currentSong)
            setCurrentSong(playbackQueue[currentIndex - 1]);
        }
    };
    
    // Toggle shuffle mode
    const toggleShuffle = () => {
        // Toggle state
        setShuffleMode(prev => !prev);
        
        // Regenerate queue if in playlist mode
        if (playlistMode && playlistSongs.length > 0) {
            // Keep the current song at its position when regenerating the queue
            const currentIndex = playlistSongs.findIndex(song => song._id === currentSong._id);
            generatePlaybackQueue(playlistSongs, currentIndex >= 0 ? currentIndex : 0);
        }
    };
    
    // Toggle repeat mode
    const toggleRepeat = () => {
        setRepeatMode(prev => !prev);
    };
    
    // Handle song ended event
    const handleSongEnded = () => {
        if (playlistMode) {
            handleNextSong();
        } else {
            // For single song playback, just stop playing
            setIsPlaying(false);
        }
    };

    // Function to handle search submission from TopBar
    const handleSearch = async (query) => {
        // Clear search if query is empty
        if (!query.trim()) {
            setSearchQuery("");
            setSearchResults(null);
            setSearchError(null);
            return;
        }
        
        try {
            setIsSearching(true);
            setSearchError(null);
            setSearchQuery(query);
            
            // Hide other views when searching
            setShowAllSongs(false);
            setShowRecommendations(false);
            setSelectedAlbum(null);
            setSelectedArtist(null);
            setSelectedPlaylist(null);
            
            // Make API call to search endpoint
            const response = await axios.get(`/api/search?query=${encodeURIComponent(query)}&limit=10`);
            
            if (response.data) {
                setSearchResults(response.data);
            }
        } catch (error) {
            console.error("Search error:", error);
            setSearchError("Failed to perform search. Please try again.");
        } finally {
            setIsSearching(false);
        }
    };
    
    // Function to handle "View more" clicks in search results
    const handleViewMoreClick = async (type) => {
        if (!searchQuery || !type) return;
        
        try {
            setIsSearching(true);
            
            // Make API call to search/more endpoint for specific type
            const response = await axios.get(`/api/search/more?query=${encodeURIComponent(searchQuery)}&type=${type}&page=1&limit=50`);
            
            if (response.data && response.data.results) {
                // Create a deep copy of current search results
                const updatedResults = {...searchResults};
                
                // Update just the specific section that was requested
                updatedResults[type] = response.data.results;
                
                setSearchResults(updatedResults);
            }
        } catch (error) {
            console.error(`Error fetching more ${type}:`, error);
            setSearchError(`Failed to load more ${type}. Please try again.`);
        } finally {
            setIsSearching(false);
        }
    };    return (
        <div className={styles.pageContainer}>
            <div className={styles.topSection}>
                <TopBar 
                    onAllSongsClick={handleAllSongsClick}
                    onSearch={handleSearch}
                />
            </div>
            <div className={styles.midSection}>
                <div className={styles.leftMiddle}>
                    <SideBar 
                        onPlaylistClick={handlePlaylistClick} 
                        onCreatePlaylistClick={() => setShowCreatePlaylistModal(true)}
                        onArtistClick={handleArtistClick}
                        onAlbumClick={handleAlbumClick}
                        selectedPlaylist={selectedPlaylist}
                        selectedArtistId={selectedArtist}
                        selectedAlbumId={selectedAlbum}
                        refreshTrigger={playlistRefreshTrigger}
                    />
                </div>                <div className={styles.centerMiddle}>
                    {loading && !searchQuery && <LoadingIndicator message="Loading songs..." />}
                    
                    {error && !searchQuery && <p className={styles.errorMessage}>Error: {error}</p>}
                    
                    {!loading && !error && !searchQuery && !selectedAlbum && !selectedArtist && songs.length === 0 && (
                        <p className={styles.noSongsMessage}>No songs found</p>
                    )}
                    
                    {/* Show search results when there's an active search */}
                    {searchQuery && (
                        <SearchResultsView 
                            searchQuery={searchQuery}
                            searchResults={searchResults}
                            isLoading={isSearching}
                            error={searchError}
                            currentSong={currentSong}
                            isPlaying={isPlaying}
                            handlePlayClick={handlePlayClick}
                            handleAlbumClick={handleAlbumClick}
                            handleArtistClick={handleArtistClick}
                            handlePlaylistClick={handlePlaylistClick}
                            handleBackToAllSongs={handleBackToAllSongs}
                            handleViewMoreClick={handleViewMoreClick}
                            artistsMap={artistsMap}
                            albumsMap={albumsMap}
                        />
                    )}
                    
                    {/* Show regular content view when not searching */}
                    {!searchQuery && !loading && !error && renderContentView()}
                </div>

                {<div className={styles.rightMiddle}>
                    <CurrentlyPlayingSection
                        song={currentSong}
                        artistsMap={artistsMap}
                        albumsMap={albumsMap}
                        onAlbumClick={handleAlbumClick}
                        onArtistClick={handleArtistClick}
                        onPlaylistUpdate={handlePlaylistSongsUpdate}
                    />
                </div>}
            </div>
            {currentSong && <div className={styles.bottomSection}>
                {/*<PlaybackProvider>*/}
                <MediaControlBar
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    artistsMap={artistsMap}
                    // Playlist functionality props
                    playlistMode={playlistMode}
                    shuffleMode={shuffleMode}
                    repeatMode={repeatMode}
                    handleNextSong={handleNextSong}
                    handlePreviousSong={handlePreviousSong}
                    toggleShuffle={toggleShuffle}
                    toggleRepeat={toggleRepeat}
                    handleSongEnded={handleSongEnded}
                />
                {/*</PlaybackProvider>*/}
            </div>}
            
            {showCreatePlaylistModal && (
                <CreatePlaylistModal 
                    onClose={() => setShowCreatePlaylistModal(false)} 
                    onPlaylistCreated={handlePlaylistCreated} 
                />
            )}
        </div>
    );
}

export default Home;