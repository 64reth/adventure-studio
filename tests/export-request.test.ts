import { test, expect, vi } from "vitest";
import { requestExport } from "../packages/print/request";
test("transient resource response retries once and preserves the exact export payload", async () => {
  const calls: string[] = [],
    pause = vi.fn(async () => {});
  const fetcher: typeof fetch = async (_input, init) => {
    calls.push(String(init?.body));
    return calls.length === 1
      ? new Response("<html>resource limit</html>", { status: 500 })
      : new Response("zip", { status: 200 });
  };
  const result = await requestExport(
    { mode: "review", seed: "unchanged" },
    { fetcher, pause },
  );
  expect(result.ok).toBe(true);
  expect(calls).toHaveLength(2);
  expect(calls[0]).toBe(calls[1]);
  expect(pause).toHaveBeenCalledWith(1500);
});
test("approval and validation errors are never retried or bypassed", async () => {
  const fetcher = vi.fn<typeof fetch>(async () =>
    Response.json({ error: "Human approval required" }, { status: 400 }),
  );
  await expect(requestExport({}, { fetcher })).rejects.toThrow(
    "Human approval required",
  );
  expect(fetcher).toHaveBeenCalledTimes(1);
});
test("repeat capacity failure gives a clear error instead of trying to parse Cloudflare HTML", async () => {
  const fetcher = vi.fn<typeof fetch>(
    async () => new Response("<html>resource limit</html>", { status: 503 }),
  );
  await expect(
    requestExport({}, { fetcher, pause: async () => {} }),
  ).rejects.toThrow("temporary resource limit");
  expect(fetcher).toHaveBeenCalledTimes(2);
});
