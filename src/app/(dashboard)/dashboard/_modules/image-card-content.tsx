"use client";

import { useLockFn, useMount } from "ahooks";
import Image from "next/image";
import { useState } from "react";
import { useServerAction } from "zsa-react";
import { getFile } from "@/actions/service/onedrive";
import { Image as ImageType } from "@/schema";

export const ImageCardContent = ({ image }: { image: ImageType }) => {
  const { execute } = useServerAction(getFile);

  const [url, setUrl] = useState<string | null>(null);

  const handleImageLoad = useLockFn(async () => {
    const [result, error] = await execute(image);

    if (error) {
      console.error(error);
      return;
    }

    setUrl(result);
  });

  useMount(() => {
    handleImageLoad();
  });

  return url ? (
    <div className="flex h-80 items-center justify-center overflow-hidden">
      <Image
        className="h-full w-full object-cover"
        width={1024}
        height={1024}
        src={url}
        alt={image.filename}
      />
    </div>
  ) : (
    <div className="h-80 animate-pulse bg-gray-200 dark:bg-gray-800" />
  );
};
