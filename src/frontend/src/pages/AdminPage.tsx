import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3,
  KeyRound,
  Loader2,
  ShieldAlert,
  Trash2,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useI18n } from "../contexts/i18n";
import {
  useAddBook,
  useDeleteBook,
  useListBooks,
  useStatistics,
} from "../hooks/useQueries";

const ADMIN_PASSWORD = "admin123";

export default function AdminPage() {
  const { t } = useI18n();
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const { data: stats } = useStatistics();
  const { data: books } = useListBooks();
  const addBook = useAddBook();
  const deleteBook = useDeleteBook();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleUpload = async () => {
    if (!title || !author || !pdfFile) return;
    try {
      const bytes = new Uint8Array(await pdfFile.arrayBuffer());
      let blob = ExternalBlob.fromBytes(bytes);
      blob = blob.withUploadProgress((pct) => setUploadProgress(pct));
      const id = crypto.randomUUID();
      await addBook.mutateAsync({ id, title, author, description, blob });
      toast.success(t("uploadSuccess"));
      setTitle("");
      setAuthor("");
      setDescription("");
      setPdfFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      toast.error(
        "Kitab yüklənərkən xəta baş verdi. Backend autentifikasiyası tələb oluna bilər. Əgər xəta davam edirsə, admin token konfiqurasiyasını yoxlayın.",
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBook.mutateAsync(id);
      toast.success("Kitab silindi.");
    } catch {
      toast.error("Kitab silinərkən xəta baş verdi.");
    }
  };

  if (!authenticated) {
    return (
      <div className="islamic-bg-pattern min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-gradient rounded-2xl p-10 text-center text-white gold-glow max-w-sm w-full mx-4"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{
              backgroundColor: "oklch(var(--islamic-gold) / 0.15)",
              border: "2px solid oklch(var(--islamic-gold))",
            }}
          >
            <KeyRound
              className="w-7 h-7"
              style={{ color: "oklch(var(--islamic-gold))" }}
            />
          </div>
          <h2 className="text-2xl font-bold mb-1">{t("admin")}</h2>
          <p className="text-white/50 text-sm mb-6">
            Daxil olmaq üçün parolu daxil edin
          </p>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Parol"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className={`bg-white/10 border-white/20 text-white placeholder-white/40 text-center tracking-widest text-lg ${
                passwordError ? "border-red-400" : ""
              }`}
              data-ocid="admin.password_input"
            />
            {passwordError && (
              <p className="text-red-400 text-sm">
                Parol yanlışdır. Yenidən cəhd edin.
              </p>
            )}
            <Button
              data-ocid="admin.primary_button"
              onClick={handleLogin}
              className="rounded-full px-8 font-semibold w-full"
              style={{
                backgroundColor: "oklch(var(--islamic-gold))",
                color: "oklch(var(--islamic-dark))",
              }}
            >
              Daxil ol
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="islamic-bg-pattern min-h-screen">
      <div className="hero-gradient py-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-white mb-2">
            {t("admin")}
          </h1>
          <p className="text-white/60">Admin Panel</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <Tabs defaultValue="upload" className="max-w-3xl mx-auto">
          <TabsList className="w-full mb-8" data-ocid="admin.tab">
            <TabsTrigger
              value="upload"
              className="flex-1"
              data-ocid="admin.tab"
            >
              <Upload className="w-4 h-4 mr-2" />
              {t("uploadBook")}
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex-1" data-ocid="admin.tab">
              <BarChart3 className="w-4 h-4 mr-2" />
              {t("statistics")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div className="bg-card rounded-2xl p-8 border border-border shadow-xs">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Upload
                  className="w-5 h-5"
                  style={{ color: "oklch(var(--islamic-gold))" }}
                />
                {t("uploadBook")}
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="book-title"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    {t("title")}
                  </label>
                  <Input
                    id="book-title"
                    data-ocid="admin.title.input"
                    placeholder={t("title")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="book-author"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    {t("author")}
                  </label>
                  <Input
                    id="book-author"
                    data-ocid="admin.author.input"
                    placeholder={t("author")}
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="book-description"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    {t("description")}
                  </label>
                  <Textarea
                    id="book-description"
                    data-ocid="admin.description.textarea"
                    placeholder={t("description")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <label
                    htmlFor="book-pdf"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    {t("pdfFile")}
                  </label>
                  <button
                    type="button"
                    className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    data-ocid="admin.dropzone"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {pdfFile ? (
                      <p className="text-sm font-medium">{pdfFile.name}</p>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          PDF faylı seçmək üçün klikləyin
                        </p>
                      </div>
                    )}
                  </button>
                  <input
                    id="book-pdf"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    data-ocid="admin.upload_button"
                    onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                  />
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${uploadProgress}%`,
                        backgroundColor: "oklch(var(--islamic-gold))",
                      }}
                    />
                  </div>
                )}

                <Button
                  data-ocid="admin.submit_button"
                  onClick={handleUpload}
                  disabled={addBook.isPending || !title || !author || !pdfFile}
                  className="w-full rounded-full font-semibold"
                  style={{
                    backgroundColor: "oklch(var(--islamic-gold))",
                    color: "oklch(var(--islamic-dark))",
                  }}
                >
                  {addBook.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {t("loading")}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {t("upload")}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Books list */}
            {books && books.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8"
              >
                <h3 className="text-lg font-bold mb-4">Yüklənmiş kitablar</h3>
                <div className="space-y-3">
                  {books.map((book, i) => (
                    <div
                      key={book.id}
                      className="flex items-center justify-between bg-card rounded-xl p-4 border border-border"
                      data-ocid={`admin.books.item.${i + 1}`}
                    >
                      <div>
                        <p className="font-medium">{book.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {book.author}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        data-ocid={`admin.books.delete_button.${i + 1}`}
                        onClick={() => handleDelete(book.id)}
                        disabled={deleteBook.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-gradient rounded-2xl p-8 text-white text-center gold-glow"
                data-ocid="admin.prayer.card"
              >
                <div
                  className="text-5xl font-extrabold mb-2"
                  style={{ color: "oklch(var(--islamic-gold))" }}
                >
                  {stats ? Number(stats.prayerCount).toLocaleString() : "—"}
                </div>
                <p className="text-white/70">{t("prayerSearches")}</p>
                <div className="text-4xl mt-4">🕌</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-gradient rounded-2xl p-8 text-white text-center gold-glow"
                data-ocid="admin.quran.card"
              >
                <div
                  className="text-5xl font-extrabold mb-2"
                  style={{ color: "oklch(var(--islamic-gold))" }}
                >
                  {stats ? Number(stats.quranCount).toLocaleString() : "—"}
                </div>
                <p className="text-white/70">{t("quranSearches")}</p>
                <div className="text-4xl mt-4">📖</div>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
