"use client";

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
  Switch,
} from "@libnyanpasu/material-design-react";
import MaterialSymbolsAdd2Rounded from "~icons/material-symbols/add-2-rounded";
import MaterialSymbolsTagRounded from "~icons/material-symbols/tag-rounded";
import { useLockFn } from "ahooks";
import prettyBytes from "pretty-bytes";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { updateImageTags } from "@/actions/service/deepdanbooru";
import { Image } from "@/schema";
import { selectFile } from "@/utils/select";
import { ImageCardContent } from "./image-card-content";
import { useUploadContext } from "./upload-provider";

const UploadButton = () => {
  const { handleUpload } = useUploadContext();

  const handleClick = useLockFn(async () => {
    const result = await selectFile({
      accept: ".jpg,.jpeg,.png,.webp",
      multiple: true,
    });

    if (!result) {
      return;
    }

    await handleUpload(result);
  });

  return (
    <Button
      variant="fab"
      className="flex items-center justify-center gap-2"
      onClick={handleClick}
    >
      <MaterialSymbolsAdd2Rounded className="size-6" />
      <b>Upload</b>
    </Button>
  );
};

export const UpdateCurrentPageImageTagsButton = ({
  images,
}: {
  images: Image[];
}) => {
  const [onlyUnknown, setOnlyUnknown] = useState(true);

  const [loading, setLoading] = useState(false);

  const [progress, setProgress] = useState(0);

  const filtedImages = useMemo(() => {
    return onlyUnknown
      ? images.filter(
          (image) => !image.character && !image.aliases && !image.tags,
        )
      : images;
  }, [images, onlyUnknown]);

  const handleClick = useLockFn(async () => {
    setLoading(true);
    setProgress(0);

    let failedCount = 0;

    for (let i = 0; i < filtedImages.length; i++) {
      try {
        const current = filtedImages[i];
        const result = await updateImageTags(current);

        if (result.serverError) {
          failedCount++;
          console.error(
            `Error updating tags for image ${current.id}:`,
            result.serverError,
          );
          toast.error(`Failed to update image ${current.id} tags`);
        }
      } finally {
        setProgress(((i + 1) / filtedImages.length) * 100);
      }
    }

    if (failedCount > 0) {
      toast.warning(`Completed with ${failedCount} failures`);
    } else {
      toast.success("All images updated successfully");
    }

    setLoading(false);
  });

  return (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="fab" icon>
          <MaterialSymbolsTagRounded className="size-6" />
        </Button>
      </ModalTrigger>

      <ModalContent>
        <Card className="max-w-2xl min-w-96">
          <CardHeader>
            <ModalTitle>Update Current Page Image Tags</ModalTitle>
          </CardHeader>

          {loading ? (
            <CardContent className="w-96">
              <div className="h-2 rounded bg-gray-200">
                <div
                  className="bg-primary h-full rounded transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-center text-sm">Processing: {progress}%</p>
            </CardContent>
          ) : (
            <>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>Only Update Unknown</span>

                  <Switch
                    checked={onlyUnknown}
                    onClick={() => {
                      setOnlyUnknown(!onlyUnknown);
                    }}
                  />
                </div>

                <div className="max-h-dvh-subtract-60 grid grid-cols-3 overflow-auto">
                  {filtedImages.map((image) => (
                    <div
                      key={image.id}
                      className="text-shadow-on-surface-variant/100 relative overflow-hidden"
                    >
                      <ImageCardContent
                        className="aspect-square"
                        image={image}
                      />

                      <div className="absolute right-2 bottom-2">
                        {prettyBytes(image.size)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="gap-1">
                <Button variant="flat" onClick={handleClick}>
                  Execute
                </Button>

                <ModalClose>Close</ModalClose>
              </CardFooter>
            </>
          )}
        </Card>
      </ModalContent>
    </Modal>
  );
};

export const FloatButtons = ({ images }: { images: Image[] }) => {
  return (
    <div className="fixed right-6 bottom-6 z-10 flex flex-col items-end gap-4">
      <UpdateCurrentPageImageTagsButton images={images} />

      <UploadButton />
    </div>
  );
};
