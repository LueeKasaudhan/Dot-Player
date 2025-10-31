import { useState, useRef, useEffect, useCallback } from 'react';
import type { Song } from '../types';
import { LoopMode } from '../types';

function shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;
    const newArray = [...array];
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
    }
    return newArray;
}

export const useMusicPlayer = (songs: Song[] = []) => {
  const audioRefA = useRef<HTMLAudioElement>(null);
  const audioRefB = useRef<HTMLAudioElement>(null);
  const activeAudioEl = useRef<'A' | 'B'>('A');
  const fadeIntervalRef = useRef<number | null>(null);

  const [shuffledPlaylist, setShuffledPlaylist] = useState<Song[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isShuffle, setIsShuffle] = useState(false);
  const [loopMode, setLoopMode] = useState<LoopMode>(LoopMode.NONE);
  const [isCrossfade, setIsCrossfade] = useState(true);
  const crossfadeDuration = 1.5; // in seconds

  const activePlaylist = isShuffle ? shuffledPlaylist : songs;
  const currentTrack = currentTrackIndex !== null ? activePlaylist[currentTrackIndex] : null;

  useEffect(() => {
    if (isShuffle) {
      setShuffledPlaylist(shuffleArray(songs));
    }
  }, [songs, isShuffle]);

  useEffect(() => {
    const currentTrackStillInPlaylist = currentTrack && activePlaylist.find(s => s.id === currentTrack.id);
    if (!currentTrackStillInPlaylist && songs.length > 0) {
        setCurrentTrackIndex(0);
        setIsPlaying(false);
    } else if (songs.length === 0) {
        setCurrentTrackIndex(null);
        setIsPlaying(false);
        if (audioRefA.current) {
          audioRefA.current.src = '';
        }
        if (audioRefB.current) {
            audioRefB.current.src = '';
        }
    }
  }, [songs, currentTrack, activePlaylist]);

  const stopFade = useCallback(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  }, []);

  const playTrack = useCallback((index: number) => {
    if (index < 0 || index >= activePlaylist.length) {
      setIsPlaying(false);
      return;
    }

    const trackToPlay = activePlaylist[index];
    if (!trackToPlay) return;

    stopFade();

    const primaryEl = activeAudioEl.current === 'A' ? audioRefA.current : audioRefB.current;
    const secondaryEl = activeAudioEl.current === 'A' ? audioRefB.current : audioRefA.current;

    if (!primaryEl || !secondaryEl) return;
    
    const isAnotherSongPlaying = primaryEl.src && !primaryEl.paused;

    setCurrentTrackIndex(index);
    setIsPlaying(true);

    if (isCrossfade && isAnotherSongPlaying) {
        secondaryEl.src = trackToPlay.url;
        secondaryEl.volume = 0;
        secondaryEl.play().catch(e => console.error("Playback error:", e));
        
        activeAudioEl.current = activeAudioEl.current === 'A' ? 'B' : 'A';

        const fadeStartTime = Date.now();
        const durationMs = crossfadeDuration * 1000;

        fadeIntervalRef.current = window.setInterval(() => {
            const elapsedTime = Date.now() - fadeStartTime;
            const progress = Math.min(elapsedTime / durationMs, 1);

            primaryEl.volume = volume * (1 - progress);
            secondaryEl.volume = volume * progress;

            if (progress >= 1) {
                stopFade();
                primaryEl.pause();
                primaryEl.src = '';
            }
        }, 25);
    } else {
        primaryEl.src = trackToPlay.url;
        primaryEl.volume = volume;
        primaryEl.play().catch(e => console.error("Playback error:", e));
        secondaryEl.pause();
        secondaryEl.src = '';
    }
  }, [activePlaylist, volume, isCrossfade, crossfadeDuration, stopFade]);

  useEffect(() => {
    const audio = activeAudioEl.current === 'A' ? audioRefA.current : audioRefB.current;
    if (audio && !fadeIntervalRef.current) { // Don't fight the crossfader
      audio.volume = volume;
    }
  }, [volume]);

  const playNext = useCallback(() => {
    if (currentTrackIndex === null) return;

    if (loopMode === LoopMode.ONE && isPlaying) {
        const audio = activeAudioEl.current === 'A' ? audioRefA.current : audioRefB.current;
        if(audio) {
            audio.currentTime = 0;
            audio.play();
        }
        return;
    }

    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= activePlaylist.length) {
      if (loopMode === LoopMode.ALL) {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }
    playTrack(nextIndex);
  }, [currentTrackIndex, activePlaylist.length, loopMode, playTrack, isPlaying]);

  useEffect(() => {
    const audioA = audioRefA.current;
    const audioB = audioRefB.current;
    if (!audioA || !audioB) return;

    const onTimeUpdate = (event: Event) => {
        const activeAudio = activeAudioEl.current === 'A' ? audioA : audioB;
        if (event.target === activeAudio) {
            setCurrentTime(activeAudio.currentTime || 0);
        }
    };
    const onLoadedMetadata = (event: Event) => {
        const activeAudio = activeAudioEl.current === 'A' ? audioA : audioB;
        if (event.target === activeAudio) {
            setDuration((event.target as HTMLAudioElement).duration || 0);
        }
    };
    const handleEnded = (event: Event) => {
        const activeAudio = activeAudioEl.current === 'A' ? audioA : audioB;
        if (event.target === activeAudio) {
            playNext();
        }
    }

    audioA.addEventListener('timeupdate', onTimeUpdate);
    audioA.addEventListener('loadedmetadata', onLoadedMetadata);
    audioA.addEventListener('ended', handleEnded);
    audioB.addEventListener('timeupdate', onTimeUpdate);
    audioB.addEventListener('loadedmetadata', onLoadedMetadata);
    audioB.addEventListener('ended', handleEnded);

    return () => {
      audioA.removeEventListener('timeupdate', onTimeUpdate);
      audioA.removeEventListener('loadedmetadata', onLoadedMetadata);
      audioA.removeEventListener('ended', handleEnded);
      audioB.removeEventListener('timeupdate', onTimeUpdate);
      audioB.removeEventListener('loadedmetadata', onLoadedMetadata);
      audioB.removeEventListener('ended', handleEnded);
    };
  }, [playNext]);

  const togglePlayPause = () => {
    if (currentTrackIndex === null && songs.length > 0) {
      playTrack(0);
      return;
    }
    
    stopFade();
    const primaryEl = activeAudioEl.current === 'A' ? audioRefA.current : audioRefB.current;
    const secondaryEl = activeAudioEl.current === 'A' ? audioRefB.current : audioRefA.current;
    if (!primaryEl || !secondaryEl) return;
    
    primaryEl.volume = volume;
    if (secondaryEl.src) {
        secondaryEl.pause();
        secondaryEl.src = '';
    }

    if (isPlaying) {
      primaryEl.pause();
    } else {
      primaryEl.play().catch(e => console.error("Playback error:", e));
    }
    setIsPlaying(!isPlaying);
  };
  
  const playPrev = () => {
    if (currentTrackIndex === null) return;
    const audio = activeAudioEl.current === 'A' ? audioRefA.current : audioRefB.current;

    if (audio && audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }
    
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) {
        if (loopMode === LoopMode.ALL) {
            prevIndex = activePlaylist.length - 1;
        } else {
            if (audio) audio.currentTime = 0;
            return;
        }
    }
    playTrack(prevIndex);
  };
  
  const seek = (time: number) => {
    const audio = activeAudioEl.current === 'A' ? audioRefA.current : audioRefB.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleShuffle = () => {
    const newShuffleState = !isShuffle;
    setIsShuffle(newShuffleState);
    if (newShuffleState && songs.length > 0) {
        const newShuffled = shuffleArray(songs);
        setShuffledPlaylist(newShuffled);
        playTrack(Math.floor(Math.random() * newShuffled.length));
    } else {
        const newIndex = currentTrack ? songs.findIndex(s => s.id === currentTrack.id) : 0;
        setCurrentTrackIndex(newIndex > -1 ? newIndex : null);
    }
  };

  const toggleLoop = () => {
    setLoopMode((prevMode) => (prevMode + 1) % 3);
  };

  const toggleCrossfade = () => setIsCrossfade(prev => !prev);
  
  return {
    audioRefA,
    audioRefB,
    songs,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffle,
    loopMode,
    isCrossfade,
    shuffledPlaylist,
    togglePlayPause,
    playNext,
    playPrev,
    seek,
    setVolume,
    toggleShuffle,
    toggleLoop,
    playTrack,
    toggleCrossfade,
  };
};