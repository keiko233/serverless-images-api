import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldWrapper } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { updateImageTagsById } from "@/query/images";
import type { Image } from "@/schema";

interface EditTagsDialogProps {
  open: boolean;
  image: Image;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditTagsDialog({
  open,
  image,
  onClose,
  onSuccess,
}: EditTagsDialogProps) {
  const [character, setCharacter] = useState(image.character ?? "");
  const [tags, setTags] = useState(image.tags ?? "");
  const [aliases, setAliases] = useState(image.aliases ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setCharacter(image.character ?? "");
      setTags(image.tags ?? "");
      setAliases(image.aliases ?? "");
      setError("");
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, image]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await updateImageTagsById({
        data: {
          id: image.id,
          character: character || null,
          tags: tags || null,
          aliases: aliases || null,
        },
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="relative z-50 w-full max-w-md overflow-hidden rounded-2xl border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Edit Tags</h2>
            <p className="truncate text-muted-foreground text-xs">
              {image.filename}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <FieldWrapper
            label="Character"
            description="The character name depicted in this image."
          >
            <Input
              value={character}
              placeholder="e.g. hatsune_miku"
              onChange={(e) => setCharacter(e.target.value)}
            />
          </FieldWrapper>

          <FieldWrapper
            label="Tags"
            description="Space or comma-separated tags for this image."
          >
            <Input
              value={tags}
              placeholder="e.g. 1girl, solo, blue_hair"
              onChange={(e) => setTags(e.target.value)}
            />
          </FieldWrapper>

          <FieldWrapper
            label="Aliases"
            description="Alternative names or identifiers."
          >
            <Input
              value={aliases}
              placeholder="e.g. miku, vocaloid"
              onChange={(e) => setAliases(e.target.value)}
            />
          </FieldWrapper>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-destructive text-sm">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Spinner className="size-4" />}
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
