import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, Info, Pause, Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
type PrayerName = "Fəcr" | "Zöhr" | "Əsr" | "Məğrib" | "İşa";

interface DuaEntry {
  id: string;
  title: string;
  arabic: string;
  transliteration?: string;
  translation: string;
  audioSurahNumber?: number;
  audioAyahAbsolute?: number;
  note?: string;
}

// ── Data ───────────────────────────────────────────────────────────────────────
const PRAYERS: { name: PrayerName; rakaat: number; emoji: string }[] = [
  { name: "Fəcr", rakaat: 2, emoji: "🌙" },
  { name: "Zöhr", rakaat: 4, emoji: "☀️" },
  { name: "Əsr", rakaat: 4, emoji: "🌤️" },
  { name: "Məğrib", rakaat: 3, emoji: "🌇" },
  { name: "İşa", rakaat: 4, emoji: "🌌" },
];

const SHORT_SURAHS: DuaEntry[] = [
  {
    id: "ikhlas",
    title: "Əl-İxlas (112)",
    arabic:
      "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    transliteration:
      "Qul huwallahu ahad. Allahus-samad. Lam yalid wa lam yulad. Wa lam yakun lahu kufuwan ahad.",
    translation:
      "De: O, Allah Birdir. Allah Saməd (möhtacsızdır)dır. O, doğmayıb və doğulmayıb. Onun heç bir tayı-bərabəri yoxdur.",
    audioSurahNumber: 112,
  },
  {
    id: "falaq",
    title: "Əl-Fələq (113)",
    arabic:
      "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    transliteration:
      "Qul a'udhu bi rabbil-falaq. Min sharri ma khalaq. Wa min sharri ghasiqin idha waqab. Wa min sharrin-naffathati fil-'uqad. Wa min sharri hasidin idha hasad.",
    translation:
      "De: Sığınıram sübhün Rəbbinə. Yaratdıqlarının şərindən. Qaranlıq çökdüyündə gecənin şərindən. Düyünlərə üfürənlərin şərindən. Həsəd apardıqda paxılın şərindən.",
    audioSurahNumber: 113,
  },
  {
    id: "nas",
    title: "Ən-Nas (114)",
    arabic:
      "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
    transliteration:
      "Qul a'udhu bi rabbin-nas. Malikin-nas. Ilahin-nas. Min sharril-waswasil-khannas. Alladhi yuwaswisu fi sudurin-nas. Minal-jinnati wan-nas.",
    translation:
      "De: Sığınıram insanların Rəbbinə. İnsanların Padşahına. İnsanların İlahına. Geri çəkilən vəsvəsəçinin şərindən. O ki, insanların sinələrinə vəsvəsə salır. Cinlər arasından da, insanlar arasından da.",
    audioSurahNumber: 114,
  },
  {
    id: "kafirun",
    title: "Əl-Kafirun (109)",
    arabic:
      "قُلْ يَا أَيُّهَا الْكَافِرُونَ ۝ لَا أَعْبُدُ مَا تَعْبُدُونَ ۝ وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ ۝ وَلَا أَنَا عَابِدٌ مَّا عَبَدتُّمْ ۝ وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ ۝ لَكُمْ دِينُكُمْ وَلِيَ دِينِ",
    transliteration:
      "Qul ya ayyuhal-kafirun. La a'budu ma ta'budun. Wa la antum 'abiduna ma a'bud. Wa la ana 'abidum ma 'abadtum. Wa la antum 'abiduna ma a'bud. Lakum dinukum wa liya din.",
    translation:
      "De: Ey kafirlər! Mən sizin ibadət etdiklərinizə ibadət etmirəm. Siz də mənim ibadət etdiyimə ibadət edənlər deyilsiniz. Mən sizin ibadət etdiklərinizə ibadət edən deyiləm. Siz də mənim ibadət etdiyimə ibadət edənlər deyilsiniz. Sizin dininiz sizinkindir, mənim dinim mənimkindir.",
    audioSurahNumber: 109,
  },
  {
    id: "asr",
    title: "Əl-Əsr (103)",
    arabic:
      "وَالْعَصْرِ ۝ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ ۝ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ",
    transliteration:
      "Wal-'asr. Innal-insana lafi khusr. Illal-ladhina amanu wa 'amilus-salihati wa tawasau bil-haqqi wa tawasau bis-sabr.",
    translation:
      "Əsrə and olsun! Həqiqətən, insan ziyan içindədir. Yalnız iman gətirib yaxşı əməllər edənlər, bir-birinə haqqı və səbri tövsiyə edənlər bundan istisnadır.",
    audioSurahNumber: 103,
  },
  {
    id: "fil",
    title: "Əl-Fil (105)",
    arabic:
      "أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ ۝ أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ ۝ وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ ۝ تَرْمِيهِم بِحِجَارَةٍ مِّن سِجِّيلٍ ۝ فَجَعَلَهُمْ كَعَصْفٍ مَّأْكُولٍ",
    transliteration:
      "Alam tara kayfa fa'ala rabbuka bi-as-habil-fil. Alam yaj'al kaydahum fi tadlil. Wa arsala 'alayhim tayran ababeel. Tarmihim bihijaratin min sijjeel. Faja'alahum ka'asfin ma'kool.",
    translation:
      "Məgər Rəbbin fil sahibləri ilə necə rəftar etdiyini görmədinmi? Məgər O, onların hiylələrini puça çıxarmadımı? Onların üstünə dəstə-dəstə quşlar göndərdi. Onlar üstlərinə bişmiş gildən daşlar atırdılar. Beləliklə, onları yeyilmiş saman kimi etdi.",
    audioSurahNumber: 105,
  },
  {
    id: "maun",
    title: "Əl-Maun (107)",
    arabic:
      "أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ ۝ فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ ۝ وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ ۝ فَوَيْلٌ لِّلْمُصَلِّينَ ۝ الَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ ۝ الَّذِينَ هُمْ يُرَاءُونَ ۝ وَيَمْنَعُونَ الْمَاعُونَ",
    transliteration:
      "Ara-aytal-ladhi yukadhdhihu bid-din. Fadha-likal-ladhi yadu'ul-yateem. Wa la yahuddu 'ala ta'amil-miskeen. Fa-waylul-lil-musalleen. Alladhina hum 'an salatihim sahoon. Alladhina hum yura-oon. Wa yamna'unal-ma'oon.",
    translation:
      "Dini yalan sayanı gördünmü? Məhz o kimsədir ki, yetimi itələyib qaçırdır. Yoxsulu yedirtməyə rəğbət göstərmir. Vay halına o namaz qılanların ki, onlar öz namazlarından qafildirlər. Onlar riyakarlıq edənlərdir. Və kiçik köməkliyi belə əsirgəyirlər.",
    audioSurahNumber: 107,
  },
];

