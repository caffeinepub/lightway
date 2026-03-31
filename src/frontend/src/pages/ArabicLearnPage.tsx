import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Volume2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const ARABIC_ALPHABET = [
  {
    arabic: "ا",
    name: "Əlif",
    latin: "a / ā",
    word: "أَب",
    wordLatin: "ab",
    wordMeaning: "ata",
  },
  {
    arabic: "ب",
    name: "Ba",
    latin: "b",
    word: "بَيْت",
    wordLatin: "bayt",
    wordMeaning: "ev",
  },
  {
    arabic: "ت",
    name: "Ta",
    latin: "t",
    word: "تَمْر",
    wordLatin: "tamr",
    wordMeaning: "xurma",
  },
  {
    arabic: "ث",
    name: "Sə",
    latin: "th",
    word: "ثَمَر",
    wordLatin: "thamar",
    wordMeaning: "meyvə",
  },
  {
    arabic: "ج",
    name: "Cim",
    latin: "c",
    word: "جَبَل",
    wordLatin: "jabal",
    wordMeaning: "dağ",
  },
  {
    arabic: "ح",
    name: "Ha",
    latin: "h (boğaz)",
    word: "حَيَاة",
    wordLatin: "hayāt",
    wordMeaning: "həyat",
  },
  {
    arabic: "خ",
    name: "Xə",
    latin: "x",
    word: "خُبْز",
    wordLatin: "khubz",
    wordMeaning: "çörək",
  },
  {
    arabic: "د",
    name: "Dal",
    latin: "d",
    word: "دَرْس",
    wordLatin: "dars",
    wordMeaning: "dərs",
  },
  {
    arabic: "ذ",
    name: "Zal",
    latin: "z (dil ucu)",
    word: "ذَهَب",
    wordLatin: "dhahab",
    wordMeaning: "qızıl",
  },
  {
    arabic: "ر",
    name: "Rə",
    latin: "r",
    word: "رَجُل",
    wordLatin: "rajul",
    wordMeaning: "kişi",
  },
  {
    arabic: "ز",
    name: "Zay",
    latin: "z",
    word: "زَيْت",
    wordLatin: "zayt",
    wordMeaning: "zeytun yağı",
  },
  {
    arabic: "س",
    name: "Sin",
    latin: "s",
    word: "سَمَاء",
    wordLatin: "samāʾ",
    wordMeaning: "göy",
  },
  {
    arabic: "ش",
    name: "Şin",
    latin: "ş",
    word: "شَمْس",
    wordLatin: "shams",
    wordMeaning: "günəş",
  },
  {
    arabic: "ص",
    name: "Sad",
    latin: "s (güclü)",
    word: "صَلَاة",
    wordLatin: "ṣalāt",
    wordMeaning: "namaz",
  },
  {
    arabic: "ض",
    name: "Dad",
    latin: "d (güclü)",
    word: "ضَوْء",
    wordLatin: "ḍawʾ",
    wordMeaning: "işıq",
  },
  {
    arabic: "ط",
    name: "Tə",
    latin: "t (güclü)",
    word: "طَرِيق",
    wordLatin: "ṭarīq",
    wordMeaning: "yol",
  },
  {
    arabic: "ظ",
    name: "Zə",
    latin: "z (güclü)",
    word: "ظُلْم",
    wordLatin: "ẓulm",
    wordMeaning: "zülm",
  },
  {
    arabic: "ع",
    name: "Ayn",
    latin: "' (boğaz)",
    word: "عِلْم",
    wordLatin: "ʿilm",
    wordMeaning: "elm",
  },
  {
    arabic: "غ",
    name: "Ğayn",
    latin: "ğ",
    word: "غَيْب",
    wordLatin: "ghayb",
    wordMeaning: "qeyb",
  },
  {
    arabic: "ف",
    name: "Fə",
    latin: "f",
    word: "فَجْر",
    wordLatin: "fajr",
    wordMeaning: "sübh",
  },
  {
    arabic: "ق",
    name: "Qaf",
    latin: "q (dərin)",
    word: "قَلْب",
    wordLatin: "qalb",
    wordMeaning: "ürək",
  },
  {
    arabic: "ك",
    name: "Kəf",
    latin: "k",
    word: "كِتَاب",
    wordLatin: "kitāb",
    wordMeaning: "kitab",
  },
  {
    arabic: "ل",
    name: "Ləm",
    latin: "l",
    word: "لَيْل",
    wordLatin: "layl",
    wordMeaning: "gecə",
  },
  {
    arabic: "م",
    name: "Mim",
    latin: "m",
    word: "مَاء",
    wordLatin: "māʾ",
    wordMeaning: "su",
  },
  {
    arabic: "ن",
    name: "Nun",
    latin: "n",
    word: "نُور",
    wordLatin: "nūr",
    wordMeaning: "nur",
  },
  {
    arabic: "ه",
    name: "Hə",
    latin: "h",
    word: "هَوَاء",
    wordLatin: "hawāʾ",
    wordMeaning: "hava",
  },
  {
    arabic: "و",
    name: "Vav",
    latin: "v / u",
    word: "وَلَد",
    wordLatin: "walad",
    wordMeaning: "uşaq",
  },
  {
    arabic: "ي",
    name: "Yə",
    latin: "y / i",
    word: "يَوْم",
    wordLatin: "yawm",
    wordMeaning: "gün",
  },
];

