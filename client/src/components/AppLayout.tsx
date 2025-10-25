import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function AppLayout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col bg-surface">
      <header className="safe-top sticky top-0 z-10 bg-white/95 px-4 py-3 text-lg font-semibold text-slate-800 shadow-sm backdrop-blur">
        ConnectedCommunity
      </header>
      <main className="flex-1 px-4 pb-24 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
