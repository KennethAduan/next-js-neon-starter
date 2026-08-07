"use client";

import * as React from "react";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      size="icon"
      variant="ghost"
    >
      <div className="flex gap-2 dark:hidden">
        <IconMoon className="size-5" />
      </div>

      <div className="dark:flex gap-2 hidden">
        <IconSun className="size-5" />
      </div>
    </Button>
  );
}
