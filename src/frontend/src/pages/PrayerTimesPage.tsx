import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearch } from "@tanstack/react-router";
import { Loader2, MapPin, Search } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import NamazGuide from "../components/NamazGuide";
import { useI18n } from "../contexts/i18n";
import { useFetchPrayerTimes } from "../hooks/useQueries";

interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface AladhanResponse {
  code: number;
  data: {
    timings: PrayerTimings;
    date: { readable: string; hijri: { date: string; month: { en: string } } };
    meta: { timezone: string; method: { name: string } };
  };
}

const PRAYER_ICONS: Record<string, string> = {
  Fajr: "🌙",
  Sunrise: "🌅",
  Dhuhr: "☀️",
  Asr: "🌤️",
  Maghrib: "🌇",
  Isha: "🌌",
};

function parseTime(timeStr: string): number {
  const parts = timeStr.split(":");
  return Number(parts[0]) * 60 + Number(parts[1]);
}

function getNextPrayer(timings: PrayerTimings): string {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
  for (const p of prayers) {
    const mins = parseTime(timings[p]);
    if (mins > nowMinutes) return p;
  }
  return "Fajr";
}

function getTimeUntil(timeStr: string): string {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  let prayerMinutes = parseTime(timeStr);
  if (prayerMinutes <= nowMinutes) prayerMinutes += 24 * 60;
  const diff = prayerMinutes - nowMinutes;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h > 0) return `${h} saat ${m} dəq`;
  return `${m} dəqiqə`;
}