const HARAKAT = [
  {
    mark: "فَ",
    name: "Fətha",
    sound: "a",
    example: "كَتَبَ",
    exampleLatin: "kataba",
    meaning: "yazdı",
  },
  {
    mark: "فِ",
    name: "Kəsrə",
    sound: "i",
    example: "كِتَاب",
    exampleLatin: "kitāb",
    meaning: "kitab",
  },
  {
    mark: "فُ",
    name: "Zəmmə",
    sound: "u",
    example: "كُتُب",
    exampleLatin: "kutub",
    meaning: "kitablar",
  },
  {
    mark: "فْ",
    name: "Sukun",
    sound: "(sakit)",
    example: "مَكْتَب",
    exampleLatin: "maktab",
    meaning: "ofis",
  },
  {
    mark: "فّ",
    name: "Şəddə",
    sound: "(şiddətli)",
    example: "مُحَمَّد",
    exampleLatin: "muḥammad",
    meaning: "Məhəmməd",
  },
];

const GRAMMAR_LESSONS = [
  {
    id: "isim",
    title: "Dərs 1: İsim (Ad — Noun)",
    explanation:
      "İsim — varlıqların, şeylərin adıdır. Ərəb dilində isimlər müzəkkər (kişi) və müənnəs (qadın) olur.",
    examples: [
      { arabic: "كِتَابٌ", latin: "kitābun", meaning: "kitab (müzəkkər)" },
      { arabic: "مَدْرَسَةٌ", latin: "madrasatun", meaning: "məktəb (müənnəs)" },
      { arabic: "رَجُلٌ", latin: "racalun", meaning: "kişi" },
      { arabic: "مَرْأَةٌ", latin: "mar'atun", meaning: "qadın" },
    ],
  },
  {
    id: "fel",
    title: "Dərs 2: Fel (Feil — Verb)",
    explanation:
      "Fel — hərəkəti bildirir. Ərəb felinin əsası 3 hərfdən ibarətdir (üçlü kök).",
    examples: [
      { arabic: "كَتَبَ", latin: "kataba", meaning: "o yazdı (keçmiş zaman)" },
      { arabic: "يَكْتُبُ", latin: "yaktubu", meaning: "o yazır (indiki/gələcək)" },
      { arabic: "اكْتُبْ", latin: "uktub", meaning: "yaz! (əmr)" },
    ],
  },
  {
    id: "cumle",
    title: "Dərs 3: Cümlə Quruluşu",
    explanation:
      "Ərəb cümləsi iki növdür: İsmi cümlə (ismlə başlayan) və Feli cümlə (feil ilə başlayan).",
    examples: [
      {
        arabic: "اَلْبَيْتُ كَبِيرٌ",
        latin: "al-baytu kabīrun",
        meaning: "Ev böyükdür (ismi cümlə)",
      },
      {
        arabic: "كَتَبَ الطَّالِبُ",
        latin: "kataba at-tālibu",
        meaning: "Tələbə yazdı (feli cümlə)",
      },
    ],
  },
  {
    id: "tanim",
    title: "Dərs 4: Müəyyənlik (əl-)",
    explanation:
      "Ərəb dilində müəyyənlik artikli ال (əl-) ismin əvvəlinə əlavə edilir.",
    examples: [
      {
        arabic: "كِتَابٌ",
        latin: "kitābun",
        meaning: "bir kitab (qeyri-müəyyən)",
      },
      { arabic: "اَلْكِتَابُ", latin: "al-kitābu", meaning: "kitab (müəyyən)" },
      { arabic: "اَلْمَسْجِدُ", latin: "al-masjidu", meaning: "məscid" },
    ],
  },
  {
    id: "sayi",
    title: "Dərs 5: Tək və Cəm",
    explanation:
      "Ərəb dilində tək (mufrad) və cəm (cəm) formalar var. Qadın cəmi -āt şəkilçisi ilə düzəlir.",
    examples: [
      {
        arabic: "كِتَابٌ / كُتُبٌ",
        latin: "kitāb / kutub",
        meaning: "kitab / kitablar",
      },
      {
        arabic: "مُسْلِمٌ / مُسْلِمُونَ",
        latin: "muslim / muslimūn",
        meaning: "müsəlman / müsəlmanlar",
      },
      {
        arabic: "مُسْلِمَةٌ / مُسْلِمَاتٌ",
        latin: "muslima / muslimāt",
        meaning: "müsəlman qadın / qadınlar",
      },
    ],
  },
  {
    id: "madd",
    title: "Dərs 6: Uzanma (Mədd)",
    explanation:
      "Ərəb dilində 3 uzanma hərfi var: ا (elif) fəthadan sonra, و (vav) zəmmədən sonra, ي (ya) kəsrədən sonra. Bu hərflər saitın müddətini 2 dəfə uzadır. Quranda uzanma hərflərini düzgün oxumaq vacibdir.",
    examples: [
      {
        arabic: "قَالَ",
        latin: "qaala",
        meaning: "dedi (elif ilə uzanma — 'aa' səsi)",
      },
      {
        arabic: "قُولُوا",
        latin: "quuluu",
        meaning: "deyin (vav ilə uzanma — 'uu' səsi)",
      },
      {
        arabic: "قِيلَ",
        latin: "qiila",
        meaning: "deyildi (ya ilə uzanma — 'ii' səsi)",
      },
      { arabic: "كِتَابٌ", latin: "kitaabun", meaning: "kitab (uzun 'aa')" },
      { arabic: "نُورٌ", latin: "nuurun", meaning: "nur, işıq (uzun 'uu')" },
      { arabic: "دِينٌ", latin: "diinun", meaning: "din (uzun 'ii')" },
    ],
  },
];

