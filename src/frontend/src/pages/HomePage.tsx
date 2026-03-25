import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Book, BookOpen, Clock, Search } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../contexts/i18n";

const PRAYER_NAMES: Record<string, string> = {
  Fajr: "Sübh",
  Sunrise: "Gün çıxışı",
  Dhuhr: "Zöhr",
  Asr: "Əsr",
  Maghrib: "Məğrib",
  Isha: "İşa",
};

const PRAYER_ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

interface NextPrayer {
  name: string;
  time: string;
  minutesLeft: number;
}

function getNextPrayer(timings: Record<string, string>): NextPrayer | null {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (const key of PRAYER_ORDER) {
    const raw = timings[key];
    if (!raw) continue;
    const [h, m] = raw.split(":").map(Number);
    const prayerMinutes = h * 60 + m;
    if (prayerMinutes > nowMinutes) {
      return {
        name: PRAYER_NAMES[key] ?? key,
        time: raw.slice(0, 5),
        minutesLeft: prayerMinutes - nowMinutes,
      };
    }
  }
  // Next day's Fajr
  const fajrRaw = timings.Fajr;
  if (fajrRaw) {
    const [h, m] = fajrRaw.split(":").map(Number);
    const prayerMinutes = h * 60 + m + 24 * 60;
    return {
      name: PRAYER_NAMES.Fajr,
      time: fajrRaw.slice(0, 5),
      minutesLeft: prayerMinutes - nowMinutes,
    };
  }
  return null;
}

const QURAN_VERSES = [
  {
    arabic: "﴿ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾",
    AZ: "Həqiqətən, çətinliyin yanında asanlıq var.",
    ref: { AZ: "əş-Şərh 94:6" },
  },
  {
    arabic: "﴿ وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ ﴾",
    AZ: "O, harada olursanız olun sizinlədir.",
    ref: { AZ: "əl-Hədid 57:4" },
  },
  {
    arabic: "﴿ وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ ﴾",
    AZ: "Allahın rəhmətindən ümidini kəsməyin.",
    ref: { AZ: "əz-Zümər 39:53" },
  },
  {
    arabic: "﴿ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ ﴾",
    AZ: "Həqiqətən, Allah səbr edənlərlədir.",
    ref: { AZ: "əl-Bəqərə 2:153" },
  },
  {
    arabic: "﴿ فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾",
    AZ: "Çətinliyin yanında mütləq asanlıq vardır.",
    ref: { AZ: "əş-Şərh 94:5" },
  },
  {
    arabic: "﴿ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ﴾",
    AZ: "Allaha təvəkkül edən kimsəyə O kifayətdir.",
    ref: { AZ: "ət-Talaq 65:3" },
  },
  {
    arabic: "﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾",
    AZ: "De: Rəbbim, elmimi artır!",
    ref: { AZ: "Ta-Ha 20:114" },
  },
  {
    arabic: "﴿ ادْعُونِي أَسْتَجِبْ لَكُمْ ﴾",
    AZ: "Mənə dua edin, mən də sizə cavab verim.",
    ref: { AZ: "Ğafir 40:60" },
  },
  {
    arabic: "﴿ وَاللَّهُ يُحِبُّ الصَّابِرِينَ ﴾",
    AZ: "Allah səbr edənləri sevir.",
    ref: { AZ: "Ali İmran 3:146" },
  },
  {
    arabic: "﴿ إِنَّ اللَّهَ غَفُورٌ رَّحِيمٌ ﴾",
    AZ: "Həqiqətən, Allah bağışlayandır, rəhimlidir.",
    ref: { AZ: "əl-Bəqərə 2:173" },
  },
  {
    arabic: "﴿ حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ ﴾",
    AZ: "Allah bizə yetər, O nə gözəl vəkildir!",
    ref: { AZ: "Ali İmran 3:173" },
  },
  {
    arabic: "﴿ وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ ﴾",
    AZ: "Namazı qılın, zəkatı verin.",
    ref: { AZ: "əl-Bəqərə 2:43" },
  },
];

