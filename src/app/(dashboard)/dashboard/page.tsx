import { cn } from "@libnyanpasu/material-design-libs";
import { getImageAllCharacter, getImages } from "@/actions/query/image";
import { GetImagesParams } from "@/actions/query/schema";
import { Pagination } from "@/components/pagination";
import { FloatButtons } from "./_modules/float-buttons";
import { ImageCard } from "./_modules/image-card";
import { QueryForm } from "./_modules/query-form";
import { UploadProvider } from "./_modules/upload-provider";

export const runtime = "edge";

export const dynamic = "force-dynamic";

type PageSearchParams = Promise<GetImagesParams>;

export default async function Page({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const { page, limit, character, orderBy, direction } = await searchParams;

  const params: GetImagesParams = {
    page: page ? parseInt(String(page)) : undefined,
    limit: limit ? parseInt(String(limit)) : undefined,
    character,
    orderBy,
    direction,
  };

  const { images, pagination } = await getImages(params);

  const [characters] = await getImageAllCharacter();

  return (
    <UploadProvider>
      <div className="flex flex-col gap-4">
        <QueryForm defaultValues={params} characters={characters} />

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

        <FloatButtons images={images} />

        <Pagination
          className="py-4"
          pagination={pagination}
          searchParams={params}
        />
      </div>
    </UploadProvider>
  );
}
