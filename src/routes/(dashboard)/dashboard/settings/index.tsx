import { createFileRoute } from "@tanstack/react-router";

import {
  getLegacyUserAgentSetting,
  getOnedrivePathSetting,
  getOnedriveSetting,
} from "@/query/settings";

import OnedriveConfigForm from "./_modules/onedrive-config-form";
import OnedrivePathForm from "./_modules/onedrive-path-form";
import UserAgentForm from "./_modules/user-agent-form";

export const Route = createFileRoute("/(dashboard)/dashboard/settings/")({
  loader: async () => {
    const [onedrive, onedrivePath, userAgent] = await Promise.all([
      getOnedriveSetting(),
      getOnedrivePathSetting(),
      getLegacyUserAgentSetting(),
    ]);

    return {
      onedrive,
      onedrivePath,
      userAgent,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="columns-1 gap-4 space-y-4 md:columns-2">
      <OnedriveConfigForm />

      <OnedrivePathForm />

      <UserAgentForm />
    </div>
  );
}
