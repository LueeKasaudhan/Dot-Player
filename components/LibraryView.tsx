import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Song } from '../types';
import { SongItem } from './SongItem';
import { SearchIcon } from './Icons';

interface LibraryViewProps {
  songs: Song[];
  onPlaySong: (song: Song) => void;
  onRemoveSong: (songId: string) => void;
  currentTrackId?: string;
  playlistTitle: string;
}

type SortKey = 'title' | 'artist' | 'album' | 'lastModified';

export const LibraryView: React.FC<LibraryViewProps> = React.memo(({ songs, onPlaySong, onRemoveSong, currentTrackId, playlistTitle }) => {
  const [sortKey, setSortKey] = useState<SortKey>('lastModified');
  const [sortAsc, setSortAsc] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const filteredAndSortedSongs = useMemo(() => {
    const filtered = songs.filter(song =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.album.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [songs, sortKey, sortAsc, searchQuery]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'lastModified' ? false : true);
    }
  };

  const SortButton: React.FC<{ sortType: SortKey, children: React.ReactNode }> = ({ sortType, children }) => {
    const isActive = sortKey === sortType;
    return (
      <button
        onClick={() => handleSort(sortType)}
        className={`px-3 py-1 text-xs uppercase tracking-widest rounded-full border transition-colors ${
          isActive ? 'bg-nothing-text text-nothing-bg dark:bg-nothing-bg dark:text-nothing-text border-nothing-text dark:border-nothing-bg' : 'border-nothing-surface dark:border-gray-700 hover:bg-nothing-surface/50 dark:hover:bg-white/5'
        }`}
      >
        {children} {isActive && (sortAsc ? '▲' : '▼')}
      </button>
    );
  };


  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold tracking-tighter font-dots uppercase truncate pr-4" title={playlistTitle}>
          LIBRARY <span className="text-gray-400">/ {playlistTitle}</span>
        </h2>
        <div className="flex items-center space-x-2">
            <div className="flex items-center">
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`bg-nothing-surface dark:bg-white/10 rounded-full px-4 py-1 text-xs transition-all duration-300 ease-in-out outline-none focus:ring-2 focus:ring-nothing-orange ${isSearchOpen ? 'w-48 opacity-100' : 'w-0 opacity-0'}`}
                />
                <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 ml-1 rounded-full hover:bg-nothing-surface/50 dark:hover:bg-white/5">
                    <SearchIcon className="w-4 h-4" />
                </button>
            </div>
            <SortButton sortType="title">Title</SortButton>
            <SortButton sortType="artist">Artist</SortButton>
            <SortButton sortType="album">Album</SortButton>
            <SortButton sortType="lastModified">Date Added</SortButton>
        </div>
      </div>
      {songs.length > 0 ? (
        <div className="flex-grow overflow-y-auto pr-2 -mr-2">
            <div className="space-y-1">
                {filteredAndSortedSongs.map(song => (
                    <SongItem
                    key={song.id}
                    song={song}
                    onPlay={() => onPlaySong(song)}
                    onRemove={() => onRemoveSong(song.id)}
                    isActive={song.id === currentTrackId}
                    />
                ))}
            </div>
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-400">
            <p className="text-lg font-bold font-dots">THIS PLAYLIST IS EMPTY.</p>
            <p className="text-sm mt-2 font-dots">IMPORT A FOLDER TO GET STARTED.</p>
        </div>
      )}
    </div>
  );
});