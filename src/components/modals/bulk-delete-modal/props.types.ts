import type { ITrack } from "@/types/track";

export interface IBulkDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onDeleted: (trackIds: string[]) => void;
  tracks: ITrack[];
  trackIds: string[];
}
