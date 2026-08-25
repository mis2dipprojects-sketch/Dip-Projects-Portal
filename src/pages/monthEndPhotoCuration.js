// 1) Dedupe exact-URL duplicates.
// 2) Guarantee at least one photo per category survives the trim, even if
//    the even date-spread sampling below would otherwise skip it.
// 3) If the pool is still large, take an even date-spread sample of the
//    rest so the AI vision call stays bounded in size/cost.

export function curatePhotos(photos, candidateCap = 40) {
  const seen = new Set();
  const deduped = photos.filter((p) => {
    if (!p.url) return false;
    const key = p.url.split("?")[0];
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (deduped.length <= candidateCap) return deduped;

  const sorted = [...deduped].sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

  // One guaranteed representative per category (first occurrence, chronologically).
  const guaranteed = [];
  const seenTypes = new Set();
  for (const p of sorted) {
    if (!seenTypes.has(p.type)) {
      guaranteed.push(p);
      seenTypes.add(p.type);
    }
  }

  const remainingCap = Math.max(0, candidateCap - guaranteed.length);
  const rest = sorted.filter((p) => !guaranteed.includes(p));
  const step = rest.length / remainingCap || 1;
  const picked = [];
  for (let i = 0; i < remainingCap && i < rest.length; i++) {
    picked.push(rest[Math.floor(i * step)]);
  }

  return [...guaranteed, ...picked];
}

async function toThumbnailBase64(url, maxW = 220, quality = 0.5) {
  const res = await fetch(url);
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, maxW / bitmap.width);
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, w, h);
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  return dataUrl.split(",")[1]; // base64 only, no data: prefix
}

// URL doesn't abort the whole batch.
export async function buildPhotoThumbnails(photos, onProgress) {
  const out = [];
  for (let i = 0; i < photos.length; i++) {
    try {
      const dataUrl = await toThumbnailBase64(photos[i].url);
      out.push({ index: i, dataUrl, caption: photos[i].caption || photos[i].type || "" });
    } catch (e) {
      console.warn("Thumbnail failed for", photos[i].url, e);
    }
    onProgress?.(i + 1, photos.length);
  }
  return out;
}