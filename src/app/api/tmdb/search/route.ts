import type { NextRequest } from "next/server";

import { searchMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query") ?? "";

  if (!query.trim()) {
    return Response.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const results = await searchMovies(query);

    return Response.json({ results });
  } catch {
    return Response.json(
      { error: "Unable to search TMDB right now." },
      { status: 500 },
    );
  }
}
