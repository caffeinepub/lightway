import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearch } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Headphones,
  Loader2,
  Pause,
  Play,
  SkipForward,
  Volume2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "../contexts/i18n";
import { useFetchQuranSurah, useFetchQuranVerse } from "../hooks/useQueries";

interface QuranVerseData {
  number: number;
  text: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
  };
  numberInSurah: number;
}

interface AlquranMultiResponse {
  code: number;
  data: QuranVerseData[];
}

interface SurahEdition {
  identifier: string;
  ayahs: Array<{ number: number; text: string; numberInSurah: number }>;
  name?: string;
  englishName?: string;
}

interface AlquranSurahResponse {
  code: number;
  data: SurahEdition[];
}

interface SurahAyah {
  numberInSurah: number;
  arabic: string;
  transliteration: string;
  translation: string;
}

const WELL_KNOWN = [
  { label: "əl-Fatihə 1:1", surah: 1, ayah: 1 },
  { label: "Ayətəl-Kürsi 2:255", surah: 2, ayah: 255 },
  { label: "əl-İxlas 112:1", surah: 112, ayah: 1 },
  { label: "əl-Fələq 113:1", surah: 113, ayah: 1 },
  { label: "ən-Nas 114:1", surah: 114, ayah: 1 },
];

const PRAYER_CATEGORIES = [
  {
    id: "qorunma",
    title: "🛡️ Qorunma duaları",
    items: [
      { label: "Surah Al-Ikhlas", surah: 112 },
      { label: "Surah Al-Falaq", surah: 113 },
      { label: "Surah An-Nas", surah: 114 },
      { label: "Ayat al-Kursi", surah: 2, ayahStart: 255, ayahEnd: 255 },
      {
        label: "Surah Al-Baqarah 285-286",
        surah: 2,
        ayahStart: 285,
        ayahEnd: 286,
      },
      {
        label: "Surah Al-Mu'minun 115-118",
        surah: 23,
        ayahStart: 115,
        ayahEnd: 118,
      },
      { label: "Surah As-Saffat 1-10", surah: 37, ayahStart: 1, ayahEnd: 10 },
    ],
  },
  {
    id: "bereket",
    title: "🌿 Bərəkət və ruzi",
    items: [
      { label: "Surah Al-Waqi'ah", surah: 56 },
      { label: "Ayat al-Kursi", surah: 2, ayahStart: 255, ayahEnd: 255 },
      {
        label: "Surah Al-Baqarah 285-286",
        surah: 2,
        ayahStart: 285,
        ayahEnd: 286,
      },
      { label: "Surah At-Talaq 2-3", surah: 65, ayahStart: 2, ayahEnd: 3 },
      { label: "Surah Nuh 10-12", surah: 71, ayahStart: 10, ayahEnd: 12 },
      { label: "Surah Adh-Dhariyat 58", surah: 51, ayahStart: 58, ayahEnd: 58 },
      { label: "Surah Ibrahim 7", surah: 14, ayahStart: 7, ayahEnd: 7 },
      { label: "Surah Al-Imran 159", surah: 3, ayahStart: 159, ayahEnd: 159 },
    ],
  },
  {
    id: "sevgi",
    title: "❤️ Sevgi və münasibətlər",
    items: [
      { label: "Surah Ar-Rum 21", surah: 30, ayahStart: 21, ayahEnd: 21 },
      { label: "Surah Al-Furqan 74", surah: 25, ayahStart: 74, ayahEnd: 74 },
      { label: "Surah An-Nisa 19", surah: 4, ayahStart: 19, ayahEnd: 19 },
      { label: "Surah Al-Baqarah 187", surah: 2, ayahStart: 187, ayahEnd: 187 },
      { label: "Surah An-Nur 26", surah: 24, ayahStart: 26, ayahEnd: 26 },
      { label: "Surah Al-Ahzab 35", surah: 33, ayahStart: 35, ayahEnd: 35 },
      { label: "Surah Al-Hujurat 10", surah: 49, ayahStart: 10, ayahEnd: 10 },
      { label: "Surah Yusuf", surah: 12 },
    ],
  },
  {
    id: "sakitlik",
    title: "🕊️ Daxili sakitlik və psixologiya",
    items: [
      { label: "Surah Ar-Ra'd 28", surah: 13, ayahStart: 28, ayahEnd: 28 },
      { label: "Surah Ash-Sharh 5-6", surah: 94, ayahStart: 5, ayahEnd: 6 },
      { label: "Surah Al-Baqarah 286", surah: 2, ayahStart: 286, ayahEnd: 286 },
      { label: "Surah Taha 25-28", surah: 20, ayahStart: 25, ayahEnd: 28 },
      { label: "Surah Al-Fajr 27-30", surah: 89, ayahStart: 27, ayahEnd: 30 },
      { label: "Surah Yunus 57", surah: 10, ayahStart: 57, ayahEnd: 57 },
      { label: "Surah Ad-Duha", surah: 93 },
      { label: "Surah Al-Inshiqaq", surah: 84 },
      { label: "Surah Yusuf", surah: 12 },
    ],
  },
  {
    id: "guc",
    title: "⚡ Güc və motivasiya",
    items: [
      { label: "Surah Al-Anfal 46", surah: 8, ayahStart: 46, ayahEnd: 46 },
      { label: "Surah Al-Imran 139", surah: 3, ayahStart: 139, ayahEnd: 139 },
      { label: "Surah At-Tawbah 51", surah: 9, ayahStart: 51, ayahEnd: 51 },
      { label: "Surah Al-Fath 1", surah: 48, ayahStart: 1, ayahEnd: 1 },
      { label: "Surah Ash-Sharh 5-6", surah: 94, ayahStart: 5, ayahEnd: 6 },
      { label: "Surah Al-Baqarah 153", surah: 2, ayahStart: 153, ayahEnd: 153 },
      { label: "Surah Muhammad", surah: 47 },
      { label: "Surah Al-Asr", surah: 103 },
    ],
  },
  {
    id: "hidayet",
    title: "🌟 Hidayət və doğru yol",
    items: [
      { label: "Surah Al-Fatiha", surah: 1 },
      { label: "Surah Al-Baqarah 2", surah: 2, ayahStart: 2, ayahEnd: 2 },
      { label: "Surah Al-Baqarah 286", surah: 2, ayahStart: 286, ayahEnd: 286 },
      { label: "Surah Al-Imran 8", surah: 3, ayahStart: 8, ayahEnd: 8 },
      { label: "Surah Al-Imran 101", surah: 3, ayahStart: 101, ayahEnd: 101 },
      { label: "Surah An-Nisa 175", surah: 4, ayahStart: 175, ayahEnd: 175 },
      { label: "Surah Al-Ma'idah 16", surah: 5, ayahStart: 16, ayahEnd: 16 },
      { label: "Surah Al-An'am 153", surah: 6, ayahStart: 153, ayahEnd: 153 },
      { label: "Surah Yunus 25", surah: 10, ayahStart: 25, ayahEnd: 25 },
      { label: "Surah Hud 112", surah: 11, ayahStart: 112, ayahEnd: 112 },
      { label: "Surah An-Nahl 90", surah: 16, ayahStart: 90, ayahEnd: 90 },
      { label: "Surah Al-Isra 9", surah: 17, ayahStart: 9, ayahEnd: 9 },
      { label: "Surah Al-Kahf", surah: 18 },
      { label: "Surah Taha 123", surah: 20, ayahStart: 123, ayahEnd: 123 },
      { label: "Surah Az-Zumar 18", surah: 39, ayahStart: 18, ayahEnd: 18 },
      { label: "Surah Ash-Shura 52", surah: 42, ayahStart: 52, ayahEnd: 52 },
      { label: "Surah Al-Jathiyah 20", surah: 45, ayahStart: 20, ayahEnd: 20 },
      { label: "Surah Al-Ahzab 36", surah: 33, ayahStart: 36, ayahEnd: 36 },
    ],
  },
];