const MEDIUM_SURAHS: DuaEntry[] = [
  {
    id: "kursi",
    title: "Ayətəl-Kürsü (2:255)",
    arabic:
      "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    transliteration:
      "Allahu la ilaha illa huwal-hayyul-qayyum. La ta'khudhhu sinatun wa la nawm. Lahu ma fis-samawati wa ma fil-ard. Man dhal-ladhi yashfa'u 'indahu illa bi-idhnih...",
    translation:
      "Allah — Ondan başqa ilah yoxdur, O, əbədi Diridir, hər şeyi Qəyyum (ayaqda tutan)dır. Onu nə mürgü, nə də yuxu tutar. Göylərdə və yerdə nə varsa, Onundur. Onun izni olmadan Onun yanında kim şəfaət edə bilər?...",
    audioAyahAbsolute: 268,
  },
  {
    id: "baqarah285",
    title: "Əl-Bəqərə 285-286",
    arabic:
      "آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ ۚ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ",
    transliteration:
      "Amanar-rasulu bima unzila ilayhi mir-rabbihi wal-mu'minun. Kullun amana billahi wa mala-ikatihi wa kutubihi wa rusulihi...",
    translation:
      "Peyğəmbər Rəbbindən ona nazil olana iman gətirdi, möminlər də. Onların hamısı Allaha, Onun mələklərinə, kitablarına, peyğəmbərlərinə iman gətirdi...",
    audioAyahAbsolute: 285,
  },
  {
    id: "imran8",
    title: "Ali-İmran 8",
    arabic:
      "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ",
    transliteration:
      "Rabbana la tuzigh qulubana ba'da idh hadaytana wa hab lana mil-ladunka rahmah. Innaka antal-wahhab.",
    translation:
      "Ey Rəbbimiz! Bizə hidayət verdikdən sonra qəlblərimizi (haqdan) çevirməkdən qoru. Öz dərgahından bizə rəhmət bəxş et. Həqiqətən, Sən Bəxşedənsən.",
    audioAyahAbsolute: 341,
  },
  {
    id: "anam153",
    title: "Əl-Ənam 153",
    arabic:
      "وَأَنَّ هَٰذَا صِرَاطِي مُسْتَقِيمًا فَاتَّبِعُوهُ ۖ وَلَا تَتَّبِعُوا السُّبُلَ فَتَفَرَّقَ بِكُمْ عَن سَبِيلِهِ ۚ ذَٰلِكُمْ وَصَّاكُم بِهِ لَعَلَّكُمْ تَتَّقُونَ",
    transliteration:
      "Wa anna hadha sirati mustaqiman fattabi'uh. Wa la tattabi'us-subula fataffarraqa bikum 'an sabilih.",
    translation:
      "Bu, Mənim düz yolumdur, ona tabe olun. Başqa yollara tabe olmayın, yoxsa onlar sizi Onun yolundan ayırar. Bax, O sizə bunu tövsiyə etdi ki, bəlkə, (pis əməllərdən) çəkinəsiniz.",
    audioAyahAbsolute: 878,
  },
  {
    id: "zumar18",
    title: "Əz-Zumər 18",
    arabic:
      "الَّذِينَ يَسْتَمِعُونَ الْقَوْلَ فَيَتَّبِعُونَ أَحْسَنَهُ ۚ أُولَٰئِكَ الَّذِينَ هَدَاهُمُ اللَّهُ ۖ وَأُولَٰئِكَ هُمْ أُولُو الْأَلْبَابِ",
    transliteration:
      "Alladhina yastami'unal-qawla fayattabi'una ahsanah. Ula-ikal-ladhina hadahumullah. Wa ula-ika hum ulul-albab.",
    translation:
      "O kəslər ki, sözü dinləyir və onun ən gözəlinə uyurlar. Onlar Allahın doğru yola yönəltdiyi kimsələrdir. Onlar ağıl sahibləridirlər.",
    audioAyahAbsolute: 4295,
  },
  {
    id: "isra9",
    title: "Əl-İsra 9",
    arabic:
      "إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ وَيُبَشِّرُ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ أَنَّ لَهُمْ أَجْرًا كَبِيرًا",
    transliteration:
      "Inna hadhal-qurana yahdi lillati hiya aqwamu wa yubashshirul-mu'mininal-ladhina ya'malus-salihati anna lahum ajran kabira.",
    translation:
      "Həqiqətən, bu Quran ən düz yola hidayət edir. Yaxşı əməllər edən möminlərə böyük mükafat olduğunu müjdələyir.",
    audioAyahAbsolute: 2162,
  },
  {
    id: "taha123",
    title: "Taha 123",
    arabic:
      "قَالَ اهْبِطَا مِنْهَا جَمِيعًا ۖ بَعْضُكُمْ لِبَعْضٍ عَدُوٌّ ۖ فَإِمَّا يَأْتِيَنَّكُم مِّنِّي هُدًى فَمَنِ اتَّبَعَ هُدَايَ فَلَا يَضِلُّ وَلَا يَشْقَىٰ",
    transliteration:
      "Qalah-bita minha jami'an. Ba'dukum liba'din 'aduww. Fa-imma ya'tiyannakum minni hudan fa-manit-taba'a hudaya fala yadillu wa la yashqa.",
    translation:
      "Hər ikiniz oradan enin! Bir-birinizə düşmən olacaqsınız. Əgər Məndən sizə bir hidayət gəlsə, Mənim hidayətimdə gedən nə azacaq, nə də bədbəxt olacaq.",
    audioAyahAbsolute: 2459,
  },
];

