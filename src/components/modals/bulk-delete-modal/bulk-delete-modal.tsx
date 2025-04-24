"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui";
import { IBulkDeleteModalProps } from "./props.types";

export function BulkDeleteModal({
  open,
  onClose,
  onDeleted,
  tracks,
  trackIds,
}: IBulkDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    onDeleted(trackIds);
    
    setIsDeleting(false);
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent data-testid="confirm-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {trackIds.length} Tracks</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {trackIds.length} tracks? This
            action cannot be undone.
            {trackIds.length <= 5 && (
              <ul className="mt-2 list-disc pl-5">
                {trackIds.map((id) => {
                  const track = tracks.find((t) => t.id === id);
                  return track ? (
                    <li key={id}>
                      "{track.title}" by {track.artist}
                    </li>
                  ) : null;
                })}
              </ul>
            )}
            {trackIds.length > 5 && (
              <p className="mt-2">
                {trackIds.length} tracks selected including "
                {tracks.find((t) => t.id === trackIds[0])?.title}" and{" "}
                {trackIds.length - 1} others.
              </p>
            )}
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
              "Delete All"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
