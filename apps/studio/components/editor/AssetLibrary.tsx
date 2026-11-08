"use client";
import { useEffect, useState } from "react";
import { Upload, Star, CheckCircle, Image as ImageIcon } from "lucide-react";
import {
  LibraryAssetSchema,
  type LibraryAsset,
} from "../../../../packages/editor/schema";
import {
  safeSvg,
  contentHash,
  readLibrary,
  writeLibrary,
} from "../../../../packages/editor/assets";
export default function AssetLibrary({
  onUse,
}: {
  onUse?: (asset: LibraryAsset) => void;
}) {
  const [assets, setAssets] = useState<LibraryAsset[]>([]),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("All"),
    [error, setError] = useState(""),
    [licence, setLicence] = useState(""),
    [review, setReview] = useState(""),
    [active, setActive] = useState("");
  useEffect(() => {
    try {
      setAssets(
        LibraryAssetSchema.array()
          .parse(readLibrary())
          .map((a) => ({ ...a, svg: safeSvg(a.svg) })),
      );
    } catch (e) {
      setError(String(e));
    }
  }, []);
  function save(next: LibraryAsset[]) {
    writeLibrary(next);
    setAssets(next);
  }
  async function importFile(file: File) {
    if (file.size > 3_000_000) throw new Error("Import images below 3 MB");
    if (!licence.trim())
      throw new Error(
        "Record the source and commercial-use licence before importing",
      );
    let svg = "";
    if (file.type === "image/svg+xml" || file.name.endsWith(".svg"))
      svg = safeSvg(await file.text());
    else {
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
        throw new Error("Use SVG, PNG, JPEG or WebP");
      const url = URL.createObjectURL(file);
      try {
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Image could not be decoded"));
          img.src = url;
        });
        const scale = 160 / Math.max(img.width, img.height),
          w = Math.max(1, Math.round(img.width * scale)),
          h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const pixels = ctx.getImageData(0, 0, w, h).data;
        let d = "";
        for (let y = 0; y < h; y++) {
          let start = -1;
          for (let x = 0; x <= w; x++) {
            const i = (y * w + x) * 4,
              dark =
                x < w &&
                pixels[i] * 0.299 +
                  pixels[i + 1] * 0.587 +
                  pixels[i + 2] * 0.114 <
                  140;
            if (dark && start < 0) start = x;
            if (!dark && start >= 0) {
              d += `M${start} ${y}h${x - start}v1h-${x - start}Z`;
              start = -1;
            }
          }
        }
        svg = safeSvg(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><path fill="black" d="${d}"/></svg>`,
        );
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    const existing = assets.find((a) => a.name === file.name),
      asset: LibraryAsset = {
        id: crypto.randomUUID(),
        familyId: existing?.familyId ?? crypto.randomUUID(),
        name: file.name,
        category: "Decorative",
        tags: [],
        favourite: false,
        version: (existing?.version ?? 0) + 1,
        svg,
        source: `Imported ${file.name} (${file.type || "SVG"})`,
        licence,
        hash: await contentHash(svg),
        createdAt: new Date().toISOString(),
        review: "Needs Review",
        reviewNote: "",
      };
    save([LibraryAssetSchema.parse(asset), ...assets]);
    setActive(asset.id);
  }
  const selected = assets.find((a) => a.id === active);
  return (
    <section className="asset-library">
      <div className="section-title">
        <h2>Reusable assets</h2>
        <span className="badge">{assets.length} assets · device-local</span>
      </div>
      <div className="asset-import">
        <label>
          Source & commercial-use licence
          <input
            value={licence}
            onChange={(e) => setLicence(e.target.value)}
            placeholder="Original work, or record permission and licence"
          />
        </label>
        <label className="upload-button">
          <Upload size={18} /> Import SVG or image
          <input
            aria-label="Import asset"
            type="file"
            accept=".svg,image/png,image/jpeg,image/webp"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f)
                try {
                  await importFile(f);
                  setError("");
                } catch (e) {
                  setError(String(e));
                }
            }}
          />
        </label>
      </div>
      <p className="small muted">
        Raster images become a monochrome vector mask. SVGs must be
        self-contained black-and-white paths; convert text to outlines.
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="actions">
        <input
          aria-label="Search assets"
          placeholder="Search names and tags…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Asset category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {[
            "All",
            ...LibraryAssetSchema.shape.category.options,
            "Favourites",
          ].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="asset-grid">
        {assets
          .filter(
            (a) =>
              (a.name + " " + a.tags.join(" "))
                .toLowerCase()
                .includes(search.toLowerCase()) &&
              (category === "All" ||
                (category === "Favourites" && a.favourite) ||
                a.category === category),
          )
          .map((a) => (
            <article
              key={a.id}
              className={`asset-tile ${active === a.id ? "chosen" : ""}`}
            >
              <button
                className="asset-preview"
                onClick={() => setActive(a.id)}
                aria-label={`Inspect ${a.name}`}
                dangerouslySetInnerHTML={{ __html: a.svg }}
              />
              <strong>{a.name}</strong>
              <small>
                v{a.version} · {a.review}
              </small>
              <div className="actions">
                <button
                  aria-label={`Favourite ${a.name}`}
                  aria-pressed={a.favourite}
                  onClick={() =>
                    save(
                      assets.map((x) =>
                        x.id === a.id ? { ...x, favourite: !x.favourite } : x,
                      ),
                    )
                  }
                >
                  <Star size={16} fill={a.favourite ? "#FFE49A" : "none"} />
                </button>
                {onUse && <button onClick={() => onUse(a)}>Add to page</button>}
              </div>
            </article>
          ))}
      </div>
      {!assets.length && (
        <div className="empty">
          <ImageIcon size={36} />
          <p>
            Your reusable artwork belongs here.
            <br />
            Import an original asset to begin.
          </p>
        </div>
      )}
      {selected && (
        <div className="card panel">
          <h3>
            {selected.name} · version {selected.version}
          </h3>
          <label>
            Category
            <select
              value={selected.category}
              onChange={(e) =>
                save(
                  assets.map((a) =>
                    a.id === selected.id
                      ? {
                          ...a,
                          category: e.target.value as LibraryAsset["category"],
                        }
                      : a,
                  ),
                )
              }
            >
              {LibraryAssetSchema.shape.category.options.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Tags
            <input
              defaultValue={selected.tags.join(", ")}
              key={selected.id}
              onBlur={(e) =>
                save(
                  assets.map((a) =>
                    a.id === selected.id
                      ? {
                          ...a,
                          tags: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        }
                      : a,
                  ),
                )
              }
            />
          </label>
          <p className="small">
            {selected.source}
            <br />
            {selected.licence}
            <br />
            SHA-256: {selected.hash}
          </p>
          <label>
            Asset rights review note
            <input value={review} onChange={(e) => setReview(e.target.value)} />
          </label>
          <button
            disabled={!review.trim()}
            onClick={() => {
              save(
                assets.map((a) =>
                  a.id === selected.id
                    ? { ...a, review: "Approved", reviewNote: review }
                    : a,
                ),
              );
              setReview("");
            }}
          >
            <CheckCircle size={16} /> Approve asset rights
          </button>
          <p className="small muted">
            Approval records your assessment; it is not automated legal
            clearance.
          </p>
        </div>
      )}
    </section>
  );
}
