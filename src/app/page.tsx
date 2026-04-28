import PosterReveal from "@/app/poster-reveal";
import { fetchMoviePosters, parseMovieIds } from "@/lib/tmdb";

type SearchParams = Promise<{
  id?: string | string[];
  subtitle?: string | string[];
  title?: string | string[];
}>;

function parseFestivalTitle(rawTitle: string | string[] | undefined) {
  if (Array.isArray(rawTitle)) {
    return rawTitle.find((value) => value.trim())?.trim() || "FILM FESTIVAL";
  }

  return rawTitle?.trim() || "FILM FESTIVAL";
}

function parseMovieSubtitles(rawSubtitle: string | string[] | undefined) {
  if (Array.isArray(rawSubtitle)) {
    return rawSubtitle.map((value) => value.trim());
  }

  if (typeof rawSubtitle === "string") {
    return [rawSubtitle.trim()];
  }

  return [];
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { id, subtitle, title } = await searchParams;
  const movieIds = parseMovieIds(id);
  const subtitles = parseMovieSubtitles(subtitle);
  const posters = (await fetchMoviePosters(movieIds)).map((poster, index) => ({
    ...poster,
    subtitle: subtitles[index] || "",
  }));
  const festivalTitle = parseFestivalTitle(title);

  return <PosterReveal posters={posters} festivalTitle={festivalTitle} />;
}