const GRAMMAR_QUIZ = [
  {
    question: "كِتَابٌ sözü hansı növ isimdir?",
    options: ["Müzəkkər", "Müənnəs", "Fel", "Hərəkə"],
    answer: "Müzəkkər",
  },
  {
    question: "كَتَبَ nə deməkdir?",
    options: ["O yazdı", "O oxudu", "O getdi", "O gəldi"],
    answer: "O yazdı",
  },
  {
    question: "Müənnəs isim nə ilə bitir?",
    options: ["ة (ta-marbuta)", "ا (əlif)", "ب (ba)", "م (mim)"],
    answer: "ة (ta-marbuta)",
  },
  {
    question: "Felin üçlü kökü neçə hərfdən ibarətdir?",
    options: ["3", "2", "4", "5"],
    answer: "3",
  },
  {
    question: "اَلْبَيْتُ كَبِيرٌ hansı cümlə növüdür?",
    options: ["İsmi cümlə", "Feli cümlə", "Sual cümləsi", "Əmr cümləsi"],
    answer: "İsmi cümlə",
  },
  {
    question: "اَلـ nə üçün işlənir?",
    options: [
      "Müəyyənlik bildirir",
      "Cəm bildirir",
      "Keçmiş zaman bildirir",
      "Sual bildirir",
    ],
    answer: "Müəyyənlik bildirir",
  },
  {
    question: "يَكْتُبُ hansı zamanda işlənir?",
    options: ["İndiki/Gələcək", "Keçmiş", "Əmr", "İnkar"],
    answer: "İndiki/Gələcək",
  },
  {
    question: "قَالَ sözündəki uzanma hərfi hansıdır?",
    options: ["ا (elif)", "و (vav)", "ي (ya)", "Uzanma yoxdur"],
    answer: "ا (elif)",
  },
  {
    question: "Uzanma hərfi olan ي kəsrədən sonra hansı səsi uzadır?",
    options: ["ii (uzun i)", "aa (uzun a)", "uu (uzun u)", "Heç birini"],
    answer: "ii (uzun i)",
  },
  {
    question: "قُولُوا sözündəki uzanma hərfi nədir?",
    options: ["و (vav)", "ا (elif)", "ي (ya)", "Uzanma yoxdur"],
    answer: "و (vav)",
  },
  {
    question: "Mədd nədir?",
    options: ["Uzanma", "Qısalma", "Şəddə", "Sukun"],
    answer: "Uzanma",
  },
  {
    question: "كِتَابٌ sözündə neçə uzanma hərfi var?",
    options: ["1", "2", "0", "3"],
    answer: "1",
  },
  {
    question: "Fəthadan sonra gələn uzanma hərfi hansıdır?",
    options: ["ا (elif)", "و (vav)", "ي (ya)", "Heç biri"],
    answer: "ا (elif)",
  },
  {
    question: "مُسْلِمُونَ nə deməkdir?",
    options: [
      "Müsəlmanlar (kişi)",
      "Müsəlman qadınlar",
      "Bir müsəlman",
      "Müsəlman (sifət)",
    ],
    answer: "Müsəlmanlar (kişi)",
  },
  {
    question: "اكْتُبْ hansı forma bir feldir?",
    options: ["Əmr", "Keçmiş", "İndiki", "İnkar"],
    answer: "Əmr",
  },
  {
    question: "كَتَبَ الطَّالِبُ hansı cümlə növüdür?",
    options: ["Feli cümlə", "İsmi cümlə", "Sual cümləsi", "Şərt cümləsi"],
    answer: "Feli cümlə",
  },
  {
    question: "اَلْمَسْجِدُ nə deməkdir?",
    options: ["məscid", "kitab", "ev", "su"],
    answer: "məscid",
  },
  {
    question: "Qadın cəm şəkilçisi hansıdır?",
    options: ["-āt", "-ūn", "-an", "-in"],
    answer: "-āt",
  },
  {
    question: "مَرْأَةٌ nə deməkdir?",
    options: ["qadın", "kişi", "uşaq", "ata"],
    answer: "qadın",
  },
  {
    question: "رَجُلٌ nə deməkdir?",
    options: ["kişi", "qadın", "oğlan", "adam cəm"],
    answer: "kişi",
  },
  {
    question: "عِلْم nə deməkdir?",
    options: ["elm", "işıq", "yol", "nur"],
    answer: "elm",
  },
];

