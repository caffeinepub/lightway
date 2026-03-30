import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Download, Loader2, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "../contexts/i18n";
import { useListBooks } from "../hooks/useQueries";

const STATIC_BOOKS = [
  {
    id: "static-1",
    title: "Sadece Allah'a Bağlılık 2",
    author: "Naməlum",
    description: "Yalnız Allaha bağlılıq mövzusunda İslami kitab.",
    pdfUrl:
      "/assets/uploads/sadece-allahaa-ba-rak-2-mk3z959bovt1eg71-019d245e-4245-779e-9833-5be954002db3-1.pdf",
  },
  {
    id: "static-2",
    title: "Kayıp Besmele",
    author: "Serhat Ahmet Tan",
    description: "Bəsmələ mövzusunda dərin düşüncələr.",
    pdfUrl:
      "/assets/uploads/serhat-ahmet-tan-kayip-besmele-019d245e-5384-731e-9caf-377b7e56e899-2.pdf",
  },
  {
    id: "static-3",
    title: "İslamda Anne Baba Hakkı",
    author: "İbnul Cevzi",
    description: "İslamda valideyn haqları haqqında klassik əsər.",
    pdfUrl:
      "/assets/uploads/bnul_cevzi_slamda_anne_baba_hakki-019d245e-5c66-74ff-9638-f330d1a9eb76-3.pdf",
  },
  {
    id: "static-4",
    title: "İslamda Cinsellik",
    author: "Arif Tekin",
    description: "İslamda ailə həyatı və cinsellik mövzusunda araşdırma.",
    pdfUrl:
      "/assets/uploads/arif-tekin-islamda-cinsellik-berfin-yayinlari-019d245e-5ceb-714f-ab8f-6a597dfbef20-4.pdf",
  },
];

function StaticDownloadButton({ book }: { book: (typeof STATIC_BOOKS)[0] }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const a = document.createElement("a");
      a.href = book.pdfUrl;
      a.download = `${book.title}.pdf`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      toast.error("Kitab yüklənərkən xəta baş verdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      className="rounded-full gap-2"
      style={{
        backgroundColor: "oklch(var(--islamic-gold))",
        color: "oklch(var(--islamic-dark))",
      }}
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {loading ? "Yüklenir..." : "Yüklə"}
    </Button>
  );
}

function DownloadButton({
  book,
}: {
  book: { id: string; title: string; blob: { getDirectURL: () => string } };
}) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const url = book.blob.getDirectURL();
      const response = await fetch(url);
      if (!response.ok) throw new Error("HTTP error");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${book.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      toast.error("Kitab yüklənərkən xəta baş verdi. Yenidən cəhd edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      className="rounded-full gap-2"
      style={{
        backgroundColor: "oklch(var(--islamic-gold))",
        color: "oklch(var(--islamic-dark))",
      }}
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {loading ? "Yüklenir..." : "Yüklə"}
    </Button>
  );
}

export default function BooksPage() {
  const { t } = useI18n();
  const { data: books, isLoading } = useListBooks();

  const allBooks = [...STATIC_BOOKS, ...(books || [])];

  return (
    <div className="islamic-bg-pattern min-h-screen">
      <div className="hero-gradient py-12 px-4">
        <div className="container mx-auto text-center">
          <p
            className="font-amiri text-xl mb-2"
            style={{ color: "oklch(var(--islamic-gold))" }}
          >
            اقْرَأْ بِاسْمِ رَبِّكَ
          </p>
          <h1 className="text-4xl font-extrabold text-white mb-2">
            {t("books")}
          </h1>
          <p className="text-white/60">Rəbbinin adı ilə oxu — əl-Ələq 96:1</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {isLoading && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="books.loading_state"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card rounded-2xl p-6 border border-border"
              >
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-9 w-28" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && allBooks.length === 0 && (
          <div className="text-center py-20" data-ocid="books.empty_state">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-lg">{t("noBooks")}</p>
          </div>
        )}

        {allBooks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STATIC_BOOKS.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-xs hover:shadow-md transition-shadow"
                data-ocid={`books.item.${i + 1}`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{
                    backgroundColor: "oklch(var(--islamic-green) / 0.1)",
                  }}
                >
                  📚
                </div>
                <h3 className="font-bold text-lg mb-1 line-clamp-2">
                  {book.title}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <User className="w-3.5 h-3.5" />
                  <span>{book.author}</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-3">
                  {book.description}
                </p>
                <StaticDownloadButton book={book} />
              </motion.div>
            ))}
            {(books || []).map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i + STATIC_BOOKS.length) * 0.08 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-xs hover:shadow-md transition-shadow"
                data-ocid={`books.item.${i + STATIC_BOOKS.length + 1}`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{
                    backgroundColor: "oklch(var(--islamic-green) / 0.1)",
                  }}
                >
                  📚
                </div>
                <h3 className="font-bold text-lg mb-1 line-clamp-2">
                  {book.title}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <User className="w-3.5 h-3.5" />
                  <span>{book.author}</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-3">
                  {book.description}
                </p>
                <DownloadButton book={book} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
