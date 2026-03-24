import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearch } from "@tanstack/react-router";
import { BookOpen, Loader2, Pause, Play, Volume2, X } from "lucide-react";
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

function padNum(n: number, len: number) {
  return String(n).padStart(len, "0");
}

function getAudioUrl(surah: number, ayah: number) {
  return `https://verses.quran.com/Alafasy/mp3/${padNum(surah, 3)}${padNum(ayah, 3)}.mp3`;
}

export default function QuranPage() {
  const { t } = useI18n();
  const searchParams = useSearch({ strict: false }) as { q?: string };
  const [surahNum, setSurahNum] = useState(1);
  const [ayahNum, setAyahNum] = useState(1);
  const [arabicData, setArabicData] = useState<QuranVerseData | null>(null);
  const [translationText, setTranslationText] = useState<string | null>(null);
  const [transliterationText, setTransliterationText] = useState<string | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { mutate, isPending, error } = useFetchQuranVerse();

  // Bottom sheet state
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [pickerSurah, setPickerSurah] = useState(1);
  const [sheetMode, setSheetMode] = useState<"choice" | "ayah-input">("choice");
  const [sheetAyahNum, setSheetAyahNum] = useState(1);

  // Full surah state
  const [fullSurahAyahs, setFullSurahAyahs] = useState<SurahAyah[] | null>(
    null,
  );
  const [fullSurahName, setFullSurahName] = useState<string>("");
  const [showFullSurah, setShowFullSurah] = useState(false);
  const { mutate: mutateSurah, isPending: isSurahPending } =
    useFetchQuranSurah();

  const handleFetch = useCallback(
    (s: number, a: number) => {
      setSurahNum(s);
      setAyahNum(a);
      setArabicData(null);
      setTranslationText(null);
      setTransliterationText(null);
      setIsPlaying(false);
      setShowFullSurah(false);
      setFullSurahAyahs(null);

      mutate(
        { surah: s, ayah: a },
        {
          onSuccess: (raw) => {
            try {
              const parsed: AlquranMultiResponse = JSON.parse(raw);
              if (parsed.code === 200 && Array.isArray(parsed.data)) {
                setArabicData(parsed.data[0]);
                if (parsed.data[1]) {
                  setTranslationText(parsed.data[1].text);
                }
                if (parsed.data[2]) {
                  setTransliterationText(parsed.data[2].text);
                }
              }
            } catch {
              // ignore parse errors
            }
          },
        },
      );
    },
    [mutate],
  );

  const handleFetchFullSurah = useCallback(
    (s: number) => {
      setShowFullSurah(false);
      setFullSurahAyahs(null);
      setArabicData(null);
      setTranslationText(null);
      setTransliterationText(null);

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
              // ignore parse errors
            }
          },
        },
      );
    },
    [mutateSurah],
  );

  const openBottomSheet = (s: number) => {
    setPickerSurah(s);
    setSheetMode("choice");
    setSheetAyahNum(1);
    setBottomSheetOpen(true);
  };

  const handleSheetFullSurah = () => {
    setBottomSheetOpen(false);
    setSheetMode("choice");
    handleFetchFullSurah(pickerSurah);
  };

  const handleSheetAyah = () => {
    setBottomSheetOpen(false);
    setSheetMode("choice");
    handleFetch(pickerSurah, sheetAyahNum);
  };

  useEffect(() => {
    if (searchParams.q) {
      const match = searchParams.q.match(/^(\d+):(\d+)$/);
      if (match) {
        handleFetch(Number(match[1]), Number(match[2]));
      }
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
      {/* Header */}
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
            Quranı tərtiblə oxu — əl-Müzzəmmil 73:4
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <Tabs defaultValue="verse" className="max-w-3xl mx-auto">
          <TabsList className="w-full mb-8" data-ocid="quran.tab">
            <TabsTrigger value="verse" className="flex-1" data-ocid="quran.tab">
              {t("byVerse")}
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex-1" data-ocid="quran.tab">
              {t("byAudio")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verse">
            {/* Surah picker section */}
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
                    onChange={(e) =>
                      setPickerSurah(
                        Math.min(114, Math.max(1, Number(e.target.value))),
                      )
                    }
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

            {/* Fetch form */}
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
                  onChange={(e) => setSurahNum(Number(e.target.value))}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleFetch(surahNum, ayahNum)
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
                  onChange={(e) => setAyahNum(Number(e.target.value))}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleFetch(surahNum, ayahNum)
                  }
                />
              </div>
              <div className="flex items-end">
                <Button
                  data-ocid="quran.submit_button"
                  onClick={() => handleFetch(surahNum, ayahNum)}
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
                    <span
                      style={{ color: "oklch(var(--islamic-gold))" }}
                      className="text-sm"
                    >
                      {fullSurahAyahs.length} ayə
                    </span>
                  </div>
                  <div className="bg-card border-x border-b border-border rounded-b-2xl divide-y divide-border">
                    {fullSurahAyahs.map((ayah, idx) => (
                      <div
                        key={ayah.numberInSurah}
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
                  {/* Surah info */}
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

                  {/* Arabic text */}
                  <div className="card-gradient px-6 pb-2">
                    <p
                      className="font-amiri text-3xl leading-loose text-right text-white py-4"
                      dir="rtl"
                      lang="ar"
                    >
                      {arabicData.text}
                    </p>
                  </div>

                  {/* Transliteration */}
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

                  {/* Translation */}
                  <div className="bg-card border-x border-b border-border rounded-b-2xl px-6 py-5">
                    {translationText && (
                      <p className="text-foreground leading-relaxed">
                        {translationText}
                      </p>
                    )}

                    {/* Audio player */}
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
                  اِسْتَمِعُوا لَهُ وَأَنصِتُوا
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
                      onChange={(e) => setSurahNum(Number(e.target.value))}
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
                      onChange={(e) => setAyahNum(Number(e.target.value))}
                      className="bg-white/10 border-white/20 text-white placeholder-white/40"
                    />
                  </div>
                </div>
                {/* biome-ignore lint/a11y/useMediaCaption: Quran recitation audio */}
                <audio
                  controls
                  src={getAudioUrl(surahNum, ayahNum)}
                  className="w-full"
                  data-ocid="quran.editor"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Sheet Overlay */}
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
              {/* Handle bar */}
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
                        onChange={(e) =>
                          setSheetAyahNum(Math.max(1, Number(e.target.value)))
                        }
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
