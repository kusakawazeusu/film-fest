export type PosterMovie = {
  id: number;
  movieUrl: string;
  posterUrl: string;
  title: string;
};

export type SearchMovie = {
  directorName: string;
  id: number;
  posterUrl: string | null;
  releaseDate: string;
  title: string;
};

type TmdbMovieDetails = {
  id: number;
  poster_path: string | null;
  title: string;
};

type TmdbSearchMovie = {
  id: number;
  poster_path: string | null;
  release_date: string;
  title: string;
};

type TmdbSearchResponse = {
  results: TmdbSearchMovie[];
};

type TmdbCreditsResponse = {
  crew: Array<{
    job: string;
    name: string;
  }>;
};

const TMDB_API_BASE = "https://api.themoviedb.org/3";
const TMDB_MOVIE_BASE = "https://www.themoviedb.org/movie";
const TMDB_POSTER_BASE = "https://image.tmdb.org/t/p/w780";

function getAccessToken() {
  return process.env.TMDB_ACCESS_TOKEN;
}

async function tmdbFetch<T>(path: string, searchParams?: URLSearchParams) {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("Missing TMDB_ACCESS_TOKEN");
  }

  const url = new URL(`${TMDB_API_BASE}${path}`);

  if (searchParams) {
    url.search = searchParams.toString();
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export function parseMovieIds(rawId: string | string[] | undefined) {
  const values = Array.isArray(rawId) ? rawId : rawId ? [rawId] : [];

  return [
    ...new Set(
      values
        .flatMap((value) => value.split(","))
        .map((value) => Number.parseInt(value.trim(), 10))
        .filter((value) => Number.isInteger(value) && value > 0),
    ),
  ];
}

export async function fetchMoviePoster(id: number) {
  try {
    const movie = await tmdbFetch<TmdbMovieDetails>(`/movie/${id}`);

    if (!movie.poster_path) {
      return null;
    }

    return {
      id: movie.id,
      movieUrl: `${TMDB_MOVIE_BASE}/${movie.id}`,
      title: movie.title,
      posterUrl: `${TMDB_POSTER_BASE}${movie.poster_path}`,
    } satisfies PosterMovie;
  } catch {
    return null;
  }
}

export async function fetchMoviePosters(ids: number[]) {
  if (ids.length === 0) {
    return [];
  }

  const results = await Promise.all(ids.map((id) => fetchMoviePoster(id)));

  return results.filter((movie): movie is PosterMovie => movie !== null);
}

async function fetchMovieDirectorName(id: number) {
  try {
    const credits = await tmdbFetch<TmdbCreditsResponse>(`/movie/${id}/credits`);
    return credits.crew.find((member) => member.job === "Director")?.name ?? "Unknown";
  } catch {
    return "Unknown";
  }
}

export async function searchMovies(query: string) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const searchParams = new URLSearchParams({
    query: trimmedQuery,
    include_adult: "false",
    language: "zh-TW",
    page: "1",
  });

  const response = await tmdbFetch<TmdbSearchResponse>("/search/movie", searchParams);

  const movies = response.results.slice(0, 18);
  const directorNames = await Promise.all(
    movies.map((movie) => fetchMovieDirectorName(movie.id)),
  );

  return movies.map((movie, index) => ({
    directorName: directorNames[index] ?? "Unknown",
    id: movie.id,
    posterUrl: movie.poster_path ? `${TMDB_POSTER_BASE}${movie.poster_path}` : null,
    releaseDate: movie.release_date,
    title: movie.title,
  })) satisfies SearchMovie[];
}
