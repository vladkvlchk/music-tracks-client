"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteTrack } from "@/lib/api";
import type { ITrack } from "@/types/track";
import { ToastError, ToastSuccess } from "@/components/ui";

interface DeleteTrackModalProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  track: ITrack;
}

export function DeleteTrackModal({
  open,
  onClose,
  onDeleted,
  track,
}: DeleteTrackModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTrack(track.id);
      toast.custom(() => (
        <ToastSuccess title="Success" message="Track deleted successfully" />
      ));

      onDeleted();
      onClose();
    } catch (error) {
      toast.custom(() => (
        <ToastError
          title="Error"
          message="Failed to delete track. Please try again."
        />
      ));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent data-testid="confirm-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Track</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{track.title}" by {track.artist}?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="cancel-delete">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            data-testid="confirm-delete"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
