import { Link, useLocation } from "react-router-dom";
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
  const location = useLocation();

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
    <div className="flex items-center justify-between gap-4">
      {/* Mobile Menu Button - Left side on mobile */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-all active:scale-95 border border-transparent hover:border-primary/20"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Logo/Brand - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-linear-to-r from-primary/10 to-accent/10 border border-primary/20">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
          <span className="text-white font-bold text-sm">₿</span>
        </div>
        <span className="font-bold text-lg bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
          CryptoTracker
        </span>
      </div>

      {/* Desktop Navigation - Centered */}
      <NavigationMenu className="hidden md:flex md:absolute md:left-1/2 md:-translate-x-1/2">
        <NavigationMenuList className="flex-wrap gap-1">
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link
                to="/"
                className={`relative group ${
                  location.pathname === "/"
                    ? "bg-linear-to-r from-primary/20 to-accent/20 text-primary border-primary/30"
                    : ""
                }`}
              >
                {t("nav.dashboard")}
                <span
                  className={`absolute inset-x-0 -bottom-px h-px bg-linear-to-r from-primary to-accent transition-transform ${
                    location.pathname === "/"
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                ></span>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link
                to="/holdings"
                className={`relative group ${
                  location.pathname === "/holdings"
                    ? "bg-linear-to-r from-primary/20 to-accent/20 text-primary border-primary/30"
                    : ""
                }`}
              >
                {t("nav.holdings")}
                <span
                  className={`absolute inset-x-0 -bottom-px h-px bg-linear-to-r from-primary to-accent transition-transform ${
                    location.pathname === "/holdings"
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                ></span>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link
                to="/watchlist"
                className={`relative group ${
                  location.pathname === "/watchlist"
                    ? "bg-linear-to-r from-primary/20 to-accent/20 text-primary border-primary/30"
                    : ""
                }`}
              >
                {t("nav.watchlist")}
                <span
                  className={`absolute inset-x-0 -bottom-px h-px bg-linear-to-r from-primary to-accent transition-transform ${
                    location.pathname === "/watchlist"
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                ></span>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Right side controls */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-primary/10 transition-all active:scale-95 border border-transparent hover:border-primary/20 relative overflow-hidden group"
          aria-label="Toggle theme"
        >
          <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/10 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          {theme === "dark" ? (
            <Sun size={18} className="relative z-10" />
          ) : (
            <Moon size={18} className="relative z-10" />
          )}
        </button>

        {/* Language Toggle Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
          <button
            onClick={() => i18n.changeLanguage("tr")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              lang === "tr"
                ? "bg-linear-to-r from-primary to-accent text-white shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
            aria-label="Turkish"
          >
            TR
          </button>
          <button
            onClick={() => i18n.changeLanguage("en")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              lang === "en"
                ? "bg-linear-to-r from-primary to-accent text-white shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
            aria-label="English"
          >
            EN
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-2xl md:hidden z-50 animate-fadeIn">
          <nav className="flex flex-col p-4 space-y-2">
            <Link
              to="/"
              className={`p-3 rounded-lg transition-all border font-medium ${
                location.pathname === "/"
                  ? "bg-linear-to-r from-primary/20 to-accent/20 border-primary/30 text-primary"
                  : "border-transparent hover:bg-primary/10 hover:border-primary/20"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("nav.dashboard")}
            </Link>
            <Link
              to="/holdings"
              className={`p-3 rounded-lg transition-all border font-medium ${
                location.pathname === "/holdings"
                  ? "bg-linear-to-r from-primary/20 to-accent/20 border-primary/30 text-primary"
                  : "border-transparent hover:bg-primary/10 hover:border-primary/20"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("nav.holdings")}
            </Link>
            <Link
              to="/watchlist"
              className={`p-3 rounded-lg transition-all border font-medium ${
                location.pathname === "/watchlist"
                  ? "bg-linear-to-r from-primary/20 to-accent/20 border-primary/30 text-primary"
                  : "border-transparent hover:bg-primary/10 hover:border-primary/20"
              }`}
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
