/** Set PNG physical resolution without changing its authoritative pixel data. */
export function setPngDpi(png: Uint8Array, dpi: number) {
  if (png.length < 33 || png[0] !== 137 || png[1] !== 80)
    throw new Error("Invalid PNG");
  const ppm = Math.round(dpi / 0.0254),
    chunk = new Uint8Array(21),
    view = new DataView(chunk.buffer);
  view.setUint32(0, 9);
  chunk.set([112, 72, 89, 115], 4);
  view.setUint32(8, ppm);
  view.setUint32(12, ppm);
  chunk[16] = 1;
  let crc = 0xffffffff;
  for (const byte of chunk.subarray(4, 17)) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  view.setUint32(17, (crc ^ 0xffffffff) >>> 0);
  const parts: Uint8Array[] = [png.subarray(0, 8)];
  let at = 8;
  while (at + 12 <= png.length) {
    const length = new DataView(png.buffer, png.byteOffset + at, 4).getUint32(
        0,
      ),
      end = at + length + 12;
    if (end > png.length) throw new Error("Corrupt PNG chunk");
    const type = String.fromCharCode(...png.subarray(at + 4, at + 8));
    if (type !== "pHYs") parts.push(png.subarray(at, end));
    if (type === "IHDR") parts.push(chunk);
    at = end;
  }
  const result = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const p of parts) {
    result.set(p, offset);
    offset += p.length;
  }
  return result;
}
