import React, { useState } from 'react';
import type { Song } from '../types';

interface YouTubeDownloaderProps {
  onDownloadComplete: (song: Omit<Song, 'groupId' | 'groupName'>) => void;
}

// A 1-second silent WAV file as a base64 data URI to use as a valid placeholder.
const silentAudioUrl = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';


export const YouTubeDownloader: React.FC<YouTubeDownloaderProps> = React.memo(({ onDownloadComplete }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;

    setIsLoading(true);
    setStatusMessage('Starting download...');
    setIsSuccess(false);

    // Simulate download process
    setTimeout(() => {
      setStatusMessage('Analyzing video details...');
    }, 1000);

    setTimeout(() => {
        setStatusMessage('Converting to audio...');
        
        const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
        const videoId = videoIdMatch ? videoIdMatch[1] : `random-${Date.now()}`;
        const videoTitle = `Simulated Title for ${videoId.substring(0,6)}`;

        const mockSong: Omit<Song, 'groupId' | 'groupName'> = {
            id: `yt-${videoId}`,
            title: videoTitle,
            artist: 'YouTube',
            album: 'YouTube Downloads',
            duration: 210,
            url: silentAudioUrl,
            artworkUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            lastModified: Date.now(),
        };
        onDownloadComplete(mockSong);
        setStatusMessage(`'${mockSong.title}' added to library!`);
        setIsSuccess(true);
        setIsLoading(false);
        setUrl('');
    }, 3000);
  };

  return (
    <div className="p-6 h-full flex flex-col items-center justify-center">
      <div className="w-full max-w-lg text-center">
        <h2 className="text-2xl font-bold tracking-tighter font-dots">YOUTUBE DOWNLOADER</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm font-dots">
          PASTE A YOUTUBE URL TO CONVERT AND ADD TO YOUR LIBRARY.
        </p>
        <p className="text-xs text-nothing-red mt-1 font-dots">[THIS IS A SIMULATED FEATURE]</p>
        
        <form onSubmit={handleDownload} className="mt-8">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="YOUTUBE.COM/WATCH?V=..."
            className="w-full p-4 bg-nothing-surface dark:bg-gray-800 border-2 border-transparent focus:border-nothing-orange focus:outline-none rounded-md text-center tracking-wider"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="mt-4 w-full p-4 bg-nothing-orange text-white font-bold tracking-widest uppercase rounded-md transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 font-dots"
          >
            {isLoading ? 'DOWNLOADING...' : 'DOWNLOAD'}
          </button>
        </form>

        {statusMessage && (
            <div className={`mt-6 p-3 rounded-md text-sm ${isSuccess ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}`}>
                <p>{statusMessage}</p>
            </div>
        )}
      </div>
    </div>
  );
});