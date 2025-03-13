import { cn } from "@libnyanpasu/material-design-libs";
import { getImages } from "@/actions/query/image";
import { ImageCard } from "./_modules/image-card";
import { UploadButton } from "./_modules/upload-button";

export const runtime = "edge";

export const dynamic = "force-dynamic";

type PageSearchParams = Promise<{
  page?: string;
  limit?: string;
}>;

export default async function Page({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const { page, limit } = await searchParams;

  const { images } = await getImages({
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined,
  });

  return (
    <div className="flex flex-col gap-4">
      {/* <div className="flex justify-end gap-4">
        <Button variant="flat">Upload</Button>
      </div> */}

      <div
        className={cn(
          "grid gap-4",
          "lg:grid-cols-3",
          "sm:grid-cols-2",
          "grid-cols-1",
        )}
      >
        {images.map((image) => (
          <ImageCard key={image.id} image={image} />
        ))}
      </div>

      <UploadButton />
    </div>
  );
}
