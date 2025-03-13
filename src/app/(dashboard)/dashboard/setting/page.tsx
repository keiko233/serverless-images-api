import { cn } from "@libnyanpasu/material-design-libs";
import {
  getOnedrivePathSetting,
  getOnedriveSetting,
} from "@/actions/query/setting";
import { OnedriveCard } from "./_modules/onedrive-card";
import { OnedrivePathCard } from "./_modules/onedrive-path-card";

export const runtime = "edge";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [onedrive, onedrivePath] = await Promise.all([
    getOnedriveSetting(),
    getOnedrivePathSetting(),
  ]);

  return (
    <div className={cn("columns-1 gap-4 space-y-4 md:columns-2")}>
      <OnedriveCard defaultValues={onedrive} />

      <OnedrivePathCard
        defaultValues={
          onedrivePath
            ? {
                path: onedrivePath.value,
              }
            : null
        }
      />
    </div>
  );
}
