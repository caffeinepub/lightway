import { useLocation, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/prayer-times": "Namaz Vaxtları",
  "/quran": "Quran",
  "/books": "Kitabxana",
  "/admin": "Admin",
};

export default function MobileHeader() {
  const location = useLocation();
  const router = useRouter();
  const isHome = location.pathname === "/";
  const title = PAGE_TITLES[location.pathname];

  return (
    <header
      className="sticky top-0 z-50 w-full flex items-center justify-center"
      style={{
        backgroundColor: "oklch(var(--islamic-dark))",
        height: "52px",
        borderBottom: "1px solid oklch(var(--islamic-gold) / 0.2)",
      }}
    >
      {!isHome && (
        <button
          type="button"
          onClick={() => router.history.back()}
          className="absolute left-3 flex items-center justify-center w-9 h-9 rounded-full transition-colors"
          style={{ color: "oklch(var(--islamic-gold))" }}
          data-ocid="header.button"
          aria-label="Geri"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      <div className="flex items-center gap-2">
        {isHome && (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-base"
            style={{
              backgroundColor: "oklch(var(--islamic-gold) / 0.15)",
              border: "1.5px solid oklch(var(--islamic-gold))",
            }}
          >
            ☪
          </div>
        )}
        <span
          className="font-bold tracking-widest text-sm"
          style={{ color: isHome ? "oklch(var(--islamic-gold))" : "white" }}
        >
          {isHome ? "LIGHTWAY" : title}
        </span>
      </div>
    </header>
  );
}
