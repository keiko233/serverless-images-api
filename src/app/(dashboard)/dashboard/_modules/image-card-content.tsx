"use client";

import { cn } from "@libnyanpasu/material-design-libs";
import Image from "next/image";
import useSWR from "swr";
import { Image as ImageType } from "@/schema";
import { fetchWithRetry } from "@/utils/retry";

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
    `/api/image/${image.id}/${image.filename}`,
    async (url) => {
      const res = await fetchWithRetry(url);
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return !isLoading && data ? (
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
        src={data}
        alt={image.filename}
      />
    </div>
  ) : (
    <div
      className={cn("animate-pulse bg-gray-200 dark:bg-gray-800", className)}
    />
  );
};
