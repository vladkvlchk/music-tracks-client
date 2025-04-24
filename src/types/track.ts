export interface ITrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverImage?: string;
  genres: string[];
  slug: string;
  audioFile?: string;
  createdAt: string;
  updatedAt: string;
}