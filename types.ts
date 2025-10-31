export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  url: string;
  artworkUrl?: string;
  lastModified: number;
  groupId: string;
  groupName: string;
}

export enum LoopMode {
  NONE,
  ONE,
  ALL,
}

export enum View {
  LIBRARY,
  DOWNLOADER,
}