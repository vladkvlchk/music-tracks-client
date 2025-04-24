export interface IAudioWaveformProps {
  audioId: string;
  isPlaying: boolean;
  color?: string;
  backgroundColor?: string;
  height?: number;
  onSeek?: (time: number) => void;
}
