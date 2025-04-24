import { create } from "zustand";
import type { ITrack } from "@/types/track";
import { fetchTracks } from "@/lib/api";

interface TrackStore {
  tracks: ITrack[];
  totalTracks: number;
  loading: boolean;
  genres: string[];

  selectionMode: boolean;
  selectedTracks: Set<string>;

  selectedTrack: ITrack | null;

  loadTracks: (searchParams: any) => void;
  setTracks: (tracks: ITrack[]) => void;
  setTotalTracks: (total: number) => void;
  setLoading: (loading: boolean) => void;
  setGenres: (genres: string[]) => void;

  toggleSelectionMode: () => void;
  setSelectedTracks: (ids: Set<string>) => void;

  setSelectedTrack: (track: ITrack | null) => void;
}

export const useTrackStore = create<TrackStore>((set) => ({
  tracks: [],
  totalTracks: 0,
  loading: false,
  genres: [],

  selectionMode: false,
  selectedTracks: new Set(),

  selectedTrack: null,

  loadTracks: async (searchParams: any) => {
    set({ loading: true });

    const page = Number(searchParams.get("page") || "1");
    const limit = 10; //TODO: take it from the request
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "title";
    const order = searchParams.get("order") || "asc";
    const genreFilter = searchParams.get("genre") || "";

    try {
      const response = await fetchTracks({
        page,
        limit,
        search,
        sort,
        order,
        genre: genreFilter,
      });

      set({ tracks: response.data });
      set({ totalTracks: response.meta.total });
    } catch (error) {} finally {
      set({ loading: false });
    }
  },
  setTracks: (tracks) => set({ tracks }),
  setTotalTracks: (total) => set({ totalTracks: total }),
  setLoading: (loading) => set({ loading }),
  setGenres: (genres) => set({ genres }),

  toggleSelectionMode: () =>
    set((state) => ({
      selectionMode: !state.selectionMode,
      selectedTracks: new Set(),
    })),

  setSelectedTracks: (ids) => set({ selectedTracks: ids }),

  setSelectedTrack: (track) => set({ selectedTrack: track }),
}));
