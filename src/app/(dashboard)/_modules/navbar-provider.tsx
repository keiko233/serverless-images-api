"use client";

import { useUpdateEffect } from "ahooks";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from "react";
import { useIsMobile } from "@/hooks/use-is-moblie";

const NavbarContext = createContext<{
  isCollapsed: boolean;
  toggleCollapsed: () => void;
} | null>(null);

export const useNavbarContext = () => {
  const context = useContext(NavbarContext);

  if (!context) {
    throw new Error("useNavbarContext must be used within a NavbarProvider");
  }

  return context;
};

export const NavbarProvider = ({ children }: PropsWithChildren) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => !prev);
  };

  const isMobile = useIsMobile();

  useUpdateEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  return (
    <NavbarContext.Provider
      value={{
        isCollapsed,
        toggleCollapsed,
      }}
    >
      {children}
    </NavbarContext.Provider>
  );
};
