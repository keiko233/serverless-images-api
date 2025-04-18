"use client";

import { cn } from "@libnyanpasu/material-design-libs";
import { useLockFn } from "ahooks";
import { AnimatePresence, motion } from "framer-motion";
import prettyBytes from "pretty-bytes";
import { createContext, PropsWithChildren, useContext, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { uploadImage } from "@/actions/service/upload-image";
import { formatError } from "@/utils/fmt";

const UploadContext = createContext<{
  isPending: boolean;
  handleUpload: (filelist: FileList) => Promise<void | undefined>;
} | null>(null);

export const useUploadContext = () => {
  const context = useContext(UploadContext);

  if (context === null) {
    throw new Error("useUploadContext must be used within a UploadProvider");
  }

  return context;
};

export const UploadProvider = ({ children }: PropsWithChildren) => {
  const [isPending, setIsPending] = useState(false);

  const [message, setMessage] = useState<string>();

  const handleUpload = useLockFn(async (filelist: FileList | File[]) => {
    setIsPending(true);

    let index = 1;

    for (const file of filelist) {
      setMessage(
        `Uploading ${file.name}, size: ${prettyBytes(file.size)} (${index++}/${filelist.length})`,
      );

      const { name, size, type } = file;
      const arrayBuffer = await file.arrayBuffer();

      const [, error] = await uploadImage({
        name,
        size,
        type,
        arrayBuffer: arrayBuffer,
      });

      if (error) {
        toast.error(`Failed to upload: ${formatError(error)}`);
      }
    }

    setMessage(undefined);
    setIsPending(false);
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      handleUpload(acceptedFiles);
    },
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    onDropRejected: () => {
      toast.error("Only image files are allowed");
    },
    noClick: true,
  });

  return (
    <UploadContext.Provider
      value={{
        isPending,
        handleUpload,
      }}
    >
      <div {...getRootProps()}>
        <input {...getInputProps()} className="pointer-events-none hidden" />

        <AnimatePresence initial={false}>
          {(isDragActive || isPending) && (
            <motion.div
              className={cn(
                "fixed inset-0 z-50",
                "backdrop-blur-xl backdrop-brightness-75",
                "grid place-content-center",
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex flex-col items-center gap-2">
                {isDragActive && <span>Drop to Upload File</span>}
                {isPending && <span>Uploading...</span>}

                {message && (
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {message}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {children}
      </div>
    </UploadContext.Provider>
  );
};