const BƏRƏKƏT_DUAS: DuaEntry[] = [
  {
    id: "rabbana-atina",
    title: "Rabbana Atina",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration:
      "Rabbana atina fid-dunya hasanah wa fil-akhirati hasanah wa qina azabannar.",
    translation:
      "Ey Rəbbimiz! Bizə dünyada da, axirətdə də yaxşılıq ver və bizi Cəhənnəm əzabından qoru.",
  },
  {
    id: "rizq-dua",
    title: "Rizq Duası",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ رِزْقًا طَيِّبًا",
    transliteration:
      "Allahumma inni as'aluka rizqan tayyiban wa 'amalan mutaqabbalan wa 'ilman nafi'an.",
    translation:
      "Allahım, Səndən halal ruzi, qəbul ediləcək əməl və faydalı elm istəyirəm.",
  },
  {
    id: "huda-dua",
    title: "Hidayət Duası",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى",
    transliteration:
      "Allahumma inni as'aluka al-huda wat-tuqa wal-afafa wal-ghina.",
    translation: "Allahım, Səndən hidayət, təqva, iffət və varlıq istəyirəm.",
  },
  {
    id: "rabbighfirli",
    title: "Bağışlanma Duası",
    arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنتَ التَّوَّابُ الرَّحِيمُ",
    transliteration: "Rabbighfirli wa tub alayya innaka anta-tawwabur-rahim.",
    translation:
      "Rəbbim, məni bağışla və tövbəmi qəbul et. Həqiqətən, Sən çox tövbə qəbul edənsən, Rəhimli olansın.",
  },
  {
    id: "hasbunallah",
    title: "Hasbunallah",
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "Hasbunallahu wa ni'mal wakeel.",
    translation: "Allah bizə yetər, O nə gözəl vəkildir.",
  },
  {
    id: "ibrahim7",
    title: "İbrahim 7 — Şükür Ayəsi",
    arabic: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ",
    transliteration:
      "La'in shakartum la-azidannakum wa la'in kafartum inna 'adhabi lashadid.",
    translation:
      "Əgər şükür etsəniz, əlbəttə artıracağam. Əgər nankorluq etsəniz, həqiqətən, Mənim əzabım çox şiddətlidir.",
    audioAyahAbsolute: 1624,
  },
  {
    id: "nuh10",
    title: "Nuh 10-12 — Bərəkət Ayələri",
    arabic:
      "فَقُلْتُ اسْتَغْفِرُوا رَبَّكُمْ إِنَّهُ كَانَ غَفَّارًا ۝ يُرْسِلِ السَّمَاءَ عَلَيْكُم مِّدْرَارًا ۝ وَيُمْدِدْكُم بِأَمْوَالٍ وَبَنِينَ وَيَجْعَل لَّكُمْ جَنَّاتٍ وَيَجْعَل لَّكُمْ أَنْهَارًا",
    transliteration:
      "Faqultus-taghfiru rabbakum innahu kana ghaffara. Yursilis-sama'a 'alaykum midrara. Wa yumdidkum bi-amwalin wa banina wa yaj'al lakum jannatin wa yaj'al lakum anhara.",
    translation:
      "Rəbbinizdən bağışlanmağınızı diləyin, həqiqətən O, çox bağışlayandır. Üzərinizə göydən bol yağış göndərsin. Mallarla, oğullarla kömək etsin. Sizin üçün bağlar, çaylar yaratsın.",
    audioAyahAbsolute: 5757,
  },
];

