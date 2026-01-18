import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { StickySidebar } from "./StickySidebar";
import { FloatingActionButton } from "./FloatingActionButton";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-paper font-body text-ink antialiased selection:bg-mocha-400/20 selection:text-mocha-700">
      <Header />
      <main className="flex-1 w-full">
        {/* Centralized container for main content */}
        <div className="container mx-auto max-w-[1440px] px-4 py-6 md:py-8 lg:py-10 flex gap-8">
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
          {/* Right Sticky Sidebar for high-density UX */}
          <StickySidebar />
        </div>
      </main>
      <Footer />
      <FloatingActionButton />
    </div>
  );
}
