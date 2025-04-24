"use client";

import { FC } from "react";
import { debounce } from "lodash";
import { Search } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import { useTrackStore } from "@/stores/track-store";

export const SortAndFilter: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { genres } = useTrackStore();

  const debouncedSearch = debounce((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset to first page on new search
    router.push(`/tracks?${params.toString()}`);
  }, 500);

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const [newSort, newOrder] = value.split("-");
    params.set("sort", newSort);
    params.set("order", newOrder);
    router.push(`/tracks?${params.toString()}`);
  };

  const handleFilterChange = (type: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(type, value);
    } else {
      params.delete(type);
    }
    params.set("page", "1"); // Reset to first page on new filter
    router.push(`/tracks?${params.toString()}`);
  };

  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "title";
  const order = searchParams.get("order") || "asc";
  const genreFilter = searchParams.get("genre") || "";

  const currentSortValue = `${sort}-${order}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="relative md:col-span-2">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tracks..."
          className="pl-8"
          defaultValue={search}
          onChange={(e) => debouncedSearch(e.target.value)}
          data-testid="search-input"
        />
      </div>

      <Select
        defaultValue={currentSortValue}
        onValueChange={handleSortChange}
        data-testid="sort-select"
      >
        <SelectTrigger>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="title-asc">Title (A-Z)</SelectItem>
          <SelectItem value="title-desc">Title (Z-A)</SelectItem>
          <SelectItem value="artist-asc">Artist (A-Z)</SelectItem>
          <SelectItem value="artist-desc">Artist (Z-A)</SelectItem>
          <SelectItem value="album-asc">Album (A-Z)</SelectItem>
          <SelectItem value="album-desc">Album (Z-A)</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={genreFilter}
        onValueChange={(value) => handleFilterChange("genre", value)}
        data-testid="filter-genre"
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by genre" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Genres</SelectItem>
          {genres.map((genre) => (
            <SelectItem key={genre} value={genre}>
              {genre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
