import { cn } from "@libnyanpasu/material-design-libs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@libnyanpasu/material-design-react";
import prettyBytes from "pretty-bytes";
import { Image } from "@/schema";
import { ImageCardContent } from "./image-card-content";
import { ImageDeleteButton } from "./image-delete-button";
import { ImageDetailsDialog } from "./image-details-dialog";

export type ImageCardType = "normal" | "small";

export const ImageCard = async ({
  image,
  type,
}: {
  image: Image;
  type?: ImageCardType;
}) => {
  const mapping = {
    Character: image.character ?? (
      <span className="text-zinc-500">Unknown</span>
    ),
    Size: prettyBytes(image.size),
    "Created At": new Date(image.createdAt).toLocaleString(),
    "Updated At": new Date(image.updatedAt).toLocaleString(),
  };

  return (
    <Card className="relative truncate overflow-clip">
      <CardHeader className="absolute z-10 truncate drop-shadow-sm">
        {image.filename}
      </CardHeader>

      <ImageCardContent className="h-80" image={image} />

      {(type === "normal" || type === undefined) && (
        <CardContent className="gap-0.5 text-sm">
          {Object.entries(mapping).map(([key, value]) => (
            <div key={key} className="flex gap-2 whitespace-nowrap">
              <b className="w-24">{key}:</b> <span>{value}</span>
            </div>
          ))}
        </CardContent>
      )}

      <CardFooter
        className={cn(
          "gap-1",
          type === "small" && "absolute right-2 bottom-2 z-10",
        )}
      >
        <ImageDeleteButton image={image} />

        <ImageDetailsDialog image={image} />
      </CardFooter>
    </Card>
  );
};
