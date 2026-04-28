type ReurlResponse = {
  res?: string;
  short_url?: string;
  short_url_with_protocol?: string;
};

function getReurlKey() {
  return process.env.REURL_KEY;
}

export async function POST(request: Request) {
  const reurlKey = getReurlKey();

  if (!reurlKey) {
    return Response.json({ error: "Missing REURL_KEY" }, { status: 500 });
  }

  try {
    const body = (await request.json()) as { url?: string };
    const url = body.url?.trim();

    if (!url) {
      return Response.json({ error: "Missing url" }, { status: 400 });
    }

    const response = await fetch("https://api.reurl.cc/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "reurl-api-key": reurlKey,
      },
      body: JSON.stringify({ url }),
      cache: "no-store",
    });

    const data = (await response.json()) as ReurlResponse;

    if (!response.ok) {
      return Response.json(
        { error: "Unable to shorten URL right now." },
        { status: response.status || 500 },
      );
    }

    const shortUrl =
      data.short_url_with_protocol?.trim() || data.short_url?.trim();

    if (!shortUrl) {
      return Response.json(
        { error: "Unable to read shortened URL." },
        { status: 502 },
      );
    }

    return Response.json({ shortUrl });
  } catch {
    return Response.json(
      { error: "Unable to shorten URL right now." },
      { status: 500 },
    );
  }
}
