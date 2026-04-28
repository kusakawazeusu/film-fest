import PosterReveal from "@/app/poster-reveal";
import { fetchMoviePosters, parseMovieIds } from "@/lib/tmdb";

type SearchParams = Promise<{ id?: string | string[]; title?: string | string[] }>;

function parseFestivalTitle(rawTitle: string | string[] | undefined) {
  if (Array.isArray(rawTitle)) {
    return rawTitle.find((value) => value.trim())?.trim() || "FILM FESTIVAL";
  }

  return rawTitle?.trim() || "FILM FESTIVAL";
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { id, title } = await searchParams;
  const movieIds = parseMovieIds(id);
  const posters = await fetchMoviePosters(movieIds);
  const festivalTitle = parseFestivalTitle(title);

  return <PosterReveal posters={posters} festivalTitle={festivalTitle} />;
}
