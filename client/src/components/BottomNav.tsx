import { NavLink } from "react-router-dom";
import { HomeIcon, ChatBubbleOvalLeftIcon, UserIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

const links = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/post/new", label: "Post", icon: PlusCircleIcon },
  { to: "/chat", label: "Chat", icon: ChatBubbleOvalLeftIcon },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

export function BottomNav() {
  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 mx-auto flex max-w-xl items-center justify-around border-t border-slate-200 bg-white/95 py-2 text-sm backdrop-blur">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            clsx(
              "flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-slate-500",
              isActive && "text-primary-dark"
            )
          }
        >
          <link.icon className="h-6 w-6" />
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
