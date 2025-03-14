"use client";

import { Button } from "@libnyanpasu/material-design-react";
import MaterialSymbolsMenuOpenRounded from "~icons/material-symbols/menu-open-rounded";
import { useNavbarContext } from "./navbar-provider";

export const NavbarMenu = () => {
  const { toggleCollapsed } = useNavbarContext();

  return (
    <Button icon onClick={toggleCollapsed}>
      <MaterialSymbolsMenuOpenRounded className="size-6" />
    </Button>
  );
};