const QARAR_STEPS = [
  {
    step: 1,
    title: "Başlanğıc (niyyəti təmizləmək)",
    surah: 1,
    label: "Surah Al-Fatiha",
    məqsəd: '"Məni doğru yola yönəlt" fokusuna girmək',
  },
  {
    step: 2,
    title: "Qəlbi sabitləşdirmək",
    surah: 3,
    ayahStart: 8,
    ayahEnd: 8,
    label: "Surah Al-Imran 8",
    məqsəd: "Qarışıqlıq → sakitlik",
  },
  {
    step: 3,
    title: "Aydınlıq və doğru seçim",
    surah: 39,
    ayahStart: 18,
    ayahEnd: 18,
    label: "Surah Az-Zumar 18",
    məqsəd: 'Variantlar içində "ən doğrusunu" seçmək',
  },
  {
    step: 4,
    title: "Qərar gücü (tərəddüdü qırmaq)",
    surah: 33,
    ayahStart: 36,
    ayahEnd: 36,
    label: "Surah Al-Ahzab 36",
    məqsəd: '"Qərar verdim və davam edirəm" vəziyyəti',
  },
  {
    step: 5,
    title: "Təvəkkül (buraxmaq və hərəkət)",
    surah: 3,
    ayahStart: 159,
    ayahEnd: 159,
    label: "Surah Al-Imran 159",
    məqsəd: "Qərardan sonra stress etməmək",
  },
  {
    step: 6,
    title: "Qorxunu sıfırlamaq",
    surah: 20,
    ayahStart: 123,
    ayahEnd: 123,
    label: "Surah Taha 123",
    məqsəd: '"Ya səhv etsəm?" düşüncəsini silmək',
  },
];

function padNum(n: number, len: number) {
  return String(n).padStart(len, "0");
}

function getAudioUrl(surah: number, ayah: number) {
  return `https://verses.quran.com/Alafasy/mp3/${padNum(surah, 3)}${padNum(ayah, 3)}.mp3`;
}

