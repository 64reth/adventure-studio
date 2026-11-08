/** Export generation is read-only/idempotent; retry transient capacity failures once. */
export async function requestExport(
  body: unknown,
  options: {
    fetcher?: typeof fetch;
    pause?: (ms: number) => Promise<void>;
    onRetry?: () => void;
  } = {},
) {
  const fetcher = options.fetcher ?? fetch,
    pause =
      options.pause ??
      ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  for (let attempt = 0; attempt < 2; attempt++) {
    let response: Response;
    try {
      response = await fetcher("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (e) {
      if (attempt === 0) {
        options.onRetry?.();
        await pause(1500);
        continue;
      }
      throw new Error(
        "Export connection failed. Your saved layout is safe; retry when the connection is available.",
      );
    }
    if (response.ok) return response;
    const text = await response.text();
    if (response.status >= 500 && attempt === 0) {
      options.onRetry?.();
      await pause(1500);
      continue;
    }
    if (response.status >= 500)
      throw new Error(
        "The staging export service reached a temporary resource limit. Try again shortly or export fewer pages. Your saved layout is safe.",
      );
    let message = `Export failed (HTTP ${response.status})`;
    try {
      const parsed = JSON.parse(text) as { error?: unknown };
      if (typeof parsed.error === "string") message = parsed.error;
    } catch {}
    throw new Error(message);
  }
  throw new Error("Export did not complete. Please retry.");
}
