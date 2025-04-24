"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit, Trash2, Upload, Play, Pause } from "lucide-react";

import { Badge, Button, Card, CardContent, Checkbox } from "@/components";
import { AudioWaveform } from "../audio-waveform/audio-waveform";
import type { ITrackListProps } from "./props.types";

export function TrackList({
  tracks,
  onEdit,
  onDelete,
  onUpload,
  selectionMode = false,
  selectedTracks = new Set<string>(),
  onSelectionChange = () => {},
}: ITrackListProps) {
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = async (trackId: string) => {
    if (playingTrack === trackId) {
      // Toggle play/pause for current track
      setIsPlaying(!isPlaying);
      const audioElement = document.getElementById(
        `audio-${trackId}`
      ) as HTMLAudioElement;
      if (audioElement) {
        if (isPlaying) {
          audioElement.pause();
        } else {
          audioElement.play().catch((error) => {
            console.error("Error playing audio:", error);
          });
        }
      }
    } else {
      if (playingTrack) {
        const currentAudio = document.getElementById(
          `audio-${playingTrack}`
        ) as HTMLAudioElement;
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }

      // Play new track
      setPlayingTrack(trackId);
      setIsPlaying(true);
      const newAudio = document.getElementById(
        `audio-${trackId}`
      ) as HTMLAudioElement;
      if (newAudio) {
        newAudio.play().catch((error) => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Handle seeking in the audio
  const handleSeek = (trackId: string, time: number) => {
    const audioElement = document.getElementById(
      `audio-${trackId}`
    ) as HTMLAudioElement;
    if (audioElement) {
      audioElement.currentTime = time;

      // If the track wasn't playing, start playing it
      if (playingTrack !== trackId) {
        setPlayingTrack(trackId);
        setIsPlaying(true);
        audioElement.play().catch((error) => {
          console.error("Error playing audio after seek:", error);
          setIsPlaying(false);
        });
      }
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (trackId: string, checked: boolean) => {
    onSelectionChange(trackId, checked);
  };

  return (
    <div className="space-y-4">
      {tracks.map((track) => {
        const isSelected = selectedTracks.has(track.id);
        const audioSrc = `${process.env.NEXT_PUBLIC_API_URL}/files/${track.audioFile}`;

        return (
          <Card
            key={track.id}
            data-testid={`track-item-${track.id}`}
            className={`relative overflow-hidden transition-colors ${
              isSelected ? "border-primary" : ""
            }`}
          >
            {track.audioFile && (
              <audio
                id={`audio-${track.id}`}
                src={audioSrc}
                onEnded={handleAudioEnded}
                data-testid={`audio-player-${track.id}`}
                className="hidden"
                crossOrigin="anonymous"
              />
            )}

            {/* Waveform background */}
            {isPlaying && playingTrack === track.id && (
              <div
                className={
                  "absolute inset-0 " +
                  (isPlaying && playingTrack === track.id
                    ? "opacity-30"
                    : "opacity-0")
                }
                data-testid={`audio-progress-${track.id}`}
              >
                <AudioWaveform
                  audioId={`audio-${track.id}`}
                  isPlaying={isPlaying && playingTrack === track.id}
                  color="#0ea5e9"
                  backgroundColor="transparent"
                  height={200}
                  onSeek={(time) => handleSeek(track.id, time)}
                />
              </div>
            )}

            <CardContent className="p-4 relative z-10">
              <div className="flex flex-col md:flex-row gap-4">
                {selectionMode && (
                  <div className="flex items-center mr-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(track.id, checked === true)
                      }
                      data-testid={`track-checkbox-${track.id}`}
                      className="h-5 w-5"
                    />
                  </div>
                )}

                <div className="flex-shrink-0">
                  <div className="relative w-24 h-24 rounded-md overflow-hidden">
                    <Image
                      src={track.coverImage || "/placeholder-track-cover.png"}
                      alt={track.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {track.audioFile && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-white/70 hover:bg-white/80"
                        onClick={() => handlePlayPause(track.id)}
                        data-testid={`play-button-${track.id}`}
                      >
                        {isPlaying && playingTrack === track.id ? (
                          <Pause
                            className="h-4 w-4"
                            data-testid={`pause-button-${track.id}`}
                          />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex-grow space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h3
                        className="text-lg font-semibold"
                        data-testid={`track-item-${track.id}-title`}
                      >
                        {track.title}
                      </h3>
                      <p
                        className="text-muted-foreground"
                        data-testid={`track-item-${track.id}-artist`}
                      >
                        {track.artist}
                      </p>
                      {track.album && (
                        <p className="text-sm text-muted-foreground">
                          Album: {track.album}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(track)}
                        data-testid={`edit-track-${track.id}`}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpload(track)}
                        data-testid={`upload-track-${track.id}`}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        {track.audioFile ? "Replace" : "Upload"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(track)}
                        data-testid={`delete-track-${track.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {track.genres && track.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {track.genres.map((genre) => (
                        <Badge key={genre} variant="secondary">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
