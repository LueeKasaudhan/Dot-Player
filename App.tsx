import React, { useState, useCallback, useMemo } from 'react';
import type { Song } from './types';
import { View } from './types';
import { useMusicPlayer } from './hooks/useMusicPlayer';
import PlayerControls from './components/PlayerControls';
import { Sidebar } from './components/Sidebar';
import { LibraryView } from './components/LibraryView';
import { YouTubeDownloader } from './components/YouTubeDownloader';

const App: React.FC = () => {
    const [library, setLibrary] = useState<Song[]>([]);
    const [currentView, setCurrentView] = useState<View>(View.LIBRARY);
    const [activePlaylistId, setActivePlaylistId] = useState<string>('all');

    const activePlaylistSongs = useMemo(() => {
        if (activePlaylistId === 'all') {
            return library;
        }
        return library.filter(song => song.groupId === activePlaylistId);
    }, [library, activePlaylistId]);
    
    const player = useMusicPlayer(activePlaylistSongs);

    const songGroups = useMemo(() => {
        const groups = new Map<string, { name: string, songs: Song[] }>();
        library.forEach(song => {
            if (!groups.has(song.groupId)) {
                groups.set(song.groupId, { name: song.groupName, songs: [] });
            }
            groups.get(song.groupId)!.songs.push(song);
        });
        return Array.from(groups.entries()).map(([id, data]) => ({
            id,
            name: data.name,
            count: data.songs.length,
        })).sort((a,b) => a.name.localeCompare(b.name));
    }, [library]);

    const handleFolderImport = useCallback((files: FileList) => {
        const audioFiles = Array.from(files).filter(file => file.type.startsWith('audio/'));
        if (audioFiles.length === 0) return;

        const folderName = audioFiles[0].webkitRelativePath.split('/')[0] || `Imported ${new Date().toLocaleTimeString()}`;
        const groupId = `${folderName}-${Date.now()}`;
        const existingSongIds = new Set(library.map(s => s.id));
        
        const newSongs: Song[] = audioFiles
            .map((file) => {
                const songId = `${file.name}-${file.lastModified}`;
                if (existingSongIds.has(songId)) return null; 

                const nameParts = file.name.replace(/\.[^/.]+$/, "").split(' - ');
                const artist = nameParts.length > 1 ? nameParts[0].trim() : 'Unknown Artist';
                const title = nameParts.length > 1 ? nameParts[1].trim() : nameParts[0].trim();

                return {
                    id: songId,
                    title: title,
                    artist: artist,
                    album: folderName,
                    duration: 0,
                    url: URL.createObjectURL(file),
                    lastModified: file.lastModified,
                    groupId: groupId,
                    groupName: folderName,
                };
            })
            .filter((song): song is Song => song !== null);


        if (newSongs.length > 0) {
            setLibrary(prev => [...prev, ...newSongs]);
            setActivePlaylistId(groupId);
            setCurrentView(View.LIBRARY);
        }
    }, [library]);

    const handleDownloadComplete = useCallback((song: Omit<Song, 'groupId' | 'groupName'>) => {
        const songWithGroup: Song = {
            ...song,
            groupId: 'youtube-downloads',
            groupName: 'YouTube Downloads',
        };

        if (library.find(s => s.id === songWithGroup.id)) return;

        setLibrary(prev => [...prev, songWithGroup]);
        setActivePlaylistId(songWithGroup.groupId);
    }, [library]);

    const handleThemeImport = useCallback((file: File) => {
        if (file && file.type === 'text/css') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const cssContent = e.target?.result;
                if (typeof cssContent === 'string') {
                    let styleTag = document.getElementById('custom-theme-style');
                    if (!styleTag) {
                        styleTag = document.createElement('style');
                        styleTag.id = 'custom-theme-style';
                        document.head.appendChild(styleTag);
                    }
                    styleTag.innerHTML = cssContent;
                }
            };
            reader.readAsText(file);
        }
    }, []);

    const handlePlaySong = useCallback((song: Song) => {
        const playlist = player.isShuffle ? player.shuffledPlaylist : activePlaylistSongs;
        const songIndex = playlist.findIndex(s => s.id === song.id);
        if (songIndex !== -1) {
            player.playTrack(songIndex);
        }
    }, [activePlaylistSongs, player]);
    
    const handleRemoveSong = useCallback((songIdToRemove: string) => {
        const songToRemove = library.find(s => s.id === songIdToRemove);
        if (songToRemove && songToRemove.url.startsWith('blob:')) {
            URL.revokeObjectURL(songToRemove.url);
        }
        setLibrary(prev => prev.filter(song => song.id !== songIdToRemove));
    }, [library]);
    
    const handleRemoveGroup = useCallback((groupIdToRemove: string) => {
        const songsToRemove = library.filter(song => song.groupId === groupIdToRemove);
        songsToRemove.forEach(song => {
            if (song.url.startsWith('blob:')) {
                URL.revokeObjectURL(song.url);
            }
        });

        setLibrary(prev => prev.filter(song => song.groupId !== groupIdToRemove));
        if (activePlaylistId === groupIdToRemove) {
            setActivePlaylistId('all');
        }
    }, [library, activePlaylistId]);

    const playlistTitle = useMemo(() => {
        if (activePlaylistId === 'all') return 'All Songs';
        return songGroups.find(g => g.id === activePlaylistId)?.name || 'Playlist';
    }, [activePlaylistId, songGroups]);

    return (
        <div className="h-screen w-screen flex overflow-hidden relative">
            <div 
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out z-0"
                style={{ 
                    backgroundImage: player.currentTrack?.artworkUrl ? `url(${player.currentTrack.artworkUrl})` : 'none',
                    opacity: player.currentTrack?.artworkUrl ? 1 : 0
                }}
            >
                 <div className="absolute inset-0 backdrop-blur-2xl bg-black/60"/>
            </div>
            
            <div className="relative flex w-full h-full z-10">
                <Sidebar 
                    currentView={currentView}
                    onViewChange={setCurrentView}
                    onFolderImport={handleFolderImport}
                    onThemeImport={handleThemeImport}
                    songGroups={songGroups}
                    onRemoveGroup={handleRemoveGroup}
                    activePlaylistId={activePlaylistId}
                    onPlaylistSelect={setActivePlaylistId}
                />
                
                <main className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-grow min-h-0 pb-24">
                       {currentView === View.LIBRARY && (
                           <LibraryView 
                               songs={activePlaylistSongs}
                               onPlaySong={handlePlaySong}
                               onRemoveSong={handleRemoveSong}
                               currentTrackId={player.currentTrack?.id}
                               playlistTitle={playlistTitle}
                           />
                       )}
                       {currentView === View.DOWNLOADER && (
                           <YouTubeDownloader onDownloadComplete={handleDownloadComplete} />
                       )}
                    </div>
                </main>
                
                <PlayerControls 
                  isPlaying={player.isPlaying}
                  currentTrack={player.currentTrack}
                  currentTime={player.currentTime}
                  duration={player.duration}
                  volume={player.volume}
                  isShuffle={player.isShuffle}
                  loopMode={player.loopMode}
                  isCrossfade={player.isCrossfade}
                  togglePlayPause={player.togglePlayPause}
                  playNext={player.playNext}
                  playPrev={player.playPrev}
                  seek={player.seek}
                  setVolume={player.setVolume}
                  setShuffle={player.setShuffle}
                  toggleLoop={player.toggleLoop}
                  toggleCrossfade={player.toggleCrossfade}
                />
                <>
                  <audio ref={player.audioRefA} />
                  <audio ref={player.audioRefB} />
                </>
            </div>
        </div>
    );
};

export default App;