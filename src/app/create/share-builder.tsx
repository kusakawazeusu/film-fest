"use client";

import Image from "next/image";
import { startTransition, useMemo, useState } from "react";

type SearchMovie = {
  id: number;
  overview: string;
  posterUrl: string | null;
  releaseDate: string;
  title: string;
};

function formatYear(releaseDate: string) {
  return releaseDate ? releaseDate.slice(0, 4) : "";
}

export default function ShareBuilder() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchMovie[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<SearchMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const sharePath = useMemo(() => {
    const ids = selectedMovies.map((movie) => movie.id);

    if (ids.length === 0) {
      return "";
    }

    return `/?id=${ids.join(",")}`;
  }, [selectedMovies]);

  const shareUrl = useMemo(() => {
    if (!sharePath) {
      return "";
    }

    if (typeof window === "undefined") {
      return sharePath;
    }

    return `${window.location.origin}${sharePath}`;
  }, [sharePath]);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults([]);
      setError("請輸入電影名稱。");
      return;
    }

    setIsLoading(true);
    setError("");
    setCopied(false);

    try {
      const response = await fetch(
        `/api/tmdb/search?query=${encodeURIComponent(trimmedQuery)}`,
      );

      const data = (await response.json()) as {
        error?: string;
        results?: SearchMovie[];
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Search failed");
      }

      startTransition(() => {
        setResults(data.results ?? []);
      });
    } catch {
      setResults([]);
      setError("搜尋失敗，請稍後再試。");
    } finally {
      setIsLoading(false);
    }
  }

  function toggleSelection(movie: SearchMovie) {
    setCopied(false);
    setSelectedMovies((current) => {
      const exists = current.some((item) => item.id === movie.id);

      if (exists) {
        return current.filter((item) => item.id !== movie.id);
      }

      return [...current, movie];
    });
  }

  async function handleCopy() {
    if (!shareUrl) {
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#141010_0%,_#0b0a0a_100%)] px-5 py-10 text-stone-100 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8">
          <h1 className="text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
            建立電影分享連結
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300 sm:text-base">
            搜尋 TMDB 電影名稱，挑選你要揭露的片單，系統會自動產生可分享的首頁網址。
          </p>

          <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="例如：Parasite, Perfect Days, Dune"
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-base text-white outline-none placeholder:text-stone-500 focus:border-amber-200/50"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-2xl bg-amber-200 px-5 py-4 text-sm font-medium text-stone-950 transition hover:bg-amber-100 disabled:cursor-wait disabled:bg-stone-400"
            >
              {isLoading ? "搜尋中..." : "搜尋電影"}
            </button>
          </form>

          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">搜尋結果</h2>
              <p className="text-sm text-stone-400">{results.length} 部</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((movie) => {
                const selected = selectedMovies.some((item) => item.id === movie.id);

                return (
                  <button
                    key={movie.id}
                    type="button"
                    onClick={() => toggleSelection(movie)}
                    className={`overflow-hidden rounded-[1.6rem] border text-left transition ${
                      selected
                        ? "border-amber-200/80 bg-amber-50/8 shadow-[0_16px_40px_rgba(245,210,126,0.16)]"
                        : "border-white/10 bg-black/18 hover:border-white/25"
                    }`}
                  >
                    <div className="relative aspect-[2/3] bg-stone-900">
                      {movie.posterUrl ? (
                        <Image
                          src={movie.posterUrl}
                          alt={movie.title}
                          fill
                          sizes="(max-width: 640px) 90vw, (max-width: 1280px) 30vw, 20vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-stone-500">
                          No poster
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-medium text-white">{movie.title}</h3>
                        <span className="shrink-0 text-xs text-stone-400">
                          {formatYear(movie.releaseDate)}
                        </span>
                      </div>
                      <p className="line-clamp-3 text-sm leading-6 text-stone-400">
                        {movie.overview || "沒有簡介。"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            {results.length === 0 ? (
              <div className="flex min-h-56 items-center justify-center rounded-[1.6rem] border border-dashed border-white/10 bg-black/10 px-6 text-center text-sm leading-7 text-stone-500">
                {query.trim()
                  ? "沒有找到符合的電影，可以換個片名試試。"
                  : "輸入電影名稱後，這裡會顯示 TMDB 搜尋結果。"}
              </div>
            ) : null}
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:p-6">
            <h2 className="text-xl font-semibold text-white">已選電影</h2>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              點選左側卡片即可加入或移除，分享連結會依目前選中的順序產生。
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {selectedMovies.map((movie) => (
                <button
                  key={movie.id}
                  type="button"
                  onClick={() => toggleSelection(movie)}
                  className="rounded-full border border-amber-200/30 bg-amber-50/8 px-3 py-2 text-sm text-amber-100"
                >
                  {movie.title}
                </button>
              ))}
              {selectedMovies.length === 0 ? (
                <p className="text-sm text-stone-500">尚未選擇電影。</p>
              ) : null}
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
              <p className="text-sm text-stone-400">分享連結</p>
              <div className="mt-3 break-all rounded-2xl border border-white/8 bg-black/35 px-4 py-4 text-sm leading-6 text-stone-200">
                {shareUrl || "選擇至少一部電影後，這裡會出現分享網址。"}
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!shareUrl}
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-stone-950 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:bg-stone-600 disabled:text-stone-300"
                >
                  複製連結
                </button>
                {shareUrl ? (
                  <a
                    href={sharePath}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-white/15 px-4 py-3 text-sm text-white transition hover:bg-white/8"
                  >
                    開啟預覽
                  </a>
                ) : null}
              </div>
              {copied ? <p className="mt-3 text-sm text-emerald-300">已複製到剪貼簿。</p> : null}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
