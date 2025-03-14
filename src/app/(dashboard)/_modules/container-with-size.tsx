"use client";

import { cn } from "@libnyanpasu/material-design-libs";
import { PropsWithChildren } from "react";
import { useNavbarContext } from "./navbar-provider";

export const ContainerWithSize = ({ children }: PropsWithChildren) => {
  const { isCollapsed } = useNavbarContext();

  return (
    <div
      className={cn(
        "p-4",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "ml-0" : "md:ml-60",
      )}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
};
