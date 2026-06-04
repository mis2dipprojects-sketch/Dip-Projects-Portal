

async function normaliseLogo(src) {
  if (!src) return null;
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const cv = document.createElement("canvas");
      cv.width  = img.naturalWidth  || 200;
      cv.height = img.naturalHeight || 200;
      cv.getContext("2d").drawImage(img, 0, 0);
      resolve(cv.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function esc(s) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmt12h(t) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function bulletLines(txt) {
  if (!txt || !txt.trim()) return "";
  const lines = txt.split("\n").filter(l => l.trim());
  if (!lines.length) return "";
  return lines.map(l =>
    `<div class="bullet-row"><span class="bullet-dot">&#9654;</span><span>${esc(l.replace(/^[•\-*]\s*/, "").trim())}</span></div>`
  ).join("");
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function ensureDeps() {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
}

// ─── shared CSS injected into every page wrapper ────────────────────────────

const SHARED_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body, .page-root {
    font-family: "Segoe UI", Arial, sans-serif;
    font-size: 14px; line-height: 1.6; color: #1a1a1a; background: #fff;
  }
  .cover-top { display: flex; justify-content: space-between; align-items: center;
    padding-bottom: 14px; border-bottom: 2px solid #0f172a; margin-bottom: 18px; }
  .brand { display: flex; align-items: center; gap: 14px; }
  .brand img { height: 48px; }
  .brand-name { font-size: 18px; font-weight: 800; letter-spacing: 1.4px;
    text-transform: uppercase; color: #0f172a; }
  .brand-sub { font-size: 13px; color: #64748b; margin-top: 2px; }
  .doc-info { text-align: right; }
  .doc-site { font-size: 18px; font-weight: 800; color: #0f172a; }
  .doc-sub  { font-size: 13px; color: #64748b; margin-top: 3px; }
  .cover-type { font-size: 13px; font-weight: 700; letter-spacing: 3px;
    text-transform: uppercase; color: #64748b; margin-bottom: 5px; }
  .cover-title { font-size: 36px; font-weight: 900; color: #0f172a;
    letter-spacing: -0.5px; line-height: 1.05; margin-bottom: 8px; }
  .cover-sub { font-size: 13px; color: #64748b; border-left: 3px solid #1e3a5f;
    padding-left: 10px; margin-bottom: 20px; }
  .cover-accent { height: 5px; background: #1e3a5f; margin-bottom: 18px; }
  .meta-bar { display: table; width: 100%; border-collapse: collapse;
    border: 1.5px solid #c2cfe0; }
  .meta-cell { display: table-cell; padding: 11px 16px;
    border-right: 1.5px solid #c2cfe0; vertical-align: top; }
  .meta-cell:last-child { border-right: none; }
  .meta-key { display: block; font-size: 10px; font-weight: 700; letter-spacing: 1.8px;
    text-transform: uppercase; color: #1e3a5f; margin-bottom: 4px; }
  .meta-val { display: block; font-size: 15px; font-weight: 800; color: #0f172a; }
  .divider { height: 3px; background: #1e3a5f; margin: 18px 0 22px; }
  .section-block { margin-bottom: 20px; border: 1.5px solid #c2cfe0; }
  .sec-header { display: flex; align-items: center; gap: 10px;
    background: #1e3a5f; padding: 10px 16px; }
  .sec-num { background: rgba(255,255,255,.22); color: #fff; font-size: 13px;
    font-weight: 900; width: 26px; height: 26px; display: flex;
    align-items: center; justify-content: center; flex-shrink: 0; }
  .sec-title { font-size: 16px; font-weight: 800; letter-spacing: .6px;
    text-transform: uppercase; color: #fff; }
  .sec-body { padding: 14px 18px; background: #fff; }
  .photo-sec-body { padding: 14px 12px; }
  .bullet-row { display: flex; align-items: flex-start; gap: 10px;
    padding: 6px 0; border-bottom: 1px solid #dde4ed; }
  .bullet-row:last-child { border-bottom: none; }
  .bullet-dot { color: #1e3a5f; font-size: 10px; margin-top: 3px; flex-shrink: 0; }
  .photo-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
  .photo-card { background: #fff; border: 1.5px solid #e8d5c8; overflow: hidden; }
  .photo-card img { width: 100%; height: 260px; object-fit: cover; display: block; }
  .photo-cap { padding: 6px 10px; font-size: 12px; font-weight: 600; text-align: center;
    color: #64748b; background: #f0f4f9; border-top: 1px solid #c2cfe0; }
  .ty-wrap { display: flex; flex-direction: column; align-items: center;
    justify-content: center; height: 100%; text-align: center; padding: 60px 40px; }
  .ty-logo { width: 90px; margin-bottom: 22px; opacity: .85; }
  .ty-line { width: 60px; height: 4px; background: #1e3a5f; margin: 0 auto 20px; }
  .ty-title { font-size: 30px; font-weight: 900; color: #0f172a; margin-bottom: 10px; }
  .ty-sub { font-size: 15px; color: #64748b; max-width: 380px;
    margin: 0 auto 24px; line-height: 1.7; }
  .ty-badge { display: inline-block; background: #1e3a5f; color: #fff;
    font-size: 12px; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; padding: 8px 22px; }
  .ty-meta { margin-top: 28px; font-size: 11px; color: #94a3b8; letter-spacing: .5px; }
  .watermark-wrap { position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    pointer-events: none; z-index: 9999; overflow: hidden; }
  .watermark-wrap img { width: 52%; opacity: 0.06; }
  .content { position: relative; z-index: 1; }
`;

// ─── page HTML builders ─────────────────────────────────────────────────────

/** Wraps inner HTML in a full-page div at A4 width with shared CSS */
function pageWrap(innerHtml, logoB64, { minHeight = null } = {}) {
  const wm = logoB64
    ? `<div class="watermark-wrap"><img src="${logoB64}" alt=""></div>`
    : "";
  const mh = minHeight ? `min-height:${minHeight}px;` : "";
  return `
    <style>${SHARED_CSS}</style>
    <div class="page-root" style="width:794px;padding:54px 36px;background:#fff;
         position:relative;${mh}">
      ${wm}
      <div class="content">${innerHtml}</div>
    </div>`;
}

/** Returns just the cover header HTML snippet (no pageWrap — sections follow on same page) */
function coverHeaderHtml(data, logoB64) {
  const { visit_date, visit_time, site_name, reporter_name, designation } = data;
  const dispDate  = fmtDate(visit_date);
  const dispTime  = fmt12h(visit_time);
  const logoBrand = logoB64 ? `<img src="${logoB64}" alt="DIP Projects">` : "";
  return `
    <div class="cover-top">
      <div class="brand">
        ${logoBrand}
        <div>
          <div class="brand-name">DIP Projects</div>
          <div class="brand-sub">Civil Project Management Consultants</div>
        </div>
      </div>
      <div class="doc-info">
        <div class="doc-site">${esc(site_name)}</div>
        <div class="doc-sub">${esc(reporter_name)} &middot; ${esc(dispDate)}</div>
      </div>
    </div>
    <div class="cover-type">O F F I C I A L &nbsp; S I T E &nbsp; I N S P E C T I O N</div>
    <div class="cover-title">SITE VISIT REPORT</div>
    <div class="cover-accent"></div>
    <div class="cover-sub">An official inspection and progress update prepared by the Project Management Consultant.</div>
    <div class="meta-bar">
      <div class="meta-cell"><span class="meta-key">VISIT DATE</span><span class="meta-val">${esc(dispDate)}</span></div>
      <div class="meta-cell"><span class="meta-key">VISIT TIME</span><span class="meta-val">${esc(dispTime)}</span></div>
      <div class="meta-cell"><span class="meta-key">REPORTED BY</span><span class="meta-val">${esc(reporter_name)}</span></div>
      <div class="meta-cell"><span class="meta-key">DESIGNATION</span><span class="meta-val">${esc(designation || "—")}</span></div>
    </div>
    <div class="divider"></div>`;
}

function buildSectionPageHtml(sections, logoB64) {
  // sections = array of { secNum, title, bodyHtml }
  const blocks = sections.map(s => `
    <div class="section-block">
      <div class="sec-header">
        <span class="sec-num">${s.secNum}</span>
        <span class="sec-title">${s.title}</span>
      </div>
      <div class="sec-body">${s.bodyHtml}</div>
    </div>`).join("");

  return pageWrap(blocks, logoB64);
}

function buildPhotoPageHtml(secNum, photoGroup, logoB64, showHeader) {
  // photoGroup = up to 4 photos [{dataUrl, caption}]
  const cards = photoGroup.map(ph => `
    <div class="photo-card">
      <img src="${ph.dataUrl}" alt="site photo">
      ${ph.caption ? `<div class="photo-cap">${esc(ph.caption)}</div>` : ""}
    </div>`).join("");

  const header = showHeader ? `
    <div class="sec-header" style="margin-bottom:0">
      <span class="sec-num">${secNum}</span>
      <span class="sec-title">Site Progress Photos</span>
    </div>` : "";

  return pageWrap(`
    <div class="section-block" style="margin-bottom:0">
      ${header}
      <div class="sec-body photo-sec-body">
        <div class="photo-grid">${cards}</div>
      </div>
    </div>`, logoB64);
}

function buildThankYouPageHtml(data, logoB64) {
  const genTime = new Date().toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const logoTy = logoB64 ? `<img class="ty-logo" src="${logoB64}" alt="DIP Projects">` : "";

  return pageWrap(`
    <div class="ty-wrap">
      ${logoTy}
      <div class="ty-line"></div>
      <div class="ty-title">Thank You</div>
      <div class="ty-sub">This report has been prepared to ensure transparency, quality, and
        continuous improvement at the project site. Your commitment to excellence drives every milestone.</div>
      <div class="ty-badge">DIP Projects</div>
      <div class="ty-meta">Generated ${esc(genTime)} &nbsp;|&nbsp; Site Visit Report &nbsp;|&nbsp; ${esc(data.site_name)}</div>
    </div>`, logoB64, { minHeight: 900 });
}

// ─── page layout planning ───────────────────────────────────────────────────

/**
 * Returns an array of "page descriptors", each with an { html } string.
 * Sections are packed onto pages greedily by estimated height.
 * Photo pairs (2-up grid) and the Thank You page each get their own page.
 */
function planPages(data, photos, logoB64) {
  const pages = [];

  // Build section list
  const SECTION_DEFS = [
    { key: "progress_of_work",        title: "Progress of Work &amp; Ongoing Activities" },
    { key: "quality_observations",    title: "Quality Observations" },
    { key: "safety_concerns",         title: "Safety Concerns" },
    { key: "issues_concerns",         title: "Issues &amp; Concerns" },
    { key: "site_visit_instructions", title: "Site Visit Instructions" },
    { key: "key_instructions",        title: "Key Instructions" },
  ];

  let secNum = 0;
  const sectionItems = [];
  for (const def of SECTION_DEFS) {
    const body = bulletLines(data[def.key]);
    if (!body) continue;
    secNum++;
    sectionItems.push({ secNum, title: def.title, bodyHtml: body });
  }

  // Estimate height of a section in px (header ~46px + ~34px per bullet + 20 margin)
  function estHeight(s) {
    const bullets = (s.bodyHtml.match(/bullet-row/g) || []).length;
    return 46 + bullets * 34 + 20;
  }

  // A4 content height in px (794 * 297/210) minus top+bottom padding (108px total)
  const PAGE_H = Math.floor(794 * 297 / 210) - 108;

  // Cover header consumes ~290px on page 1 (title + meta bar + divider)
  const COVER_H = 290;

  // ── page 1: cover header + as many sections as fit ──
  let currentSections = [];
  let currentH = COVER_H; // page 1 starts already occupied by cover header

  function flushPage(isFirst) {
    if (isFirst) {
      // Combine cover header + sections into one pageWrap
      const blocks = currentSections.map(s => `
        <div class="section-block">
          <div class="sec-header">
            <span class="sec-num">${s.secNum}</span>
            <span class="sec-title">${s.title}</span>
          </div>
          <div class="sec-body">${s.bodyHtml}</div>
        </div>`).join("");
      pages.push({ html: pageWrap(coverHeaderHtml(data, logoB64) + blocks, logoB64) });
    } else {
      pages.push({ html: buildSectionPageHtml(currentSections, logoB64) });
    }
    currentSections = [];
    currentH = 0;
  }

  let isFirstPage = true;
  for (const s of sectionItems) {
    const h = estHeight(s);
    if (currentH + h > PAGE_H && currentSections.length > 0) {
      flushPage(isFirstPage);
      isFirstPage = false;
    }
    currentSections.push(s);
    currentH += h;
  }
  if (currentSections.length > 0) flushPage(isFirstPage);

  // Photo pages: 4 photos per page, always own page(s)
  if (photos && photos.length) {
    secNum++;
    const photoSecNum = secNum;
    for (let gi = 0; gi < photos.length; gi += 4) {
      const group = photos.slice(gi, gi + 4);
      const showHeader = gi === 0;
      pages.push({ html: buildPhotoPageHtml(photoSecNum, group, logoB64, showHeader) });
    }
  }

  // Thank You — always its own page
  pages.push({ html: buildThankYouPageHtml(data, logoB64), isThankyou: true });

  return pages;
}

// ─── render helpers ─────────────────────────────────────────────────────────

/** Mounts html as a hidden div, waits for images, returns the root element */
async function mountHidden(html) {
  const wrap = document.createElement("div");
  Object.assign(wrap.style, {
    position: "fixed", top: "0", left: "-9999px",
    width: "794px", background: "#fff", zIndex: "-1",
  });

  const parser = new DOMParser();
  const doc    = parser.parseFromString(`<html><body>${html}</body></html>`, "text/html");

  doc.querySelectorAll("style").forEach(s => {
    const clone = document.createElement("style");
    clone.textContent = s.textContent;
    wrap.appendChild(clone);
  });
  Array.from(doc.body.childNodes).forEach(n => wrap.appendChild(document.importNode(n, true)));
  document.body.appendChild(wrap);

  // Wait for images
  const imgs = Array.from(wrap.querySelectorAll("img"));
  await Promise.all(imgs.map(img =>
    img.complete ? Promise.resolve()
                 : new Promise(res => { img.onload = res; img.onerror = res; })
  ));
  await new Promise(r => setTimeout(r, 200));
  return wrap;
}

async function renderToCanvas(wrap) {
  const root = wrap.querySelector(".page-root") || wrap;
  return window.html2canvas(root, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    windowWidth: 794,
    scrollX: 0, scrollY: 0,
    foreignObjectRendering: false,
  });
}

// ─── main export ─────────────────────────────────────────────────────────────

export async function generateSiteReportPDF(data, photos = [], logoSrc = null) {
  await ensureDeps();

  const logo  = await normaliseLogo(logoSrc);
  const pages = planPages(data, photos, logo);

  const { jsPDF } = window.jspdf;
  const A4_W = 210, A4_H = 297;
  const MARGIN = 10;
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const totalPages = pages.length;

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage();

    const wrap  = await mountHidden(pages[i].html);
    const canvas = await renderToCanvas(wrap);
    document.body.removeChild(wrap);

    // Fit canvas into A4 content area, preserving aspect ratio
    const pxPerMm = canvas.width / (A4_W - MARGIN * 2);
    const imgH    = canvas.height / pxPerMm;
    const maxH    = A4_H - MARGIN * 2;
    const drawH   = Math.min(imgH, maxH);
    const drawW   = A4_W - MARGIN * 2;

    // If content is taller than one page (rare edge case), scale down to fit
    let srcH = canvas.height;
    if (imgH > maxH) {
      srcH = Math.floor(maxH * pxPerMm);
    }

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width  = canvas.width;
    pageCanvas.height = srcH;
    pageCanvas.getContext("2d").drawImage(
      canvas, 0, 0, canvas.width, srcH,
               0, 0, canvas.width, srcH
    );

    pdf.addImage(pageCanvas.toDataURL("image/jpeg", 0.95), "JPEG",
      MARGIN, MARGIN, drawW, drawH);

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(100);
    pdf.text(
      `Page ${i + 1} of ${totalPages}  ·  DIP Projects  ·  Site Visit Report`,
      A4_W / 2, A4_H - 5, { align: "center" }
    );
  }

  const safeSite = (data.site_name     || "site").replace(/[\s/\\:*?"<>|]/g, "_");
  const safeName = (data.reporter_name || "reporter").replace(/[\s/\\:*?"<>|]/g, "_");
  // pdf.save(`SVR_${safeSite}_${data.visit_date}_${safeName}.pdf`);

  // return { fileName: `SVR_${safeSite}_${data.visit_date}_${safeName}.pdf` };
  const fileName =
  `SVR_${safeSite}_${data.visit_date}_${safeName}.pdf`;

const pdfBlob = pdf.output("blob");

pdf.save(fileName);

return {
  blob: pdfBlob,
  fileName
};
}