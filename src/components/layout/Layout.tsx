import { Outlet } from "react-router-dom";
import { NavigationMenuDemo } from "./Header";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-3">
          <NavigationMenuDemo />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