const ISLAMIC_FACTS: string[] = [
  "Quran təxminən 23 il ərzində Peyğəmbər Məhəmməd ﷺ-ə nazil olub.",
  "Müqəddəs Quranda 114 surə və 6.236 ayə vardır.",
  "Müsəlmanlar gündə beş dəfə namaz qılır — Sübh, Zöhr, Əsr, Məğrib və İşa.",
  "Quranın ən uzun surəsi əl-Bəqərədir — 286 ayədir.",
  "Quranın ən qısa surəsi əl-Kövsərdir — cəmi 3 ayədir.",
  "Allahın 99 gözəl adı (Əsmaül-Hüsna) vardır.",
  "İslam dünyada ən sürətli yayılan dindir.",
  "Həcc ibadəti hər il milyonlarla müsəlmanı Məkkəyə toplayır.",
  "Ramazan ayında Quranın ilk ayələri nazil olmuşdur.",
  "Məscidi-Haram dünyanın ən böyük məscididir.",
  "Zəmzəm suyu minillərdir Məkkədə axır.",
  "İslam 7-ci əsrdə Ərəbistanda ortaya çıxmışdır.",
  "Peyğəmbər Məhəmməd ﷺ 570-ci ildə Məkkədə doğulmuşdur.",
  "Quranın ilk nazil olan ayəsi 'İqrə' — 'Oxu!' — sözüdür.",
  "Cümə namazı müsəlmanlar üçün xüsusi əhəmiyyət daşıyır.",
  "İslami təqvimdə il 12 ay, aylar isə Ay ilə hesablanır.",
  "Hicrət — Peyğəmbərin Məkkədən Mədinəyə köçü — İslam tarixinin başlanğıc nöqtəsidir.",
  "Müsəlmanlar namazı qılarkən Məkkəyə — Qibləyə — üz tuturlar.",
  "İslam dini iman, ibadət, əxlaq və müamilət kimi dörd əsas sütun üzərindədir.",
  "Zəkat — mal-dövlətin 2.5%-i — kasıblara verilən vacib sədəqədir.",
  "Quranı əzbərləyənlərə 'Hafiz' deyilir.",
  "Peyğəmbər ﷺ buyurmuşdur: 'Ən xeyirliniz Quranı öyrənən və öyrədəndir.'",
  "Bismillah — 'Allahın adı ilə' — hər işin başlanğıcında söylənir.",
  "Quranın mənasını öyrənmək müsəlmanlar üçün fərz sayılır.",
  "Ayətəl-Kürsi Quranın ən böyük ayəsi hesab olunur.",
  "əl-Fatihə surəsi hər namazda oxunan yeganə surədir.",
  "İslam dini qardaşlıq, ədalət və sülhü əsas prinsip kimi qəbul edir.",
  "Peyğəmbər ﷺ-in hədisləri 'Hədis' kitablarında toplanmışdır.",
  "Müsəlmanlar günə 5 namaz qılmaqla ən azı 34 dəfə Allaha şükürlər edirlər.",
  "Quranın surələrinin çoxu Məkkədə, bir hissəsi isə Mədinədə nazil olmuşdur.",
  "Quranı ilk toplayan həzrət Əbu Bəkr Siddiq (r.a.) olmuşdur.",
  "İslam tarixinin ən məşhur alimi İmam Buxari 600.000-dən çox hədis öyrənmişdir.",
  "Peyğəmbər ﷺ-in axırıncı xütbəsi 'Vida Xütbəsi' adlanır.",
  "Quran ərəb dilinin ən mükəmməl nümunəsi sayılır.",
  "İslam dini insanın həm maddi, həm də mənəvi inkişafını nəzərdə tutur.",
  "Müsəlmanlar hər əməl öncəsi 'Bismillah' deyirlər.",
  "Allahın rəhməti Onun qəzəbindən üstündür — bu Quranda bildirilir.",
  "Mədinə şəhəri Peyğəmbər ﷺ-in şəhəri kimi tanınır.",
  "Xədicə (r.a.) ilk müsəlman olan şəxsdir.",
  "Əbu Bəkr Siddiq (r.a.) Peyğəmbər ﷺ-dən sonra ilk xəlifədir.",
  "İslam Avropada İspaniya vasitəsilə yayılmışdır.",
  "Peyğəmbər ﷺ oxumaq-yazmağı bilməsə də, Quran onun vasitəsilə nazil olmuşdur.",
  "Təravih namazı Ramazan gecələrinin xüsusi namazıdır.",
  "Laylətul-Qadr gecəsi min aydan daha xeyirlidir.",
  "İslam dini bütün insanları qardaş-bacı kimi qəbul edir.",
  "Quran ilk dəfə 'Hira' mağarasında nazil olmağa başlamışdır.",
  "Müsəlmanlar salamlaşarkən 'Əssalamu Aleykum' deyirlər — bu 'Sizə salam olsun' deməkdir.",
  "İslam dilimizə 'Sülh' mənasını verən ərəb kökündən gəlir.",
  "Sübh namazı günahların bağışlanmasına vəsilə olan ən fəzilətli namazlardan biridir.",
  "Quranın 'Yasin' surəsi 'Quranın qəlbi' adlandırılır.",
  "Peyğəmbər ﷺ buyurmuşdur: 'Müsəlman o kəsdir ki, əlindən və dilindən başqaları salamat olsun.'",
  "Sədəqə vermək günahları suyun odu söndürdüyü kimi söndürür.",
  "İslam tarixinin ilk məscidi Mədinədə 'Quba məscidi'dir.",
  "Quranın ən çox oxunan ayəsi Ayətəl-Kürsidir — əl-Bəqərə 2:255.",
  "Hər gün oxunan dua və zikirler ruhu sakitləşdirir.",
  "Peyğəmbər ﷺ buyurmuşdur: 'Gülümsəmək sədəqədir.'",
  "Allahın xatırlanması qəlbə sülh gətirir — Quran bildirdi.",
  "İslam dini elmi öyrənməyi hər müsəlmana fərz buyurmuşdur.",
  "Hər çətinliyin yanında iki asanlıq var — Quran bunu iki dəfə bildirdi.",
  "İslam 57 ölkədə rəsmi din kimi tanınır.",
  "Dünyada 1.8 milyard müsəlman yaşayır.",
  "Quranın nazil olması Laylətul-Qadr gecəsindən başlamışdır.",
  "Müsəlmanlar Allaha ibadət edərkən heç bir vasitə olmadan birbaşa dua edirlər.",
  "Peyğəmbər ﷺ həm dövlət başçısı, həm də mənəvi rəhbər idi.",
  "İslam dininin beş sütunu: Şəhadət, Namaz, Zəkat, Oruc, Həcc.",
  "Quranın ilk surəsi əl-Fatihə 'Açılış' mənasını daşıyır.",
  "Quranı tamamilə əzbərləyən dünyada 10 milyondan çox insan var.",
  "Hər gün Quran oxumaq həm dünyəvi, həm də mənəvi fayda verir.",
  "Müsəlmanın gününü başlatması üçün Sübh namazı çox əhəmiyyətlidir.",
  "İslam inancına görə hər insan pak olaraq — fitrət üzrə — doğulur.",
  "Quranın 'əl-Mulk' surəsini hər gecə oxumaq qəbrin əzabından qoruduğu bildirilir.",
  "Peyğəmbər ﷺ buyurmuşdur: 'Anana, anana, anana, sonra atana yaxşılıq et.'",
  "İslam dininin yayılmasında Əndəlusun (İspaniya) böyük rolu olmuşdur.",
  "Quranın 'ər-Rəhman' surəsi bir çox insan tərəfindən ən gözəl surə sayılır.",
  "İlk İslam universiteti Qahirədə 'əl-Əzhər' adı ilə 970-ci ildə açılmışdır.",
  "Quranın 'Bəqərə' surəsinin son iki ayəsi gecə oxunanlar üçün qoruyucu sayılır.",
  "İslam mədəniyyəti riyaziyyat, astronomiya və tibb sahəsindəki tərəqqiyə böyük töhfə vermişdir.",
  "Peyğəmbər ﷺ buyurmuşdur: 'Hər çətinliyin yanında asanlıq var.'",
  "Müsəlmanlar hər gün ən az 17 rükət namaz qılırlar — 5 vaxt namazda.",
  "Quranın 36-cı surəsi 'Yasin' adlanır və 'Ya, Sin' ərəb hərflərindən ibarətdir.",
  "Həzrət İbrahim (ə.s.) bütün peyğəmbərlərin atası hesab olunur.",
  "Quran ilk dəfə 610-cu ildə nazil olmağa başlamışdır.",
  "Zəmzəm suyunun mənşəyi Həzrət Həcərin (r.a.) Allaha olan güvənidir.",
  "Peyğəmbər ﷺ 63 yaşında vəfat etmişdir.",
  "Quranı əzbərləmək dünyanın ən qədim və ən geniş yayılmış əzbərləmə ənənəsidir.",
  "İslam inancına görə Quran qiyamətə qədər hifz olunacaqdır.",
  "Müsəlmanlar hər ayın 13, 14 və 15-ci günlərini oruc tutmağı tövsiyə edirlər.",
  "İbn Sina — Əvicenna — İslam dünyasının ən böyük həkimi idi.",
  "Həzrət Musa (ə.s.) Quranda ən çox adı çəkilən peyğəmbərdir.",
  "Quran dünyada ən çox oxunan kitabdır.",
  "Müsəlmanlar oruc tutarkən yalnız yemək-içməkdən deyil, pis düşüncə və davranışdan da çəkinirlər.",
  "İslam inancına görə insanın əsl evi axirətdir — dünya bir imtahan meydanıdır.",
  "Quranın hər hərfinə 10 savab yazılır.",
  "Müsəlmanlar dua edərkən Allaha 'Ya Rəbb' deyə müraciət edirlər.",
  "Azan — namaz çağırışı — gündə beş dəfə dünya üzərindən dayanmadan ucalır.",
  "İslam dininin sülhsevər olduğunu Quranın özü bir çox yerdə vurğulayır.",
  "Həzrət Yusif (ə.s.) haqqındakı surə 'ən gözəl qissə' kimi adlandırılır.",
  "Müsəlmanlar həyatını Allahın rizasını qazanmaq üçün yaşamağa çalışırlar.",
];

