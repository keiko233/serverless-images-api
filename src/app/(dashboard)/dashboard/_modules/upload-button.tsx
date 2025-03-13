"use client";

import { cn } from "@libnyanpasu/material-design-libs";
import { Button } from "@libnyanpasu/material-design-react";
import MaterialSymbolsAdd2Rounded from "~icons/material-symbols/add-2-rounded";
import { useLockFn } from "ahooks";
import { uploadImage } from "@/actions/service/upload-image";
import { selectFile } from "@/utils/select";

export const UploadButton = () => {
  const handleClick = useLockFn(async () => {
    const result = await selectFile({
      accept: ".jpg,.jpeg,.png,.webp",
    });

    if (!result) {
      return;
    }

    for (const file of result) {
      const { name, size, type } = file;
      const arrayBuffer = await file.arrayBuffer();

      const [, error] = await uploadImage({
        name,
        size,
        type,
        arrayBuffer: arrayBuffer,
      });

      if (error) {
        console.error("Failed to upload", error);
        return;
      }
    }
  });

  return (
    <Button
      variant="fab"
      className={cn(
        "fixed right-6 bottom-6",
        "flex items-center justify-center gap-2",
      )}
      onClick={handleClick}
    >
      <MaterialSymbolsAdd2Rounded className="size-6" />
      <b>Upload</b>
    </Button>
  );
};
