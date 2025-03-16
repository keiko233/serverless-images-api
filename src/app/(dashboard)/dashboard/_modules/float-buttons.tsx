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
import { formatError } from "@/utils/fmt";
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
    try {
      setLoading(true);
      setProgress(0);

      const totalImages = filtedImages.length;

      for (let i = 0; i < totalImages; i++) {
        const { id, filename } = filtedImages[i];
        await updateImageTags({
          id,
          filename,
        });
        setProgress(Math.round(((i + 1) / totalImages) * 100));
      }
    } catch (err) {
      toast.error(formatError(err));
    } finally {
      setLoading(false);
    }
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

            <div className="grid grid-cols-3">
              {filtedImages.map((image) => (
                <div key={image.id} className="relative overflow-hidden">
                  <ImageCardContent className="aspect-square" image={image} />

                  <div className="absolute top-2 px-2">{image.id}</div>

                  <div className="absolute right-2 bottom-2 drop-shadow-sm">
                    {prettyBytes(image.size)}
                  </div>
                </div>
              ))}
            </div>

            {loading && (
              <div>
                <div className="h-2 rounded bg-gray-200">
                  <div
                    className="bg-primary h-full rounded transition-all duration-300 ease-in-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="mt-1 text-center text-sm">
                  Processing: {progress}%
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="gap-1">
            <Button variant="flat" loading={loading} onClick={handleClick}>
              Execute
            </Button>

            <ModalClose disabled={loading}>Close</ModalClose>
          </CardFooter>
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
