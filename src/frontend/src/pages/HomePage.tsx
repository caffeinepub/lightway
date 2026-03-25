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
  "Quranın 'əl-Kəhf' surəsini hər cümə günü oxumaq tövsiyə edilir.",
  "İslam tarixinin ilk Quran məktəbi Mədinədə açılmışdır.",
  "Ərəb dili dünyada ən qədim yazılı dillərdən biridir.",
  "Peyğəmbər ﷺ buyurmuşdur: 'Kim sübh namazını qılsa, o Allahın himayəsindədir.'",
  "Quranın 'ər-Rəhman' surəsinin 31 ayəsi 'Fəbəyyiə aləi rəbbikumə tükəzzibən' cümləsidir.",
  "İslam mədəniyyəti 8-11-ci əsrlərdə dünya elminin mərkəzi idi.",
  "Həzrət Əli (r.a.) Peyğəmbər ﷺ-in əmisi oğlu və damadıdır.",
  "Zəmzəm quyusu Kəbənin 20 metr cənub-şərqindədir.",
  "Quranı tam bir dəfə oxumaq 'Xətm' adlanır.",
  "Müsəlmanlar bayram namazını aşkar yerdə, çöldə qılırlar.",
  "İslam dininin yayılmasında ticarət yollarının böyük rolu olmuşdur.",
  "Peyğəmbər ﷺ buyurmuşdur: 'Qonşusu ac olarkən tok yatan bizdən deyil.'",
  "Quranın hər hərfini oxumaq 10 savabdır — bu 60 mindən çox savab deməkdir.",
  "Həzrət Ömər (r.a.) İslamı qəbul etdikdən sonra müsəlmanlar aşkara çıxdı.",
  "Müsəlmanlar cümə namazından əvvəl qüsl etmək sünnədir.",
  "Quranın 'Mülk' surəsini hər gecə oxumaq qəbrin əzabından qoruyur.",
  "İslam dininin ən qiymətli ibadəti namazdır.",
  "Peyğəmbər ﷺ Mədinədə ilk İslam dövlətini qurmuşdur.",
  "Həzrət Bilal (r.a.) ilk müəzzin — azan oxuyan şəxs -- idi.",
  "Quranın 'Bəqərə' surəsi ən uzun surədir — 286 ayə.",
  "İslam dininin ilk universiteti 'Darül-Hikmə' idi.",
  "Müsəlmanlar sağ əllə yemək yeyib, sol əllə işləmir -- bu sünnədir.",
  "Peyğəmbər ﷺ buyurmuşdur: 'Güclü müsəlman zəif müsəlmandan daha yaxşıdır.'",
  "İslamda 'Halal' sözü 'icazəli' mənasını verir.",
  "Quranın 1/3-i hekayələrdən, 1/3-i qanun-qaydalardan, 1/3-i isə ibadətdən bəhs edir.",
  "Həzrət Aişə (r.a.) İslam elminin ən böyük alimələrindən biri idi.",
  "Namaz qılmaq üçün üz-əl-ayaqları yumaq -- dəstəmaz almaq -- vacibdir.",
  "Peyğəmbər ﷺ buyurmuşdur: 'Elmi Çindən olsa da axtarın.'",
  "İslam dininin ən böyük günası şirkdir -- Allaha şərik qoşmaq.",
  "Quranın 'Fatihə' surəsi hər namazda oxunur -- gündə ən az 17 dəfə.",
  "Müsəlmanların müqəddəs şəhərləri Məkkə, Mədinə və Qüdsdür.",
  "Peyğəmbər ﷺ Məkkəni fəth etdikdə bütün düşmənlərini bağışladı.",
  "İslamda 'Əmanət' -- güvənilirlik -- ən yüksək əxlaq dəyərlərindən biridir.",
  "Quranı dinləmək tilavət etmək kimi savab sayılır.",
  "Həzrət Yaqub (ə.s.)-un oğlu Həzrət Yusif (ə.s.) Misirdə nazir oldu.",
  "Peyğəmbər ﷺ buyurmuşdur: 'Müsəlmanın müsəlmana etdiyi ən böyük yaxşılıq onu doğru yola yönəltməkdir.'",
  "İslam dinindəki 'Tövbə' anlayışı günahdan dönüşü ifadə edir.",
  "Quranın 'Nuh' surəsi Həzrət Nuhun (ə.s.) həyatını anlatır.",
  "Müsəlmanlar Allahın hər şeyi bildiyinə -- Elm sifətinə -- iman gətirir.",
  "Ramazan ayı İslam təqviminin 9-cu ayıdır.",
  "Peyğəmbər ﷺ buyurmuşdur: 'Hər çətinliyin arxasında asanlıq var.'",
  "İslamda 'Xəlifə' sözü 'Allahın yer üzündəki canişini' mənasını verir.",
  "Quranın 'Qiyamə' surəsi qiyamət gününü təsvir edir.",
  "Müsəlmanlar Allah ilə hər an birbaşa əlaqə qura bilər -- vasitəçiyə ehtiyac yoxdur.",
  "Peyğəmbər ﷺ-in ən çox sevdiyi ibadət nafilə namazı idi.",
  "İslam tarixinin ən böyük fiqh alimi İmam Şafii idi.",
  "Quranın 'Hucurat' surəsi insan münasibətlərinin əxlaqını öyrədir.",
  "Müsəlmanlar xeyirli bir iş edərkən 'Bismillah' deyirlər.",
  "İslam dininin 'Sünni' qolu dünyada müsəlmanların 85-90%-ni təşkil edir.",
  "Peyğəmbər ﷺ buyurmuşdur: 'Hər kim Allah üçün bir məscid tikərsə, Allah ona Cənnətdə ev tikər.'",
  "Həzrət İsa (ə.s.) İslamda da peyğəmbər kimi qəbul edilir.",
  "Quranın 'Ənam' surəsinin 59-cu ayəsindəki 'Ğayb açarları' Allahın bilikləridir.",
  "Müsəlmanlar Allahı sevir, Ondan qorxur, Ondan ümid edir -- üç əsas hissiyyat.",
  "İslam inancına görə hər insanın iki mələyi var -- Kiraman Katibin -- əməlləri yazır.",
  "Peyğəmbər ﷺ-in 23 illik peyğəmbərlik dövrü İslam tarixinin əsasını qoydu.",
  "Quranın 'Taha' surəsindəki 'Rəbbim, köksümü aç' duası hər dua edənin arzusudur.",
  "Müsəlmanların qibləsi Kəbədir -- Kəbənin içi isə boşdur.",
  "İslam dininin 'Sədəqeyi-Cəriyyə' anlayışı ölümdən sonra da davam edən savabı ifadə edir.",
  "Peyğəmbər ﷺ buyurmuşdur: 'Kim bir nəfəri öldürərsə, sanki bütün insanlığı öldürmüşdür.'",
  "Həzrət Musa (ə.s.) Quranda 136 dəfə adı keçən peyğəmbərdir.",
  "Quranın 'Zümər' surəsinin 53-cü ayəsi Allahın rəhməti haqqındadır.",
  "Müsəlmanlar gecə namazı -- Təhəccüd -- qılmağı çox dəyərli sayır.",
  "İslam dininin 'Elm' anlayışı dini biliklərlə dünyəvi bilikləri birləşdirir.",
  "Peyğəmbər ﷺ buyurmuşdur: 'Ana ayaqlarının altında Cənnət var.'",
  "Quranın sonuncu nazil olan ayəsi əl-Maidə surəsinin 3-cü ayəsidir.",
  "Müsəlmanlar güvənə bildikləri hər kəsə salam verirlər -- bu sünnədir.",
  "İslam inancında 'Axirət' dünya həyatından daha əhəmiyyətlidir.",
  "Həzrət Süleyman (ə.s.) həm peyğəmbər, həm də güclü bir hökmdar idi.",
  "Quranın 'İbrahim' surəsi Həzrət İbrahimin (ə.s.) duaları ilə doludur.",
  "Müsəlmanlar namazda Allah ilə birbaşa danışır -- bu ən dəyərli anlar.",
  "Peyğəmbər ﷺ buyurmuşdur: 'Ən yaxşı insan insanlara faydalı olandır.'",
  "İslam dini 'Ehsan' anlayışını -- Allah görür kimi ibadət etmək -- tərğib edir.",
  "Quranın 'Muminun' surəsi möminlərin sifətlərini sadalayır.",
  "Həzrət Ömer (r.a.) İslam xilafətini genişləndirdi -- Şam, Misir, İran fəth edildi.",
  "Müsəlmanların ən böyük bayramları Ramazan bayramı və Qurban bayramıdır.",
  "Peyğəmbər ﷺ buyurmuşdur: 'Kim bir gülümsəməklə birisinin qəlbini sevindirsə, bu sədəqədir.'",
  "İslam inancına görə Cənnət 8 qapılıdır, Cəhənnəm isə 7 qapılıdır.",
  "Quranın 'Əraf' surəsi peyğəmbərlərin tarixini anlatır.",
  "Müsəlmanlar 'İstərəm Allah istəsə' -- İnşaAllah -- deyərək gələcəkdən danışır.",
  "Peyğəmbər ﷺ buyurmuşdur: 'Oruclu iken pis söz söyləmə, əgər biri sənə söyürsə, mən orucluyam de.'",
  "İslam dininin ən böyük alimlərindən biri İmam Əhməd ibn Hənbəl 1 milyon hədis bilirdi.",
  "Quranın 'Qədr' surəsi sadəcə 5 ayədir amma çox güclü mənalar daşıyır.",
  "Müsəlmanlar 'Allahu Əkbər' -- Allah ən böyükdür -- deyərək namazı başlayır.",
  "Həzrət Nuh (ə.s.) 950 il öz qövmünü İslama dəvət etdi.",
  "İslam dini insanı bütün varlığın xəlifəsi olaraq yaratdı.",
  "Peyğəmbər ﷺ buyurmuşdur: 'Ölümdən sonra 3 şey kəsilməz: sədəqeyi-cəriyyə, elm, dua edən saleh övlad.'",
  "Quranın 'Nur' surəsi ailə həyatının əxlaqını öyrədir.",
  "Müsəlmanlar 'La iləhə illəllah' -- Allahdan başqa ilah yoxdur -- şəhadəti ilə başlayır.",
  "İslam tarixinin ən mühüm döyüşü Bədr döyüşü idi -- 313 müsəlman 1000 müşrikə qalib gəldi.",
  "Həzrət Rəsulullah ﷺ-in ən sevdiyi yemək xurma idi.",
  "Quranın 'Nisa' surəsi qadın hüquqları haqqında çox əhəmiyyətli hökmlər ehtiva edir.",
  "Müsəlmanlar 'SubhənəAllah' deyərək Allahı paklaşdırır -- bu zikrdir.",
  "Peyğəmbər ﷺ buyurmuşdur: 'Dinin yarısı təmizlikdir.'",
  "İslam inancına görə Quran Allah kəlamıdır -- heç bir dəyişiklik olmadan qiyamətə qədər qalacaq.",
  "Həzrət İdris (ə.s.) xəttatlığın banisi sayılır.",
  "Quranın 'Şuəra' surəsi bir neçə peyğəmbərin tarixini anlatır.",
  "Müsəlmanlar Allah üçün bir-birini sevir -- bu imanın əlamətidir.",
];

