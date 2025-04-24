import type { ITrack } from "@/types/track";

export interface ITrackListProps {
  tracks: ITrack[];
  onEdit: (track: ITrack) => void;
  onDelete: (track: ITrack) => void;
  onUpload: (track: ITrack) => void;
  selectionMode?: boolean;
  selectedTracks?: Set<string>;
  onSelectionChange?: (trackId: string, selected: boolean) => void;
}
