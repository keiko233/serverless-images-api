import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboardIcon,
  MenuIcon,
  SendIcon,
  SettingsIcon,
} from "lucide-react";
import { motion } from "motion/react";
import {
  createContext,
  use,
  type ComponentProps,
  type PropsWithChildren,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SidebarContext = createContext<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
} | null>(null);

export const useSidebar = () => {
  const context = use(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }

  return context;
};

export function SidebarProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

const NAV_ITEMS = [
  {
    href: "/dashboard",
    icon: LayoutDashboardIcon,
    label: "Dashboard",
  },
  {
    href: "/dashboard/request",
    icon: SendIcon,
    label: "Request",
  },
  {
    href: "/dashboard/settings",
    icon: SettingsIcon,
    label: "Settings",
  },
] as Array<{
  href: ComponentProps<typeof Link>["href"];
  icon: React.ElementType;
  label: string;
}>;

export function Sidebar() {
  const { isOpen, setIsOpen } = useSidebar();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const { pathname } = useLocation();

  return (
    <motion.aside
      className={cn(
        "bg-sidebar border-sidebar-border",
        "flex gap-2 h-full shrink-0 flex-col overflow-clip border-r p-2",
      )}
      animate={{
        width: isOpen ? 280 : 48,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      <div className="flex h-10 items-center justify-between">
        <motion.div
          className={cn(
            "text-sidebar-foreground min-w-0 overflow-hidden whitespace-nowrap",
            "font-semibold",
          )}
          animate={{
            maxWidth: isOpen ? 180 : 0,
            opacity: isOpen ? 1 : 0,
            paddingLeft: isOpen ? 8 : 0,
          }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
        >
          Serverless Images API
        </motion.div>

        <Button variant="outline" className="size-8" onClick={handleToggle}>
          <MenuIcon className="size-4" />
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            to={href}
            data-active={String(pathname === href)}
            className={cn(
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
              "flex h-8 items-center rounded-lg px-2 transition-colors",
            )}
          >
            <Icon className="size-4 shrink-0" />

            <motion.span
              className="overflow-hidden text-sm whitespace-nowrap"
              animate={{
                maxWidth: isOpen ? 140 : 0,
                opacity: isOpen ? 1 : 0,
                marginLeft: isOpen ? 8 : 0,
              }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
            >
              {label}
            </motion.span>
          </Link>
        ))}
      </nav>

      {/* <div className="mt-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="text-muted-foreground text-xs">v1.0.0</div>
        </div>
      </div> */}
    </motion.aside>
  );
}
