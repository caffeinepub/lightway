import { Link } from "@tanstack/react-router";
import { useI18n } from "../contexts/i18n";

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  return (
    <footer
      style={{ backgroundColor: "oklch(var(--islamic-dark))" }}
      className="mt-auto"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
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
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Gündəlik İslami ehtiyaclarınız üçün yoldaşınız.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4
              className="text-white font-semibold mb-3"
              style={{ color: "oklch(var(--islamic-gold))" }}
            >
              Naviqasiya
            </h4>
            <ul className="space-y-2">
              {[
                { to: "/", label: t("home") },
                { to: "/prayer-times", label: t("prayerTimes") },
                { to: "/quran", label: t("quran") },
                { to: "/books", label: t("books") },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              className="font-semibold mb-3"
              style={{ color: "oklch(var(--islamic-gold))" }}
            >
              بِسْمِ اللّٰهِ
            </h4>
            <p className="text-white/60 text-sm">
              Bağışlayan və Mərhəmətli Allahın adı ilə.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-white/50 text-sm">
            © {year}. Yaradıldı{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white underline"
            >
              caffeine.ai
            </a>{" "}
            ilə
          </p>
          <p className="text-white/40 text-xs font-amiri">اللَّهُمَّ اهْدِنَا</p>
        </div>
      </div>
    </footer>
  );
}
