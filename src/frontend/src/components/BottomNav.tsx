import { Link, useLocation } from "@tanstack/react-router";
import { BookOpen, BookText, GraduationCap, Home, Moon } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Ana Səhifə", Icon: Home },
  { to: "/prayer-times", label: "Namaz", Icon: Moon },
  { to: "/quran", label: "Quran", Icon: BookOpen },
  { to: "/books", label: "Kitabxana", Icon: BookText },
  { to: "/arabic-learn", label: "Ərəbcə", Icon: GraduationCap },
] as const;

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="w-full flex items-stretch"
      style={{
        backgroundColor: "oklch(var(--islamic-dark))",
        borderTop: "1.5px solid oklch(var(--islamic-gold) / 0.3)",
        minHeight: "60px",
      }}
    >
      {NAV_ITEMS.map(({ to, label, Icon }) => {
        const isActive =
          to === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
            style={{
              color: isActive
                ? "oklch(var(--islamic-gold))"
                : "rgba(255,255,255,0.5)",
            }}
            data-ocid="nav.tab"
          >
            <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
            <span className="text-[10px] font-medium leading-tight">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