const HARAKAT_QUIZ = [
  {
    question: "Fətha hansı səsi bildirir?",
    options: ["a", "i", "u", "sakit"],
    answer: "a",
  },
  {
    question: "Kəsrə hansı səsi bildirir?",
    options: ["i", "a", "u", "şiddətli"],
    answer: "i",
  },
  {
    question: "Zəmmə hansı səsi bildirir?",
    options: ["u", "a", "i", "sakit"],
    answer: "u",
  },
  {
    question: "Sukun nəyi bildirir?",
    options: ["Sakit hərf", "Uzun a", "Şiddətli", "Qısa i"],
    answer: "Sakit hərf",
  },
  {
    question: "Şəddə nəyi bildirir?",
    options: ["Şiddətli (ikiqat) səs", "Uzun u", "Sakit", "Qısa a"],
    answer: "Şiddətli (ikiqat) səs",
  },
  {
    question: "كَتَبَ sözündəki hərəkə nədir?",
    options: ["Fətha", "Kəsrə", "Zəmmə", "Sukun"],
    answer: "Fətha",
  },
  {
    question: "كِتَاب sözünün başındakı hərəkə?",
    options: ["Kəsrə", "Fətha", "Zəmmə", "Şəddə"],
    answer: "Kəsrə",
  },
  {
    question: "كُتُب sözündəki hərəkə nədir?",
    options: ["Zəmmə", "Fətha", "Kəsrə", "Sukun"],
    answer: "Zəmmə",
  },
  {
    question: "مُحَمَّد sözündəki ّ işarəsi nədir?",
    options: ["Şəddə", "Sukun", "Fətha", "Kəsrə"],
    answer: "Şəddə",
  },
  {
    question: "Qısa 'a' səsini hansı hərəkə bildirir?",
    options: ["Fətha", "Zəmmə", "Kəsrə", "Sukun"],
    answer: "Fətha",
  },
];

function speakArabic(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const doSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA";
    utterance.rate = 0.8;
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find((v) => v.lang.startsWith("ar"));
    if (arabicVoice) utterance.voice = arabicVoice;
    window.speechSynthesis.speak(utterance);
  };
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    window.speechSynthesis.addEventListener("voiceschanged", doSpeak, {
      once: true,
    });
  } else {
    doSpeak();
  }
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildAlphabetQuiz() {
  const pool = shuffle(ARABIC_ALPHABET).slice(0, 10);
  return pool.map((item) => {
    if (Math.random() > 0.5) {
      const wrongs = shuffle(
        ARABIC_ALPHABET.filter((a) => a.name !== item.name),
      )
        .slice(0, 3)
        .map((a) => a.name);
      return {
        arabic: item.arabic,
        question: "Bu hərfin adı nədir?",
        options: shuffle([item.name, ...wrongs]),
        answer: item.name,
      };
    }
    const wrongs = shuffle(
      ARABIC_ALPHABET.filter((a) => a.arabic !== item.arabic),
    )
      .slice(0, 3)
      .map((a) => a.arabic);
    return {
      arabic: undefined as string | undefined,
      question: `"${item.name}" hərfi hansıdır?`,
      options: shuffle([item.arabic, ...wrongs]),
      answer: item.arabic,
    };
  });
}

