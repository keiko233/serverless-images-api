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
} from "@libnyanpasu/material-design-react";
import MaterialSymbolsDeleteForeverRounded from "~icons/material-symbols/delete-forever-rounded";
import { useLockFn } from "ahooks";
import { useServerAction } from "zsa-react";
import { deleteImageById } from "@/actions/query/image";
import { Image } from "@/schema";

export const ImageDeleteButton = ({ image }: { image: Image }) => {
  const { execute } = useServerAction(deleteImageById);

  const handleDelete = useLockFn(async () => {
    await execute(image.id);
  });

  return (
    <Modal>
      <ModalTrigger asChild>
        <Button icon variant="raised">
          <MaterialSymbolsDeleteForeverRounded />
        </Button>
      </ModalTrigger>

      <ModalContent>
        <Card className="w-96">
          <CardHeader>
            <ModalTitle>Delete Image?</ModalTitle>
          </CardHeader>

          <CardContent className="text-sm">
            Are you sure you want to delete the image?
          </CardContent>

          <CardFooter className="gap-1">
            <Button variant="flat" onClick={handleDelete}>
              Yes
            </Button>

            <ModalClose>No</ModalClose>
          </CardFooter>
        </Card>
      </ModalContent>
    </Modal>
  );
};
