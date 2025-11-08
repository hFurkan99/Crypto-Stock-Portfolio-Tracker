import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/useTranslation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sun, Moon } from "lucide-react";

export function NavigationMenuDemo() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { t, i18n, lang } = useTranslation();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    }
  }, []);

  function toggleTheme() {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  }
  return (
    <NavigationMenu>
      <NavigationMenuList className="flex-wrap">
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link to="/">{t("nav.dashboard")}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link to="/holdings">{t("nav.holdings")}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link to="/watchlist">{t("nav.watchlist")}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <div className="ml-4 flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <select
            aria-label="Language"
            defaultValue={lang}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="bg-transparent p-1 rounded border border-gray-200 dark:border-gray-700"
          >
            <option value="tr">{t("header.language.tr")}</option>
            <option value="en">{t("header.language.en")}</option>
          </select>
        </div>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
