export interface ICreateTrackModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  availableGenres: string[];
}
