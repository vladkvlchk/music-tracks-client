"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Music, Trash } from "lucide-react";
import { toast } from "sonner";

import {
  Button,
  Checkbox,
  TrackList,
  EditTrackModal,
  DeleteTrackModal,
  BulkDeleteModal,
  UploadTrackModal,
  Pagination,
  ToastError,
  ToastSuccess,
} from "@/components";
import { CreateTrackButton } from "./create-track-button";
import { SortAndFilter } from "./sort-and-filter";
import { fetchGenres, deleteTrack, bulkDeleteTracks } from "@/lib/api";
import type { ITrack } from "@/types/track";
import { useTrackStore } from "@/stores/track-store";

export default function TracksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const {
    genres,
    tracks,
    totalTracks,
    loading,
    selectionMode,
    selectedTracks,
    selectedTrack,
    setGenres,
    setTracks,
    setTotalTracks,
    toggleSelectionMode,
    setSelectedTracks,
    setSelectedTrack,
    loadTracks,
  } = useTrackStore();

  const page = Number(searchParams.get("page") || "1");
  const limit = 10;

  const loadMetadata = useCallback(async () => {
    try {
      const genresData = await fetchGenres();
      setGenres(genresData);
    } catch (error) {
      toast.custom(() => (
        <ToastError
          title="Failed to load metadata"
          message="Some filters may not be available."
        />
      ));
    }
  }, []);

  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);

  useEffect(() => {
    loadTracks(searchParams);
  }, [loadTracks]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/tracks?${params.toString()}`);

    loadTracks(params);
  };

  const handleEditTrack = (track: ITrack) => {
    setSelectedTrack(track);
    setEditModalOpen(true);
  };

  const handleDeleteTrack = (track: ITrack) => {
    setSelectedTrack(track);
    setDeleteModalOpen(true);
  };

  const handleUploadTrack = (track: ITrack) => {
    setSelectedTrack(track);
    setUploadModalOpen(true);
  };

  const handleTrackUpdated = () => {
    setEditModalOpen(false);
    loadTracks(searchParams);
  };

  const handleTrackDeleted = (trackId: string) => {
    setTracks([...tracks.filter((track) => track.id !== trackId)]);
    setTotalTracks(totalTracks - 1);
    setDeleteModalOpen(false);

    deleteTrack(trackId);
  };

  const handleBulkTrackDeleted = (trackIds: string[]) => {
    setTracks([...tracks.filter((track) => !trackIds.includes(track.id))]);
    setTotalTracks(totalTracks - trackIds.length);
    setBulkDeleteModalOpen(false);
    setSelectedTracks(new Set());

    bulkDeleteTracks(trackIds)
      .then(() => {
        toast.custom(() => (
          <ToastSuccess
            title="Success"
            message={`${trackIds.length} tracks deleted successfully`}
          />
        ));
      })
      .catch(() => {
        toast.custom(() => (
          <ToastError
            title="Error"
            message="Failed to delete some tracks. Please try again."
          />
        ));
        loadTracks(searchParams);
      });
  };

  const handleFileUploaded = (updatedTrack?: ITrack) => {
    if (updatedTrack) {
      setTracks([
        ...tracks.map((track) =>
          track.id === updatedTrack.id ? updatedTrack : track
        ),
      ]);
    }
    setUploadModalOpen(false);

    loadTracks(searchParams);
  };

  const handleSelectionChange = (trackId: string, selected: boolean) => {
    const newSet = new Set(selectedTracks);
    if (selected) {
      newSet.add(trackId);
    } else {
      newSet.delete(trackId);
    }

    setSelectedTracks(newSet);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = tracks.map((track) => track.id);
      setSelectedTracks(new Set(allIds));
    } else {
      setSelectedTracks(new Set());
    }
  };

  const handleBulkDelete = () => {
    if (selectedTracks.size > 0) {
      setBulkDeleteModalOpen(true);
    }
  };

  const allSelected =
    tracks.length > 0 && selectedTracks.size === tracks.length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" data-testid="tracks-header">
          Music Tracks
        </h1>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectionMode}
            data-testid="select-mode-toggle"
          >
            {selectionMode ? "Cancel Selection" : "Select Tracks"}
          </Button>
          <CreateTrackButton />
        </div>
      </div>

      {selectionMode && (
        <div className="flex items-center justify-between bg-muted p-2 rounded-md">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              data-testid="select-all"
              id="select-all"
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              Select All ({tracks.length})
            </label>
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-sm">
              {selectedTracks.size} track{selectedTracks.size !== 1 ? "s" : ""}{" "}
              selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={selectedTracks.size === 0}
              data-testid="bulk-delete-button"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <SortAndFilter />

      {loading ? (
        <div className="flex justify-center py-12" data-testid="loading-tracks">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Music className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No tracks found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters, or create a new track.
          </p>
        </div>
      ) : (
        <TrackList
          tracks={tracks}
          onEdit={handleEditTrack}
          onDelete={handleDeleteTrack}
          onUpload={handleUploadTrack}
          selectionMode={selectionMode}
          selectedTracks={selectedTracks}
          onSelectionChange={handleSelectionChange}
        />
      )}

      {tracks.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={Math.max(1, Math.ceil(totalTracks / limit))}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* TODO: separate into /components/track-list/action-buttons.tsx */}
      {/* Modals */}
      {selectedTrack && (
        <>
          <EditTrackModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onUpdated={handleTrackUpdated}
            track={selectedTrack}
            availableGenres={genres}
          />

          <DeleteTrackModal
            open={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onDeleted={() => handleTrackDeleted(selectedTrack.id)}
            track={selectedTrack}
          />

          <UploadTrackModal
            open={uploadModalOpen}
            onClose={() => setUploadModalOpen(false)}
            onUploaded={handleFileUploaded}
            track={selectedTrack}
          />
        </>
      )}

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        open={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onDeleted={handleBulkTrackDeleted}
        tracks={tracks}
        trackIds={Array.from(selectedTracks)}
      />
    </div>
  );
}
