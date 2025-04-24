"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTrack } from "@/lib/api";
import { ICreateTrackModalProps } from "./props.types";
import { ToastError, ToastSuccess } from "@/components/ui";

const defaultValues = {
  title: "",
  artist: "",
  album: "",
  coverImage: "",
  genres: [],
};

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  album: z.string().optional(),
  coverImage: z
    .string()
    .url("Please enter a valid URL")
    .or(z.literal(""))
    .optional(),
  genres: z.array(z.string()).min(1, "At least one genre is required"),
});

export type TCreateTrackForm = z.infer<typeof formSchema>;

export function CreateTrackModal({
  open,
  onClose,
  onCreated,
  availableGenres,
}: ICreateTrackModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>("");

  const form = useForm<TCreateTrackForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleAddGenre = () => {
    if (!selectedGenre) return;

    const currentGenres = form.getValues("genres");
    if (!currentGenres.includes(selectedGenre)) {
      form.setValue("genres", [...currentGenres, selectedGenre]);
    }

    setSelectedGenre("");
  };

  const handleRemoveGenre = (genre: string) => {
    const currentGenres = form.getValues("genres");
    form.setValue(
      "genres",
      currentGenres.filter((g) => g !== genre)
    );
  };

  const onSubmit = async (data: TCreateTrackForm) => {
    setIsSubmitting(true);
    try {
      await createTrack(data);
      toast.custom(() => (
        <ToastSuccess title="Success" message="Track created successfully" />
      ));
      form.reset();
      onCreated();
    } catch (error) {
      toast.custom(() => (
        <ToastError
          title="Error"
          message="Failed to create track. Please try again."
        />
      ));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Track</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            data-testid="track-form"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter track title"
                      {...field}
                      data-testid="input-title"
                    />
                  </FormControl>
                  <FormMessage data-testid="error-title" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="artist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artist</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter artist name"
                      {...field}
                      data-testid="input-artist"
                    />
                  </FormControl>
                  <FormMessage data-testid="error-artist" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="album"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Album (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter album name"
                      {...field}
                      data-testid="input-album"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                      data-testid="input-cover-image"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="genres"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genres</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Select
                        value={selectedGenre}
                        onValueChange={setSelectedGenre}
                        data-testid="genre-selector"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableGenres.map((genre) => (
                            <SelectItem key={genre} value={genre}>
                              {genre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddGenre}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((genre) => (
                        <Badge key={genre} variant="secondary">
                          {genre}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => handleRemoveGenre(genre)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>

                    <FormMessage data-testid="error-genre" />
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="submit-button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Track"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
