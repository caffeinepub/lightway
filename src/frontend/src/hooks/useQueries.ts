import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExternalBlob } from "../backend";
import type { Book } from "../backend.d";
import { useActor } from "./useActor";

export function useListBooks() {
  const { actor, isFetching } = useActor();
  return useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listBooks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStatistics() {
  const { actor, isFetching } = useActor();
  return useQuery<{ prayerCount: bigint; quranCount: bigint }>({
    queryKey: ["statistics"],
    queryFn: async () => {
      if (!actor) return { prayerCount: 0n, quranCount: 0n };
      const [prayerCount, quranCount] = await Promise.all([
        actor.getPrayerSearchCount(),
        actor.getQuranSearchCount(),
      ]);
      return { prayerCount, quranCount };
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFetchPrayerTimes() {
  return useMutation<string, Error, { city: string; country: string }>({
    mutationFn: async ({ city, country }) => {
      const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API xətası: ${res.status}`);
      return res.text();
    },
  });
}

export function useFetchQuranVerse() {
  return useMutation<string, Error, { surah: number; ayah: number }>({
    mutationFn: async ({ surah, ayah }) => {
      const url = `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/editions/quran-simple,az.mammadaliyev,en.transliteration`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API xətası: ${res.status}`);
      return res.text();
    },
  });
}

export function useFetchQuranSurah() {
  return useMutation<string, Error, { surah: number }>({
    mutationFn: async ({ surah }) => {
      const url = `https://api.alquran.cloud/v1/surah/${surah}/editions/quran-simple,az.mammadaliyev,en.transliteration`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API xətası: ${res.status}`);
      return res.text();
    },
  });
}

export function useAddBook() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<
    Book,
    Error,
    {
      id: string;
      title: string;
      author: string;
      description: string;
      blob: ExternalBlob;
    }
  >({
    mutationFn: async ({ id, title, author, description, blob }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addBook(id, title, author, description, blob);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books"] }),
  });
}

export function useDeleteBook() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteBook(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books"] }),
  });
}
