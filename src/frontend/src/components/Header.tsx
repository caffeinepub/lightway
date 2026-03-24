import { Link, useLocation } from "@tanstack/react-router";
import { type Lang, useI18n } from "../contexts/i18n";

const LANGS: Lang[] = ["AZ", "TR", "EN"];

export default function Header() {
  const { lang, setLang, t } = useI18n();
  const location = useLocation();

  const navLinks = [
    { to: "/", label: t("home") },
    { to: "/prayer-times", label: t("prayerTimes") },
    { to: "/quran", label: t("quran") },
    { to: "/books", label: t("books") },
    { to: "/admin", label: t("admin") },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{ backgroundColor: "oklch(var(--islamic-dark))" }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0"
          data-ocid="header.link"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xl"
            style={{
              backgroundColor: "oklch(var(--islamic-gold) / 0.15)",
              border: "1.5px solid oklch(var(--islamic-gold))",
            }}
          >
            ☪
          </div>
          <span className="text-white font-bold text-xl tracking-widest">
            LIGHTWAY
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                data-ocid="header.link"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "text-gold bg-white/10"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
                style={isActive ? { color: "oklch(var(--islamic-gold))" } : {}}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Language switcher */}
        <div
          className="flex rounded-full overflow-hidden border shrink-0"
          style={{ borderColor: "oklch(var(--islamic-gold) / 0.4)" }}
        >
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              data-ocid="header.toggle"
              onClick={() => setLang(l)}
              className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
                lang === l
                  ? "text-islamic-dark"
                  : "text-white/70 hover:text-white"
              }`}
              style={
                lang === l
                  ? {
                      backgroundColor: "oklch(var(--islamic-gold))",
                      color: "oklch(var(--islamic-dark))",
                    }
                  : {}
              }
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
