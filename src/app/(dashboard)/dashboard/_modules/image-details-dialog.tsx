"use client";

import { cn } from "@libnyanpasu/material-design-libs";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Modal,
  ModalClose,
  ModalContent,
  ModalTitle,
  ModalTrigger,
} from "@libnyanpasu/material-design-react";
import { useLockFn } from "ahooks";
import { useAction } from "next-safe-action/hooks";
import prettyBytes from "pretty-bytes";
import { PropsWithChildren } from "react";
import { toast } from "sonner";
import { updateImageTags } from "@/actions/service/deepdanbooru";
import { Image } from "@/schema";

const Empty = ({ children }: PropsWithChildren) => (
  <span className="text-zinc-500">{children}</span>
);

const Chip = ({ children }: PropsWithChildren) => (
  <span
    className={cn(
      "text-zinc-700 dark:text-zinc-300",
      "bg-primary-container dark:bg-on-primary-container",
      "rounded-full px-2 py-0.5",
    )}
  >
    {children}
  </span>
);

const UpdateTagButton = ({ image }: { image: Image }) => {
  const { isPending, executeAsync } = useAction(updateImageTags);

  const handleClick = useLockFn(async () => {
    const result = await executeAsync(image);

    if (result.serverError) {
      console.log(result.serverError);
      toast.error(result.serverError);
    }
  });

  return (
    <Button loading={isPending} onClick={handleClick}>
      Update Tags
    </Button>
  );
};

export const ImageDetailsDialog = ({ image }: { image: Image }) => {
  const mapping = {
    ID: image.id,
    Filename: image.filename,
    Character: image.character ?? <Empty>Unknown</Empty>,
    Aliases: image.aliases
      ?.split(",")
      .map((alias) => <Chip key={alias}>{alias}</Chip>) ?? <Empty> None</Empty>,
    Tags: image.tags?.split(",").map((tag) => <Chip key={tag}>{tag}</Chip>) ?? (
      <Empty> None</Empty>
    ),
    Size: prettyBytes(image.size),
    "Created At": new Date(image.createdAt).toLocaleString(),
    "Updated At": new Date(image.updatedAt).toLocaleString(),
  };

  return (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="flat">Details</Button>
      </ModalTrigger>

      <ModalContent>
        <Card className="min-w-96">
          <CardHeader>
            <ModalTitle>Image Details</ModalTitle>
          </CardHeader>

          <CardContent className="gap-0.5 text-sm">
            {Object.entries(mapping).map(([key, value]) => (
              <div key={key} className="flex gap-2 whitespace-nowrap">
                <b className="min-w-24">{key}:</b>{" "}
                <div className="flex flex-wrap gap-1">{value}</div>
              </div>
            ))}
          </CardContent>

          <CardFooter className="gap-1">
            <ModalClose>Close</ModalClose>

            <UpdateTagButton image={image} />
          </CardFooter>
        </Card>
      </ModalContent>
    </Modal>
  );
};