export default function PrayerTimesPage() {
  const { t } = useI18n();
  const searchParams = useSearch({ strict: false }) as { city?: string };
  const [city, setCity] = useState(searchParams.city ?? "");
  const [country, setCountry] = useState("AZ");
  const { mutate, data: rawData, isPending, error } = useFetchPrayerTimes();
  const [parsed, setParsed] = useState<AladhanResponse | null>(null);
  const [displayCity, setDisplayCity] = useState("Bakı");
  const [now, setNow] = useState(new Date());
  const autoLoadedRef = useRef(false);

  // Update clock every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (rawData) {
      try {
        setParsed(JSON.parse(rawData));
      } catch {
        setParsed(null);
      }
    }
  }, [rawData]);

  // Auto-load Baku on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: mutate is stable
  useEffect(() => {
    if (!autoLoadedRef.current) {
      autoLoadedRef.current = true;
      const initCity = searchParams.city ?? "Baku";
      const initCountry = "AZ";
      setCity(searchParams.city ?? "");
      setDisplayCity(searchParams.city ?? "Bakı");
      mutate({ city: initCity, country: initCountry });
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: mutate is stable
  useEffect(() => {
    if (searchParams.city) {
      setCity(searchParams.city);
      setDisplayCity(searchParams.city);
      mutate({ city: searchParams.city, country: "AZ" });
    }
  }, [searchParams.city]);

  const handleSearch = () => {
    if (!city.trim()) return;
    setDisplayCity(city.trim());
    mutate({ city: city.trim(), country: country.trim() || "AZ" });
  };

  const prayerLabels: Record<string, string> = {
    Fajr: t("fajr"),
    Sunrise: t("sunrise"),
    Dhuhr: t("dhuhr"),
    Asr: t("asr"),
    Maghrib: t("maghrib"),
    Isha: t("isha"),
  };

  const nextPrayer = parsed ? getNextPrayer(parsed.data.timings) : null;
  const prayerOrder = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div className="islamic-bg-pattern min-h-screen">
      {/* Page header */}
      <div className="hero-gradient py-12 px-4">
        <div className="container mx-auto text-center">
          <p
            className="font-amiri text-xl mb-2"
            style={{ color: "oklch(var(--islamic-gold))" }}
          >
            حَافِظُوا عَلَى الصَّلَوَاتِ
          </p>
          <h1 className="text-4xl font-extrabold text-white mb-2">
            {t("prayerTimes")}
          </h1>
          <p className="text-white/60">{t("baqarahQuote")}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Search */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-ocid="prayer.search_input"
                placeholder={t("city")}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>
            <Input
              data-ocid="prayer.input"
              placeholder={t("country")}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-24"
            />
            <Button
              data-ocid="prayer.submit_button"
              onClick={handleSearch}
              disabled={isPending}
              style={{
                backgroundColor: "oklch(var(--islamic-gold))",
                color: "oklch(var(--islamic-dark))",
              }}
              className="rounded-full px-6 font-semibold"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {isPending && (
          <div className="text-center py-12" data-ocid="prayer.loading_state">
            <Loader2
              className="w-8 h-8 animate-spin mx-auto mb-3"
              style={{ color: "oklch(var(--islamic-gold))" }}
            />
            <p className="text-muted-foreground">{t("loading")}</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8" data-ocid="prayer.error_state">
            <p className="text-destructive">{t("errorFetchingPrayer")}</p>
          </div>
        )}

        {parsed?.data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Date info */}
            <div className="text-center mb-8">
              <p
                className="text-2xl font-bold"
                style={{ color: "oklch(var(--islamic-green))" }}
              >
                {displayCity}
              </p>
              <p className="text-muted-foreground">
                {parsed.data.date.readable}
              </p>
              {parsed.data.date.hijri && (
                <p
                  className="text-sm"
                  style={{ color: "oklch(var(--islamic-gold))" }}
                >
                  {parsed.data.date.hijri.date} —{" "}
                  {parsed.data.date.hijri.month.en}
                </p>
              )}
              {nextPrayer && (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="inline-flex flex-col items-center gap-1 mt-4 px-6 py-3 rounded-2xl shadow-lg"
                  style={{ backgroundColor: "oklch(var(--islamic-gold))" }}
                >
                  <span
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "oklch(var(--islamic-dark) / 0.7)" }}
                  >
                    {t("nextPrayer")}
                  </span>
                  <span
                    className="text-2xl font-extrabold"
                    style={{ color: "oklch(var(--islamic-dark))" }}
                  >
                    {PRAYER_ICONS[nextPrayer]} {prayerLabels[nextPrayer]} —{" "}
                    {parsed.data.timings[nextPrayer as keyof PrayerTimings]}
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "oklch(var(--islamic-dark) / 0.75)" }}
                  >
                    {getTimeUntil(
                      parsed.data.timings[nextPrayer as keyof PrayerTimings],
                    )}{" "}
                    qaldı
                  </span>
                </motion.div>
              )}
            </div>

            {/* Prayer cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {prayerOrder.map((prayer, i) => {
                const isNext = prayer === nextPrayer;
                const time = parsed.data.timings[prayer as keyof PrayerTimings];
                const pMins = parseTime(time);
                const isPast = pMins <= nowMinutes;
                return (
                  <motion.div
                    key={prayer}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className={`rounded-2xl p-5 text-center transition-all ${
                      isNext
                        ? "card-gradient gold-glow text-white"
                        : "bg-card border border-border shadow-xs"
                    }`}
                    data-ocid={`prayer.item.${i + 1}`}
                  >
                    <div className="text-3xl mb-2">{PRAYER_ICONS[prayer]}</div>
                    <div
                      className={`font-semibold text-sm mb-1 ${
                        isNext ? "text-white/70" : "text-muted-foreground"
                      }`}
                    >
                      {prayerLabels[prayer]}
                    </div>
                    <div
                      className={`text-2xl font-extrabold ${
                        isNext
                          ? "text-white"
                          : isPast
                            ? "text-muted-foreground"
                            : ""
                      }`}
                      style={
                        !isNext && !isPast
                          ? { color: "oklch(var(--islamic-green))" }
                          : {}
                      }
                    >
                      {time}
                    </div>
                    {isNext && (
                      <div className="mt-2 text-xs text-white/60">
                        ▶ {t("nextPrayer")}
                      </div>
                    )}
                    {isPast && !isNext && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        ✓
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Namaz Guide */}
            <div className="max-w-3xl mx-auto mt-6">
              <NamazGuide />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