export default function HomePage() {
  const { t } = useI18n();
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);
  const [prayerLoading, setPrayerLoading] = useState(true);

  const randomFact = useMemo(
    () => ISLAMIC_FACTS[Math.floor(Math.random() * ISLAMIC_FACTS.length)],
    [],
  );

  const randomVerse = useMemo(
    () => QURAN_VERSES[Math.floor(Math.random() * QURAN_VERSES.length)],
    [],
  );

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

      {/* Compact Header */}
      <section className="hero-gradient py-10 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p
              className="font-amiri text-2xl mb-3"
              style={{ color: "oklch(var(--islamic-gold))" }}
            >
              بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
            <h1 className="text-4xl font-extrabold text-white mb-2 leading-tight">
              LightWay
            </h1>
            <p className="text-white/60 text-base">{t("heroSubtitle")}</p>
          </motion.div>
        </div>
      </section>

      {/* Prayer Time Card */}
      <section className="px-4 pt-6">
        <div className="container mx-auto max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-6 card-gradient gold-glow text-white"
            data-ocid="prayer.card"
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
            <p className="text-white/70 text-sm">{t("searchCityDesc")}</p>
          </motion.div>
        </div>
      </section>

      {/* Bilirdinizmi Section */}
      <section className="px-4 pt-4 pb-24">
        <div className="container mx-auto max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-6 text-white card-gradient gold-glow"
            data-ocid="bilirdinizmi.card"
          >
            <div className="flex items-center gap-2 mb-4">
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
          </motion.div>
        </div>
      </section>
    </div>
  );
}
