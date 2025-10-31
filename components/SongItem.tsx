import React from 'react';
import type { Song } from '../types';
import { MusicNoteIcon, PlayIcon, TrashIcon } from './Icons';

interface SongItemProps {
  song: Song;
  onPlay: () => void;
  onRemove: () => void;
  isActive: boolean;
}

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

export const SongItem: React.FC<SongItemProps> = React.memo(({ song, onPlay, onRemove, isActive }) => {
  return (
    <div className={`group flex items-center p-2 rounded-md transition-colors duration-200 ${isActive ? 'bg-nothing-surface/50 dark:bg-white/10' : 'hover:bg-nothing-surface/50 dark:hover:bg-white/10'}`}>
      <div className="w-10 h-10 bg-nothing-surface dark:bg-gray-800 rounded-md flex items-center justify-center mr-4 flex-shrink-0">
        {song.artworkUrl ? (
          <img src={song.artworkUrl} alt={song.title} className="w-full h-full object-cover rounded-md" />
        ) : (
          <MusicNoteIcon className="w-5 h-5 text-gray-400" />
        )}
      </div>
      <div className="flex-grow min-w-0">
        <p className={`font-bold truncate ${isActive ? 'text-nothing-orange' : 'text-nothing-text dark:text-nothing-bg'}`}>{song.title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
      </div>
      <div className="flex items-center ml-4 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onRemove} className="p-2 rounded-full hover:bg-nothing-surface dark:hover:bg-white/20" title="Remove from Library">
          <TrashIcon className="w-5 h-5 text-nothing-red" />
        </button>
        <button onClick={onPlay} className="p-2 rounded-full bg-nothing-orange text-white" title="Play">
          <PlayIcon className="w-5 h-5" />
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 ml-4 w-12 text-right group-hover:opacity-0 transition-opacity">{formatTime(song.duration)}</p>
    </div>
  );
});