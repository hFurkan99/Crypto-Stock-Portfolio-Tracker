import { Outlet } from "react-router-dom";
import { NavigationMenuDemo } from "./Header";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Glassmorphism Header with blur effect */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-card/70 border-b border-border/50 shadow-lg shadow-primary/5">
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-accent/5 to-primary/5"></div>
        <div className="container mx-auto px-2 sm:px-4 py-3 relative">
          <NavigationMenuDemo />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-2 sm:px-4 py-4 sm:py-6 animate-fadeIn">
        <Outlet />
      </main>

      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>
    </div>
  );
}