const QORUYUCU_DUAS: DuaEntry[] = [
  {
    id: "la-ilaha",
    title: "La İlahə İllə Əntə",
    arabic: "لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin.",
    translation:
      "Səndən başqa ilah yoxdur, Sən pak və müqəddəssən, həqiqətən mən zalımlardan olmuşam.",
  },
  {
    id: "astaghfir",
    title: "Əstağfirullah",
    arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
    transliteration:
      "Astaghfirullahal-'Azimal-ladhi la ilaha illa huwal-hayyul-qayyumu wa atubu ilayh.",
    translation:
      "Özündən başqa ilah olmayan, Həmişəyaşayan, hər şeyi Qəyyum olan Böyük Allahdan bağışlanmağımı diləyirəm.",
  },
  {
    id: "allahumma-audhu",
    title: "Qəm-kədərdən Qorunma",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ",
    transliteration:
      "Allahumma inni a'udhu bika minal-hammi wal-hazan wal-'ajzi wal-kasal.",
    translation:
      "Allahım, qəm-kədərdən, acizlikdən və tənbəllikdən Sənə sığınıram.",
  },
  {
    id: "la-hawla",
    title: "La Həvlə",
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
    transliteration: "La hawla wa la quwwata illa billahil-'aliyyil-'azim.",
    translation:
      "Uca və Böyük Allahın köməyi olmadan heç bir güc və qüvvət yoxdur.",
  },
  {
    id: "baqarah286-q",
    title: "Əl-Bəqərə 285-286 (Qoruyucu)",
    arabic:
      "آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ",
    transliteration:
      "Amanar-rasulu bima unzila ilayhi mir-rabbihi wal-mu'minun...",
    translation:
      "Peyğəmbər Rəbbindən ona nazil olana iman gətirdi, möminlər də. Onların hamısı Allaha, mələklərinə, kitablarına, peyğəmbərlərinə iman gətirdi...",
    audioAyahAbsolute: 285,
  },
  {
    id: "uch-qul",
    title: "Üç Qul (İxlas + Fələq + Nas)",
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ ... قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ... قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
    transliteration:
      "Qul huwallahu ahad... Qul a'udhu bi rabbil-falaq... Qul a'udhu bi rabbin-nas...",
    translation:
      "İxlas, Fələq və Nas surələri (Üç Qul). Hər namazdan sonra 3 dəfə oxumaq sünnədir.",
    note: "Hər namazdan sonra 3 dəfə oxumaq sünnədir",
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────
function AudioButton({
  surahNum,
  ayahAbsolute,
}: { surahNum?: number; ayahAbsolute?: number }) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<string[]>([]);
  const indexRef = useRef(0);

  const getAudio = () => {
    if (!audioRef.current) audioRef.current = new Audio();
    return audioRef.current;
  };

  const stopAll = () => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.onended = null;
    }
    setPlaying(false);
    queueRef.current = [];
    indexRef.current = 0;
  };

  const playNext = () => {
    const queue = queueRef.current;
    const idx = indexRef.current;
    if (idx >= queue.length) {
      setPlaying(false);
      return;
    }
    const a = getAudio();
    a.src = queue[idx];
    indexRef.current = idx + 1;
    a.onended = playNext;
    a.play().catch(() => setPlaying(false));
  };

  const handlePlay = async () => {
    if (playing) {
      stopAll();
      return;
    }
    if (ayahAbsolute) {
      queueRef.current = [
        `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahAbsolute}.mp3`,
      ];
      indexRef.current = 0;
      setPlaying(true);
      playNext();
    } else if (surahNum) {
      setLoading(true);
      try {
        const resp = await fetch(
          `https://api.alquran.cloud/v1/surah/${surahNum}/ar.alafasy`,
        );
        const data = await resp.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const urls: string[] = (data?.data?.ayahs ?? [])
          .map((a: any) => a.audio)
          .filter(Boolean);
        if (urls.length) {
          queueRef.current = urls;
          indexRef.current = 0;
          setLoading(false);
          setPlaying(true);
          playNext();
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handlePlay}
      disabled={loading}
      className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all"
      style={{
        backgroundColor: playing
          ? "oklch(var(--islamic-gold) / 0.2)"
          : "oklch(var(--islamic-green) / 0.15)",
        color: playing
          ? "oklch(var(--islamic-gold))"
          : "oklch(var(--islamic-green))",
        border: `1px solid ${playing ? "oklch(var(--islamic-gold) / 0.4)" : "oklch(var(--islamic-green) / 0.3)"}`,
        opacity: loading ? 0.6 : 1,
      }}
    >
      {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
      {loading ? "Yüklənir..." : playing ? "Dayandır" : "Dinlə"}
    </button>
  );
}

function DuaCard({
  dua,
  showTranslation,
  showTransliteration,
}: {
  dua: DuaEntry;
  showTranslation: boolean;
  showTransliteration: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl border transition-all overflow-hidden"
      style={{
        borderColor: open
          ? "oklch(var(--islamic-gold) / 0.4)"
          : "oklch(var(--border))",
      }}
      data-ocid={`namaz.dua.${dua.id}.panel`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        style={{
          backgroundColor: open
            ? "oklch(var(--islamic-gold) / 0.08)"
            : "transparent",
        }}
        data-ocid={`namaz.dua.${dua.id}.toggle`}
      >
        <span
          className="font-semibold text-sm"
          style={{ color: "oklch(var(--foreground))" }}
        >
          {dua.title}
        </span>
        {open ? (
          <ChevronUp
            className="w-4 h-4"
            style={{ color: "oklch(var(--islamic-gold))" }}
          />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {dua.note && (
                <div
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{
                    backgroundColor: "oklch(var(--islamic-gold) / 0.12)",
                    color: "oklch(var(--islamic-gold))",
                  }}
                >
                  ⭐ {dua.note}
                </div>
              )}
              <p
                className="font-amiri text-xl leading-loose text-right"
                dir="rtl"
                style={{ color: "oklch(var(--islamic-gold))" }}
              >
                {dua.arabic}
              </p>
              {showTransliteration && dua.transliteration && (
                <p
                  className="text-sm italic"
                  style={{ color: "oklch(var(--foreground) / 0.65)" }}
                >
                  {dua.transliteration}
                </p>
              )}
              {showTranslation && (
                <p
                  className="text-sm"
                  style={{ color: "oklch(var(--foreground) / 0.8)" }}
                >
                  {dua.translation}
                </p>
              )}
              {(dua.audioSurahNumber || dua.audioAyahAbsolute) && (
                <AudioButton
                  surahNum={dua.audioSurahNumber}
                  ayahAbsolute={dua.audioAyahAbsolute}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Step Guide ─────────────────────────────────────────────────────────────────
interface StepInfo {
  label: string;
  icon: string;
  arabic?: string;
  transliteration?: string;
  extra?: { arabic: string; transliteration: string };
  text?: string;
  tooltip?: string;
  isTextOnly?: boolean;
}

function getSteps(rakaat: number, totalRakaat: number): StepInfo[] {
  const isLastRakaat = rakaat === totalRakaat;
  const isSecondRakaat = rakaat === 2;
  const showMiddleOturuş = isSecondRakaat && totalRakaat > 2;
  const showFullOturuş = isLastRakaat;

  const steps: StepInfo[] = [
    {
      label: "Qiyam",
      icon: "🕴️",
      arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      transliteration: "Bismillahir-rahmanir-rahim",
      text: "Fatihanı oxu, sonra qısa surə seç (aşağıdakı bölmədən)",
      tooltip: "Fatiha hər rükətdə oxunur",
    },
    {
      label: "Rüku",
      icon: "🙇",
      arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
      transliteration: "Subhana Rabbiyal-'Azim",
      tooltip: "3 dəfə oxumaq tövsiyə edilir",
      isTextOnly: true,
    },
    {
      label: "Qiyam (Rükudan sonra)",
      icon: "🕴️",
      arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ",
      transliteration: "Sami'Allahu liman hamidah",
      extra: {
        arabic: "رَبَّنَا وَلَكَ الْحَمْدُ",
        transliteration: "Rabbana wa lakal-hamd",
      },
      isTextOnly: true,
    },
    {
      label: "Səcdə",
      icon: "🙏",
      arabic: "سُبْحَانَ رَبِّيَ الأَعْلَى",
      transliteration: "Subhana Rabbiyal-A'la",
      tooltip: "3 dəfə oxumaq tövsiyə edilir",
      text: "Birinci səcdə, sonra oturuş, sonra ikinci səcdə (eyni zikr)",
      isTextOnly: true,
    },
  ];

  if (showMiddleOturuş) {
    steps.push({
      label: "Oturuş (Təşəhhüd)",
      icon: "🧎",
      arabic:
        "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
      transliteration:
        "Attahiyyatu lillahi wasalawatu wattayyibat. Assalamu alayka ayyuhan-nabiyyu wa rahmatullahi wa barakatuh. Assalamu alayna wa ala ibadillahis-salihin. Ash-hadu alla ilaha illallah wa ash-hadu anna Muhammadan abduhu wa rasuluh",
      text: "Attahiyyatu oxu, sonra 3-cü rükətə qalx",
      isTextOnly: true,
    });
  }

  if (showFullOturuş) {
    steps.push({
      label: "Oturuş (Tam Təşəhhüd)",
      icon: "🧎",
      arabic:
        "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
      transliteration:
        "Attahiyyatu lillahi wasalawatu wattayyibat. Assalamu alayka ayyuhan-nabiyyu wa rahmatullahi wa barakatuh. Assalamu alayna wa ala ibadillahis-salihin. Ash-hadu alla ilaha illallah wa ash-hadu anna Muhammadan abduhu wa rasuluh",
      extra: {
        arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
        transliteration: "Allahumma salli ala Muhammadin wa ala ali Muhammad",
      },
      text: "Attahiyyatu + Salawat oxu, sonra salam ver",
      isTextOnly: true,
    });
    steps.push({
      label: "Salam",
      icon: "🤲",
      arabic: "سَلَامٌ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
      transliteration: "Salamun alaykum wa rahmatullah",
      text: "Sağa salam ver → Sola salam ver",
      isTextOnly: true,
    });
  }

  return steps;
}

function StepCard({ step, index }: { step: StepInfo; index: number }) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  return (
    <div
      className="rounded-xl border p-4 space-y-2"
      style={{
        borderColor: "oklch(var(--islamic-green) / 0.25)",
        backgroundColor: "oklch(var(--card))",
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{
            backgroundColor: "oklch(var(--islamic-green) / 0.15)",
            color: "oklch(var(--islamic-green))",
          }}
        >
          {index + 1}
        </span>
        <span className="font-bold text-sm">
          {step.icon} {step.label}
        </span>
        {step.tooltip && (
          <button
            type="button"
            className="ml-auto relative"
            onClick={() => setTooltipOpen((v) => !v)}
            data-ocid="namaz.step.tooltip"
          >
            <Info className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
            {tooltipOpen && (
              <div
                className="absolute right-0 top-6 z-10 w-56 text-xs rounded-lg px-3 py-2 shadow-lg"
                style={{
                  backgroundColor: "oklch(var(--islamic-dark))",
                  color: "oklch(var(--islamic-gold))",
                  border: "1px solid oklch(var(--islamic-gold) / 0.3)",
                }}
              >
                {step.tooltip}
              </div>
            )}
          </button>
        )}
      </div>
      {step.arabic && (
        <p
          className="font-amiri text-lg leading-loose text-right pt-1"
          dir="rtl"
          style={{ color: "oklch(var(--islamic-gold))" }}
        >
          {step.arabic}
        </p>
      )}
      {step.transliteration && (
        <p className="text-xs italic text-muted-foreground">
          {step.transliteration}
        </p>
      )}
      {step.extra && (
        <>
          <p
            className="font-amiri text-base leading-loose text-right"
            dir="rtl"
            style={{ color: "oklch(var(--islamic-gold) / 0.8)" }}
          >
            {step.extra.arabic}
          </p>
          <p className="text-xs italic text-muted-foreground">
            {step.extra.transliteration}
          </p>
        </>
      )}
      {step.text && (
        <p
          className="text-xs rounded-lg px-3 py-1.5"
          style={{
            backgroundColor: "oklch(var(--muted))",
            color: "oklch(var(--muted-foreground))",
          }}
        >
          {step.text}
        </p>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function NamazGuide() {
  const [guideOpen, setGuideOpen] = useState(false);
  const [dualarOpen, setDualarOpen] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<
    (typeof PRAYERS)[0] | null
  >(null);
  const [activeRakaat, setActiveRakaat] = useState(1);
  const [completedRakaats, setCompletedRakaats] = useState<number[]>([]);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [finished, setFinished] = useState(false);

  const selectPrayer = (p: (typeof PRAYERS)[0]) => {
    setSelectedPrayer(p);
    setActiveRakaat(1);
    setCompletedRakaats([]);
    setFinished(false);
  };

  const markComplete = () => {
    if (!selectedPrayer) return;
    const newCompleted = [...completedRakaats, activeRakaat];
    setCompletedRakaats(newCompleted);
    if (activeRakaat < selectedPrayer.rakaat) {
      setActiveRakaat(activeRakaat + 1);
    } else {
      setFinished(true);
    }
  };

  const resetGuide = () => {
    setSelectedPrayer(null);
    setActiveRakaat(1);
    setCompletedRakaats([]);
    setFinished(false);
  };

  const progressPercent = selectedPrayer
    ? (completedRakaats.length / selectedPrayer.rakaat) * 100
    : 0;

  const steps = selectedPrayer
    ? getSteps(activeRakaat, selectedPrayer.rakaat)
    : [];

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: "oklch(var(--islamic-green) / 0.3)" }}
    >
      {/* Trigger */}
      <button
        type="button"
        data-ocid="namaz.guide.toggle"
        onClick={() => setGuideOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 transition-all"
        style={{
          background: guideOpen
            ? "linear-gradient(135deg, oklch(var(--islamic-green) / 0.15), oklch(var(--islamic-gold) / 0.08))"
            : "oklch(var(--card))",
        }}
      >
        <span className="flex items-center gap-3 font-bold text-base">
          <span className="text-2xl">🕌</span>
          <span
            style={{
              color: guideOpen ? "oklch(var(--islamic-green))" : undefined,
            }}
          >
            Namaz Bələdçisi
          </span>
        </span>
        <motion.div
          animate={{ rotate: guideOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <ChevronDown
            className="w-5 h-5"
            style={{ color: "oklch(var(--islamic-gold))" }}
          />
        </motion.div>
      </button>

      <AnimatePresence>
        {guideOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-6 space-y-6">
              {/* Separator */}
              <div
                className="h-px w-full"
                style={{ backgroundColor: "oklch(var(--islamic-green) / 0.2)" }}
              />

              {/* Prayer selection */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Namaz seçin
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRAYERS.map((p) => (
                    <button
                      type="button"
                      key={p.name}
                      data-ocid={`namaz.prayer.${p.name.toLowerCase()}.button`}
                      onClick={() => selectPrayer(p)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all"
                      style={{
                        backgroundColor:
                          selectedPrayer?.name === p.name
                            ? "oklch(var(--islamic-gold))"
                            : "oklch(var(--islamic-green) / 0.1)",
                        color:
                          selectedPrayer?.name === p.name
                            ? "oklch(var(--islamic-dark))"
                            : "oklch(var(--foreground))",
                        boxShadow:
                          selectedPrayer?.name === p.name
                            ? "0 0 12px oklch(var(--islamic-gold) / 0.4)"
                            : "none",
                      }}
                    >
                      <span>{p.emoji}</span>
                      <span>{p.name}</span>
                      <Badge
                        className="text-xs px-1.5 py-0 h-5"
                        style={{
                          backgroundColor:
                            selectedPrayer?.name === p.name
                              ? "oklch(var(--islamic-dark) / 0.2)"
                              : "oklch(var(--islamic-green) / 0.2)",
                          color:
                            selectedPrayer?.name === p.name
                              ? "oklch(var(--islamic-dark))"
                              : "oklch(var(--islamic-green))",
                        }}
                      >
                        {p.rakaat}r
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rükət tracker + guide */}
              {selectedPrayer && !finished && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {completedRakaats.length} / {selectedPrayer.rakaat}{" "}
                        rükət tamamlandı
                      </span>
                      <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress
                      value={progressPercent}
                      className="h-2 rounded-full"
                      data-ocid="namaz.progress"
                    />
                  </div>

                  {/* Rükət circles */}
                  <div className="flex gap-2 flex-wrap">
                    {Array.from(
                      { length: selectedPrayer.rakaat },
                      (_, i) => i + 1,
                    ).map((r) => {
                      const isDone = completedRakaats.includes(r);
                      const isActive = r === activeRakaat;
                      return (
                        <div
                          key={r}
                          data-ocid={`namaz.rakaat.item.${r}`}
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                          style={{
                            backgroundColor: isDone
                              ? "oklch(var(--islamic-green))"
                              : isActive
                                ? "oklch(var(--islamic-gold))"
                                : "oklch(var(--muted))",
                            color:
                              isDone || isActive
                                ? "white"
                                : "oklch(var(--muted-foreground))",
                            boxShadow: isActive
                              ? "0 0 14px oklch(var(--islamic-gold) / 0.5)"
                              : "none",
                          }}
                        >
                          {isDone ? "✓" : r}
                        </div>
                      );
                    })}
                    <div className="flex items-center ml-2">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "oklch(var(--islamic-green))" }}
                      >
                        {selectedPrayer.name} — {activeRakaat}-ci rükət
                      </span>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-3">
                    {steps.map((step, i) => (
                      <StepCard key={step.label} step={step} index={i} />
                    ))}
                  </div>

                  {/* Complete rükət button */}
                  <Button
                    data-ocid="namaz.rakaat.complete_button"
                    onClick={markComplete}
                    className="w-full rounded-xl font-bold"
                    style={{
                      backgroundColor: "oklch(var(--islamic-green))",
                      color: "white",
                    }}
                  >
                    {activeRakaat < selectedPrayer.rakaat
                      ? `✓ ${activeRakaat}-ci rükəti tamamla → ${activeRakaat + 1}-ci rükətə keç`
                      : "✓ Son rükəti tamamla"}
                  </Button>
                </motion.div>
              )}

              {/* Finished state */}
              {finished && selectedPrayer && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6 space-y-4"
                  data-ocid="namaz.finished.success_state"
                >
                  <div className="text-5xl">🌟</div>
                  <p
                    className="text-xl font-bold"
                    style={{ color: "oklch(var(--islamic-gold))" }}
                  >
                    {selectedPrayer.name} namazı tamamlandı
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Allahu Əkbər! Namazınız qəbul olsun.
                  </p>
                  <Button
                    data-ocid="namaz.reset.button"
                    onClick={resetGuide}
                    variant="outline"
                    className="rounded-full px-8"
                    style={{
                      borderColor: "oklch(var(--islamic-green) / 0.5)",
                      color: "oklch(var(--islamic-green))",
                    }}
                  >
                    Yeni namaza başla
                  </Button>
                </motion.div>
              )}

              {/* Fatiha Sonrası Dualar */}
              <div
                className="rounded-2xl border overflow-hidden"
                style={{ borderColor: "oklch(var(--islamic-gold) / 0.3)" }}
              >
                <button
                  type="button"
                  data-ocid="namaz.dualar.toggle"
                  onClick={() => setDualarOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-5 py-4 transition-all"
                  style={{
                    background: dualarOpen
                      ? "oklch(var(--islamic-gold) / 0.08)"
                      : "transparent",
                  }}
                >
                  <span className="flex items-center gap-2 font-bold text-sm">
                    <span>📖</span>
                    <span
                      style={{
                        color: dualarOpen
                          ? "oklch(var(--islamic-gold))"
                          : undefined,
                      }}
                    >
                      Fatiha Sonrası Dualar
                    </span>
                  </span>
                  <motion.div
                    animate={{ rotate: dualarOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown
                      className="w-4 h-4"
                      style={{ color: "oklch(var(--islamic-gold))" }}
                    />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {dualarOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-5 space-y-4">
                        {/* Toggles */}
                        <div className="flex gap-4 flex-wrap pt-1">
                          <button
                            type="button"
                            className="flex items-center gap-2 cursor-pointer"
                            data-ocid="namaz.translation.toggle"
                            onClick={() => setShowTranslation((v) => !v)}
                          >
                            <div
                              className="relative w-9 h-5 rounded-full transition-colors pointer-events-none"
                              style={{
                                backgroundColor: showTranslation
                                  ? "oklch(var(--islamic-green))"
                                  : "oklch(var(--muted))",
                              }}
                            >
                              <div
                                className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform"
                                style={{
                                  transform: showTranslation
                                    ? "translateX(16px)"
                                    : "translateX(0)",
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium">Tərcümə</span>
                          </button>
                          <button
                            type="button"
                            className="flex items-center gap-2 cursor-pointer"
                            data-ocid="namaz.transliteration.toggle"
                            onClick={() => setShowTransliteration((v) => !v)}
                          >
                            <div
                              className="relative w-9 h-5 rounded-full transition-colors pointer-events-none"
                              style={{
                                backgroundColor: showTransliteration
                                  ? "oklch(var(--islamic-green))"
                                  : "oklch(var(--muted))",
                              }}
                            >
                              <div
                                className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform"
                                style={{
                                  transform: showTransliteration
                                    ? "translateX(16px)"
                                    : "translateX(0)",
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium">Oxunuş</span>
                          </button>
                        </div>

                        <Tabs defaultValue="qisa" className="w-full">
                          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto gap-1 p-1">
                            <TabsTrigger
                              value="qisa"
                              className="text-xs rounded-lg"
                              data-ocid="namaz.dualar.qisa.tab"
                            >
                              Qısa Surələr
                            </TabsTrigger>
                            <TabsTrigger
                              value="orta"
                              className="text-xs rounded-lg"
                              data-ocid="namaz.dualar.orta.tab"
                            >
                              Orta Surələr
                            </TabsTrigger>
                            <TabsTrigger
                              value="bərəkət"
                              className="text-xs rounded-lg"
                              data-ocid="namaz.dualar.bərəkət.tab"
                            >
                              Bərəkət & Rızıq
                            </TabsTrigger>
                            <TabsTrigger
                              value="qoruyucu"
                              className="text-xs rounded-lg"
                              data-ocid="namaz.dualar.qoruyucu.tab"
                            >
                              Qoruyucu Dualar
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="qisa" className="space-y-2 mt-3">
                            {SHORT_SURAHS.map((dua) => (
                              <DuaCard
                                key={dua.id}
                                dua={dua}
                                showTranslation={showTranslation}
                                showTransliteration={showTransliteration}
                              />
                            ))}
                          </TabsContent>

                          <TabsContent value="orta" className="space-y-2 mt-3">
                            {MEDIUM_SURAHS.map((dua) => (
                              <DuaCard
                                key={dua.id}
                                dua={dua}
                                showTranslation={showTranslation}
                                showTransliteration={showTransliteration}
                              />
                            ))}
                          </TabsContent>

                          <TabsContent
                            value="bərəkət"
                            className="space-y-2 mt-3"
                          >
                            {BƏRƏKƏT_DUAS.map((dua) => (
                              <DuaCard
                                key={dua.id}
                                dua={dua}
                                showTranslation={showTranslation}
                                showTransliteration={showTransliteration}
                              />
                            ))}
                          </TabsContent>

                          <TabsContent
                            value="qoruyucu"
                            className="space-y-2 mt-3"
                          >
                            {QORUYUCU_DUAS.map((dua) => (
                              <DuaCard
                                key={dua.id}
                                dua={dua}
                                showTranslation={showTranslation}
                                showTransliteration={showTransliteration}
                              />
                            ))}
                          </TabsContent>
                        </Tabs>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
