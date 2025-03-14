"use client";

import { cn } from "@libnyanpasu/material-design-libs";
import { Button } from "@libnyanpasu/material-design-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavbarContext } from "./navbar-provider";

const LINKS = {
  dashboard: "/dashboard",
  setting: "/dashboard/setting",
};

export const NavbarAside = () => {
  const { isCollapsed, toggleCollapsed } = useNavbarContext();

  const pathname = usePathname();

  return (
    <AnimatePresence initial={false}>
      {!isCollapsed && (
        <motion.div
          key="backdrop"
          className={cn(
            "md:hidden",
            "backdrop-blur-xl backdrop-brightness-75",
            "fixed inset-0 z-40 h-dvh w-full",
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.3,
            stiffness: 1000,
          }}
          onClick={toggleCollapsed}
        />
      )}

      <aside
        key="aside"
        className={cn(
          "fixed top-0 h-dvh",
          "md:h-dvh-subtract-16 md:absolute",
          "z-50 min-w-60",
          "bg-primary-container/30 dark:bg-on-secondary-container/30",
          "overflow-x-hidden overflow-y-auto p-2",
          "flex flex-col gap-1",
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "-translate-x-60" : "",
        )}
      >
        <div
          className={cn(
            "md:hidden",
            "text-primary flex h-12 items-center justify-center font-bold",
          )}
        >
          Serverless Images API
        </div>

        {Object.entries(LINKS).map(([key, value]) => {
          const isCurrent = pathname === value;

          return (
            <Link href={{ pathname: value }} key={key} className="w-full">
              <Button
                className="w-full px-6 text-left capitalize"
                variant={isCurrent ? "flat" : "basic"}
                onClick={toggleCollapsed}
              >
                {key}
              </Button>
            </Link>
          );
        })}
      </aside>
    </AnimatePresence>
  );
};