const QUICK_LINKS = [
  { labelKey: "prayerTimes" as const, to: "/prayer-times", icon: "🕌" },
  { labelKey: "quran" as const, to: "/quran", icon: "📖" },
  { labelKey: "books" as const, to: "/books", icon: "📚" },
];

export default function HomePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);
  const [prayerLoading, setPrayerLoading] = useState(true);

  // Random on each page load/refresh
  const randomFact = useMemo(
    () => ISLAMIC_FACTS[Math.floor(Math.random() * ISLAMIC_FACTS.length)],
    [],
  );

  const randomVerse = useMemo(
    () => QURAN_VERSES[Math.floor(Math.random() * QURAN_VERSES.length)],
    [],
  );

  // Fetch prayer times for Baku
  useEffect(() => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    fetch(
      `https://api.aladhan.com/v1/timingsByCity/${day}-${month}-${year}?city=Baku&country=AZ&method=3`,
    )
      .then((r) => r.json())
      .then((data) => {
        const timings = data?.data?.timings;
        if (timings) {
          setNextPrayer(getNextPrayer(timings));
        }
      })
      .catch(() => {})
      .finally(() => setPrayerLoading(false));
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    if (/^\d+:\d+$/.test(searchQuery.trim())) {
      navigate({ to: "/quran", search: { q: searchQuery.trim() } });
    } else {
      navigate({ to: "/prayer-times", search: { city: searchQuery.trim() } });
    }
  };

  const currentDate = new Date().toLocaleDateString("az-AZ");

  return (
    <div className="islamic-bg-pattern min-h-screen">
      {/* Random Verse Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full py-3 px-4 text-center"
        style={{
          background:
            "linear-gradient(90deg, oklch(var(--islamic-dark)) 0%, oklch(0.22 0.05 160) 50%, oklch(var(--islamic-dark)) 100%)",
          borderBottom: "1px solid oklch(var(--islamic-gold) / 0.35)",
        }}
        data-ocid="verse.panel"
      >
        <span
          className="text-xs font-semibold uppercase tracking-widest mr-3"
          style={{ color: "oklch(var(--islamic-gold) / 0.7)" }}
        >
          {t("verseOfDay")}
        </span>
        <span
          className="font-amiri text-lg mx-2"
          style={{ color: "oklch(var(--islamic-gold))" }}
          dir="rtl"
        >
          {randomVerse.arabic}
        </span>
        <span className="text-white/80 text-sm mx-2">{randomVerse.AZ}</span>
        <span
          className="text-xs"
          style={{ color: "oklch(var(--islamic-gold) / 0.6)" }}
        >
          — {randomVerse.ref.AZ}
        </span>
      </motion.div>

      {/* Hero */}
      <section className="hero-gradient py-24 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p
              className="font-amiri text-2xl mb-4"
              style={{ color: "oklch(var(--islamic-gold))" }}
            >
              بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
              LightWay: {t("heroTitle")}
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">
              {t("heroSubtitle")}
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div
              className="flex rounded-full overflow-hidden shadow-2xl"
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid oklch(var(--islamic-gold) / 0.4)",
              }}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={t("searchPlaceholder")}
                data-ocid="hero.search_input"
                className="flex-1 bg-transparent text-white placeholder-white/50 px-6 py-4 text-base outline-none"
              />
              <button
                type="button"
                data-ocid="hero.button"
                onClick={handleSearch}
                className="w-14 h-14 m-0.5 rounded-full flex items-center justify-center shrink-0 transition-opacity hover:opacity-90"
                style={{ backgroundColor: "oklch(var(--islamic-gold))" }}
              >
                <Search
                  className="w-5 h-5"
                  style={{ color: "oklch(var(--islamic-dark))" }}
                />
              </button>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button
              data-ocid="hero.primary_button"
              size="lg"
              className="rounded-full px-8 font-semibold text-base"
              style={{
                backgroundColor: "oklch(var(--islamic-gold))",
                color: "oklch(var(--islamic-dark))",
              }}
              onClick={() =>
                navigate({ to: "/quran", search: { q: undefined } })
              }
            >
              <BookOpen className="w-5 h-5 mr-2" />
              {t("startReading")}
            </Button>
            <Button
              data-ocid="hero.secondary_button"
              size="lg"
              variant="outline"
              className="rounded-full px-8 font-semibold text-base border-2 bg-transparent hover:bg-white/10"
              style={{
                borderColor: "oklch(var(--islamic-gold))",
                color: "oklch(var(--islamic-gold))",
              }}
              onClick={() =>
                navigate({ to: "/prayer-times", search: { city: undefined } })
              }
            >
              <Clock className="w-5 h-5 mr-2" />
              {t("viewPrayerTimes")}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prayer Times card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl p-6 card-gradient gold-glow text-white"
              data-ocid="feature.card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{
                    backgroundColor: "oklch(var(--islamic-gold) / 0.2)",
                  }}
                >
                  🕌
                </div>
                <h3
                  className="font-bold uppercase tracking-wider text-sm"
                  style={{ color: "oklch(var(--islamic-gold))" }}
                >
                  {t("prayerTimesCard")}
                </h3>
              </div>
              {prayerLoading ? (
                <div className="text-white/50 text-sm mb-4">Yüklənir...</div>
              ) : nextPrayer ? (
                <>
                  <div
                    className="text-xs font-semibold uppercase tracking-widest mb-1"
                    style={{ color: "oklch(var(--islamic-gold) / 0.7)" }}
                  >
                    Növbəti namaz — Bakı
                  </div>
                  <div className="text-4xl font-extrabold mb-0.5">
                    {nextPrayer.name}
                  </div>
                  <div
                    className="text-2xl font-bold mb-1"
                    style={{ color: "oklch(var(--islamic-gold))" }}
                  >
                    {nextPrayer.time}
                  </div>
                  <div className="text-white/60 text-sm mb-4">
                    {nextPrayer.minutesLeft < 60
                      ? `${nextPrayer.minutesLeft} dəqiqə sonra`
                      : `${Math.floor(nextPrayer.minutesLeft / 60)} saat ${nextPrayer.minutesLeft % 60} dəq sonra`}
                  </div>
                </>
              ) : (
                <div className="text-white/50 text-sm mb-4">{currentDate}</div>
              )}
              <p className="text-white/70 text-sm mb-6">
                {t("searchCityDesc")}
              </p>
              <Button
                data-ocid="feature.prayer.button"
                size="sm"
                className="rounded-full"
                style={{
                  backgroundColor: "oklch(var(--islamic-gold))",
                  color: "oklch(var(--islamic-dark))",
                }}
                onClick={() =>
                  navigate({ to: "/prayer-times", search: { city: undefined } })
                }
              >
                {t("fullSchedule")}
              </Button>
            </motion.div>

            {/* Quran card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-6 card-gradient gold-glow text-white"
              data-ocid="feature.card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{
                    backgroundColor: "oklch(var(--islamic-gold) / 0.2)",
                  }}
                >
                  📖
                </div>
                <h3
                  className="font-bold uppercase tracking-wider text-sm"
                  style={{ color: "oklch(var(--islamic-gold))" }}
                >
                  {t("holyQuran")}
                </h3>
              </div>
              <p
                className="font-amiri text-2xl leading-loose text-right mb-3"
                dir="rtl"
              >
                ﴿ بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴾
              </p>
              <p className="text-white/70 text-sm mb-6">{t("inNameOfAllah")}</p>
              <Button
                data-ocid="feature.quran.button"
                size="sm"
                className="rounded-full"
                style={{
                  backgroundColor: "oklch(var(--islamic-gold))",
                  color: "oklch(var(--islamic-dark))",
                }}
                onClick={() =>
                  navigate({ to: "/quran", search: { q: undefined } })
                }
              >
                {t("readMore")}
              </Button>
            </motion.div>

            {/* Books card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl p-6 card-gradient gold-glow text-white"
              data-ocid="feature.card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{
                    backgroundColor: "oklch(var(--islamic-gold) / 0.2)",
                  }}
                >
                  📚
                </div>
                <h3
                  className="font-bold uppercase tracking-wider text-sm"
                  style={{ color: "oklch(var(--islamic-gold))" }}
                >
                  {t("islamicBooks")}
                </h3>
              </div>
              <div className="text-5xl font-extrabold mb-1">16+</div>
              <div className="text-white/60 text-sm mb-4">
                {t("islamicBooksAvailable")}
              </div>
              <p className="text-white/70 text-sm mb-6">
                {t("browseCuratedBooks")}
              </p>
              <Button
                data-ocid="feature.books.button"
                size="sm"
                className="rounded-full"
                style={{
                  backgroundColor: "oklch(var(--islamic-gold))",
                  color: "oklch(var(--islamic-dark))",
                }}
                onClick={() => navigate({ to: "/books" })}
              >
                {t("browseLibrary")}
              </Button>
            </motion.div>

            {/* Arabic Learn card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl p-6 card-gradient gold-glow text-white"
              data-ocid="feature.card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{
                    backgroundColor: "oklch(var(--islamic-gold) / 0.2)",
                  }}
                >
                  🎓
                </div>
                <h3
                  className="font-bold uppercase tracking-wider text-sm"
                  style={{ color: "oklch(var(--islamic-gold))" }}
                >
                  Ərəbcə Öyrən
                </h3>
              </div>
              <p
                className="font-amiri text-2xl leading-loose text-right mb-2"
                dir="rtl"
                style={{ color: "oklch(var(--islamic-gold) / 0.85)" }}
              >
                تَعَلَّمِ الْعَرَبِيَّةَ
              </p>
              <p className="text-white/60 text-sm mb-1">
                Əlifba · Harakat · Qrammatika
              </p>
              <p className="text-white/70 text-sm mb-6">
                Quran ərəbcəsinin əsaslarını öyrən — hərflər, hərəkələr, quiz.
              </p>
              <Button
                data-ocid="feature.arabic.button"
                size="sm"
                className="rounded-full"
                style={{
                  backgroundColor: "oklch(var(--islamic-gold))",
                  color: "oklch(var(--islamic-dark))",
                }}
                onClick={() => navigate({ to: "/arabic-learn" })}
              >
                Öyrən
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2-column section */}
      <section className="py-8 px-4 pb-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Links */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-xs">
              <div className="flex items-center gap-2 mb-5">
                <Book
                  className="w-5 h-5"
                  style={{ color: "oklch(var(--islamic-gold))" }}
                />
                <h3 className="font-bold text-lg">{t("quickLinks")}</h3>
              </div>
              <div className="space-y-3">
                {QUICK_LINKS.map((ql) => (
                  <button
                    key={ql.to}
                    type="button"
                    data-ocid="home.link"
                    onClick={() => navigate({ to: ql.to })}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <span className="text-2xl">{ql.icon}</span>
                    <span className="font-medium">{t(ql.labelKey)}</span>
                    <span className="ml-auto text-muted-foreground">›</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Did you know */}
            <div className="rounded-2xl p-6 text-white card-gradient gold-glow">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-xl">💡</span>
                <h3
                  className="font-bold text-lg"
                  style={{ color: "oklch(var(--islamic-gold))" }}
                >
                  {t("didYouKnow")}
                </h3>
              </div>
              <p className="text-white/80 leading-relaxed text-base">
                {randomFact}
              </p>
              <p
                className="font-amiri text-xl mt-6 text-right"
                style={{ color: "oklch(var(--islamic-gold))" }}
                dir="rtl"
              >
                ﴿ وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ ﴾
              </p>
              <p className="text-white/50 text-xs mt-1 text-right">
                {t("isrâRef")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
