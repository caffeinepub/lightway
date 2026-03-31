import { Link, useLocation } from "@tanstack/react-router";
import {
  BookOpen,
  BookText,
  Compass,
  GraduationCap,
  Home,
  Moon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  to: string;
  label: string;
  Icon: LucideIcon;
  isCenter?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Ana Səhifə", Icon: Home },
  { to: "/prayer-times", label: "Namaz", Icon: Moon },
  { to: "/quran", label: "Quran", Icon: BookOpen },
  { to: "/qibla", label: "Qiblə", Icon: Compass, isCenter: true },
  { to: "/books", label: "Kitabxana", Icon: BookText },
  { to: "/arabic-learn", label: "ƍrəbcə", Icon: GraduationCap },
];

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
      {NAV_ITEMS.map(({ to, label, Icon, isCenter }) => {
        const isActive =
          to === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(to);

        if (isCenter) {
          return (
            <Link
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-colors relative"
              data-ocid="nav.tab"
            >
              <div
                className="flex flex-col items-center justify-center rounded-full w-12 h-12 -mt-4 shadow-lg"
                style={{
                  background: isActive
                    ? "oklch(var(--islamic-gold))"
                    : "oklch(0.25 0.06 150)",
                  border: "2px solid oklch(var(--islamic-gold) / 0.6)",
                  boxShadow: isActive
                    ? "0 0 16px oklch(var(--islamic-gold) / 0.6)"
                    : "0 4px 12px oklch(0 0 0 / 0.4)",
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={2}
                  style={{
                    color: isActive
                      ? "oklch(var(--islamic-dark))"
                      : "oklch(var(--islamic-gold))",
                  }}
                />
              </div>
              <span
                className="text-[9px] font-medium leading-tight"
                style={{
                  color: isActive
                    ? "oklch(var(--islamic-gold))"
                    : "rgba(255,255,255,0.5)",
                }}
              >
                {label}
              </span>
            </Link>
          );
        }

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
