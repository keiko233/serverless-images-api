"use client";

import { cn } from "@libnyanpasu/material-design-libs";
import {
  CircularProgress,
  Modal,
  ModalClose,
  ModalContent,
  ModalTitle,
  ModalTrigger,
} from "@libnyanpasu/material-design-react";
import MaterialSymbolsCloseRounded from "~icons/material-symbols/close-rounded";
import Image from "next/image";
import prettyBytes from "pretty-bytes";
import useSWR from "swr";
import { getFile } from "@/actions/service/onedrive";
import { Image as ImageType } from "@/schema";
import { fetchWithRetry } from "@/utils/retry";

type ImageCardContentProps = {
  image: ImageType;
  className?: string;
  width?: number;
  height?: number;
};

const ImageContainer = ({
  image,
  className,
  width,
  height,
  src,
}: ImageCardContentProps & {
  src: string;
}) => {
  return (
    <Modal>
      <ModalTrigger asChild>
        <div
          className={cn(
            "flex items-center justify-center overflow-hidden",
            className,
          )}
        >
          <Image
            className="h-full w-full object-cover"
            width={width ?? 1024}
            height={height ?? 1024}
            src={src}
            alt={image.filename}
          />
        </div>
      </ModalTrigger>

      <ModalContent>
        <div className="fixed top-4 z-50 flex w-full items-center justify-between px-4">
          <ModalTitle>
            {image.filename} ({prettyBytes(image.size)})
          </ModalTitle>

          <ModalClose icon>
            <MaterialSymbolsCloseRounded className="size-6" />
          </ModalClose>
        </div>

        <Image
          className="h-full w-full"
          width={4096}
          height={4096}
          src={src}
          alt={image.filename}
        />
      </ModalContent>
    </Modal>
  );
};

export const ImageCardContent = ({
  image,
  className,
  width,
  height,
}: {
  image: ImageType;
  className?: string;
  width?: number;
  height?: number;
}) => {
  const { data, isLoading } = useSWR(
    `/image-cache/${image.id}`,
    async () => {
      const result = await getFile(image);

      if (result.serverError || !result.data) {
        return null;
      }

      const res = await fetchWithRetry(result.data);

      return URL.createObjectURL(await res.blob());
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return !isLoading && data ? (
    <ImageContainer
      image={image}
      className={className}
      width={width}
      height={height}
      src={data}
    />
  ) : (
    <div
      className={cn(
        "grid animate-pulse place-content-center bg-gray-200 dark:bg-gray-800",
        className,
      )}
    >
      <CircularProgress indeterminate />
    </div>
  );
};
