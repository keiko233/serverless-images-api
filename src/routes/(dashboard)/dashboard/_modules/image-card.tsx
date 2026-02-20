import { useRouter } from "@tanstack/react-router";
import { ImageIcon, PencilIcon, SparklesIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deleteImageById } from "@/query/images";
import { updateImageTags } from "@/service/deepdanbooru";
import type { Image } from "@/schema";
import { cn } from "@/lib/utils";

import EditTagsDialog from "./edit-tags-dialog";

interface ImageCardProps {
  image: Image;
  onPreview?: () => void;
}

export default function ImageCard({ image, onPreview }: ImageCardProps) {
  const router = useRouter();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [autoTagging, setAutoTagging] = useState(false);

  async function handleAutoTag() {
    setAutoTagging(true);
    try {
      await updateImageTags({ data: { id: image.id, filename: image.filename } });
      router.invalidate();
    } catch {
      // silent fail
    } finally {
      setAutoTagging(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteImageById({ data: image.id });
      router.invalidate();
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  function handleEditSuccess() {
    setEditOpen(false);
    router.invalidate();
  }

  const imgUrl = `/api/image/${image.id}/${image.filename}`;

  return (
    <>
      <div className="group relative overflow-hidden rounded-xl bg-muted aspect-square">
        {/* Loading skeleton */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}

        {/* Image error state */}
        {imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground">
            <ImageIcon className="size-8" />
            <span className="text-xs">Failed to load</span>
          </div>
        )}

        {/* Image */}
        {!imgError && (
          <img
            src={imgUrl}
            alt={image.character || image.filename}
            className={cn(
              "size-full object-cover transition-all duration-300 group-hover:scale-105",
              imgLoaded ? "opacity-100" : "opacity-0",
              onPreview && "cursor-pointer",
            )}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            onClick={onPreview}
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-gradient-to-t from-black/70 via-black/20 to-black/40">
          {/* Action buttons */}
          <div className="flex justify-end gap-1">
            {!confirmDelete ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    type="button"
                    onClick={handleAutoTag}
                    disabled={autoTagging}
                    className="rounded-md bg-white/15 p-1.5 text-white backdrop-blur-xs transition-colors hover:bg-white/30 disabled:opacity-60"
                  >
                    {autoTagging ? (
                      <Spinner className="size-3.5" />
                    ) : (
                      <SparklesIcon className="size-3.5" />
                    )}
                  </TooltipTrigger>
                  <TooltipPopup>Auto-tag with AI</TooltipPopup>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    type="button"
                    onClick={() => setEditOpen(true)}
                    className="rounded-md bg-white/15 p-1.5 text-white backdrop-blur-xs transition-colors hover:bg-white/30"
                  >
                    <PencilIcon className="size-3.5" />
                  </TooltipTrigger>
                  <TooltipPopup>Edit tags</TooltipPopup>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="rounded-md bg-white/15 p-1.5 text-white backdrop-blur-xs transition-colors hover:bg-destructive/80"
                  >
                    <Trash2Icon className="size-3.5" />
                  </TooltipTrigger>
                  <TooltipPopup>Delete</TooltipPopup>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="flex items-center gap-1.5 rounded-lg bg-black/60 px-2 py-1 backdrop-blur-xs">
                <span className="text-white text-xs">Delete?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded px-2 py-0.5 bg-destructive text-white text-xs font-medium hover:bg-destructive/80 disabled:opacity-60"
                >
                  {deleting ? <Spinner className="size-3" /> : "Yes"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded px-2 py-0.5 bg-white/20 text-white text-xs font-medium hover:bg-white/30"
                >
                  No
                </button>
              </div>
            )}
          </div>

          {/* Image info */}
          <div className="text-white">
            {image.character && (
              <p className="truncate text-xs font-medium">{image.character}</p>
            )}
            <p className="truncate text-white/70 text-xs">{image.filename}</p>
          </div>
        </div>
      </div>

      <EditTagsDialog
        open={editOpen}
        image={image}
        onClose={() => setEditOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
