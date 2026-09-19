"use client";
import { useEffect, useState } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState({
    primaryColor: "#b88c65",
    secondaryColor: "#0d0b0b",
    accentColor: "#a77a54",
  });

  useEffect(() => {
    // Fetch theme from API
    fetch("/api/theme")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setTheme(data);
          document.documentElement.style.setProperty("--primary", data.primaryColor);
          document.documentElement.style.setProperty("--secondary", data.secondaryColor);
          document.documentElement.style.setProperty("--accent", data.accentColor);
        }
      })
      .catch(() => {});
  }, []);

  return <>{children}</>;
}
