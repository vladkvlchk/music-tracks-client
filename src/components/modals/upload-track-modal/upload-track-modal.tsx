"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { uploadTrackFile, removeTrackFile } from "@/lib/api";
import type { ITrack } from "@/types/track";
import { ToastError, ToastSuccess } from "@/components/ui";

interface UploadTrackModalProps {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
  track: ITrack;
}

export function UploadTrackModal({
  open,
  onClose,
  onUploaded,
  track,
}: UploadTrackModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.custom(() => (
        <ToastError title="Error" message="Please select a file to upload" />
      ));
      return;
    }

    // Validate file type
    const validTypes = ["audio/mpeg", "audio/wav", "audio/mp3"];
    if (!validTypes.includes(selectedFile.type)) {
      toast.custom(() => (
        <ToastError title="Error" message="Please select a valid audio file (MP3 or WAV)" />
      ));
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast.custom(() => (
        <ToastError title="Error" message="File size exceeds 10MB limit" />
      ));
      return;
    }

    setIsUploading(true);
    try {
      await uploadTrackFile(track.id, selectedFile);
      toast.custom(() => (
        <ToastSuccess title="Success" message="Track file uploaded successfully" />
      ));
      onUploaded();
    } catch (error) {
      toast.custom(() => (
        <ToastError title="Error" message="Failed to upload track file. Please try again." />
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    setIsRemoving(true);
    try {
      await removeTrackFile(track.id);
      toast.custom(() => (
        <ToastSuccess title="Success" message="Track file removed successfully" />
      ));
      onUploaded();
    } catch (error) {
      toast.custom(() => (
        <ToastError title="Error" message="Failed to remove track file. Please try again." />
      ));
    } finally {
      setIsRemoving(false);
    }
  };

  useEffect(() => {
    if (open) {
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {track.audioFile ? "Replace Audio File" : "Upload Audio File"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Upload an audio file for "{track.title}" by {track.artist}
          </div>

          {track.audioFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center">
                  <div className="ml-2">
                    <p className="text-sm font-medium">Current file</p>
                    <p className="text-xs text-muted-foreground">
                      {track.audioFile.split("/").pop()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="text-sm">
                Upload a new file to replace the current one:
              </div>
            </div>
          ) : null}

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <input
              type="file"
              id="audio-file"
              className="hidden"
              accept="audio/mpeg,audio/wav,audio/mp3"
              onChange={handleFileChange}
              ref={fileInputRef}
            />

            {selectedFile ? (
              <div className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center">
                  <div className="ml-2">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8"
              >
                <Upload className="mr-2 h-4 w-4" />
                Select Audio File
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
