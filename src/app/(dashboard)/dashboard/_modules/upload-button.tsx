"use client";

import { cn } from "@libnyanpasu/material-design-libs";
import { Button } from "@libnyanpasu/material-design-react";
import MaterialSymbolsAdd2Rounded from "~icons/material-symbols/add-2-rounded";
import { useLockFn } from "ahooks";
import { selectFile } from "@/utils/select";
import { useUploadContext } from "./upload-provider";

export const UploadButton = () => {
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
      className={cn(
        "fixed right-6 bottom-6 z-10",
        "flex items-center justify-center gap-2",
      )}
      onClick={handleClick}
    >
      <MaterialSymbolsAdd2Rounded className="size-6" />
      <b>Upload</b>
    </Button>
  );
};