function buildHarakatQuiz() {
  return shuffle(HARAKAT_QUIZ).slice(0, 8);
}

function buildGrammarQuiz() {
  return shuffle(GRAMMAR_QUIZ).slice(0, 10);
}

type QuizState = { answers: (string | null)[]; finished: boolean };

function Quiz({
  questions,
  ocidPrefix,
}: {
  questions: {
    question: string;
    arabic?: string;
    options: string[];
    answer: string;
  }[];
  ocidPrefix: string;
}) {
  const [state, setState] = useState<QuizState>({
    answers: Array(questions.length).fill(null),
    finished: false,
  });
  const score = state.answers.filter(
    (a, i) => a === questions[i].answer,
  ).length;
  const allAnswered = state.answers.every((a) => a !== null);

  const handleAnswer = (qIdx: number, option: string) => {
    if (state.answers[qIdx] !== null) return;
    setState((prev) => {
      const newAnswers = [...prev.answers];
      newAnswers[qIdx] = option;
      return {
        answers: newAnswers,
        finished: newAnswers.every((a) => a !== null),
      };
    });
  };

  const reset = () =>
    setState({ answers: Array(questions.length).fill(null), finished: false });

  return (
    <div className="space-y-6">
      {questions.map((q, qi) => (
        <div
          key={`${q.question}-${qi}`}
          className="rounded-2xl p-5 card-gradient"
          data-ocid={`${ocidPrefix}.item.${qi + 1}`}
        >
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">
            Sual {qi + 1}
          </p>
          {q.arabic && (
            <p
              className="font-amiri text-3xl text-center mb-2"
              dir="rtl"
              style={{ color: "oklch(var(--islamic-gold))" }}
            >
              {q.arabic}
            </p>
          )}
          <p className="text-white font-medium mb-4">{q.question}</p>
          <div className="grid grid-cols-2 gap-2">
            {q.options.map((opt) => {
              const selected = state.answers[qi] === opt;
              const isCorrect = opt === q.answer;
              const answered = state.answers[qi] !== null;
              let cls =
                "w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ";
              let style: React.CSSProperties = {};
              if (answered) {
                if (isCorrect)
                  cls +=
                    "border-emerald-400 bg-emerald-500/20 text-emerald-300";
                else if (selected)
                  cls += "border-red-400 bg-red-500/20 text-red-300";
                else cls += "border-white/10 text-white/40 bg-white/5";
              } else {
                style = {
                  borderColor: "oklch(var(--islamic-gold) / 0.3)",
                  color: "white",
                  backgroundColor: "oklch(var(--islamic-gold) / 0.05)",
                };
                cls += "hover:bg-white/10";
              }
              return (
                <button
                  key={opt}
                  type="button"
                  className={cls}
                  style={style}
                  disabled={answered}
                  onClick={() => handleAnswer(qi, opt)}
                  data-ocid={`${ocidPrefix}.radio`}
                >
                  {answered && isCorrect && (
                    <CheckCircle className="inline w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  )}
                  {answered && selected && !isCorrect && (
                    <XCircle className="inline w-3.5 h-3.5 mr-1.5 text-red-400" />
                  )}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {allAnswered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-6 text-center card-gradient gold-glow"
          data-ocid={`${ocidPrefix}.success_state`}
        >
          <div
            className="text-5xl font-extrabold mb-1"
            style={{ color: "oklch(var(--islamic-gold))" }}
          >
            {score}/{questions.length}
          </div>
          <p className="text-white/70 mb-4">
            {score === questions.length
              ? "Əla! Hamısını düz cavabladınız 🎉"
              : score >= questions.length * 0.7
                ? "Yaxşı nəticə! Davam edin!"
                : "Daha çox məşq edin. Bacara bilərsiniz!"}
          </p>
          <Button
            data-ocid={`${ocidPrefix}.button`}
            onClick={reset}
            style={{
              backgroundColor: "oklch(var(--islamic-gold))",
              color: "oklch(var(--islamic-dark))",
            }}
            className="rounded-full"
          >
            Yenidən başla
          </Button>
        </motion.div>
      )}
    </div>
  );
}

export default function ArabicLearnPage() {
  const [alphabetQuiz, setAlphabetQuiz] = useState(() => buildAlphabetQuiz());
  const [harakatQuiz, setHarakatQuiz] = useState(() => buildHarakatQuiz());
  const [grammarQuiz, setGrammarQuiz] = useState(() => buildGrammarQuiz());
  const [selectedLetter, setSelectedLetter] = useState<
    (typeof ARABIC_ALPHABET)[0] | null
  >(null);

  return (
    <div
      className="min-h-screen pb-24"
      style={{ backgroundColor: "oklch(var(--islamic-dark))" }}
    >
      <div
        className="px-4 py-6 text-center"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.22 0.06 160) 0%, oklch(var(--islamic-dark)) 100%)",
          borderBottom: "1px solid oklch(var(--islamic-gold) / 0.2)",
        }}
      >
        <p
          className="font-amiri text-2xl mb-1"
          style={{ color: "oklch(var(--islamic-gold))" }}
          dir="rtl"
        >
          تَعَلَّمِ الْعَرَبِيَّةَ
        </p>
        <h1 className="text-xl font-extrabold text-white">Ərəbcə Öyrən</h1>
        <p className="text-white/50 text-sm mt-1">Quran ərəbcəsinin əsasları</p>
      </div>

      <div className="px-4 pt-4">
        <Tabs defaultValue="oxunush" className="w-full">
          <TabsList
            className="w-full mb-6 rounded-xl"
            style={{
              backgroundColor: "oklch(var(--islamic-gold) / 0.1)",
              border: "1px solid oklch(var(--islamic-gold) / 0.25)",
            }}
            data-ocid="learn.tab"
          >
            <TabsTrigger
              value="oxunush"
              className="flex-1 rounded-lg text-white data-[state=active]:text-black font-semibold"
              data-ocid="learn.tab"
            >
              📖 Oxunuş
            </TabsTrigger>
            <TabsTrigger
              value="qrammatika"
              className="flex-1 rounded-lg text-white data-[state=active]:text-black font-semibold"
              data-ocid="learn.tab"
            >
              ✍️ Qrammatika
            </TabsTrigger>
          </TabsList>

          {/* ===== OXUNUŞ TAB ===== */}
          <TabsContent value="oxunush" className="space-y-8">
            {/* Alphabet */}
            <section>
              <h2
                className="text-lg font-bold mb-1"
                style={{ color: "oklch(var(--islamic-gold))" }}
              >
                Ərəb Əlifbası
              </h2>
              <p className="text-white/50 text-sm mb-4">
                Hərfə toxunaraq tələffüzü dinlə
              </p>
              <div className="grid grid-cols-4 gap-2">
                {ARABIC_ALPHABET.map((letter, i) => (
                  <motion.button
                    key={letter.arabic}
                    type="button"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.015 }}
                    className="rounded-xl p-3 text-center card-gradient relative"
                    style={
                      selectedLetter?.arabic === letter.arabic
                        ? { outline: "2px solid oklch(var(--islamic-gold))" }
                        : {}
                    }
                    data-ocid={`alphabet.item.${i + 1}`}
                    onClick={() => {
                      setSelectedLetter(letter);
                      speakArabic(letter.arabic);
                    }}
                  >
                    <div
                      className="font-amiri text-3xl leading-tight"
                      dir="rtl"
                      style={{ color: "oklch(var(--islamic-gold))" }}
                    >
                      {letter.arabic}
                    </div>
                    <div className="text-white text-xs font-semibold mt-1 leading-tight">
                      {letter.name}
                    </div>
                    <div className="text-white/45 text-[10px] mt-0.5">
                      {letter.latin}
                    </div>
                    <Volume2 className="w-2.5 h-2.5 absolute top-1.5 right-1.5 text-white/25" />
                  </motion.button>
                ))}
              </div>

              {/* Selected letter detail */}
              {selectedLetter && (
                <motion.div
                  key={selectedLetter.arabic}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-2xl p-5 card-gradient gold-glow"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className="font-amiri text-6xl shrink-0"
                      dir="rtl"
                      style={{ color: "oklch(var(--islamic-gold))" }}
                    >
                      {selectedLetter.arabic}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold text-lg">
                          {selectedLetter.name}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor:
                              "oklch(var(--islamic-gold) / 0.15)",
                            color: "oklch(var(--islamic-gold))",
                          }}
                        >
                          {selectedLetter.latin}
                        </span>
                      </div>
                      <div className="text-white/60 text-sm mb-3">
                        Nümunə söz:
                      </div>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span
                          className="font-amiri text-2xl"
                          dir="rtl"
                          style={{ color: "oklch(var(--islamic-gold) / 0.9))" }}
                        >
                          {selectedLetter.word}
                        </span>
                        <span className="text-white/50 text-sm italic">
                          ({selectedLetter.wordLatin})
                        </span>
                        <span className="text-white/70 text-sm">
                          — {selectedLetter.wordMeaning}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                      style={{
                        backgroundColor: "oklch(var(--islamic-gold) / 0.2)",
                        color: "oklch(var(--islamic-gold))",
                      }}
                      onClick={() => speakArabic(selectedLetter.arabic)}
                    >
                      <Volume2 className="w-4 h-4" /> Hərf tələffüzü
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                      style={{
                        backgroundColor: "oklch(var(--islamic-green) / 0.2)",
                        color: "oklch(0.7 0.15 160)",
                      }}
                      onClick={() => speakArabic(selectedLetter.word)}
                    >
                      <Volume2 className="w-4 h-4" /> Söz nümunəsi
                    </button>
                  </div>
                </motion.div>
              )}
            </section>

            {/* Harakat */}
            <section>
              <h2
                className="text-lg font-bold mb-1"
                style={{ color: "oklch(var(--islamic-gold))" }}
              >
                Harakat Dərsi
              </h2>
              <p className="text-white/50 text-sm mb-4">
                Qısa sait işarələri (hərəkələr)
              </p>
              <div className="space-y-3">
                {HARAKAT.map((h) => (
                  <div
                    key={h.name}
                    className="rounded-2xl p-5 card-gradient gold-glow"
                    data-ocid="harakat.card"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="font-amiri text-5xl w-16 text-center shrink-0"
                        style={{ color: "oklch(var(--islamic-gold))" }}
                        dir="rtl"
                      >
                        {h.mark}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-bold text-base">
                            {h.name}
                          </span>
                          <span
                            className="text-sm px-2 py-0.5 rounded-full font-mono"
                            style={{
                              backgroundColor:
                                "oklch(var(--islamic-gold) / 0.15)",
                              color: "oklch(var(--islamic-gold))",
                            }}
                          >
                            "{h.sound}" səsi
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span
                            className="font-amiri text-2xl"
                            style={{
                              color: "oklch(var(--islamic-gold) / 0.8)",
                            }}
                            dir="rtl"
                          >
                            {h.example}
                          </span>
                          <span className="text-white/50 text-sm italic">
                            ({h.exampleLatin})
                          </span>
                          <span className="text-white/70 text-sm">
                            — {h.meaning}
                          </span>
                          <button
                            type="button"
                            className="ml-auto"
                            onClick={() => speakArabic(h.example)}
                          >
                            <Volume2
                              className="w-4 h-4"
                              style={{
                                color: "oklch(var(--islamic-gold) / 0.6)",
                              }}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Alphabet Quiz */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2
                    className="text-lg font-bold"
                    style={{ color: "oklch(var(--islamic-gold))" }}
                  >
                    Əlifba Quizi
                  </h2>
                  <p className="text-white/50 text-sm">
                    10 sual — hərfləri yoxla
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs border-white/20 text-white/60 hover:text-white"
                  onClick={() => setAlphabetQuiz(buildAlphabetQuiz())}
                  data-ocid="alphabet_quiz.button"
                >
                  Yeni suallar
                </Button>
              </div>
              <Quiz questions={alphabetQuiz} ocidPrefix="alphabet_quiz" />
            </section>

            {/* Harakat Quiz */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2
                    className="text-lg font-bold"
                    style={{ color: "oklch(var(--islamic-gold))" }}
                  >
                    Harakat Quizi
                  </h2>
                  <p className="text-white/50 text-sm">
                    8 sual — hərəkələri yoxla
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs border-white/20 text-white/60 hover:text-white"
                  onClick={() => setHarakatQuiz(buildHarakatQuiz())}
                  data-ocid="harakat_quiz.button"
                >
                  Yeni suallar
                </Button>
              </div>
              <Quiz questions={harakatQuiz} ocidPrefix="harakat_quiz" />
            </section>
          </TabsContent>

          {/* ===== QRAMMATİKA TAB ===== */}
          <TabsContent value="qrammatika" className="space-y-6">
            {GRAMMAR_LESSONS.map((lesson, li) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: li * 0.1 }}
                className="rounded-2xl p-5 card-gradient"
                data-ocid={`grammar.item.${li + 1}`}
              >
                <h3
                  className="text-base font-bold mb-2"
                  style={{ color: "oklch(var(--islamic-gold))" }}
                >
                  {lesson.title}
                </h3>
                <p className="text-white/70 text-sm mb-4 leading-relaxed">
                  {lesson.explanation}
                </p>
                <div className="space-y-2">
                  {lesson.examples.map((ex) => (
                    <div
                      key={ex.arabic}
                      className="flex items-center gap-3 rounded-xl px-4 py-3"
                      style={{
                        backgroundColor: "oklch(var(--islamic-gold) / 0.07)",
                        border: "1px solid oklch(var(--islamic-gold) / 0.15)",
                      }}
                    >
                      <span
                        className="font-amiri text-2xl shrink-0"
                        dir="rtl"
                        style={{ color: "oklch(var(--islamic-gold))" }}
                      >
                        {ex.arabic}
                      </span>
                      <button
                        type="button"
                        onClick={() => speakArabic(ex.arabic)}
                        className="shrink-0"
                      >
                        <Volume2
                          className="w-3.5 h-3.5"
                          style={{ color: "oklch(var(--islamic-gold) / 0.5)" }}
                        />
                      </button>
                      <span className="text-white/50 text-sm italic shrink-0">
                        ({ex.latin})
                      </span>
                      <span className="text-white/80 text-sm">
                        — {ex.meaning}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2
                    className="text-lg font-bold"
                    style={{ color: "oklch(var(--islamic-gold))" }}
                  >
                    Qrammatika Quizi
                  </h2>
                  <p className="text-white/50 text-sm">
                    10 sual — bildiklərini yoxla
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs border-white/20 text-white/60 hover:text-white"
                  onClick={() => setGrammarQuiz(buildGrammarQuiz())}
                  data-ocid="grammar_quiz.button"
                >
                  Yeni suallar
                </Button>
              </div>
              <Quiz questions={grammarQuiz} ocidPrefix="grammar_quiz" />
            </section>

            {/* Faydalı İpuçları */}
            <section className="mt-6 mb-2">
              <h2
                className="text-lg font-bold mb-4"
                style={{ color: "oklch(var(--islamic-gold))" }}
              >
                💡 Faydalı İpuçları
              </h2>
              <div className="space-y-3">
                {[
                  {
                    tip: "Hər gün yalnız 1 ayə olsa belə, Quran oxuyun — ardıcıllıq əlifbanı tanımağa kömək edir.",
                    icon: "📖",
                  },
                  {
                    tip: "Ən çox işlənən 10 ərəb kökünü öyrənin (k-t-b, q-r-a, r-h-m, h-m-d, s-l-m, k-r-m, 3-l-m, d-kh-l, q-w-l, j-3-l). Bu köklər Quranın böyük hissəsini əhatə edir.",
                    icon: "🔤",
                  },
                  {
                    tip: "Şəms hərfləri (ش, س, ن, ر, ل və s.) ilə başlayan sözlərdə 'əl-' artikli birləşir: əş-Şəms, ər-Rəhman. Qəmər hərflərindən (ك, م, ب, ق) əvvəl isə 'əl-' ayrı oxunur.",
                    icon: "☀️",
                  },
                  {
                    tip: "Hər hərfin 4 formasını öyrənin: ayrı, söz başı, söz ortası, söz sonu. Məsələn: ب — بـ — ـبـ — ـب.",
                    icon: "✍️",
                  },
                  {
                    tip: "Həmzə (ء) hər zaman sabit deyil — sözdəki yerinə görə ا , و , ي üzərində yazılır. Bunu öyrənmək oxumanı asanlaşdırır.",
                    icon: "🔵",
                  },
                  {
                    tip: "Tanış Quran ayələrini hərəkəsiz mushafda oxumağa çalışın — bu sizi uzun mətnləri deşifrə etməyə öyrədir.",
                    icon: "🌙",
                  },
                ].map((item, i) => (
                  <div
                    key={item.icon}
                    className="rounded-xl p-4 flex gap-3 items-start"
                    style={{
                      backgroundColor: "oklch(var(--islamic-dark) / 0.6)",
                      border: "1px solid oklch(var(--islamic-gold) / 0.2)",
                    }}
                    data-ocid={`arabic_tips.item.${i + 1}`}
                  >
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {item.tip}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
