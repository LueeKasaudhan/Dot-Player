import React, { useRef, useState, useEffect } from 'react';
import { View } from '../types';
import { MusicNoteIcon, DownloadIcon, FolderIcon, SunIcon, MoonIcon, ListIcon, PaletteIcon, XIcon } from './Icons';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onFolderImport: (files: FileList) => void;
  onThemeImport: (file: File) => void;
  songGroups: { id: string; name: string; count: number }[];
  onRemoveGroup: (groupId: string) => void;
  activePlaylistId: string;
  onPlaylistSelect: (id: string) => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center w-full text-left p-3 rounded-md transition-colors duration-200 ${
        isActive
          ? 'bg-nothing-surface text-nothing-orange dark:bg-white/10'
          : 'hover:bg-nothing-surface/50 dark:hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="ml-3 font-semibold tracking-wider uppercase text-sm font-dots">{label}</span>
    </button>
);

// Fix: Updated onRemove prop to accept a mouse event to allow for stopPropagation.
const PlaylistPill: React.FC<{name: string, count: number, isActive: boolean, onClick: () => void, onRemove?: (e: React.MouseEvent) => void}> = ({ name, count, isActive, onClick, onRemove }) => (
    <div className={`group flex items-center w-full text-left p-2 rounded-md transition-colors duration-200 ${isActive ? 'bg-nothing-surface/50 dark:bg-white/10' : 'bg-transparent'}`}>
        <button onClick={onClick} className="flex-grow flex items-center min-w-0">
            <ListIcon className={`w-5 h-5 flex-shrink-0 ml-1 ${isActive ? 'text-nothing-orange' : 'text-gray-400'}`}/>
            <div className="ml-3 min-w-0 flex-grow">
                <p className={`font-semibold tracking-wider uppercase text-sm truncate ${isActive ? 'text-nothing-text dark:text-nothing-bg' : 'text-gray-500 dark:text-gray-400'}`} title={name}>{name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{count} songs</p>
            </div>
        </button>
        {onRemove && (
            <button 
                onClick={onRemove} 
                className="ml-auto p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-nothing-surface dark:hover:bg-white/20 transition-opacity flex-shrink-0"
                title={`Remove ${name}`}
            >
                <XIcon className="w-4 h-4 text-nothing-red"/>
            </button>
        )}
    </div>
);

export const Sidebar: React.FC<SidebarProps> = React.memo(({ currentView, onViewChange, onFolderImport, onThemeImport, songGroups, onRemoveGroup, activePlaylistId, onPlaylistSelect }) => {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const themeInputRef = useRef<HTMLInputElement>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && isDarkMode));
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);


  const handleFolderClick = () => {
    folderInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFolderImport(event.target.files);
      event.target.value = '';
    }
  };

  const handleThemeClick = () => {
    themeInputRef.current?.click();
  };

  const handleThemeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        onThemeImport(event.target.files[0]);
    }
  };

  const totalSongs = songGroups.reduce((sum, group) => sum + group.count, 0);

  return (
    <div className="w-64 h-full bg-nothing-bg dark:bg-black p-4 flex flex-col border-r border-nothing-surface dark:border-gray-800 flex-shrink-0">
      <div className="flex items-center space-x-2 pb-6 border-b border-nothing-surface dark:border-gray-800">
        <h1 className="text-2xl font-bold font-dots tracking-tighter">DOTPLAYER</h1>
        <div className="w-2 h-2 bg-nothing-red rounded-full"></div>
      </div>

      <nav className="mt-6 flex-grow flex flex-col min-h-0">
        <h2 className="text-xs uppercase text-gray-400 tracking-widest mb-2 font-dots">MENU</h2>
        <div className="space-y-2">
            <NavItem icon={<MusicNoteIcon className="w-5 h-5" />} label="Library" isActive={currentView === View.LIBRARY} onClick={() => onViewChange(View.LIBRARY)} />
            <NavItem icon={<DownloadIcon className="w-5 h-5" />} label="Downloader" isActive={currentView === View.DOWNLOADER} onClick={() => onViewChange(View.DOWNLOADER)} />
        </div>
        
        <h2 className="text-xs uppercase text-gray-400 tracking-widest mt-8 mb-2 font-dots">PLAYLIST</h2>
        <div className="space-y-2 flex-grow flex flex-col min-h-0">
            <button onClick={handleFolderClick} className="flex items-center w-full text-left p-3 rounded-md hover:bg-nothing-surface/50 dark:hover:bg-white/5 transition-colors duration-200 flex-shrink-0">
                <FolderIcon className="w-5 h-5"/>
                <span className="ml-3 font-semibold tracking-wider uppercase text-sm font-dots">IMPORT FOLDER</span>
            </button>
            <input type="file" ref={folderInputRef} onChange={handleFileChange} className="hidden" multiple {...{ webkitdirectory: "" } as any} />
            
            <div className="flex-grow overflow-y-auto pr-1 space-y-1">
                <PlaylistPill name="All Songs" count={totalSongs} isActive={activePlaylistId === 'all'} onClick={() => onPlaylistSelect('all')} />
                {songGroups.map(group => (
                    <PlaylistPill 
                        key={group.id} 
                        name={group.name}
                        count={group.count}
                        isActive={activePlaylistId === group.id}
                        onClick={() => onPlaylistSelect(group.id)}
                        onRemove={(e) => { e.stopPropagation(); onRemoveGroup(group.id); }}
                    />
                ))}
            </div>
        </div>
      </nav>

      <div className="mt-auto pt-4 border-t border-nothing-surface dark:border-gray-800">
        <button onClick={toggleTheme} className="flex items-center w-full text-left p-3 rounded-md hover:bg-nothing-surface/50 dark:hover:bg-white/5 transition-colors duration-200">
          {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          <span className="ml-3 font-semibold tracking-wider uppercase text-sm font-dots">{isDark ? 'LIGHT MODE' : 'DARK MODE'}</span>
        </button>
        <button onClick={handleThemeClick} className="flex items-center w-full text-left p-3 rounded-md hover:bg-nothing-surface/50 dark:hover:bg-white/5 transition-colors duration-200">
            <PaletteIcon className="w-5 h-5" />
            <span className="ml-3 font-semibold tracking-wider uppercase text-sm font-dots">IMPORT THEME</span>
        </button>
        <input type="file" ref={themeInputRef} onChange={handleThemeFileChange} className="hidden" accept=".css" />
      </div>
    </div>
  );
});