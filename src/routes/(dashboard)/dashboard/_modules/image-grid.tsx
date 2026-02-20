import { useNavigate, useRouter } from "@tanstack/react-router";
import { SparklesIcon, UploadIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { updateImageTags } from "@/service/deepdanbooru";

import { Route as IndexRoute } from "../index";
import ImageCard from "./image-card";
import ImagePreviewDialog from "./image-preview-dialog";
import UploadDialog from "./upload-dialog";

const PAGE_SIZE_OPTIONS = [12, 24, 48, 96] as const;

export default function ImageGrid() {
  const { images, pagination } = IndexRoute.useLoaderData();

  const search = IndexRoute.useSearch();

  const navigate = useNavigate({ from: IndexRoute.fullPath });

  const router = useRouter();

  const [searchInput, setSearchInput] = useState(search.search ?? "");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [autoTagAllProgress, setAutoTagAllProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    navigate({
      search: (prev) => ({
        ...prev,
        search: searchInput,
        page: 1,
      }),
    });
  }

  function handlePage(page: number) {
    navigate({ search: (prev) => ({ ...prev, page }) });
  }

  function handlePageSize(pageSize: number) {
    navigate({ search: (prev) => ({ ...prev, pageSize, page: 1 }) });
  }

  function handleUploadSuccess() {
    setUploadOpen(false);
    router.invalidate();
  }

  async function handleAutoTagAll() {
    setAutoTagAllProgress({ current: 0, total: images.length });
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      try {
        await updateImageTags({
          data: { id: image.id, filename: image.filename },
        });
      } catch {
        // Continue even if one fails
      }
      setAutoTagAllProgress({ current: i + 1, total: images.length });
    }
    setAutoTagAllProgress(null);
    router.invalidate();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Images</CardTitle>
        <CardDescription>
          {pagination.total.toLocaleString("en-US")} images · page{" "}
          {pagination.page} of {pagination.totalPages || 1}
        </CardDescription>

        <CardAction className="flex items-center gap-2">
          {autoTagAllProgress ? (
            <Button variant="outline" disabled>
              <Spinner className="size-4" />
              {autoTagAllProgress.current}/{autoTagAllProgress.total}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleAutoTagAll}
              disabled={images.length === 0}
            >
              <SparklesIcon />
              Auto-tag All
            </Button>
          )}
          <Button onClick={() => setUploadOpen(true)}>
            <UploadIcon />
            Upload
          </Button>
        </CardAction>
      </CardHeader>

      <CardPanel>
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <Input
            type="search"
            placeholder="Search by filename, character, or tags…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
          {search.search && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchInput("");
                navigate({
                  search: (prev) => ({ ...prev, search: "", page: 1 }),
                });
              }}
            >
              Clear
            </Button>
          )}
        </form>

        {images.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            No images found.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {images.map((image, index) => (
              <ImageCard
                key={image.id}
                image={image}
                onPreview={() => setPreviewIndex(index)}
              />
            ))}
          </div>
        )}
      </CardPanel>

      <CardFooter className="justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page <= 1}
          onClick={() => handlePage(pagination.page - 1)}
        >
          Previous
        </Button>

        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm">
            {pagination.page} / {pagination.totalPages || 1}
          </span>
          <div className="flex items-center rounded-lg border border-input p-0.5">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handlePageSize(size)}
                className={cn(
                  "h-6 rounded px-2 text-xs font-medium transition-colors",
                  search.pageSize === size
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => handlePage(pagination.page + 1)}
        >
          Next
        </Button>
      </CardFooter>

      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      <ImagePreviewDialog
        images={images}
        currentIndex={previewIndex}
        onClose={() => setPreviewIndex(null)}
        onNavigate={setPreviewIndex}
      />
    </Card>
  );
}