function FullSurahPlayer({
  surahNumber,
  ayahs,
  onIndexChange,
}: {
  surahNumber: number;
  ayahs: SurahAyah[];
  onIndexChange?: (idx: number) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentIdxRef = useRef(0);

  const currentAyah = ayahs[currentIdx];

  useEffect(() => {
    onIndexChange?.(currentIdx);
  }, [currentIdx, onIndexChange]);

  const playNext = useCallback(() => {
    const nextIdx = currentIdxRef.current + 1;
    if (nextIdx < ayahs.length) {
      currentIdxRef.current = nextIdx;
      setCurrentIdx(nextIdx);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [ayahs.length]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const skipNext = () => {
    if (currentIdx < ayahs.length - 1) {
      const nextIdx = currentIdx + 1;
      currentIdxRef.current = nextIdx;
      audioRef.current?.pause();
      setCurrentIdx(nextIdx);
    }
  };

  return (
    <div
      className="sticky top-0 z-10 rounded-2xl px-5 py-4 mb-4 shadow-lg"
      style={{
        backgroundColor: "oklch(0.18 0.05 160)",
        border: "1px solid oklch(var(--islamic-gold) / 0.4)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-white/50 text-xs">Oynayır</p>
          <p className="text-white font-semibold text-sm">
            Ayə {currentAyah.numberInSurah} / {ayahs.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: "oklch(var(--islamic-green))" }}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
          <button
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white border border-white/20"
            onClick={skipNext}
            disabled={currentIdx >= ayahs.length - 1}
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{
            width: `${((currentIdx + 1) / ayahs.length) * 100}%`,
            backgroundColor: "oklch(var(--islamic-gold))",
          }}
        />
      </div>
      {/* biome-ignore lint/a11y/useMediaCaption: Quran recitation */}
      <audio
        key={currentIdx}
        ref={audioRef}
        src={getAudioUrl(surahNumber, currentAyah.numberInSurah)}
        onEnded={playNext}
        onLoadedMetadata={() => {
          if (isPlaying) audioRef.current?.play().catch(() => {});
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
}

// InlineAyahContent: fetches and displays ayahs inline
function InlineAyahContent({
  surah,
  ayahStart,
  ayahEnd,
}: {
  surah: number;
  ayahStart?: number;
  ayahEnd?: number;
}) {
  const [ayahs, setAyahs] = useState<SurahAyah[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(false);
    setAyahs(null);

    fetch(
      `https://api.alquran.cloud/v1/surah/${surah}/editions/quran-simple,az.mammadaliyev,en.transliteration`,
    )
      .then((r) => r.json())
      .then((parsed: AlquranSurahResponse) => {
        if (cancelled) return;
        if (
          parsed.code === 200 &&
          Array.isArray(parsed.data) &&
          parsed.data.length >= 3
        ) {
          const ar = parsed.data[0];
          const tr = parsed.data[1];
          const tlit = parsed.data[2];
          let result: SurahAyah[] = ar.ayahs.map((a, idx) => ({
            numberInSurah: a.numberInSurah,
            arabic: a.text,
            translation: tr.ayahs[idx]?.text || "",
            transliteration: tlit.ayahs[idx]?.text || "",
          }));
          if (ayahStart !== undefined && ayahEnd !== undefined) {
            result = result.filter(
              (a) => a.numberInSurah >= ayahStart && a.numberInSurah <= ayahEnd,
            );
          }
          setAyahs(result);
        } else {
          setFetchError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setFetchError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [surah, ayahStart, ayahEnd]);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2
          className="w-6 h-6 animate-spin"
          style={{ color: "oklch(var(--islamic-gold))" }}
        />
      </div>
    );
  }

  if (fetchError || !ayahs) {
    return (
      <p className="text-white/50 text-xs text-center py-4">
        Yüklənə bilmədi. Yenidən cəhd edin.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-3">
      {ayahs.map((ayah) => (
        <div key={ayah.numberInSurah} className="flex flex-col gap-1">
          <p
            className="text-right text-2xl leading-loose font-amiri"
            style={{ color: "oklch(var(--islamic-gold))" }}
            dir="rtl"
          >
            {ayah.arabic}
          </p>
          <p className="text-white/50 text-xs italic text-center">
            {ayah.transliteration}
          </p>
          <p className="text-white/80 text-sm">{ayah.translation}</p>
          {/* biome-ignore lint/a11y/useMediaCaption: Quran recitation */}
          <audio
            controls
            src={getAudioUrl(surah, ayah.numberInSurah)}
            className="w-full mt-1 h-8"
            style={{ accentColor: "oklch(var(--islamic-gold))" }}
          />
        </div>
      ))}
    </div>
  );
}

function PrayerCategoryAccordion({
  category,
}: {
  category: (typeof PRAYER_CATEGORIES)[number];
}) {
  const [open, setOpen] = useState(false);
  const [expandedItemKey, setExpandedItemKey] = useState<string | null>(null);

  const toggleItem = (key: string) => {
    setExpandedItemKey((prev) => (prev === key ? null : key));
  };

  return (
    <div
      className="rounded-2xl overflow-hidden mb-3"
      style={{ border: "1px solid oklch(var(--islamic-gold) / 0.25)" }}
    >
      <button
        type="button"
        data-ocid="dualar.tab"
        className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-white transition-colors"
        style={{ backgroundColor: "oklch(0.18 0.05 155)" }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-base">{category.title}</span>
        {open ? (
          <ChevronDown
            className="w-5 h-5"
            style={{ color: "oklch(var(--islamic-gold))" }}
          />
        ) : (
          <ChevronRight
            className="w-5 h-5"
            style={{ color: "oklch(var(--islamic-gold))" }}
          />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 py-3 flex flex-col gap-2"
              style={{ backgroundColor: "oklch(0.14 0.04 155)" }}
            >
              {category.items.map((item) => {
                const key = `${item.surah}-${item.ayahStart ?? "full"}`;
                const isExpanded = expandedItemKey === key;
                return (
                  <div key={key} className="rounded-xl overflow-hidden">
                    <button
                      type="button"
                      data-ocid="dualar.button"
                      className="w-full text-left px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80 flex items-center justify-between gap-2"
                      style={{
                        backgroundColor: isExpanded
                          ? "oklch(var(--islamic-green))"
                          : "oklch(var(--islamic-green) / 0.75)",
                      }}
                      onClick={() => toggleItem(key)}
                    >
                      <span>{item.label}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 opacity-60 shrink-0" />
                      )}
                    </button>
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key="ayah-content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div
                            className="px-4"
                            style={{
                              backgroundColor: "oklch(0.11 0.03 155)",
                              borderTop:
                                "1px solid oklch(var(--islamic-gold) / 0.15)",
                            }}
                          >
                            <InlineAyahContent
                              surah={item.surah}
                              ayahStart={item.ayahStart}
                              ayahEnd={item.ayahEnd}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QararSection() {
  const [open, setOpen] = useState(false);
  const [expandedStepKey, setExpandedStepKey] = useState<string | null>(null);

  const toggleStep = (key: string) => {
    setExpandedStepKey((prev) => (prev === key ? null : key));
  };

  return (
    <div
      className="rounded-2xl overflow-hidden mt-6"
      style={{ border: "1px solid oklch(var(--islamic-gold) / 0.5)" }}
    >
      {/* Accordion Header */}
      <button
        type="button"
        data-ocid="dualar.tab"
        className="w-full flex items-center justify-between px-5 py-5 text-left"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.08 270), oklch(0.18 0.06 270))",
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <div>
          <h3 className="text-white font-bold text-base mb-0.5">
            🧭 QƏRAR VERƏ BİLMƏYƏNDƏ – AYƏ SİSTEMİ
          </h3>
          <p className="text-white/60 text-xs">
            6 addımlı ayə sistemi ilə qərar ver
          </p>
        </div>
        {open ? (
          <ChevronDown
            className="w-5 h-5 shrink-0 ml-3"
            style={{ color: "oklch(var(--islamic-gold))" }}
          />
        ) : (
          <ChevronRight
            className="w-5 h-5 shrink-0 ml-3"
            style={{ color: "oklch(var(--islamic-gold))" }}
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="qarar-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            {/* Steps */}
            <div
              style={{
                backgroundColor: "oklch(0.14 0.04 270)",
              }}
            >
              {QARAR_STEPS.map((step) => {
                const key = `qarar-${step.step}`;
                const isExpanded = expandedStepKey === key;
                return (
                  <div
                    key={step.step}
                    className="border-b"
                    style={{ borderColor: "oklch(var(--islamic-gold) / 0.1)" }}
                  >
                    <div className="px-5 py-4">
                      <div className="flex items-start gap-3 mb-3">
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{
                            backgroundColor: "oklch(var(--islamic-gold) / 0.2)",
                            color: "oklch(var(--islamic-gold))",
                            border:
                              "1px solid oklch(var(--islamic-gold) / 0.4)",
                          }}
                        >
                          {step.step}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm">
                            {step.title}
                          </p>
                          <p
                            className="text-xs italic mt-0.5"
                            style={{
                              color: "oklch(var(--islamic-gold) / 0.7)",
                            }}
                          >
                            {step.məqsəd}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        data-ocid="dualar.button"
                        className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-80 flex items-center justify-between gap-2"
                        style={{
                          backgroundColor: isExpanded
                            ? "oklch(0.32 0.09 270)"
                            : "oklch(0.28 0.08 270)",
                        }}
                        onClick={() => toggleStep(key)}
                      >
                        <span>{step.label}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 opacity-60 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
                        )}
                      </button>
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key="step-content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div
                              className="px-4 mt-2 rounded-xl"
                              style={{
                                backgroundColor: "oklch(0.10 0.03 270)",
                                border:
                                  "1px solid oklch(var(--islamic-gold) / 0.15)",
                              }}
                            >
                              <InlineAyahContent
                                surah={step.surah}
                                ayahStart={step.ayahStart}
                                ayahEnd={step.ayahEnd}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Usage tip */}
            <div
              className="px-5 py-4"
              style={{
                backgroundColor: "oklch(0.12 0.03 270)",
                borderTop: "1px solid oklch(var(--islamic-gold) / 0.2)",
              }}
            >
              <p
                className="text-xs font-bold mb-2"
                style={{ color: "oklch(var(--islamic-gold))" }}
              >
                ⚡ NECƏ İSTİFADƏ ET (3 dəqiqəlik sistem)
              </p>
              <ol className="text-white/60 text-xs space-y-1 list-decimal list-inside">
                <li>Sakit otur</li>
                <li>Bu ayələri ardıcıl oxu</li>
                <li>
                  1 sual ver:{" "}
                  <span className="italic text-white/80">
                    "Ən doğru addım hansıdır?"
                  </span>
                </li>
                <li>İlk gələn aydın hiss → onu seç</li>
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function QuranPage() {
  const { t } = useI18n();
  const searchParams = useSearch({ strict: false }) as { q?: string };
  const [activeTab, setActiveTab] = useState("verse");
  const [surahNum, setSurahNum] = useState("1");
  const [ayahNum, setAyahNum] = useState("1");
  const [arabicData, setArabicData] = useState<QuranVerseData | null>(null);
  const [translationText, setTranslationText] = useState<string | null>(null);
  const [transliterationText, setTransliterationText] = useState<string | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { mutate, isPending, error } = useFetchQuranVerse();

  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [pickerSurah, setPickerSurah] = useState("1");
  const [sheetMode, setSheetMode] = useState<"choice" | "ayah-input">("choice");
  const [sheetAyahNum, setSheetAyahNum] = useState("1");

  const [fullSurahAyahs, setFullSurahAyahs] = useState<SurahAyah[] | null>(
    null,
  );
  const [fullSurahName, setFullSurahName] = useState("");
  const [fullSurahNumber, setFullSurahNumber] = useState(1);
  const [showFullSurah, setShowFullSurah] = useState(false);
  const [fullSurahAudioMode, setFullSurahAudioMode] = useState(false);
  const { mutate: mutateSurah, isPending: isSurahPending } =
    useFetchQuranSurah();

  const handleFetch = useCallback(
    (s: number, a: number) => {
      setSurahNum(String(s));
      setAyahNum(String(a));
      setArabicData(null);
      setTranslationText(null);
      setTransliterationText(null);
      setIsPlaying(false);
      setShowFullSurah(false);
      setFullSurahAyahs(null);
      setFullSurahAudioMode(false);

      mutate(
        { surah: s, ayah: a },
        {
          onSuccess: (raw) => {
            try {
              const parsed: AlquranMultiResponse = JSON.parse(raw);
              if (parsed.code === 200 && Array.isArray(parsed.data)) {
                setArabicData(parsed.data[0]);
                if (parsed.data[1]) setTranslationText(parsed.data[1].text);
                if (parsed.data[2]) setTransliterationText(parsed.data[2].text);
              }
            } catch {
              /* ignore */
            }
          },
        },
      );
    },
    [mutate],
  );

  const handleFetchFullSurah = useCallback(
    (s: number, audioOnly = false) => {
      setShowFullSurah(false);
      setFullSurahAyahs(null);
      setArabicData(null);
      setTranslationText(null);
      setTransliterationText(null);
      setFullSurahAudioMode(audioOnly);

      mutateSurah(
        { surah: s },
        {
          onSuccess: (raw) => {
            try {
              const parsed: AlquranSurahResponse = JSON.parse(raw);
              if (
                parsed.code === 200 &&
                Array.isArray(parsed.data) &&
                parsed.data.length >= 3
              ) {
                const arabicEdition = parsed.data[0];
                const translationEdition = parsed.data[1];
                const transliterationEdition = parsed.data[2];
                setFullSurahName(
                  arabicEdition.name ||
                    arabicEdition.englishName ||
                    `Surə ${s}`,
                );
                setFullSurahNumber(s);
                const ayahs: SurahAyah[] = arabicEdition.ayahs.map(
                  (ayah, idx) => ({
                    numberInSurah: ayah.numberInSurah,
                    arabic: ayah.text,
                    translation: translationEdition.ayahs[idx]?.text || "",
                    transliteration:
                      transliterationEdition.ayahs[idx]?.text || "",
                  }),
                );
                setFullSurahAyahs(ayahs);
                setShowFullSurah(true);
              }
            } catch {
              /* ignore */
            }
          },
        },
      );
    },
    [mutateSurah],
  );

  const handleFetchAyahRange = useCallback(
    (s: number, start: number, end: number) => {
      setShowFullSurah(false);
      setFullSurahAyahs(null);
      setArabicData(null);
      mutateSurah(
        { surah: s },
        {
          onSuccess: (raw) => {
            try {
              const parsed: AlquranSurahResponse = JSON.parse(raw);
              if (
                parsed.code === 200 &&
                Array.isArray(parsed.data) &&
                parsed.data.length >= 3
              ) {
                const arabicEdition = parsed.data[0];
                const translationEdition = parsed.data[1];
                const transliterationEdition = parsed.data[2];
                setFullSurahName(arabicEdition.englishName || `Surə ${s}`);
                setFullSurahNumber(s);
                const allAyahs: SurahAyah[] = arabicEdition.ayahs.map(
                  (ayah, idx) => ({
                    numberInSurah: ayah.numberInSurah,
                    arabic: ayah.text,
                    translation: translationEdition.ayahs[idx]?.text || "",
                    transliteration:
                      transliterationEdition.ayahs[idx]?.text || "",
                  }),
                );
                const filtered = allAyahs.filter(
                  (a) => a.numberInSurah >= start && a.numberInSurah <= end,
                );
                setFullSurahAyahs(filtered);
                setShowFullSurah(true);
                setFullSurahAudioMode(false);
              }
            } catch {
              /* ignore */
            }
          },
        },
      );
    },
    [mutateSurah],
  );

  const _handlePrayerItemClick = useCallback(
    (item: { surah: number; ayahStart?: number; ayahEnd?: number }) => {
      setActiveTab("verse");
      if (item.ayahStart !== undefined && item.ayahEnd !== undefined) {
        handleFetchAyahRange(item.surah, item.ayahStart, item.ayahEnd);
      } else {
        handleFetchFullSurah(item.surah, false);
      }
    },
    [handleFetchAyahRange, handleFetchFullSurah],
  );

  const openBottomSheet = (s: number | string) => {
    setPickerSurah(String(s));
    setSheetMode("choice");
    setSheetAyahNum("1");
    setBottomSheetOpen(true);
  };

  const handleSheetFullSurah = () => {
    setBottomSheetOpen(false);
    setSheetMode("choice");
    handleFetchFullSurah(Number(pickerSurah) || 1, false);
  };

  const handleSheetFullAudio = () => {
    setBottomSheetOpen(false);
    setSheetMode("choice");
    handleFetchFullSurah(Number(pickerSurah) || 1, true);
  };

  const handleSheetAyah = () => {
    setBottomSheetOpen(false);
    setSheetMode("choice");
    handleFetch(Number(pickerSurah) || 1, Number.parseInt(sheetAyahNum) || 1);
  };

  useEffect(() => {
    if (searchParams.q) {
      const match = searchParams.q.match(/^(\d+):(\d+)$/);
      if (match) handleFetch(Number(match[1]), Number(match[2]));
    }
  }, [searchParams.q, handleFetch]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="islamic-bg-pattern min-h-screen">
      <div className="hero-gradient py-12 px-4">
        <div className="container mx-auto text-center">
          <p
            className="font-amiri text-xl mb-2"
            style={{ color: "oklch(var(--islamic-gold))" }}
          >
            وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
          </p>
          <h1 className="text-4xl font-extrabold text-white mb-2">
            {t("quran")}
          </h1>
          <p className="text-white/60">
            Quranı tərtiblə oxu — əl-Müz zəmmil 73:4
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="max-w-3xl mx-auto"
        >
          <TabsList className="w-full mb-8" data-ocid="quran.tab">
            <TabsTrigger value="verse" className="flex-1" data-ocid="quran.tab">
              {t("byVerse")}
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex-1" data-ocid="quran.tab">
              {t("byAudio")}
            </TabsTrigger>
            <TabsTrigger
              value="dualar"
              className="flex-1"
              data-ocid="dualar.tab"
            >
              Dualar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verse">
            {/* Surah picker */}
            <div className="mb-6 p-4 rounded-xl border border-border bg-card">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Surə seçin
              </h3>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label
                    htmlFor="surah-picker"
                    className="text-xs text-muted-foreground mb-1 block"
                  >
                    Surə nömrəsi (1-114)
                  </label>
                  <Input
                    id="surah-picker"
                    data-ocid="quran.select"
                    type="number"
                    min={1}
                    max={114}
                    value={pickerSurah}
                    onChange={(e) => setPickerSurah(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && openBottomSheet(pickerSurah)
                    }
                  />
                </div>
                <Button
                  data-ocid="quran.open_modal_button"
                  onClick={() => openBottomSheet(pickerSurah)}
                  style={{
                    backgroundColor: "oklch(var(--islamic-green))",
                    color: "white",
                  }}
                  className="rounded-full px-5 font-semibold"
                >
                  Surəni aç
                </Button>
              </div>
            </div>

            {/* Well-known verses */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {t("wellKnownVerses")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {WELL_KNOWN.map((v) => (
                  <button
                    key={`${v.surah}:${v.ayah}`}
                    type="button"
                    data-ocid="quran.button"
                    onClick={() => handleFetch(v.surah, v.ayah)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "oklch(var(--islamic-green))" }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual fetch */}
            <div className="flex gap-3 mb-8">
              <div className="flex-1">
                <label
                  htmlFor="surah-input"
                  className="text-xs text-muted-foreground mb-1 block"
                >
                  {t("surah")} (1-114)
                </label>
                <Input
                  id="surah-input"
                  data-ocid="quran.input"
                  type="number"
                  min={1}
                  max={114}
                  value={surahNum}
                  onChange={(e) => setSurahNum(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    handleFetch(
                      Number.parseInt(surahNum) || 1,
                      Number.parseInt(ayahNum) || 1,
                    )
                  }
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="ayah-input"
                  className="text-xs text-muted-foreground mb-1 block"
                >
                  {t("ayah")}
                </label>
                <Input
                  id="ayah-input"
                  data-ocid="quran.input"
                  type="number"
                  min={1}
                  value={ayahNum}
                  onChange={(e) => setAyahNum(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    handleFetch(
                      Number.parseInt(surahNum) || 1,
                      Number.parseInt(ayahNum) || 1,
                    )
                  }
                />
              </div>
              <div className="flex items-end">
                <Button
                  data-ocid="quran.submit_button"
                  onClick={() =>
                    handleFetch(
                      Number.parseInt(surahNum) || 1,
                      Number.parseInt(ayahNum) || 1,
                    )
                  }
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
                    t("fetchVerse")
                  )}
                </Button>
              </div>
            </div>

            {(isPending || isSurahPending) && (
              <div
                className="text-center py-10"
                data-ocid="quran.loading_state"
              >
                <Loader2
                  className="w-8 h-8 animate-spin mx-auto"
                  style={{ color: "oklch(var(--islamic-gold))" }}
                />
                <p className="text-muted-foreground mt-2">{t("loading")}</p>
              </div>
            )}

            {error && (
              <div className="text-center py-6" data-ocid="quran.error_state">
                <p className="text-destructive">
                  Ayə yüklənərkən xəta baş verdi. Yenidən cəhd edin.
                </p>
              </div>
            )}

            {/* Full surah display */}
            <AnimatePresence mode="wait">
              {showFullSurah && fullSurahAyahs && (
                <motion.div
                  key="full-surah"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-2xl overflow-hidden shadow-gold"
                >
                  <div className="card-gradient px-6 py-4 flex items-center justify-between">
                    <h2 className="text-white font-bold text-lg">
                      {fullSurahName}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span
                        style={{ color: "oklch(var(--islamic-gold))" }}
                        className="text-sm"
                      >
                        {fullSurahAyahs.length} ayə
                      </span>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                        style={
                          fullSurahAudioMode
                            ? {
                                backgroundColor: "oklch(var(--islamic-gold))",
                                color: "oklch(var(--islamic-dark))",
                              }
                            : {
                                backgroundColor:
                                  "oklch(var(--islamic-gold) / 0.15)",
                                color: "oklch(var(--islamic-gold))",
                              }
                        }
                        onClick={() => setFullSurahAudioMode((m) => !m)}
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        {fullSurahAudioMode ? "Ses açıq" : "Tam dinlə"}
                      </button>
                    </div>
                  </div>

                  {fullSurahAudioMode && (
                    <div className="card-gradient px-6 pb-4">
                      <FullSurahPlayer
                        surahNumber={fullSurahNumber}
                        ayahs={fullSurahAyahs}
                        onIndexChange={(idx) => {
                          const ayah = fullSurahAyahs[idx];
                          if (ayah) {
                            document
                              .getElementById(`ayah-${ayah.numberInSurah}`)
                              ?.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });
                          }
                        }}
                      />
                    </div>
                  )}

                  <div className="bg-card border-x border-b border-border rounded-b-2xl divide-y divide-border">
                    {fullSurahAyahs.map((ayah, idx) => (
                      <div
                        key={ayah.numberInSurah}
                        id={`ayah-${ayah.numberInSurah}`}
                        className="px-6 py-5"
                        data-ocid={`quran.item.${idx + 1}`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                            style={{
                              backgroundColor: "oklch(var(--islamic-green))",
                            }}
                          >
                            {ayah.numberInSurah}
                          </span>
                          <p
                            className="font-amiri text-2xl leading-loose text-right text-foreground flex-1"
                            dir="rtl"
                            lang="ar"
                          >
                            {ayah.arabic}
                          </p>
                        </div>
                        {ayah.transliteration && (
                          <p className="text-sm italic text-muted-foreground mb-2 leading-relaxed">
                            {ayah.transliteration}
                          </p>
                        )}
                        <p className="text-foreground/80 leading-relaxed text-sm">
                          {ayah.translation}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Single ayah display */}
            <AnimatePresence mode="wait">
              {arabicData && (
                <motion.div
                  key={`${arabicData.surah.number}:${arabicData.numberInSurah}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-2xl overflow-hidden shadow-gold"
                >
                  <div className="card-gradient px-6 py-4">
                    <div className="flex items-center justify-between text-white/70 text-sm">
                      <span>
                        {arabicData.surah.name} — {arabicData.surah.englishName}
                      </span>
                      <span style={{ color: "oklch(var(--islamic-gold))" }}>
                        {arabicData.surah.number}:{arabicData.numberInSurah}
                      </span>
                    </div>
                  </div>
                  <div className="card-gradient px-6 pb-2">
                    <p
                      className="font-amiri text-3xl leading-loose text-right text-white py-4"
                      dir="rtl"
                      lang="ar"
                    >
                      {arabicData.text}
                    </p>
                  </div>
                  {transliterationText && (
                    <div className="card-gradient px-6 pb-4">
                      <p
                        className="text-sm italic leading-relaxed"
                        style={{ color: "oklch(var(--islamic-gold) / 0.8)" }}
                      >
                        {transliterationText}
                      </p>
                    </div>
                  )}
                  <div className="bg-card border-x border-b border-border rounded-b-2xl px-6 py-5">
                    {translationText && (
                      <p className="text-foreground leading-relaxed">
                        {translationText}
                      </p>
                    )}
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          data-ocid="quran.toggle"
                          onClick={togglePlay}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                          style={{
                            backgroundColor: "oklch(var(--islamic-green))",
                          }}
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </button>
                        <Volume2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Mishary Alafasy
                        </span>
                        {/* biome-ignore lint/a11y/useMediaCaption: Quran recitation audio */}
                        <audio
                          ref={audioRef}
                          src={getAudioUrl(
                            arabicData.surah.number,
                            arabicData.numberInSurah,
                          )}
                          onEnded={() => setIsPlaying(false)}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isPending &&
              !isSurahPending &&
              !arabicData &&
              !showFullSurah &&
              !error && (
                <div
                  className="text-center py-16"
                  data-ocid="quran.empty_state"
                >
                  <div className="text-6xl mb-4">📖</div>
                  <p className="text-muted-foreground text-lg">
                    Surə və ayə nömrəsi seçin
                  </p>
                </div>
              )}
          </TabsContent>

          <TabsContent value="audio">
            <div className="max-w-2xl mx-auto">
              <div className="card-gradient rounded-2xl p-8 text-white text-center gold-glow">
                <p
                  className="font-amiri text-2xl mb-4"
                  style={{ color: "oklch(var(--islamic-gold))" }}
                >
                  اِسْتَمِعُوا لَهُ وَأنصِتُوا
                </p>
                <h3 className="text-xl font-bold mb-2">
                  Mishary Rashid Alafasy
                </h3>
                <p className="text-white/60 text-sm mb-8">
                  Müqəddəs Quran tilavətini dinləyin
                </p>
                <div className="flex gap-3 mb-6">
                  <div className="flex-1">
                    <label
                      htmlFor="audio-surah-input"
                      className="text-xs text-white/60 mb-1 block"
                    >
                      {t("surah")}
                    </label>
                    <Input
                      id="audio-surah-input"
                      data-ocid="quran.audio.input"
                      type="number"
                      min={1}
                      max={114}
                      value={surahNum}
                      onChange={(e) => setSurahNum(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-white/40"
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="audio-ayah-input"
                      className="text-xs text-white/60 mb-1 block"
                    >
                      {t("ayah")}
                    </label>
                    <Input
                      id="audio-ayah-input"
                      data-ocid="quran.audio.input"
                      type="number"
                      min={1}
                      value={ayahNum}
                      onChange={(e) => setAyahNum(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-white/40"
                    />
                  </div>
                </div>
                {/* biome-ignore lint/a11y/useMediaCaption: Quran recitation audio */}
                <audio
                  controls
                  src={getAudioUrl(
                    Number.parseInt(surahNum) || 1,
                    Number.parseInt(ayahNum) || 1,
                  )}
                  className="w-full"
                  data-ocid="quran.editor"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dualar">
            <div className="max-w-2xl mx-auto space-y-2">
              {/* Header */}
              <div
                className="rounded-2xl px-5 py-4 mb-6"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.2 0.07 155), oklch(0.16 0.05 155))",
                  border: "1px solid oklch(var(--islamic-gold) / 0.35)",
                }}
              >
                <p
                  className="font-amiri text-2xl text-center mb-1"
                  style={{ color: "oklch(var(--islamic-gold))" }}
                >
                  ادْعُونِي أَسْتَجِبْ لَكُمْ
                </p>
                <p className="text-white/50 text-xs text-center">
                  Mənə dua edin, qəbul edim — Qafir 40:60
                </p>
              </div>

              {/* 6 main categories */}
              {PRAYER_CATEGORIES.map((cat) => (
                <PrayerCategoryAccordion key={cat.id} category={cat} />
              ))}

              {/* QARAR special section - collapsible accordion */}
              <QararSection />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {bottomSheetOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setBottomSheetOpen(false)}
            />
            <motion.div
              key="sheet"
              data-ocid="quran.sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
              style={{ backgroundColor: "oklch(var(--islamic-dark))" }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1 rounded-full bg-white/20" />
              </div>
              <div className="px-6 pb-8 pt-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-bold text-lg">
                    {pickerSurah}. Surə
                  </h3>
                  <button
                    type="button"
                    data-ocid="quran.close_button"
                    onClick={() => {
                      setBottomSheetOpen(false);
                      setSheetMode("choice");
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {sheetMode === "choice" && (
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      data-ocid="quran.primary_button"
                      onClick={handleSheetFullSurah}
                      className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-3 transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "oklch(var(--islamic-green))" }}
                    >
                      <BookOpen className="w-5 h-5" />
                      Tam surəni göstər
                    </button>
                    <button
                      type="button"
                      data-ocid="quran.audio_button"
                      onClick={handleSheetFullAudio}
                      className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-3 transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "oklch(0.3 0.08 200)" }}
                    >
                      <Headphones className="w-5 h-5" />
                      Tam surəni dinlə
                    </button>
                    <button
                      type="button"
                      data-ocid="quran.secondary_button"
                      onClick={() => setSheetMode("ayah-input")}
                      className="w-full py-4 rounded-2xl font-semibold border-2 transition-colors hover:bg-white/5"
                      style={{
                        borderColor: "oklch(var(--islamic-gold))",
                        color: "oklch(var(--islamic-gold))",
                      }}
                    >
                      Ayə nömrəsi ilə
                    </button>
                  </div>
                )}

                {sheetMode === "ayah-input" && (
                  <div>
                    <label
                      htmlFor="sheet-ayah-input"
                      className="text-sm text-white/60 mb-2 block"
                    >
                      Ayə nömrəsini daxil edin
                    </label>
                    <div className="flex gap-3">
                      <Input
                        id="sheet-ayah-input"
                        data-ocid="quran.input"
                        type="number"
                        min={1}
                        value={sheetAyahNum}
                        onChange={(e) => setSheetAyahNum(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSheetAyah()
                        }
                        className="bg-white/10 border-white/20 text-white"
                        autoFocus
                      />
                      <Button
                        data-ocid="quran.confirm_button"
                        onClick={handleSheetAyah}
                        style={{
                          backgroundColor: "oklch(var(--islamic-gold))",
                          color: "oklch(var(--islamic-dark))",
                        }}
                        className="rounded-xl font-semibold shrink-0"
                      >
                        Keç
                      </Button>
                    </div>
                    <button
                      type="button"
                      data-ocid="quran.cancel_button"
                      onClick={() => setSheetMode("choice")}
                      className="mt-3 text-sm text-white/40 hover:text-white/70"
                    >
                      ← Geri
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
