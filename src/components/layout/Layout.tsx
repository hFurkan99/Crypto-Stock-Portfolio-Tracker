import { Outlet } from "react-router-dom";
import { NavigationMenuDemo } from "./Header";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow sticky top-0 z-40 dark:bg-gray-900">
        <div className="container mx-auto px-2 sm:px-4 py-3">
          <NavigationMenuDemo />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <Outlet />
      </main>
    </div>
  );
}
