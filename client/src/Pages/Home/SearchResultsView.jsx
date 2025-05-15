import { useState } from 'react';
import { ChevronRight, ArrowLeft, Play, Pause } from 'lucide-react';
import styles from './SearchResultsView.module.css';
import AlbumCard from './AlbumCard.jsx';
import ArtistCard from './ArtistCard.jsx';
import PlaylistCard from './PlaylistCard.jsx';
import PropTypes from 'prop-types';

function SearchResultsView({ 
  searchQuery,
  searchResults,
  isLoading,
  error,
  currentSong,
  isPlaying,
  handlePlayClick,
  handleAlbumClick,
  handleArtistClick,
  handlePlaylistClick,
  handleBackToAllSongs,
  handleViewMoreClick,
  artistsMap,
  albumsMap
}) {
  const { songs = [], artists = [], albums = [], playlists = [], counts = {} } = searchResults || {};
  const hasSongs = songs && songs.length > 0;
  const hasArtists = artists && artists.length > 0;
  const hasAlbums = albums && albums.length > 0;
  const hasPlaylists = playlists && playlists.length > 0;
  const hasResults = hasSongs || hasArtists || hasAlbums || hasPlaylists;

  return (
    <div className={styles.searchResultsView}>
      <div className={styles.header}>
        <button 
            className={styles.backButton} 
            onClick={handleBackToAllSongs}
        >
            <ArrowLeft size={24} />
        </button>
        <h1>Search Results for <span className={styles.queryHighlight}>"{searchQuery}"</span></h1>
      </div>

      {isLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Searching...</p>
        </div>
      )}

      {error && <p className={styles.errorMessage}>Error: {error}</p>}

      {!isLoading && !error && !hasResults && (
        <div className={styles.noResultsMessage}>
          <p>No results found for "{searchQuery}"</p>
        </div>
      )}

      {!isLoading && hasResults && (
        <div className={styles.resultsContainer}>
          {/* Songs Section */}
          {hasSongs && (
            <div className={styles.resultSection}>
              <div className={styles.sectionHeader}>
                <h2>Songs</h2>
                {counts.songs > songs.length && (
                  <button 
                    className={styles.viewMoreButton} 
                    onClick={() => handleViewMoreClick('songs')}
                  >
                    View all {counts.songs} songs <ChevronRight size={16} />
                  </button>
                )}
              </div>
              <div className={styles.songsGrid}>
                <table className={styles.songTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Artist</th>
                      <th>Album</th>
                    </tr>
                  </thead>
                  <tbody>
                    {songs.map((song, index) => {
                      const isCurrentSong = currentSong && currentSong._id === song._id;
                      const artistInfo = song.artist ? 
                        (typeof song.artist === 'object' ? song.artist : artistsMap[song.artist]) : null;
                      const albumInfo = song.album ? 
                        (typeof song.album === 'object' ? song.album : albumsMap[song.album]) : null;
                      
                      return (
                      <tr 
                          key={`${song._id}-${index}`}
                          className={`${styles.songRow} ${isCurrentSong ? styles.currentSong : ''}`}
                          onClick={() => handlePlayClick(song)}
                        ><td>
                            <div className={styles.playButtonContainer} onClick={(e) => {
                              e.stopPropagation();
                              handlePlayClick(song);
                            }}>
                              {isCurrentSong && isPlaying ? (
                                <div className={styles.playingAnimation}>
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                </div>
                              ) : (
                                <button className={styles.playButton}>
                                  <Play size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                          <td>{song.title}</td>
                          <td>
                            {artistInfo ? (
                              <span 
                                className={styles.artistLink} 
                                onClick={() => handleArtistClick(artistInfo._id || artistInfo.artistID)}
                              >
                                {artistInfo.name}
                              </span>
                            ) : 'Unknown Artist'}
                          </td>
                          <td>
                            {albumInfo ? (
                              <span 
                                className={styles.albumLink} 
                                onClick={() => handleAlbumClick(albumInfo._id || albumInfo.albumID)}
                              >
                                {albumInfo.title}
                              </span>
                            ) : 'Unknown Album'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Artists Section */}
          {hasArtists && (
            <div className={styles.resultSection}>
              <div className={styles.sectionHeader}>
                <h2>Artists</h2>
                {counts.artists > artists.length && (
                  <button 
                    className={styles.viewMoreButton} 
                    onClick={() => handleViewMoreClick('artists')}
                  >
                    View all {counts.artists} artists <ChevronRight size={16} />
                  </button>
                )}
              </div>              <div className={styles.cardsGrid}>
                {artists.map((artist) => (
                  <div 
                    key={artist._id} 
                    className={styles.cardItem}
                    onClick={() => handleArtistClick(artist._id)}
                  >
                    <ArtistCard 
                      artist={artist}
                      onClick={() => handleArtistClick(artist._id)}
                    />
                    <div className={styles.cardOverlay}>
                      <button 
                        className={styles.cardPlayButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          // If we had artist songs, we could play them here
                          handleArtistClick(artist._id);
                        }}
                      >
                        <Play size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Albums Section */}
          {hasAlbums && (
            <div className={styles.resultSection}>
              <div className={styles.sectionHeader}>
                <h2>Albums</h2>
                {counts.albums > albums.length && (
                  <button 
                    className={styles.viewMoreButton} 
                    onClick={() => handleViewMoreClick('albums')}
                  >
                    View all {counts.albums} albums <ChevronRight size={16} />
                  </button>
                )}
              </div>              <div className={styles.cardsGrid}>
                {albums.map((album) => (
                  <div 
                    key={album._id}
                    className={styles.cardItem}
                    onClick={() => handleAlbumClick(album._id)}
                  >
                    <AlbumCard 
                      album={album}
                      onClick={() => handleAlbumClick(album._id)}
                    />
                    <div className={styles.cardOverlay}>
                      <button 
                        className={styles.cardPlayButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAlbumClick(album._id);
                        }}
                      >
                        <Play size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Playlists Section */}
          {hasPlaylists && (
            <div className={styles.resultSection}>
              <div className={styles.sectionHeader}>
                <h2>Playlists</h2>
                {counts.playlists > playlists.length && (
                  <button 
                    className={styles.viewMoreButton} 
                    onClick={() => handleViewMoreClick('playlists')}
                  >
                    View all {counts.playlists} playlists <ChevronRight size={16} />
                  </button>
                )}
              </div>
              <div className={styles.cardsGrid}>
                {playlists.map((playlist) => (
                  <div 
                    key={playlist._id}
                    className={styles.cardItem}
                    onClick={() => handlePlaylistClick(playlist)}
                  >
                    <PlaylistCard 
                      playlist={playlist}
                      onClick={() => handlePlaylistClick(playlist)}
                    />
                    <div className={styles.cardOverlay}>
                      <button 
                        className={styles.cardPlayButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Ideally we would start playing the playlist here
                          handlePlaylistClick(playlist);
                        }}
                      >
                        <Play size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

SearchResultsView.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  searchResults: PropTypes.object,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  currentSong: PropTypes.object,
  isPlaying: PropTypes.bool,
  handlePlayClick: PropTypes.func.isRequired,
  handleAlbumClick: PropTypes.func.isRequired,
  handleArtistClick: PropTypes.func.isRequired,
  handlePlaylistClick: PropTypes.func.isRequired,
  handleBackToAllSongs: PropTypes.func.isRequired,
  handleViewMoreClick: PropTypes.func.isRequired,
  artistsMap: PropTypes.object,
  albumsMap: PropTypes.object
};

export default SearchResultsView;
