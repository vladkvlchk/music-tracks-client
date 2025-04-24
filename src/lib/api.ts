import { TCreateTrackForm } from "@/components/modals/create-track-modal/create-track-modal";
import { EditFormValues } from "@/components/modals/edit-track-modal/edit-track-modal";
import type { ITrack } from "@/types/track";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://0.0.0.0:8000/api";

interface TrackQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: string;
  genre?: string;
  artist?: string;
}

interface GetTracksResponse {
  data: ITrack[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Fetch tracks with pagination, sorting, and filtering
export async function fetchTracks(
  params: TrackQueryParams = {}
): Promise<GetTracksResponse> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.sort) queryParams.append("sort", params.sort);
  if (params.order) queryParams.append("order", params.order);
  if (params.genre)
    queryParams.append("genre", params.genre.replace("all", ""));

  const response = await fetch(`${API_URL}/tracks?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch tracks");
  }

  return await response.json();
}

// Fetch a single track by ID
export async function fetchTrack(id: string): Promise<ITrack> {
  const response = await fetch(`${API_URL}/tracks/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch track");
  }

  return await response.json();
}

// Create a new track
export async function createTrack(data: TCreateTrackForm): Promise<ITrack> {
  const response = await fetch(`${API_URL}/tracks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create track");
  }

  return await response.json();
}

// Update an existing track
export async function updateTrack(
  id: string,
  data: EditFormValues
): Promise<ITrack> {
  const response = await fetch(`${API_URL}/tracks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update track");
  }

  return await response.json();
}

// Delete a track
export async function deleteTrack(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/tracks/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete track");
  }
}

// Delete multiple tracks
export async function bulkDeleteTracks(ids: string[]): Promise<void> {
  const body = JSON.stringify({ ids });

  const response = await fetch(`${API_URL}/tracks/delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  if (!response.ok) {
    throw new Error("Failed to delete tracks");
  }
}

// Upload a track file
export async function uploadTrackFile(id: string, file: File): Promise<ITrack> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/tracks/${id}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload track file");
  }

  return await response.json();
}

// Remove a track file
export async function removeTrackFile(id: string): Promise<ITrack> {
  const response = await fetch(`${API_URL}/tracks/${id}/file`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to remove track file");
  }

  return await response.json();
}

// Fetch all available genres
export async function fetchGenres(): Promise<string[]> {
  const response = await fetch(`${API_URL}/genres`);

  if (!response.ok) {
    throw new Error("Failed to fetch genres");
  }

  return await response.json();
}
