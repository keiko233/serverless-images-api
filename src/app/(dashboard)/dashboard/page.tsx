import { cn } from "@libnyanpasu/material-design-libs";
import { getImageAllCharacter, getImages } from "@/actions/query/image";
import { GetImagesParams } from "@/actions/query/schema";
import { Pagination } from "@/components/pagination";
import { formatError } from "@/utils/fmt";
import { FloatButtons } from "./_modules/float-buttons";
import { ImageCard, ImageCardType } from "./_modules/image-card";
import { QueryForm } from "./_modules/query-form";
import { UploadProvider } from "./_modules/upload-provider";

export const dynamic = "force-dynamic";

export type PageSearchParams = GetImagesParams & {
  cardType?: ImageCardType;
  cols?: number;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const { page, limit, character, orderBy, direction, cardType, cols } =
    await searchParams;

  const params: GetImagesParams = {
    page: page ? parseInt(String(page)) : undefined,
    limit: limit ? parseInt(String(limit)) : undefined,
    character,
    orderBy,
    direction,
  };

  const mergedSearchParams = {
    ...params,
    cardType,
    cols,
  };

  const { images, pagination } = await getImages(params);

  const result = await getImageAllCharacter();

  if (result.serverError || !result.data) {
    console.error(result.serverError);
    return <div>Error: {formatError(result.serverError)}</div>;
  }

  const characters = result.data;

  return (
    <UploadProvider>
      <div className="flex flex-col gap-4 ring-0 outline-none">
        <QueryForm defaultValues={mergedSearchParams} characters={characters} />

        <div
          className={cn(
            "grid gap-4",
            !cols && ["lg:grid-cols-3", "sm:grid-cols-2", "grid-cols-1"],
          )}
          style={{
            gridTemplateColumns: cols
              ? `repeat(${cols}, minmax(0, 1fr))`
              : undefined,
          }}
        >
          {images.map((image) => (
            <ImageCard key={image.id} image={image} type={cardType} />
          ))}
        </div>

        <FloatButtons images={images} />

        <Pagination
          className="py-4"
          pagination={pagination}
          searchParams={mergedSearchParams}
        />
      </div>
    </UploadProvider>
  );
}
