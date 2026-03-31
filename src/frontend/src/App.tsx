import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import BottomNav from "./components/BottomNav";
import MobileHeader from "./components/MobileHeader";
import { I18nProvider } from "./contexts/i18n";
import AdminPage from "./pages/AdminPage";
import ArabicLearnPage from "./pages/ArabicLearnPage";
import BooksPage from "./pages/BooksPage";
import HomePage from "./pages/HomePage";
import PrayerTimesPage from "./pages/PrayerTimesPage";
import QiblaPage from "./pages/QiblaPage";
import QuranPage from "./pages/QuranPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <div className="app-shell">
      <MobileHeader />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const prayerTimesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/prayer-times",
  component: PrayerTimesPage,
  validateSearch: (search: Record<string, unknown>) => ({
    city: search.city as string | undefined,
  }),
});

const quranRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/quran",
  component: QuranPage,
  validateSearch: (search: Record<string, unknown>) => ({
    q: search.q as string | undefined,
  }),
});

const booksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/books",
  component: BooksPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const arabicLearnRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/arabic-learn",
  component: ArabicLearnPage,
});

const qiblaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/qibla",
  component: QiblaPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  prayerTimesRoute,
  quranRoute,
  booksRoute,
  adminRoute,
  arabicLearnRoute,
  qiblaRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <RouterProvider router={router} />
        <Toaster />
      </I18nProvider>
    </QueryClientProvider>
  );
}
