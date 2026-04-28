"use client";

import Image from "next/image";
import { startTransition, useMemo, useState } from "react";

type SearchMovie = {
  directorName: string;
  id: number;
  posterUrl: string | null;
  releaseDate: string;
  title: string;
};

type SelectedMovie = SearchMovie & {
  subtitle: string;
};

function formatYear(releaseDate: string) {
  return releaseDate ? releaseDate.slice(0, 4) : "Unknown";
}

export default function ShareBuilder() {
  const [festivalTitle, setFestivalTitle] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchMovie[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<SelectedMovie[]>([]);
  const [draggedMovieId, setDraggedMovieId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isShortening, setIsShortening] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const sharePath = useMemo(() => {
    const ids = selectedMovies.map((movie) => movie.id);

    if (ids.length === 0) {
      return "";
    }

    const params = new URLSearchParams();
    params.set("id", ids.join(","));
    selectedMovies.forEach((movie) => {
      params.append("subtitle", movie.subtitle.trim());
    });

    if (festivalTitle.trim()) {
      params.set("title", festivalTitle.trim());
    }

    return `/?${params.toString()}`;
  }, [festivalTitle, selectedMovies]);

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

      return [...current, { ...movie, subtitle: "" }];
    });
  }

  function updateSelectedMovieSubtitle(id: number, subtitle: string) {
    setCopied(false);
    setSelectedMovies((current) =>
      current.map((movie) =>
        movie.id === id
          ? {
              ...movie,
              subtitle,
            }
          : movie,
      ),
    );
  }

  function moveSelectedMovie(draggedId: number, targetId: number) {
    if (draggedId === targetId) {
      return;
    }

    setSelectedMovies((current) => {
      const draggedIndex = current.findIndex((movie) => movie.id === draggedId);
      const targetIndex = current.findIndex((movie) => movie.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) {
        return current;
      }

      const next = [...current];
      const [draggedMovie] = next.splice(draggedIndex, 1);
      next.splice(targetIndex, 0, draggedMovie);
      return next;
    });
  }

  async function handleCopy() {
    if (!shareUrl) {
      return;
    }

    setIsShortening(true);

    try {
      const response = await fetch("/api/reurl/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: shareUrl }),
      });

      const data = (await response.json()) as {
        error?: string;
        shortUrl?: string;
      };

      const finalUrl = response.ok && data.shortUrl ? data.shortUrl : shareUrl;

      await navigator.clipboard.writeText(finalUrl);
    } finally {
      setIsShortening(false);
    }

    setCopied(true);
  }

  return (
    <main className="bg-[linear-gradient(180deg,_#141010_0%,_#0b0a0a_100%)] px-5 sm:px-8 lg:px-12 py-10 min-h-screen text-stone-100">
      <div className="flex flex-col gap-8 mx-auto w-full max-w-6xl">
        <section className="bg-white/6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm p-6 sm:p-8 border border-white/10 rounded-none">
          <h1 className="font-semibold text-white text-3xl sm:text-4xl tracking-[-0.05em]">
            建立電影分享連結
          </h1>
          <p className="mt-3 max-w-2xl text-stone-300 text-sm sm:text-base leading-7">
            搜尋 TMDB
            電影名稱，挑選你要揭露的片單，系統會自動產生可分享的首頁網址。
          </p>

          <form
            className="flex sm:flex-row flex-col gap-3 mt-6"
            onSubmit={handleSearch}
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="例如：Parasite, Perfect Days, Dune"
              className="flex-1 bg-black/30 px-5 py-4 border border-white/10 focus:border-amber-200/50 rounded-none outline-none min-w-0 text-white placeholder:text-stone-500 text-base"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-amber-200 hover:bg-amber-100 disabled:bg-stone-400 px-5 py-4 rounded-none font-medium text-stone-950 text-sm transition disabled:cursor-wait"
            >
              {isLoading ? "搜尋中..." : "搜尋電影"}
            </button>
          </form>

          {error ? <p className="mt-4 text-rose-300 text-sm">{error}</p> : null}
        </section>

        <section className="flex flex-col gap-8">
          <div className="bg-white/6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm p-5 sm:p-6 border border-white/10 rounded-none">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-white text-xl">搜尋結果</h2>
              <p className="text-stone-400 text-sm">{results.length} 部</p>
            </div>

            <div className="gap-1.5 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {results.map((movie) => {
                const selected = selectedMovies.some(
                  (item) => item.id === movie.id,
                );

                return (
                  <button
                    key={movie.id}
                    type="button"
                    onClick={() => toggleSelection(movie)}
                    className={`group relative overflow-hidden border text-left transition ${
                      selected
                        ? "border-amber-200/80 shadow-[0_16px_40px_rgba(245,210,126,0.16)]"
                        : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    <div className="relative bg-stone-900 aspect-[2/3]">
                      {movie.posterUrl ? (
                        <Image
                          src={movie.posterUrl}
                          alt={movie.title}
                          fill
                          sizes="(max-width: 640px) 42vw, (max-width: 1280px) 22vw, 16vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex justify-center items-center px-4 h-full text-stone-500 text-xs text-center">
                          No poster
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="bottom-0 absolute inset-x-0 opacity-0 group-hover:opacity-100 p-2 transition-opacity duration-300">
                        <p className="font-medium text-white text-xs leading-snug">
                          {movie.title}
                        </p>
                        <p className="mt-1 text-[10px] text-stone-300 uppercase tracking-[0.16em]">
                          {formatYear(movie.releaseDate)}
                        </p>
                      </div>
                    </div>
                    {selected ? (
                      <div className="top-2 right-2 absolute bg-amber-200 px-1.5 py-1 rounded-[0.4rem] font-medium text-[9px] text-stone-950 uppercase tracking-[0.14em]">
                        Added
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {results.length === 0 ? (
              <div className="flex justify-center items-center bg-black/10 px-6 border border-white/10 border-dashed rounded-none min-h-56 text-stone-500 text-sm text-center leading-7">
                {query.trim()
                  ? "沒有找到符合的電影，可以換個片名試試。"
                  : "輸入電影名稱後，這裡會顯示 TMDB 搜尋結果。"}
              </div>
            ) : null}
          </div>

          <div className="bg-white/6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm p-5 sm:p-6 border border-white/10 rounded-none">
            <h2 className="font-semibold text-white text-xl">已選電影</h2>
            <p className="mt-2 text-stone-400 text-sm leading-6">
              點選上方海報即可加入或移除；下方列表可以拖曳排序，首頁海報會依這個順序由左到右顯示。
            </p>

            <div className="mt-5 space-y-3">
              {selectedMovies.length === 0 ? (
                <p className="text-stone-500 text-sm">尚未選擇電影。</p>
              ) : (
                selectedMovies.map((movie, index) => (
                  <div
                    key={movie.id}
                    draggable
                    onDragStart={() => setDraggedMovieId(movie.id)}
                    onDragEnd={() => setDraggedMovieId(null)}
                    onDragOver={(event) => {
                      event.preventDefault();
                    }}
                    onDrop={(event) => {
                      event.preventDefault();

                      if (draggedMovieId !== null) {
                        moveSelectedMovie(draggedMovieId, movie.id);
                      }

                      setDraggedMovieId(null);
                    }}
                    className={`grid gap-4 bg-black/22 p-4 border transition sm:grid-cols-[minmax(0,1fr)_minmax(220px,320px)_auto] ${
                      draggedMovieId === movie.id
                        ? "border-amber-200/65"
                        : "border-white/10"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-stone-500 text-[11px] uppercase tracking-[0.2em]">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <p className="mt-1 font-medium text-white text-sm sm:text-base leading-snug">
                        {movie.title}
                      </p>
                      <p className="mt-1 text-stone-400 text-xs sm:text-sm leading-6">
                        {formatYear(movie.releaseDate)} · {movie.directorName}
                      </p>
                    </div>
                    <div>
                      <input
                        id={`subtitle-${movie.id}`}
                        value={movie.subtitle}
                        onChange={(event) =>
                          updateSelectedMovieSubtitle(
                            movie.id,
                            event.target.value,
                          )
                        }
                        placeholder="小標題⋯⋯"
                        className="bg-black/30 px-4 py-3 border border-white/10 focus:border-amber-200/50 rounded-none outline-none w-full min-w-0 text-white placeholder:text-stone-500 text-sm"
                      />
                    </div>
                    <div className="flex sm:justify-end items-start gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSelection(movie)}
                        aria-label={`移除 ${movie.title}`}
                        className="flex justify-center items-center hover:bg-white/8 border border-white/12 w-11 h-11 text-stone-200 transition"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6 6 18" />
                          <path d="M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white/6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm p-5 sm:p-6 border border-white/10 rounded-none">
            <label className="block mb-2 text-stone-300 text-sm">影展標題</label>
            <input
              value={festivalTitle}
              onChange={(event) => setFestivalTitle(event.target.value)}
              placeholder="例如：Golden Horse Special Selection"
              className="bg-black/30 px-4 py-3 border border-white/10 focus:border-amber-200/50 rounded-none outline-none w-full text-white placeholder:text-stone-500 text-sm"
            />
            {!festivalTitle.trim() ? (
              <p className="my-2 text-amber-200 text-xs">
                複製或預覽分享連結前，請先輸入影展標題。
              </p>
            ) : null}

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!shareUrl || !festivalTitle.trim() || isShortening}
                className="bg-white hover:bg-stone-200 disabled:bg-stone-600 px-4 py-3 rounded-none font-medium text-stone-950 disabled:text-stone-300 text-sm transition disabled:cursor-not-allowed"
              >
                {isShortening ? "縮短中..." : "複製連結"}
              </button>
            </div>
            {copied ? (
              <p className="mt-3 text-emerald-300 text-sm">已複製到剪貼簿。</p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
