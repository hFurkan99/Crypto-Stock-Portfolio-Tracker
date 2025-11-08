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
import { Sun, Moon, Menu, X } from "lucide-react";

export function NavigationMenuDemo() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <div className="flex items-center justify-between">
      {/* Desktop Navigation */}
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList className="flex-wrap">
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link to="/">{t("nav.dashboard")}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link to="/holdings">{t("nav.holdings")}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link to="/watchlist">{t("nav.watchlist")}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Theme and Language Controls */}
      <div className="flex items-center space-x-2">
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
          className="bg-transparent dark:bg-gray-800 p-1 rounded border border-gray-200 dark:border-gray-700 text-sm dark:text-gray-200"
        >
          <option
            value="tr"
            className="bg-white dark:bg-gray-800 text-black dark:text-gray-200"
          >
            {t("header.language.tr")}
          </option>
          <option
            value="en"
            className="bg-white dark:bg-gray-800 text-black dark:text-gray-200"
          >
            {t("header.language.en")}
          </option>
        </select>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg md:hidden z-50">
          <nav className="flex flex-col p-4 space-y-2">
            <Link
              to="/"
              className="p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("nav.dashboard")}
            </Link>
            <Link
              to="/holdings"
              className="p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("nav.holdings")}
            </Link>
            <Link
              to="/watchlist"
              className="p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("nav.watchlist")}
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
