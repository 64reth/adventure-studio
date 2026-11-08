import { env } from "cloudflare:workers";
import { z } from "zod";
import { AdventureSchema } from "../../../../../packages/core/index";
import { exportPackage } from "../../../../../packages/print/export";
const RequestSchema = z.object({
  adventure: AdventureSchema,
  mode: z.enum(["review", "publication"]),
  profile: z.enum(["no-bleed", "kdp-bleed"]),
});
async function boundedBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing request body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 2_000_000) {
      await reader.cancel();
      throw new Error("Request too large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let at = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, at);
    at += chunk.length;
  }
  return new TextDecoder().decode(bytes);
}
export async function POST(request: Request) {
  try {
    if (Number(request.headers.get("content-length") ?? 0) > 2_000_000)
      return Response.json({ error: "Request too large" }, { status: 413 });
    const input = RequestSchema.parse(JSON.parse(await boundedBody(request)));
    const fontResponse = await env.ASSETS.fetch(
      new Request(new URL("/fonts/OpenSans-Regular.ttf", request.url)),
    );
    if (!fontResponse.ok) throw new Error("Embedded font unavailable");
    const fonts: Record<string, Uint8Array> = {};
    for (const name of ["Fredoka", "Nunito"]) {
      const r = await env.ASSETS.fetch(
        new Request(
          new URL(`/fonts/${name.toLowerCase()}/${name}-Print.ttf`, request.url),
        ),
      );
      if (!r.ok) throw new Error(`${name} font unavailable`);
      fonts[name] = new Uint8Array(await r.arrayBuffer());
    }
    const zip = await exportPackage(
      input.adventure,
      new Uint8Array(await fontResponse.arrayBuffer()),
      { ...input, fonts },
    );
    const bytes = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
    });
    console.log(
      JSON.stringify({
        event: "export_completed",
        pages: input.adventure.pages.length,
        mode: input.mode,
        profile: input.profile,
      }),
    );
    return new Response(new Uint8Array(bytes).buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition":
          'attachment; filename="adventure-studio-export.zip"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Export failed" },
      { status: 400 },
    );
  }
}
