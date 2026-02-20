import { useEffect, useState } from "react";

export function useColorScheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    setIsDark(isDark);
  }, []);

  return isDark;
}
