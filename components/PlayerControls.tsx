import React from 'react';
import type { Song } from '../types';
import { LoopMode } from '../types';
import { PlayIcon, PauseIcon, SkipNextIcon, SkipPreviousIcon, ShuffleIcon, LoopIcon, LoopOneIcon, VolumeHighIcon, VolumeMuteIcon, MusicNoteIcon, CrossfadeIcon } from './Icons';

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTrack: Song | null;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  loopMode: LoopMode;
  isCrossfade: boolean;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleLoop: () => void;
  toggleCrossfade: () => void;
}

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return isNaN(minutes) || isNaN(secs) ? '0:00' : `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

const PlayerControls: React.FC<PlayerControlsProps> = React.memo(({
  isPlaying, currentTrack, currentTime, duration, volume, isShuffle, loopMode, isCrossfade,
  togglePlayPause, playNext, playPrev, seek, setVolume, toggleShuffle, toggleLoop, toggleCrossfade
}) => {
  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };
  
  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  const LoopButton = () => {
    switch(loopMode) {
      case LoopMode.ONE: return <LoopOneIcon className="w-5 h-5 text-nothing-orange" />;
      case LoopMode.ALL: return <LoopIcon className="w-5 h-5 text-nothing-orange" />;
      default: return <LoopIcon className="w-5 h-5" />;
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-nothing-bg/80 dark:bg-black/80 backdrop-blur-md border-t border-nothing-surface dark:border-gray-800 z-50">
      <div className="h-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-3 items-center">
        
        {/* Current Track Info */}
        <div className="flex items-center space-x-3 min-w-0">
          {currentTrack ? (
            <>
              <div className="w-14 h-14 bg-nothing-surface dark:bg-gray-800 rounded-md flex-shrink-0">
                {currentTrack.artworkUrl ? (
                    <img src={currentTrack.artworkUrl} alt={currentTrack.title} className="w-full h-full object-cover rounded-md"/>
                ) : <MusicNoteIcon className="w-8 h-8 text-gray-400 m-auto"/>}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">{currentTrack.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentTrack.artist}</p>
              </div>
            </>
          ) : (
             <p className="text-sm text-gray-500 font-dots">NO SONG PLAYING</p>
          )}
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center space-x-4">
            <button onClick={toggleCrossfade} title="Toggle Crossfade" className={`p-2 ${isCrossfade ? 'text-nothing-orange' : 'hover:text-nothing-text/70 dark:hover:text-nothing-bg/70'}`}>
              <CrossfadeIcon className="w-5 h-5" />
            </button>
            <button onClick={toggleShuffle} className={`p-2 ${isShuffle ? 'text-nothing-orange' : 'hover:text-nothing-text/70 dark:hover:text-nothing-bg/70'}`}>
              <ShuffleIcon className="w-5 h-5" />
            </button>
            <button onClick={playPrev} className="p-2 hover:text-nothing-text/70 dark:hover:text-nothing-bg/70">
              <SkipPreviousIcon className="w-6 h-6" />
            </button>
            <button onClick={togglePlayPause} className="w-12 h-12 flex items-center justify-center bg-nothing-text text-nothing-bg dark:bg-nothing-bg dark:text-nothing-text rounded-full shadow-lg">
              {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </button>
            <button onClick={playNext} className="p-2 hover:text-nothing-text/70 dark:hover:text-nothing-bg/70">
              <SkipNextIcon className="w-6 h-6" />
            </button>
            <button onClick={toggleLoop} className="p-2 hover:text-nothing-text/70 dark:hover:text-nothing-bg/70">
              <LoopButton />
            </button>
          </div>
          <div className="w-full max-w-md flex items-center space-x-2 mt-2">
              <span className="text-xs w-10 text-center">{formatTime(currentTime)}</span>
              <input type="range" min="0" max={duration || 0} value={currentTime} onChange={onSeek} className="w-full h-1 bg-nothing-surface dark:bg-gray-700 rounded-lg appearance-none cursor-pointer range-sm accent-nothing-orange" />
              <span className="text-xs w-10 text-center">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center justify-end space-x-2">
            {volume > 0 ? <VolumeHighIcon className="w-6 h-6"/> : <VolumeMuteIcon className="w-6 h-6"/>}
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={onVolumeChange} className="w-24 h-1 bg-nothing-surface dark:bg-gray-700 rounded-lg appearance-none cursor-pointer range-sm accent-nothing-orange" />
        </div>
      </div>
    </div>
  );
});

export default PlayerControls;
