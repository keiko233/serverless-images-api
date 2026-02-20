import { createServerFn } from "@tanstack/react-start";

import { OnedriveService } from "@/lib/onedrive";
import { getOnedrivePathSetting, getOnedriveSetting } from "@/query/settings";
import { ImageSchema } from "@/schema";

let cachedOnedriveClient: OnedriveService | null = null;

export const getOnedriveClient = async () => {
  if (cachedOnedriveClient) {
    return cachedOnedriveClient;
  }

  const settings = await getOnedriveSetting();

  if (!settings) {
    throw new Error("Onedrive settings not found, please configure it first");
  }

  cachedOnedriveClient = new OnedriveService(settings);

  return cachedOnedriveClient;
};

export const uploadFile = async (fileBuffer: Buffer, filename: string) => {
  const client = await getOnedriveClient();

  const path = await getOnedrivePathSetting();

  if (!path) {
    throw new Error(
      "Onedrive path settings not found, please configure it first",
    );
  }

  const result = await client.upload(fileBuffer, `${path.value}/${filename}`);

  if (!result) {
    throw new Error("Failed to upload file");
  }
};

export const getFile = createServerFn({
  method: "GET",
})
  .inputValidator(
    ImageSchema.pick({
      id: true,
      filename: true,
    }),
  )
  .handler(async ({ data }) => {
    const client = await getOnedriveClient();

    const path = await getOnedrivePathSetting();

    if (!path) {
      throw new Error(
        "Onedrive path settings not found, please configure it first",
      );
    }

    const [, format] = data.filename.split(".");

    const result = await client.getLink(`${path.value}/${data.id}.${format}`);

    if (!result) {
      throw new Error("Failed to get file");
    }

    return result;
  });
