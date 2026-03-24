import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Download, Loader2, User } from "lucide-react";
import { motion } from "motion/react";
import { useI18n } from "../contexts/i18n";
import { useListBooks } from "../hooks/useQueries";

export default function BooksPage() {
  const { t } = useI18n();
  const { data: books, isLoading, error } = useListBooks();

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
          <p className="text-white/60">
            Read in the name of your Lord — Al-Alaq 96:1
          </p>
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

        {error && (
          <div className="text-center py-10" data-ocid="books.error_state">
            <p className="text-destructive">Error loading books.</p>
          </div>
        )}

        {!isLoading && books && books.length === 0 && (
          <div className="text-center py-20" data-ocid="books.empty_state">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-lg">{t("noBooks")}</p>
          </div>
        )}

        {books && books.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book, i) => (
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
                <a
                  href={book.blob.getDirectURL()}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid={`books.download_button.${i + 1}`}
                >
                  <Button
                    size="sm"
                    className="rounded-full gap-2"
                    style={{
                      backgroundColor: "oklch(var(--islamic-gold))",
                      color: "oklch(var(--islamic-dark))",
                    }}
                  >
                    <Download className="w-4 h-4" />
                    {t("download")}
                  </Button>
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
