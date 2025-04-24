"use client";

import { FC, useState } from "react";
import { Plus } from "lucide-react";

import { Button, CreateTrackModal } from "@/components";
import { ITrack } from "@/types/track";
import { useTrackStore } from "@/stores/track-store";
import { useSearchParams } from "next/navigation";

export const CreateTrackButton: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const { genres, tracks, setTracks, setTotalTracks, totalTracks, loadTracks } =
    useTrackStore();

  const handleCreateTrack = () => setIsModalOpen(true);

  const handleTrackCreated = (newTrack?: ITrack) => {
    if (newTrack) {
      setTracks([newTrack, ...tracks]);
    }

    setTotalTracks(totalTracks + 1);
    setIsModalOpen(false);

    loadTracks(searchParams);
  };

  return (
    <>
      <Button onClick={handleCreateTrack} data-testid="create-track-button">
        <Plus className="mr-2 h-4 w-4" />
        Create Track
      </Button>

      <CreateTrackModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleTrackCreated}
        availableGenres={genres}
      />
    </>
  );
};
