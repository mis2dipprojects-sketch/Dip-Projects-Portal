import { useState, useEffect, useCallback, useRef } from "react";

// ─── CSS ────────────────────────────────────────────────────────────────────
const WPR_CSS = `
.wpr-wrap {
  --wpr-grad: linear-gradient(135deg, #3d1200 0%, #7a2e00 50%, #c96a10 100%);
  --wpr-1: #3d1200;
  --wpr-2: #7a2e00;
  --wpr-3: #c96a10;
}
.wpr-wrap { max-width: 1500px; margin: 0 auto; }
.wpr-status-bar { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:18px; }
.wpr-pill { display:inline-flex; align-items:center; gap:5px; padding:4px 11px; border-radius:20px; font-size:11.5px; font-weight:700; border:1.5px solid var(--line2); background:var(--paper); color:var(--ink2); transition:all .15s; }
.wpr-pill.done { background:linear-gradient(135deg,#3d1200,#7a2e00,#c96a10); color:#fff; border-color:#c96a10; }
.wpr-pill.partial { background:rgba(201,106,16,0.15); color:#c96a10; border-color:#c96a10; }
.wpr-acc { border:1.5px solid #c96a10; border-radius:12px; margin-bottom:12px; overflow:hidden; background:var(--surface); }
.wpr-acc-hdr { display:flex; align-items:center; gap:12px; padding:0 18px; height:62px; cursor:pointer; user-select:none; background:var(--paper); border-bottom:1px solid transparent; transition:background .15s; }
.wpr-acc.open .wpr-acc-hdr { border-bottom-color:var(--line); }
.wpr-acc-hdr:hover { background:rgba(201,106,16,0.08); }
.wpr-acc-ico { width:36px; height:36px; border-radius:9px; background:linear-gradient(135deg,#3d1200,#7a2e00,#c96a10); display:flex; align-items:center; justify-content:center; color:#fff; font-size:17px; flex-shrink:0; }
.wpr-acc.open .wpr-acc-ico { background:linear-gradient(135deg,#3d1200,#7a2e00,#c96a10); color:#fff; }
.wpr-acc-titles { flex:1; min-width:0; }
.wpr-acc-title { font-size:14px; font-weight:700; color:var(--ink); }
.wpr-acc-sub { font-size:11.5px; color:var(--ink3); margin-top:1px; }
.wpr-acc-arrow { color:var(--ink3); transition:transform .22s; font-size:13px; }
.wpr-acc.open .wpr-acc-arrow { transform:rotate(180deg); }
.wpr-acc-body { display:none; padding:18px; }
.wpr-acc.open .wpr-acc-body { display:block; }
.wpr-g2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.wpr-g3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }
@media(max-width:600px) { .wpr-g2,.wpr-g3 { grid-template-columns:1fr; } }
.wpr-fg { display:flex; flex-direction:column; gap:5px; margin-bottom:14px; }
.wpr-lbl { font-size:11.5px; font-weight:700; color:var(--ink2); }
.wpr-act-card { background:var(--paper); border:1.5px solid #c96a10; border-radius:11px; padding:14px 16px; margin-bottom:12px; position:relative; }
.wpr-act-num { width:32px; height:32px; background:linear-gradient(135deg,#3d1200,#7a2e00,#c96a10); color:#fff; border-radius:8px; font-size:14px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.wpr-act-del { position:absolute; top:12px; right:12px; width:28px; height:28px; background:#fef2f2; border:1.5px solid #fecaca; border-radius:7px; color:#dc2626; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.wpr-plan-item { display:flex; align-items:center; gap:10px; padding:10px 13px; background:var(--paper); border:1.5px solid #c96a10; border-radius:9px; margin-bottom:10px; }
.wpr-plan-num { width:28px; height:28px; border-radius:7px; background:linear-gradient(135deg,#3d1200,#7a2e00,#c96a10); color:#fff; font-size:12px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-family:var(--mono); }
.wpr-plan-item input { border:none!important; background:transparent!important; flex:1; font-size:14px!important; color:var(--ink); padding:0!important; box-shadow:none!important; }
.wpr-drop-zone { border:2px dashed #c96a10; border-radius:11px; padding:28px 20px; text-align:center; cursor:pointer; transition:all .18s; background:var(--paper); }
.wpr-drop-zone:hover,.wpr-drop-zone.over { border-color:#c96a10; background:rgba(201,106,16,0.07); }
.wpr-photo-grid { display:flex; flex-wrap:wrap; gap:10px; margin-top:12px; }
.wpr-photo-card { position:relative; width:140px; border:1.5px solid #c96a10; border-radius:9px; overflow:hidden; background:var(--paper); }
.wpr-photo-card img { width:100%; height:100px; object-fit:cover; display:block; }
.wpr-photo-del { position:absolute; top:5px; right:5px; width:22px; height:22px; background:rgba(220,38,38,.88); color:#fff; border:none; border-radius:50%; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-weight:700; }
.wpr-photo-cap input { width:100%; border:none!important; border-top:1px solid var(--line)!important; border-radius:0!important; font-size:12px!important; padding:6px 8px!important; background:var(--surface)!important; box-shadow:none!important; }
.wpr-tbl-hdr { display:flex; align-items:center; gap:8px; padding:9px 12px; background:linear-gradient(135deg,#3d1200,#7a2e00,#c96a10); border:1.5px solid #c96a10; border-radius:8px 8px 0 0; font-size:11.5px; font-weight:800; color:#fff; text-transform:uppercase; letter-spacing:.06em; }
.wpr-tbl-row { display:grid; gap:8px; align-items:center; padding:8px 12px; background:var(--surface); border:1.5px solid #c96a10; border-top:none; }
.wpr-tbl-row:last-of-type { border-radius:0 0 8px 8px; }
.wpr-tbl-row input { border:1.5px solid transparent!important; background:transparent!important; padding:6px 8px!important; font-size:13px!important; box-shadow:none!important; }
.wpr-tbl-row input:focus { border-color:#c96a10!important; background:var(--paper)!important; border-radius:6px!important; }
.wpr-rc-item { background:var(--surface); border:1.5px solid #c96a10; border-radius:10px; margin-bottom:10px; overflow:hidden; }
.wpr-rc-hdr { display:flex; align-items:center; gap:9px; padding:12px 14px; background:var(--paper); border-bottom:1px solid var(--line); flex-wrap:wrap; }
.wpr-rc-badge { width:30px; height:30px; border-radius:8px; background:linear-gradient(135deg,#3d1200,#7a2e00,#c96a10); border:1px solid #c96a10; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; color:#fff; }
.wpr-rc-title { flex:1; min-width:120px; font-size:13.5px; font-weight:700; color:var(--ink); background:transparent; border:none; outline:none; }
.wpr-rc-actions { display:flex; gap:5px; margin-left:auto; }
.wpr-rc-btn { width:30px; height:30px; border-radius:7px; border:1.5px solid var(--line2); background:var(--surface); color:var(--ink2); font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .13s; }
.wpr-rc-btn:hover { border-color:#c96a10; color:#c96a10; }
.wpr-rc-btn.hide-active { background:linear-gradient(135deg,#3d1200,#7a2e00,#c96a10); border-color:#c96a10; color:#fff; }
.wpr-rc-btn.del:hover { border-color:#dc2626; color:#dc2626; background:#fef2f2; }
.wpr-hint { display:flex; gap:9px; background:rgba(201,106,16,0.07); border:1px solid #c96a10; border-radius:9px; padding:11px 14px; font-size:12.5px; color:#7a2e00; line-height:1.55; margin-bottom:14px; }
.wpr-budget { display:flex; align-items:center; gap:10px; padding:9px 14px; background:var(--paper); border:1px solid var(--line); border-radius:9px; margin-bottom:14px; }
.wpr-budget-track { flex:1; height:7px; background:var(--line2); border-radius:7px; overflow:hidden; }
.wpr-budget-fill { height:100%; border-radius:7px; transition:width .35s,background .35s; background:linear-gradient(135deg,#3d1200,#7a2e00,#c96a10)!important; }
.wpr-draft-banner { display:flex; align-items:center; gap:12px; padding:12px 16px; background:rgba(201,106,16,0.07); border:1.5px solid #c96a10; border-radius:10px; margin-bottom:16px; font-size:13px; }
.wpr-draft-title { font-weight:700; color:#7a2e00; flex:1; }
.wpr-draft-sub { font-size:11.5px; color:#c96a10; margin-top:1px; }
.wpr-fab-wrap { position:sticky; bottom:0; padding:12px 0 4px; background:linear-gradient(to top,var(--paper) 70%,transparent); pointer-events:none; margin-top:20px; }
.wpr-fab { width:100%; height:56px; background:linear-gradient(135deg,#3d1200,#7a2e00,#c96a10); border:none; border-radius:14px; font-family:var(--font); font-size:16px; font-weight:800; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; pointer-events:all; box-shadow:0 4px 18px rgba(61,18,0,0.4); transition:all .15s; }
.wpr-fab:hover { background:linear-gradient(135deg,#4a1600,#8f3600,#d97a20); transform:translateY(-1px); }
.wpr-fab:disabled { opacity:.6; cursor:not-allowed; transform:none; }
.wpr-overlay { position:fixed; inset:0; z-index:9999; background:rgba(15,13,10,.88); backdrop-filter:blur(12px); display:flex; align-items:center; justify-content:center; padding:16px; }
.wpr-overlay-card { background:var(--surface); border:1.5px solid #c96a10; border-radius:18px; padding:32px 28px; max-width:480px; width:100%; display:flex; flex-direction:column; align-items:center; gap:14px; text-align:center; box-shadow:0 16px 48px rgba(0,0,0,.3); }
.wpr-spinner { width:48px; height:48px; border:4px solid rgba(201,106,16,0.2); border-top-color:#c96a10; border-radius:50%; animation:wprSpin .7s linear infinite; }
@keyframes wprSpin { to { transform:rotate(360deg); } }
.wpr-progress-bar { width:260px; height:7px; background:var(--line2); border-radius:7px; overflow:hidden; margin-top:4px; }
.wpr-progress-fill { height:100%; background:linear-gradient(135deg,#3d1200,#7a2e00,#c96a10); border-radius:7px; transition:width .5s ease; }
.wpr-toast { position:fixed; bottom:80px; right:16px; z-index:10000; padding:12px 18px; border-radius:11px; font-size:13px; font-weight:700; max-width:300px; box-shadow:0 4px 18px rgba(0,0,0,.15); animation:wprSlideUp .25s ease; }
@keyframes wprSlideUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
.wpr-toast.success { background:#f0fdf4; border:1.5px solid #bbf7d0; color:#15803d; }
.wpr-toast.error { background:#fef2f2; border:1.5px solid #fecaca; color:#dc2626; }
.wpr-toast.info { background:linear-gradient(135deg,#3d1200,#7a2e00,#c96a10); border:1.5px solid #c96a10; color:#fff; }
.wpr-vis-card { background:var(--paper); border:1.5px solid #c96a10; border-radius:10px; padding:13px 15px; margin-bottom:11px; }
.wpr-success-title { font-size:18px; font-weight:800; color:var(--ink); }
.wpr-success-sub { font-size:13px; color:var(--ink2); line-height:1.6; }
.wpr-success-links { width:100%; display:flex; flex-direction:column; gap:10px; margin-top:8px; }
.wpr-link-row { display:flex; align-items:center; gap:10px; padding:12px 14px; background:var(--paper); border:1.5px solid var(--line2); border-radius:10px; text-decoration:none; color:var(--ink); font-size:13px; font-weight:600; transition:all .15s; }
.wpr-link-row:hover { border-color:#c96a10; background:rgba(201,106,16,0.07); }
.wpr-link-icon { font-size:20px; flex-shrink:0; }
.wpr-link-label { flex:1; text-align:left; }
.wpr-link-arrow { color:var(--ink3); font-size:12px; }
`;

const STANDARD_SECTIONS = [
  "Detailed Status of Activities","Graphical Report of Work","Site Photographs",
  "Cube Testing Register","Next Week Planning","Drawing Register","Office Activity",
  "Visitor Register","Drawing & Decision Pending","Weekly Site Checklist",
  "Delay Points / Highlights / Red Flag","MOM Review","Barchart & Worksheet",
];

const VISITOR_TYPES = [
  "Architect","Structural Engineer","Client / Owner","Contractor",
  "Sub-Contractor","Supplier","Government Inspector","Consultant",
  "PMC Representative","Bank / Finance Officer",
];

const zp = (n) => String(parseInt(n) || 1).padStart(2, "0");
const today = () => new Date().toISOString().split("T")[0];

// ─── Image compression ───────────────────────────────────────────────────────
function compress(dataUrl, maxW = 1200, quality = 0.72) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      let q = quality;
      let result = canvas.toDataURL("image/jpeg", q);
      while (result.length / 1024 > 180 && q > 0.3) { q -= 0.06; result = canvas.toDataURL("image/jpeg", q); }
      resolve(result);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => compress(e.target.result).then(resolve);
    reader.readAsDataURL(file);
  });
}

// Strip "data:image/jpeg;base64," prefix → raw base64 string for pptxgenjs
function dataUrlToBase64(dataUrl) {
  return dataUrl.split(",")[1] || "";
}

// Get mime type from dataUrl
function getMime(dataUrl) {
  return dataUrl.split(";")[0].split(":")[1] || "image/jpeg";
}

// pptxgenjs data string format: "image/jpeg;base64,<data>"
function toPptxData(dataUrl) {
  const mime = getMime(dataUrl);
  const b64 = dataUrlToBase64(dataUrl);
  return `${mime};base64,${b64}`;
}

// Upload dataUrl to Supabase Storage, return public URL
async function uploadImage(supabase, dataUrl, path) {
  const base64 = dataUrl.split(",")[1];
  const mime = getMime(dataUrl);
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: mime });
  const { data, error } = await supabase.storage
    .from("wpr-images")
    .upload(path, blob, { contentType: mime, upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from("wpr-images").getPublicUrl(path);
  return urlData.publicUrl;
}

// Upload a Blob (for PPTX file) to Supabase Storage
async function uploadBlob(supabase, blob, path, contentType) {
  const { data, error } = await supabase.storage
    .from("wpr-images")
    .upload(path, blob, { contentType, upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from("wpr-images").getPublicUrl(path);
  return urlData.publicUrl;
}

// ─── Load pptxgenjs dynamically from CDN ────────────────────────────────────
// /let _pptxPromise = null;
// function loadPptxGen() {
//   if (_pptxPromise) return _pptxPromise;
//   _pptxPromise = new Promise((resolve, reject) => {
//     if (window.PptxGenJS) { resolve(window.PptxGenJS); return; }
//     const script = document.createElement("script");
//     script.src = "https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.bundle.js";
//     script.onload = () => resolve(window.PptxGenJS);
//     script.onerror = reject;
//     document.head.appendChild(script);
//   });
//   return _pptxPromise;
// }
// ─── Load pptxgenjs dynamically from CDN ────────────────────────────────────
let _pptxPromise = null;
function loadPptxGen() {
  if (_pptxPromise) return _pptxPromise;
  _pptxPromise = new Promise((resolve, reject) => {
    // If already globally loaded, return the constructor class directly
    if (window.PptxGenJS) { resolve(window.PptxGenJS); return; }
    
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.bundle.js";
    script.onload = () => {
      // 🌟 CRITICAL: Resolve with the global constructor class instead of the module object
      resolve(window.PptxGenJS); 
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return _pptxPromise;
}

// ─── PPT GENERATION ─────────────────────────────────────────────────────────
// Returns a Blob of the generated .pptx
async function generatePPT({ site, engineer, reportDate, reportNum, location,
  activities, graphicalImages, sitePhotos, siteImage,
  plans, drawingHeaders, drawingData, officeItems, visitors,
  drawDecision, delayPoints, checklistPhotos, sections }) {

  // Load the constructor class reference
  const PptxGenJS = window.PptxGenJS;
  if (!PptxGenJS) throw new Error("PptxGenJS not loaded");
  const pres = new PptxGenJS();
  pres.layout = "LAYOUT_WIDE";
  pres.title = `WPR ${zp(reportNum)} — ${site}`;
  pres.author = engineer;

  // Color palette
  const C = {
    amber:  "D97706",
    amber2: "B45309",
    amberBg:"FFFBEB",
    navy:   "1E2761",
    white:  "FFFFFF",
    ink:    "1C1917",
    ink2:   "57534E",
    ink3:   "A8A29E",
    surface:"F5F5F4",
    line:   "E7E5E4",
  };

  const slideW = 10, slideH = 5.625;
  const MARGIN = 0.45;

  // ── Slide helpers ────────────────────────────────────────────────────────
  function addHeader(slide, title) {
    // Dark header bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: slideW, h: 0.72,
      fill: { color: C.navy }, line: { color: C.navy },
    });
    // Amber accent dot
    slide.addShape(pres.shapes.OVAL, {
      x: MARGIN - 0.05, y: 0.16, w: 0.38, h: 0.38,
      fill: { color: C.amber }, line: { color: C.amber },
    });
    slide.addText(title.toUpperCase(), {
      x: MARGIN + 0.42, y: 0, w: slideW - MARGIN - 0.5, h: 0.72,
      fontSize: 15, fontFace: "Calibri", bold: true,
      color: C.white, valign: "middle", margin: 0,
    });
    // Report tag top-right
    slide.addText(`WPR — ${zp(reportNum)}  |  ${site}`, {
      x: 0, y: 0, w: slideW - MARGIN, h: 0.72,
      fontSize: 9, fontFace: "Calibri", color: "CADCFC",
      align: "right", valign: "middle", margin: 0,
    });
  }

  function addFooter(slide) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: slideH - 0.3, w: slideW, h: 0.3,
      fill: { color: C.surface }, line: { color: C.line },
    });
    slide.addText(`${engineer}  |  ${reportDate}  |  ${location || ""}`, {
      x: MARGIN, y: slideH - 0.3, w: slideW - MARGIN * 2, h: 0.3,
      fontSize: 8, fontFace: "Calibri", color: C.ink3, valign: "middle", margin: 0,
    });
  }

  // ── 1. TITLE SLIDE ───────────────────────────────────────────────────────
  {
    const s = pres.addSlide();
    // Background
    s.background = { color: C.navy };

    // Site image if available (left half)
    if (siteImage) {
      try {
        s.addImage({
          data: toPptxData(siteImage),
          x: 0, y: 0, w: 5.5, h: slideH,
          sizing: { type: "cover", w: 5.5, h: slideH },
        });
        // Dark overlay on image
        s.addShape(pres.shapes.RECTANGLE, {
          x: 0, y: 0, w: 5.5, h: slideH,
          fill: { color: "000000", transparency: 40 }, line: { color: "000000", transparency: 40 },
        });
      } catch (e) { /* skip image if corrupt */ }
    }

    // Right panel
    const rx = siteImage ? 5.8 : MARGIN;
    const rw = siteImage ? (slideW - 5.8 - MARGIN) : (slideW - MARGIN * 2);

    s.addText("WEEKLY PROGRESS REPORT", {
      x: rx, y: 1.1, w: rw, h: 0.5,
      fontSize: 10, fontFace: "Calibri", bold: true,
      color: C.amber, charSpacing: 3,
    });
    s.addText(`WPR — ${zp(reportNum)}`, {
      x: rx, y: 1.65, w: rw, h: 1.0,
      fontSize: 40, fontFace: "Calibri", bold: true, color: C.white,
    });
    s.addText(site, {
      x: rx, y: 2.65, w: rw, h: 0.55,
      fontSize: 18, fontFace: "Calibri", bold: true, color: "CADCFC",
    });

    // Info rows
    const infoY = 3.35;
    [
      ["📅", reportDate],
      ["👷", engineer],
      ...(location ? [["📍", location]] : []),
    ].forEach(([icon, val], i) => {
      s.addText(`${icon}  ${val}`, {
        x: rx, y: infoY + i * 0.38, w: rw, h: 0.36,
        fontSize: 12, fontFace: "Calibri", color: C.ink3,
      });
    });
  }

  // ── 2. ACTIVITIES SLIDE ──────────────────────────────────────────────────
  if (activities.filter(a => a.name).length) {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "Detailed Status of Activities");
    addFooter(s);

    const contentY = 0.85;
    const contentH = slideH - contentY - 0.35;
    const colW = (slideW - MARGIN * 2 - 0.1) / 2;

    // Table header
    s.addShape(pres.shapes.RECTANGLE, {
      x: MARGIN, y: contentY, w: slideW - MARGIN * 2, h: 0.32,
      fill: { color: C.amber }, line: { color: C.amber },
    });
    s.addText("Activity", {
      x: MARGIN + 0.08, y: contentY, w: colW - 0.08, h: 0.32,
      fontSize: 10, fontFace: "Calibri", bold: true, color: C.white, valign: "middle", margin: 0,
    });
    s.addText("Status / Remark", {
      x: MARGIN + colW + 0.1, y: contentY, w: colW - 0.08, h: 0.32,
      fontSize: 10, fontFace: "Calibri", bold: true, color: C.white, valign: "middle", margin: 0,
    });

    const rowH = 0.34;
    const maxRows = Math.floor(contentH / rowH) - 1;
    const acts = activities.filter(a => a.name).slice(0, maxRows);

    acts.forEach((act, i) => {
      const ry = contentY + 0.32 + i * rowH;
      const bg = i % 2 === 0 ? C.white : C.surface;
      s.addShape(pres.shapes.RECTANGLE, {
        x: MARGIN, y: ry, w: slideW - MARGIN * 2, h: rowH,
        fill: { color: bg }, line: { color: C.line },
      });
      // Row number badge
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: MARGIN + 0.07, y: ry + 0.06, w: 0.22, h: 0.22,
        fill: { color: C.amber }, line: { color: C.amber }, rectRadius: 0.04,
      });
      s.addText(String(i + 1), {
        x: MARGIN + 0.07, y: ry + 0.06, w: 0.22, h: 0.22,
        fontSize: 8, fontFace: "Calibri", bold: true, color: C.white,
        align: "center", valign: "middle", margin: 0,
      });
      s.addText(act.name, {
        x: MARGIN + 0.34, y: ry, w: colW - 0.34, h: rowH,
        fontSize: 10, fontFace: "Calibri", color: C.ink, valign: "middle", margin: 0,
      });
      s.addText(act.status || "—", {
        x: MARGIN + colW + 0.1, y: ry, w: colW - 0.1, h: rowH,
        fontSize: 10, fontFace: "Calibri", color: C.ink2, valign: "middle", margin: 0,
      });
    });

    // Overflow note
    if (activities.filter(a => a.name).length > maxRows) {
      const remainY = contentY + 0.32 + acts.length * rowH;
      s.addText(`+ ${activities.filter(a=>a.name).length - maxRows} more activities…`, {
        x: MARGIN, y: remainY, w: slideW - MARGIN * 2, h: 0.3,
        fontSize: 9, fontFace: "Calibri", color: C.ink3, italic: true,
      });
    }
  }

  // ── 3. PROGRESS IMAGES (per activity) ───────────────────────────────────
  for (const act of activities) {
    const imgs = (act.progressImages || []).filter(i => i.dataUrl);
    if (!imgs.length) continue;

    // Up to 4 images per activity slide
    const chunks = [];
    for (let i = 0; i < imgs.length; i += 4) chunks.push(imgs.slice(i, i + 4));

    for (const chunk of chunks) {
      const s = pres.addSlide();
      s.background = { color: C.white };
      addHeader(s, `Progress — ${act.name}`);
      addFooter(s);

      const contentY = 0.82;
      const contentH = slideH - contentY - 0.35;
      const cols = chunk.length <= 2 ? 2 : 2;
      const rows = Math.ceil(chunk.length / cols);
      const imgW = (slideW - MARGIN * 2 - 0.1 * (cols - 1)) / cols;
      const imgH = (contentH - 0.1 * (rows - 1)) / rows;

      chunk.forEach((img, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const ix = MARGIN + col * (imgW + 0.1);
        const iy = contentY + row * (imgH + 0.1);
        try {
          s.addImage({
            data: toPptxData(img.dataUrl),
            x: ix, y: iy, w: imgW, h: imgH - (img.label ? 0.28 : 0),
            sizing: { type: "cover", w: imgW, h: imgH - (img.label ? 0.28 : 0) },
          });
        } catch (e) { /* skip corrupt image */ }
        if (img.label) {
          s.addText(img.label, {
            x: ix, y: iy + imgH - 0.28, w: imgW, h: 0.25,
            fontSize: 9, fontFace: "Calibri", color: C.ink2,
            align: "center", italic: true, margin: 0,
          });
        }
      });
    }
  }

  // ── 4. GRAPHICAL REPORT ──────────────────────────────────────────────────
  const graphImgs = graphicalImages.filter(i => i.dataUrl);
  if (graphImgs.length) {
    const chunks = [];
    for (let i = 0; i < graphImgs.length; i += 4) chunks.push(graphImgs.slice(i, i + 4));

    for (const [ci, chunk] of chunks.entries()) {
      const s = pres.addSlide();
      s.background = { color: C.white };
      addHeader(s, "Graphical Report of Work");
      addFooter(s);

      const contentY = 0.82;
      const contentH = slideH - contentY - 0.35;
      const cols = 2, rows = Math.ceil(chunk.length / cols);
      const imgW = (slideW - MARGIN * 2 - 0.1) / cols;
      const imgH = (contentH - 0.1 * (rows - 1)) / rows;

      chunk.forEach((img, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const ix = MARGIN + col * (imgW + 0.1);
        const iy = contentY + row * (imgH + 0.1);
        try {
          s.addImage({
            data: toPptxData(img.dataUrl),
            x: ix, y: iy, w: imgW, h: imgH - (img.caption ? 0.28 : 0),
            sizing: { type: "cover", w: imgW, h: imgH - (img.caption ? 0.28 : 0) },
          });
        } catch (e) {}
        if (img.caption) {
          s.addText(img.caption, {
            x: ix, y: iy + imgH - 0.28, w: imgW, h: 0.25,
            fontSize: 9, fontFace: "Calibri", color: C.ink2, align: "center", italic: true, margin: 0,
          });
        }
      });
    }
  }

  // ── 5. SITE PHOTOGRAPHS ──────────────────────────────────────────────────
  const sPhotos = sitePhotos.filter(p => p.dataUrl);
  if (sPhotos.length) {
    const chunks = [];
    for (let i = 0; i < sPhotos.length; i += 4) chunks.push(sPhotos.slice(i, i + 4));

    for (const chunk of chunks) {
      const s = pres.addSlide();
      s.background = { color: C.white };
      addHeader(s, "Site Photographs");
      addFooter(s);

      const contentY = 0.82;
      const contentH = slideH - contentY - 0.35;
      const cols = 2, rows = Math.ceil(chunk.length / cols);
      const imgW = (slideW - MARGIN * 2 - 0.1) / cols;
      const imgH = (contentH - 0.1 * (rows - 1)) / rows;

      chunk.forEach((img, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const ix = MARGIN + col * (imgW + 0.1);
        const iy = contentY + row * (imgH + 0.1);
        try {
          s.addImage({
            data: toPptxData(img.dataUrl),
            x: ix, y: iy, w: imgW, h: imgH - (img.label ? 0.28 : 0),
            sizing: { type: "cover", w: imgW, h: imgH - (img.label ? 0.28 : 0) },
          });
        } catch (e) {}
        if (img.label) {
          s.addText(img.label, {
            x: ix, y: iy + imgH - 0.28, w: imgW, h: 0.25,
            fontSize: 9, fontFace: "Calibri", color: C.ink2, align: "center", italic: true, margin: 0,
          });
        }
      });
    }
  }

  // ── 6. DRAWING REGISTER ──────────────────────────────────────────────────
  if (drawingData.length) {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "Drawing Register");
    addFooter(s);

    const tableRows = [
      // Header
      drawingHeaders.map(h => ({
        text: h,
        options: { fill: { color: C.amber }, color: C.white, bold: true, fontSize: 10, fontFace: "Calibri", align: "center" },
      })),
      // Data
      ...drawingData.map((row, ri) =>
        drawingHeaders.map((_, hi) => ({
          text: row[`col${hi}`] || "—",
          options: {
            fill: { color: ri % 2 === 0 ? C.white : C.surface },
            color: C.ink, fontSize: 9, fontFace: "Calibri",
          },
        }))
      ),
    ];

    s.addTable(tableRows, {
      x: MARGIN, y: 0.85,
      w: slideW - MARGIN * 2,
      border: { pt: 0.5, color: C.line },
      rowH: 0.3,
    });
  }

  // ── 7. VISITORS ──────────────────────────────────────────────────────────
  const realVisitors = visitors.filter(v => v.name);
  if (realVisitors.length) {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "Visitor Register");
    addFooter(s);

    const tableRows = [
      [
        { text: "#", options: { fill: { color: C.amber }, color: C.white, bold: true, fontSize: 10, fontFace: "Calibri", align: "center" } },
        { text: "Type", options: { fill: { color: C.amber }, color: C.white, bold: true, fontSize: 10, fontFace: "Calibri" } },
        { text: "Name / Company", options: { fill: { color: C.amber }, color: C.white, bold: true, fontSize: 10, fontFace: "Calibri" } },
        { text: "Instruction / Remark", options: { fill: { color: C.amber }, color: C.white, bold: true, fontSize: 10, fontFace: "Calibri" } },
      ],
      ...realVisitors.map((v, i) => [
        { text: String(i + 1), options: { fill: { color: i%2===0?C.white:C.surface }, color: C.ink2, fontSize: 9, fontFace: "Calibri", align: "center" } },
        { text: v.type || "—", options: { fill: { color: i%2===0?C.white:C.surface }, color: C.ink2, fontSize: 9, fontFace: "Calibri" } },
        { text: v.name || "—", options: { fill: { color: i%2===0?C.white:C.surface }, color: C.ink, bold: true, fontSize: 9, fontFace: "Calibri" } },
        { text: v.instruction || "—", options: { fill: { color: i%2===0?C.white:C.surface }, color: C.ink2, fontSize: 9, fontFace: "Calibri" } },
      ]),
    ];

    s.addTable(tableRows, {
      x: MARGIN, y: 0.85,
      w: slideW - MARGIN * 2,
      colW: [0.4, 2.2, 2.8, 3.5],
      border: { pt: 0.5, color: C.line },
      rowH: 0.3,
    });
  }

  // ── 8. OFFICE ACTIVITY ───────────────────────────────────────────────────
  const realOffice = officeItems.filter(Boolean);
  if (realOffice.length) {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "Office Activity");
    addFooter(s);

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: MARGIN, y: 0.85, w: slideW - MARGIN * 2, h: 0.35,
      fill: { color: "F0FDF4" }, line: { color: "BBF7D0" }, rectRadius: 0.07,
    });
    s.addText("BACK OFFICE WORK", {
      x: MARGIN + 0.1, y: 0.85, w: slideW - MARGIN * 2 - 0.2, h: 0.35,
      fontSize: 10, fontFace: "Calibri", bold: true, color: "15803D",
      valign: "middle", charSpacing: 2, margin: 0,
    });

    realOffice.forEach((item, i) => {
      const ry = 1.28 + i * 0.38;
      s.addShape(pres.shapes.RECTANGLE, {
        x: MARGIN, y: ry, w: slideW - MARGIN * 2, h: 0.35,
        fill: { color: i % 2 === 0 ? C.white : C.surface }, line: { color: C.line },
      });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: MARGIN + 0.08, y: ry + 0.07, w: 0.22, h: 0.22,
        fill: { color: C.amber }, line: { color: C.amber }, rectRadius: 0.04,
      });
      s.addText(String(i + 1), {
        x: MARGIN + 0.08, y: ry + 0.07, w: 0.22, h: 0.22,
        fontSize: 8, fontFace: "Calibri", bold: true, color: C.white,
        align: "center", valign: "middle", margin: 0,
      });
      s.addText(item, {
        x: MARGIN + 0.38, y: ry, w: slideW - MARGIN * 2 - 0.45, h: 0.35,
        fontSize: 11, fontFace: "Calibri", color: C.ink, valign: "middle", margin: 0,
      });
    });
  }

  // ── 9. DRAWING & DECISION PENDING ───────────────────────────────────────
  const realDec = drawDecision.filter(d => d.drawingName);
  if (realDec.length) {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "Drawing & Decision Pending");
    addFooter(s);

    const tableRows = [
      [
        { text: "#", options: { fill: { color: C.navy }, color: C.white, bold: true, fontSize: 10, fontFace: "Calibri", align: "center" } },
        { text: "Drawing / Decision Name", options: { fill: { color: C.navy }, color: C.white, bold: true, fontSize: 10, fontFace: "Calibri" } },
        { text: "Required Date", options: { fill: { color: C.navy }, color: C.white, bold: true, fontSize: 10, fontFace: "Calibri", align: "center" } },
      ],
      ...realDec.map((d, i) => [
        { text: String(i + 1), options: { fill: { color: i%2===0?C.white:"FEF3C7" }, color: C.ink2, fontSize: 9, fontFace: "Calibri", align: "center" } },
        { text: d.drawingName, options: { fill: { color: i%2===0?C.white:"FEF3C7" }, color: C.ink, bold: true, fontSize: 10, fontFace: "Calibri" } },
        { text: d.requiredDate || "—", options: { fill: { color: i%2===0?C.white:"FEF3C7" }, color: C.amber2, bold: true, fontSize: 9, fontFace: "Calibri", align: "center" } },
      ]),
    ];

    s.addTable(tableRows, {
      x: MARGIN, y: 0.85,
      w: slideW - MARGIN * 2,
      colW: [0.5, 6.5, 1.9],
      border: { pt: 0.5, color: C.line },
      rowH: 0.32,
    });
  }

  // ── 10. DELAY POINTS ─────────────────────────────────────────────────────
  const realDelays = delayPoints.filter(Boolean);
  if (realDelays.length) {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "Delay Points / Highlights / Red Flag");
    addFooter(s);

    realDelays.forEach((pt, i) => {
      const ry = 0.88 + i * 0.44;
      s.addShape(pres.shapes.RECTANGLE, {
        x: MARGIN, y: ry, w: slideW - MARGIN * 2, h: 0.38,
        fill: { color: i % 2 === 0 ? "FEF2F2" : C.white }, line: { color: "FECACA" },
      });
      s.addText("🚩", {
        x: MARGIN + 0.07, y: ry, w: 0.28, h: 0.38,
        fontSize: 14, valign: "middle", margin: 0,
      });
      s.addText(pt, {
        x: MARGIN + 0.38, y: ry, w: slideW - MARGIN * 2 - 0.45, h: 0.38,
        fontSize: 11, fontFace: "Calibri", color: "DC2626", bold: i === 0, valign: "middle", margin: 0,
      });
    });
  }

  // ── 11. NEXT WEEK PLANNING ───────────────────────────────────────────────
  const realPlans = plans.filter(Boolean);
  if (realPlans.length) {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "Next Week Planning");
    addFooter(s);

    realPlans.forEach((pl, i) => {
      const ry = 0.88 + i * 0.42;
      s.addShape(pres.shapes.RECTANGLE, {
        x: MARGIN, y: ry, w: slideW - MARGIN * 2, h: 0.38,
        fill: { color: i % 2 === 0 ? C.white : C.surface }, line: { color: C.line },
      });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: MARGIN + 0.07, y: ry + 0.08, w: 0.22, h: 0.22,
        fill: { color: C.navy }, line: { color: C.navy }, rectRadius: 0.04,
      });
      s.addText(String(i + 1), {
        x: MARGIN + 0.07, y: ry + 0.08, w: 0.22, h: 0.22,
        fontSize: 8, fontFace: "Calibri", bold: true, color: C.white,
        align: "center", valign: "middle", margin: 0,
      });
      s.addText(pl, {
        x: MARGIN + 0.38, y: ry, w: slideW - MARGIN * 2 - 0.45, h: 0.38,
        fontSize: 11, fontFace: "Calibri", color: C.ink, valign: "middle", margin: 0,
      });
    });
  }

  // ── 12. CHECKLIST PHOTOS ─────────────────────────────────────────────────
  const cPhotos = checklistPhotos.filter(p => p.dataUrl);
  if (cPhotos.length) {
    const chunks = [];
    for (let i = 0; i < cPhotos.length; i += 4) chunks.push(cPhotos.slice(i, i + 4));

    for (const chunk of chunks) {
      const s = pres.addSlide();
      s.background = { color: C.white };
      addHeader(s, "Weekly Site Checklist");
      addFooter(s);

      const contentY = 0.82;
      const contentH = slideH - contentY - 0.35;
      const cols = 2, rows = Math.ceil(chunk.length / cols);
      const imgW = (slideW - MARGIN * 2 - 0.1) / cols;
      const imgH = (contentH - 0.1 * (rows - 1)) / rows;

      chunk.forEach((img, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const ix = MARGIN + col * (imgW + 0.1);
        const iy = contentY + row * (imgH + 0.1);
        try {
          s.addImage({
            data: toPptxData(img.dataUrl),
            x: ix, y: iy, w: imgW, h: imgH - (img.label ? 0.28 : 0),
            sizing: { type: "cover", w: imgW, h: imgH - (img.label ? 0.28 : 0) },
          });
        } catch (e) {}
        if (img.label) {
          s.addText(img.label, {
            x: ix, y: iy + imgH - 0.28, w: imgW, h: 0.25,
            fontSize: 9, fontFace: "Calibri", color: C.ink2, align: "center", italic: true, margin: 0,
          });
        }
      });
    }
  }

  // ── 13. THANK YOU / END SLIDE ────────────────────────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };
    s.addShape(pres.shapes.OVAL, {
      x: 3.5, y: 0.8, w: 3, h: 3,
      fill: { color: C.amber, transparency: 88 }, line: { color: C.amber, transparency: 70 },
    });
    s.addText("PREPARED BY", {
      x: 1, y: 1.4, w: 8, h: 0.4,
      fontSize: 11, fontFace: "Calibri", bold: true, color: C.amber,
      align: "center", charSpacing: 4,
    });
    s.addText(engineer, {
      x: 1, y: 1.85, w: 8, h: 0.7,
      fontSize: 28, fontFace: "Calibri", bold: true, color: C.white, align: "center",
    });
    s.addText(`WPR — ${zp(reportNum)}  |  ${site}`, {
      x: 1, y: 2.65, w: 8, h: 0.4,
      fontSize: 14, fontFace: "Calibri", color: "CADCFC", align: "center",
    });
    s.addText(reportDate + (location ? `  •  ${location}` : ""), {
      x: 1, y: 3.1, w: 8, h: 0.35,
      fontSize: 11, fontFace: "Calibri", color: C.ink3, align: "center",
    });
  }

  // Also return blob for Supabase upload
  const base64 = await pres.write({ outputType: "base64" });
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  });
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function Pill({ label, icon, state }) {
  return <span className={`wpr-pill ${state || ""}`}>{icon} {label}</span>;
}

function Acc({ id, icon, title, sub, open, onToggle, children }) {
  return (
    <div className={`wpr-acc${open ? " open" : ""}`}>
      <div className="wpr-acc-hdr" onClick={onToggle}>
        <div className="wpr-acc-ico">{icon}</div>
        <div className="wpr-acc-titles">
          <div className="wpr-acc-title">{title}</div>
          {sub && <div className="wpr-acc-sub">{sub}</div>}
        </div>
        <span className="wpr-acc-arrow">▾</span>
      </div>
      <div className="wpr-acc-body">{open && children}</div>
    </div>
  );
}

function BtnAdd({ onClick, label }) {
  return (
    <button onClick={onClick} style={{
      width:"100%", height:46, background:"transparent",
      border:"2px dashed var(--line2)", borderRadius:9, color:"var(--ink2)",
      fontSize:13.5, fontWeight:700, cursor:"pointer", display:"flex",
      alignItems:"center", justifyContent:"center", gap:8, marginTop:10,
      fontFamily:"var(--font)", transition:"all .15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor="var(--amber)"; e.currentTarget.style.color="var(--amber)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor="var(--line2)"; e.currentTarget.style.color="var(--ink2)"; }}
    >
      + {label}
    </button>
  );
}

function PhotoGrid({ photos, onRemove, onCaption, onAdd, accept, multiple = true, label = "Upload Photos" }) {
  const fileRef = useRef();
  return (
    <div>
      <button className="btn btn-out" style={{ height:42, fontSize:13 }} onClick={() => fileRef.current?.click()}>
        📁 {label}
      </button>
      <input type="file" ref={fileRef} accept={accept || "image/*"} multiple={multiple} style={{ display:"none" }}
        onChange={onAdd} />
      <div className="wpr-photo-grid">
        {photos.map((ph, i) => ph.dataUrl ? (
          <div key={i} className="wpr-photo-card">
            <img src={ph.dataUrl} alt="" />
            <button className="wpr-photo-del" onClick={() => onRemove(i)}>✕</button>
            <div className="wpr-photo-cap">
              <input value={ph.label || ph.caption || ""} placeholder="Caption…"
                onChange={e => onCaption(i, e.target.value)} />
            </div>
          </div>
        ) : null)}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function WprGenerator({ user, supabase }) {
  const [openSec, setOpenSec] = useState({ info: true });
  const toggle = (k) => setOpenSec(p => ({ ...p, [k]: !p[k] }));

  const [site, setSite] = useState(user?.site_names?.[0] || user?.site_name || "");
  const [engineer, setEngineer] = useState(user?.name || "");
  const [reportDate, setReportDate] = useState(today());
  const [location, setLocation] = useState("");
  const [reportNum, setReportNum] = useState(1);
  const [siteImage, setSiteImage] = useState(null);
  const [activities, setActivities] = useState([]);
  const [graphicalImages, setGraphicalImages] = useState([]);
  const [sitePhotos, setSitePhotos] = useState([]);
  const [drawingHeaders, setDrawingHeaders] = useState(["Architect GFC Drawing","Structure GFC Drawing","MEPF GFC Drawing"]);
  const [drawingData, setDrawingData] = useState([]);
  const [officeItems, setOfficeItems] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [drawDecision, setDrawDecision] = useState([]);
  const [checklistPhotos, setChecklistPhotos] = useState([]);
  const [delayPoints, setDelayPoints] = useState([]);
  const [plans, setPlans] = useState([]);
  const [sections, setSections] = useState(() =>
    STANDARD_SECTIONS.map(title => ({ title, isStandard:true, hidden:false, slideHidden:false, type:"text", textItems:[], images:[] }))
  );

  const [draftExists, setDraftExists] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState("");
  const [autoSavePending, setAutoSavePending] = useState(false);
  const [toast, setToast] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState("");
  const [genProgress, setGenProgress] = useState(0);
  const [successUrls, setSuccessUrls] = useState(null);
const saveDraftRef = useRef(null);

// Keep ref always up to date
// useEffect(() => {
//   saveDraftRef.current = () => saveDraft(true);
// });

// // Autosave every 25 seconds
// useEffect(() => {
//   if (!site || !engineer || !supabase) return;
//   const t = setInterval(() => {
//     saveDraftRef.current?.();
//   }, 25000);
//   return () => clearInterval(t);
// }, [site, engineer, supabase]);
  const showToast = (msg, type = "info", ms = 3000) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), ms);
  };

  const fetchReportNum = useCallback(async (siteName, date) => {
    if (!siteName || !date || !supabase) return;
    const { data } = await supabase.from("wpr_reports").select("report_number")
      .eq("site_name", siteName).order("report_number", { ascending:false }).limit(1);
    setReportNum(data?.[0]?.report_number ? data[0].report_number + 1 : 1);
  }, [supabase]);

  useEffect(() => { fetchReportNum(site, reportDate); }, [site, reportDate, fetchReportNum]);

  const checkDraft = useCallback(async () => {
    if (!site || !engineer || !supabase) return;
    const { data } = await supabase.from("wpr_drafts").select("updated_at")
      .eq("site_name", site).eq("engineer_name", engineer).maybeSingle();
    if (data) {
      setDraftExists(true);
      setDraftSavedAt(new Date(data.updated_at).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",hour12:true}));
    } else { setDraftExists(false); setDraftSavedAt(""); }
  }, [site, engineer, supabase]);

  useEffect(() => { if (site && engineer) checkDraft(); }, [site, engineer, checkDraft]);

const hasAnyData = useCallback(() => {
  if (activities.filter(a => a.name).length > 0) return true;
  if (plans.filter(Boolean).length > 0) return true;
  if (officeItems.filter(Boolean).length > 0) return true;
  if (delayPoints.filter(Boolean).length > 0) return true;
  if (drawingData.length > 0) return true;
  if (visitors.filter(v => v.name).length > 0) return true;
  if (drawDecision.filter(d => d.drawingName).length > 0) return true;
  if (location.trim()) return true;
  return false;
}, [activities, plans, officeItems, delayPoints, drawingData, visitors, drawDecision, location]);

const [isDirty, setIsDirty] = useState(false);

// Mark dirty whenever any field changes
useEffect(() => {
  if (hasAnyData()) setIsDirty(true);
}, [activities, plans, officeItems, delayPoints, drawingData, visitors, drawDecision, location]);

// Autosave every 25s — only if dirty and has real data
useEffect(() => {
  if (!site || !engineer || !supabase) return;
  const t = setInterval(() => {
    if (isDirty && hasAnyData()) {
      saveDraft(true);
      setIsDirty(false);
    }
  }, 20000);
  return () => clearInterval(t);
}, [site, engineer, supabase, isDirty, hasAnyData]);

  const totalImages = () => {
    let n = 0;
    activities.forEach(a => { n += (a.progressImages || []).filter(i => i.dataUrl).length; });
    n += graphicalImages.filter(i => i.dataUrl).length;
    n += sitePhotos.filter(i => i.dataUrl).length;
    n += checklistPhotos.filter(i => i.dataUrl).length;
    return n;
  };

  const collectPayload = (stripImages = false) => ({
    site_name: site, engineer_name: engineer, report_date: reportDate,
    report_number: reportNum, location, activities: activities.map(a => ({
      name: a.name || "", status: a.status || "",
      progressImages: stripImages ? [] : (a.progressImages || []),
    })),
    next_week_plans: plans, drawing_register_headers: drawingHeaders,
    drawing_register_data: drawingData, office_activity_items: officeItems,
    visitor_register_data: visitors, drawing_decision_data: drawDecision,
    delay_points: delayPoints, report_sections: sections.map(s => ({
      title:s.title, isStandard:s.isStandard, hidden:s.hidden,
      slideHidden:s.slideHidden, type:s.type, textItems:s.textItems||[],
      images: stripImages ? [] : (s.images||[]),
    })),
  });

const saveDraft = async (silent = false) => {
    console.log("btn clicked");
  if (!supabase) { if (!silent) showToast("Database not ready","error"); return; }
  if (!site || !engineer) { if (!silent) showToast("Site and engineer required","error"); return; }
  
  setAutoSavePending(true);
  
  const payload = {
    site_name: site,
    engineer_name: engineer,
    report_date: reportDate,
    report_number: reportNum,
    location,
    activities: activities.map(a => ({
      name: a.name || "",
      status: a.status || "",
      progressImages: a.progressImages || [],
    })),
    next_week_plans: plans,
    drawing_register_headers: drawingHeaders,
    drawing_register_data: drawingData,
    office_activity_items: officeItems,
    visitor_register_data: visitors,
    drawing_decision_data: drawDecision,
    delay_points: delayPoints,
    report_sections: sections.map(s => ({
      title: s.title, isStandard: s.isStandard,
      hidden: s.hidden, slideHidden: s.slideHidden,
      type: s.type, textItems: s.textItems || [],
    })),
    updated_at: new Date().toISOString(),
  };

  console.log("💾 Saving draft:", payload);

  const { data, error } = await supabase
    .from("wpr_drafts")
    .upsert(payload, { onConflict: "site_name,engineer_name" })
    .select();

  setAutoSavePending(false);

  if (error) {
    console.error("❌ Draft save error:", error);
    if (!silent) showToast("❌ Save failed: " + error.message, "error");
    return;
  }

  console.log("✅ Draft saved:", data);
  const ts = new Date().toLocaleString("en-IN", {
    day:"numeric", month:"short",
    hour:"2-digit", minute:"2-digit", hour12:true
  });
  setDraftExists(true);
  setDraftSavedAt(ts);
  if (!silent) showToast("✅ Draft saved — " + ts, "success");
};
const loadDraft = async () => {
  const { data, error } = await supabase.from("wpr_drafts").select("*")
    .eq("site_name", site).eq("engineer_name", engineer).maybeSingle();
  if (error || !data) { showToast("No draft found", "error"); return; }

  if (data.report_date) setReportDate(data.report_date);
  if (data.location !== undefined) setLocation(data.location ?? "");
  if (data.report_number) setReportNum(data.report_number);
  if (Array.isArray(data.activities)) 
    setActivities(data.activities.map(a => ({ ...a, progressImages: a.progressImages || [] })));
  if (Array.isArray(data.next_week_plans)) setPlans(data.next_week_plans);
  if (Array.isArray(data.drawing_register_headers)) setDrawingHeaders(data.drawing_register_headers);
  if (Array.isArray(data.drawing_register_data)) setDrawingData(data.drawing_register_data);
  if (Array.isArray(data.office_activity_items)) setOfficeItems(data.office_activity_items);
  if (Array.isArray(data.visitor_register_data)) setVisitors(data.visitor_register_data);
  if (Array.isArray(data.drawing_decision_data)) setDrawDecision(data.drawing_decision_data);
  if (Array.isArray(data.delay_points)) setDelayPoints(data.delay_points);
  if (Array.isArray(data.report_sections)) setSections(data.report_sections.map(s => ({
    ...s, textItems: s.textItems || [], images: s.images || [],
  })));

  showToast("✅ Draft restored!", "success");
};

  const deleteDraft = async () => {
    await supabase.from("wpr_drafts").delete().eq("site_name",site).eq("engineer_name",engineer);
    setDraftExists(false); setDraftSavedAt("");
    showToast("🗑 Draft deleted","info");
  };

  // ─── GENERATE ─────────────────────────────────────────────────────────────
  const generate = async () => {
    if (!site) { showToast("Select a site","error"); return; }
    if (!engineer) { showToast("Enter engineer name","error"); return; }
    if (!reportDate) { showToast("Select report date","error"); return; }

    setGenerating(true); setGenProgress(5); setGenStep("Saving report data…"); setSuccessUrls(null);

    try {
      const dateFormatted = new Date(reportDate + "T00:00:00").toLocaleDateString("en-IN",
        { day:"2-digit", month:"long", year:"numeric" });
      const dateStr = reportDate.replace(/-/g,"");
      const safeEng = engineer.replace(/\s+/g,"_").replace(/[^a-zA-Z0-9_]/g,"");
      const folder = `${dateStr}_${safeEng}`;
      const safeSite = site.replace(/\s+/g,"_");

      // 1. Insert base record
      const { data: reportData, error: reportError } = await supabase.from("wpr_reports").insert({
        site_name: site, engineer_name: engineer, report_date: dateFormatted,
        report_number: reportNum, location, status:"submitted",
        activities: activities.map(a => ({ name:a.name, status:a.status })),
        next_week_plans: plans.filter(Boolean),
        drawing_register_headers: drawingHeaders, drawing_register_data: drawingData,
        office_activity_items: officeItems.filter(Boolean),
        visitor_register_data: visitors, drawing_decision_data: drawDecision,
        delay_points: delayPoints.filter(Boolean),
        report_sections: sections.map(s => ({
          title:s.title, isStandard:s.isStandard, hidden:s.hidden,
          slideHidden:s.slideHidden, type:s.type, textItems:s.textItems||[],
        })),
        submitted_by: user?.user_name || engineer,
      }).select("id").single();

      if (reportError) throw reportError;
      const reportId = reportData.id;

      setGenProgress(15); setGenStep("Generating PowerPoint presentation…");

      // 2. Generate PPT with all images embedded
      const pptBlob = await generatePPT({
        site, engineer, reportDate: dateFormatted, reportNum, location,
        activities, graphicalImages, sitePhotos, siteImage,
        plans, drawingHeaders, drawingData, officeItems, visitors,
        drawDecision, delayPoints, checklistPhotos, sections,
      });

      // ── Direct download immediately after generation ──
const dlUrl = URL.createObjectURL(pptBlob);
const dlA = document.createElement("a");
dlA.href = dlUrl;
dlA.download = `WPR_${zp(reportNum)}_${site.replace(/\s+/g,"_")}.pptx`;
dlA.style.display = "none";
document.body.appendChild(dlA);
dlA.click();
document.body.removeChild(dlA);
setTimeout(() => URL.revokeObjectURL(dlUrl), 10000);
      setGenProgress(55); setGenStep("Uploading presentation…");


      // 3. Upload PPT to storage
      const pptPath = `${safeSite}/${folder}/WPR_${zp(reportNum)}_${safeSite}.pptx`;
      const pptUrl = await uploadBlob(supabase, pptBlob, pptPath,
        "application/vnd.openxmlformats-officedocument.presentationml.presentation");

      // 4. Update record with presentation_url
      await supabase.from("wpr_reports").update({ presentation_url: pptUrl }).eq("id", reportId);

      setGenProgress(65); setGenStep("Uploading images…");

      // 5. Upload images & track in wpr_images
      let uploadedCount = 0;
      const allImgCounts = [
        graphicalImages.filter(i=>i.dataUrl).length,
        sitePhotos.filter(i=>i.dataUrl).length,
        checklistPhotos.filter(i=>i.dataUrl).length,
        ...activities.map(a=>(a.progressImages||[]).filter(i=>i.dataUrl).length),
      ];
      const totalUp = allImgCounts.reduce((a,b)=>a+b,0);

      const uploadBatch = async (images, imageType, prefix, activityIndex = null) => {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          if (!img.dataUrl) continue;
          const ext = img.dataUrl.split(";")[0].split("/")[1] || "jpg";
          const cap = (img.label || img.caption || "").replace(/[^a-zA-Z0-9_]/g,"").slice(0,25);
          const fname = `${prefix}_${i+1}${cap ? "_"+cap : ""}.${ext}`;
          const path = `${safeSite}/${folder}/${imageType}/${fname}`;
          const publicUrl = await uploadImage(supabase, img.dataUrl, path);
          await supabase.from("wpr_images").insert({
            wpr_report_id: reportId, image_type: imageType,
            activity_index: activityIndex, storage_path: path,
            public_url: publicUrl, caption: img.label || img.caption || "",
            sort_order: i,
          });
          uploadedCount++;
          setGenProgress(65 + Math.round((uploadedCount / Math.max(totalUp,1)) * 28));
          setGenStep(`Uploading images… (${uploadedCount}/${totalUp})`);
        }
      };

      if (siteImage) {
        const path = `${safeSite}/${folder}/site_image/title.jpg`;
        const url = await uploadImage(supabase, siteImage, path);
        await supabase.from("wpr_images").insert({
          wpr_report_id: reportId, image_type:"site_image",
          storage_path: path, public_url: url, caption:"Site Title Image", sort_order:0,
        });
        // Also update site_image_url on report
        await supabase.from("wpr_reports").update({ site_image_url: url }).eq("id", reportId);
      }

      await uploadBatch(graphicalImages, "graphical", "graphical");
      await uploadBatch(sitePhotos, "site_photo", "site");
      await uploadBatch(checklistPhotos, "checklist", "checklist");
      for (let ai = 0; ai < activities.length; ai++) {
        const imgs = activities[ai].progressImages || [];
        if (imgs.length) await uploadBatch(imgs, "progress", `act${ai+1}`, ai);
      }

      setGenProgress(100); setGenStep("Done!");

      if (draftExists) await supabase.from("wpr_drafts").delete()
        .eq("site_name",site).eq("engineer_name",engineer);

      setDraftExists(false); setDraftSavedAt("");
      await fetchReportNum(site, reportDate);

      setSuccessUrls({ reportId, pptUrl, viewUrl: `/wpr/${reportId}` });

    } catch (err) {
      setGenerating(false);
      showToast("❌ " + (err.message || "Generation failed"), "error", 6000);
    }
  };
const closeOverlay = () => { 
  setGenerating(false); 
  setSuccessUrls(null); 
  setGenProgress(0); 
};
  const imgCount = totalImages();
  const actsCount = activities.filter(a=>a.name).length;
  const photosCount = sitePhotos.filter(p=>p.dataUrl).length;

  return (
    <>
      <style>{WPR_CSS}</style>
      <div className="wpr-wrap">

            {/* Status pills */}
        <div className="wpr-status-bar">
            <Pill icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} label={site ? `✓ ${site}` : "Info"} state={site && engineer && reportDate ? "done" : site ? "partial" : ""} />
            <Pill icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-4"/></svg>} label={actsCount > 0 ? `✓ ${actsCount} acts` : "Activities"} state={actsCount ? "done" : ""} />
            <Pill icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>} label={imgCount > 0 ? `✓ ${imgCount} imgs` : "Images"} state={imgCount ? "done" : ""} />
            <Pill icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>} label={photosCount > 0 ? `✓ ${photosCount} photos` : "Photos"} state={photosCount ? "done" : ""} />
            <Pill icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} label={plans.filter(Boolean).length > 0 ? `✓ ${plans.filter(Boolean).length} plans` : "Plan"} state={plans.filter(Boolean).length ? "done" : ""} />
        </div>

        {/* Image budget */}
        {imgCount > 0 && (
          <div className="wpr-budget">
            <span style={{fontSize:12,fontWeight:700,color:"var(--ink2)",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:5}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Image Budget
            </span>
            <div className="wpr-budget-track">
              <div className="wpr-budget-fill" style={{
                width:`${Math.min(100,(imgCount/25)*100)}%`,
                background:imgCount<=15?"var(--green)":imgCount<=22?"var(--amber)":"#dc2626"
              }}/>
            </div>
            <span style={{fontSize:12,fontWeight:700,fontFamily:"var(--mono)",whiteSpace:"nowrap",color:imgCount<=15?"var(--green)":"var(--amber)"}}>
              {imgCount} / 25
            </span>
          </div>
        )}

        {/* Draft banner */}
        {draftExists && (
          <div className="wpr-draft-banner">
            <div>
              <div className="wpr-draft-title" style={{display:"flex",alignItems:"center",gap:6}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Draft found
              </div>
              <div className="wpr-draft-sub">Saved on {draftSavedAt}</div>
            </div>
            <button className="btn btn-amber" style={{height:36,fontSize:12,padding:"0 13px",display:"flex",alignItems:"center",gap:6}} onClick={loadDraft}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                Open
            </button>
            <button className="btn btn-red" style={{height:36,fontSize:12,padding:"0 11px",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={deleteDraft}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
            </button>
          </div>
        )}

        {/* ① PROJECT INFO */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} title="Project Information" sub={site || "Site, engineer, date"} open={openSec.info} onToggle={() => toggle("info")}>
          <div className="wpr-g2">
            <div className="wpr-fg">
              <label className="wpr-lbl">Site Name *</label>
              {(user?.site_names?.length > 1) ? (
                <select className="finput" value={site} onChange={e => setSite(e.target.value)}>
                  {user.site_names.map(s => <option key={s}>{s}</option>)}
                </select>
              ) : (
                <input className="finput" value={site} onChange={e => setSite(e.target.value)} placeholder="Site name…" />
              )}
            </div>
            <div className="wpr-fg">
              <label className="wpr-lbl">Engineer *</label>
              <input className="finput" value={engineer} onChange={e => setEngineer(e.target.value)} placeholder="Engineer name…" />
            </div>
            <div className="wpr-fg">
              <label className="wpr-lbl">Location</label>
              <input className="finput" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Surat" />
            </div>
            <div className="wpr-fg">
              <label className="wpr-lbl">Report Date *</label>
              <input className="finput" type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} />
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"linear-gradient(135deg,#3d1200,#7a2e00,#c96a10)",border:"1.5px solid #c96a10",borderRadius:10,marginBottom:16}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#ffcfa0",textTransform:"uppercase",letterSpacing:".06em"}}>Report Number</div>
              <div style={{fontSize:22,fontWeight:800,fontFamily:"var(--mono)",color:"#fff"}}>WPR — {zp(reportNum)}</div>
            </div>
          </div>
          <div className="wpr-fg">
            <label className="wpr-lbl">Title Slide Image (optional)</label>
            {siteImage ? (
              <div style={{position:"relative",display:"inline-block"}}>
                <img src={siteImage} alt="site" style={{height:110,borderRadius:10,border:"1.5px solid var(--line2)"}} />
                <button className="wpr-photo-del" style={{position:"absolute",top:6,right:6}} onClick={() => setSiteImage(null)}>✕</button>
              </div>
            ) : (
              <label className="wpr-drop-zone" style={{display:"block",textAlign:"center",cursor:"pointer",padding:"20px"}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" strokeWidth="1.5" strokeLinecap="round" style={{marginBottom:8}}>
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
                </svg>
                <div style={{fontSize:13,color:"var(--ink2)",fontWeight:600}}>Upload site overview photo</div>
                <input type="file" accept="image/*" style={{display:"none"}}
                  onChange={async e => { if (e.target.files[0]) setSiteImage(await readFileAsDataUrl(e.target.files[0])); }} />
              </label>
            )}
          </div>
        </Acc>

        {/* ② ACTIVITIES */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-4"/></svg>} title="Activities" sub={actsCount ? `${actsCount} activities` : "Add construction activities"} open={openSec.acts} onToggle={() => toggle("acts")}>
          {activities.map((act, i) => (
            <div key={i} className="wpr-act-card">
              <button className="wpr-act-del" onClick={() => setActivities(p => p.filter((_,x)=>x!==i))}>✕</button>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <div className="wpr-act-num">{i+1}</div>
                <span style={{fontSize:14,fontWeight:700,color:"var(--ink)"}}>{act.name || `Activity ${i+1}`}</span>
              </div>
              <div className="wpr-g2">
                <div className="wpr-fg">
                  <label className="wpr-lbl">Activity Name</label>
                  <input className="finput" value={act.name} placeholder="e.g. EXCAVATION WORK"
                    onChange={e => setActivities(p => p.map((a,x)=>x===i?{...a,name:e.target.value}:a))} />
                </div>
                <div className="wpr-fg">
                  <label className="wpr-lbl">Status / Note</label>
                  <input className="finput" value={act.status} placeholder="e.g. 75% completed"
                    onChange={e => setActivities(p => p.map((a,x)=>x===i?{...a,status:e.target.value}:a))} />
                </div>
              </div>
              <div className="wpr-fg">
                <label className="wpr-lbl">Progress Images</label>
                <PhotoGrid
                  photos={act.progressImages || []}
                  onRemove={j => setActivities(p => p.map((a,x)=>x===i?{...a,progressImages:a.progressImages.filter((_,jj)=>jj!==j)}:a))}
                  onCaption={(j,v) => setActivities(p => p.map((a,x)=>x===i?{...a,progressImages:a.progressImages.map((im,jj)=>jj===j?{...im,label:v}:im)}:a))}
                  onAdd={async e => {
                    const files = Array.from(e.target.files||[]);
                    const imgs = await Promise.all(files.map(f => readFileAsDataUrl(f).then(d=>({dataUrl:d,label:""}))));
                    setActivities(p => p.map((a,x)=>x===i?{...a,progressImages:[...(a.progressImages||[]),...imgs]}:a));
                    e.target.value="";
                  }}
                  label="Add Progress Images"
                />
              </div>
            </div>
          ))}
          <BtnAdd label="Add Activity" onClick={() => setActivities(p => [...p, { name:"", status:"", progressImages:[] }])} />
        </Acc>

        {/* ③ GRAPHICAL REPORT */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>} title="Graphical Report of Work" sub={graphicalImages.filter(i=>i.dataUrl).length ? `${graphicalImages.filter(i=>i.dataUrl).length} images` : "Upload progress images"} open={openSec.graph} onToggle={() => toggle("graph")}>
          <PhotoGrid
            photos={graphicalImages}
            onRemove={i => setGraphicalImages(p => p.filter((_,x)=>x!==i))}
            onCaption={(i,v) => setGraphicalImages(p => p.map((im,x)=>x===i?{...im,caption:v}:im))}
            onAdd={async e => {
              const files = Array.from(e.target.files||[]);
              const imgs = await Promise.all(files.map(f => readFileAsDataUrl(f).then(d=>({dataUrl:d,caption:""}))));
              setGraphicalImages(p => [...p,...imgs]);
              e.target.value="";
            }}
            label="Upload Graphical Images"
          />
        </Acc>

        {/* ④ SITE PHOTOGRAPHS */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>} title="Site Photographs" sub={photosCount ? `${photosCount} photos` : "General site photos"} open={openSec.photos} onToggle={() => toggle("photos")}>
          <PhotoGrid
            photos={sitePhotos}
            onRemove={i => setSitePhotos(p => p.filter((_,x)=>x!==i))}
            onCaption={(i,v) => setSitePhotos(p => p.map((ph,x)=>x===i?{...ph,label:v}:ph))}
            onAdd={async e => {
              const files = Array.from(e.target.files||[]);
              const imgs = await Promise.all(files.map(f => readFileAsDataUrl(f).then(d=>({dataUrl:d,label:""}))));
              setSitePhotos(p => [...p,...imgs]);
              e.target.value="";
            }}
            label="Upload Site Photos"
          />
        </Acc>

        {/* ⑤ DRAWING REGISTER */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>} title="Drawing Register" sub={drawingData.length ? `${drawingData.length} rows` : "GFC Drawing entries"} open={openSec.drawing} onToggle={() => toggle("drawing")}>
          <div className="wpr-hint">ℹ Column headers become table headers in the report. Add/remove columns as needed.</div>
          <div className="wpr-tbl-hdr">
            <div style={{width:32,flexShrink:0,textAlign:"center"}}>#</div>
            {drawingHeaders.map((h,hi) => (
              <div key={hi} style={{flex:1,display:"flex",alignItems:"center",gap:4}}>
                <input value={h} onChange={e => setDrawingHeaders(p => p.map((v,x)=>x===hi?e.target.value:v))}
                  style={{flex:1,background:"transparent",border:"1.5px dashed var(--amber-line)",borderRadius:6,padding:"4px 8px",fontSize:11.5,fontWeight:800,color:"var(--amber2)",fontFamily:"var(--font)",outline:"none",textTransform:"uppercase",letterSpacing:".05em"}} />
                {drawingHeaders.length > 1 && (
                  <button onClick={() => setDrawingHeaders(p => p.filter((_,x)=>x!==hi))}
                    style={{width:18,height:18,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:4,color:"#dc2626",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
                )}
              </div>
            ))}
            <button onClick={() => setDrawingHeaders(p => [...p,"New Column"])}
              style={{width:26,height:26,background:"#f0fdf4",border:"1.5px solid #bbf7d0",borderRadius:6,color:"#15803d",fontSize:16,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
          </div>
          {drawingData.map((row, ri) => (
            <div key={ri} className="wpr-tbl-row" style={{gridTemplateColumns:`32px ${drawingHeaders.map(()=>"1fr").join(" ")} 28px`}}>
              <div style={{width:28,height:28,background:"var(--amber)",color:"#fff",borderRadius:7,fontSize:12,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{ri+1}</div>
              {drawingHeaders.map((h,hi) => (
                <input key={hi} className="finput" value={row[`col${hi}`]||""} placeholder={h}
                  onChange={e => setDrawingData(p => p.map((r,x)=>x===ri?{...r,[`col${hi}`]:e.target.value}:r))} />
              ))}
              <button onClick={() => setDrawingData(p => p.filter((_,x)=>x!==ri))}
                style={{background:"none",border:"none",color:"var(--ink3)",fontSize:18,cursor:"pointer"}}>✕</button>
            </div>
          ))}
          <BtnAdd label="Add Drawing Row" onClick={() => {
            const newRow = {}; drawingHeaders.forEach((_,hi) => { newRow[`col${hi}`]=""; });
            setDrawingData(p => [...p, newRow]);
          }} />
        </Acc>

        {/* ⑥ OFFICE ACTIVITY */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>} title="Office Activity" sub={officeItems.filter(Boolean).length ? `${officeItems.filter(Boolean).length} items` : "Back office work"} open={openSec.office} onToggle={() => toggle("office")}>
          {officeItems.map((item,i) => (
            <div key={i} className="wpr-plan-item">
              <div className="wpr-plan-num">{i+1}</div>
              <input value={item} placeholder="e.g. Lift work order prepared"
                onChange={e => setOfficeItems(p => p.map((v,x)=>x===i?e.target.value:v))} />
              <button onClick={() => setOfficeItems(p => p.filter((_,x)=>x!==i))}
                style={{background:"none",border:"none",color:"var(--ink3)",fontSize:20,cursor:"pointer"}}>✕</button>
            </div>
          ))}
          <BtnAdd label="Add Item" onClick={() => setOfficeItems(p => [...p,""])} />
        </Acc>

        {/* ⑦ VISITOR REGISTER */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} title="Visitor Register" sub={visitors.filter(v=>v.name).length ? `${visitors.filter(v=>v.name).length} visitors` : "Record site visitors"} open={openSec.visitor} onToggle={() => toggle("visitor")}>
          {visitors.map((row, i) => (
            <div key={i} className="wpr-vis-card">
              <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:12}}>
                <div className="wpr-act-num" style={{width:28,height:28,fontSize:12}}>{i+1}</div>
                <select className="finput" style={{flex:1}} value={row.type||VISITOR_TYPES[0]}
                  onChange={e => setVisitors(p => p.map((v,x)=>x===i?{...v,type:e.target.value}:v))}>
                  {VISITOR_TYPES.map(t => <option key={t}>{t}</option>)}
                  <option value="__other__">+ Other…</option>
                </select>
                <button onClick={() => setVisitors(p => p.filter((_,x)=>x!==i))}
                  style={{background:"none",border:"none",color:"var(--ink3)",fontSize:20,cursor:"pointer",flexShrink:0}}>✕</button>
              </div>
              <div className="wpr-g2">
                <div className="wpr-fg">
                  <label className="wpr-lbl">Name / Company</label>
                  <input className="finput" value={row.name||""} placeholder="Visitor name"
                    onChange={e => setVisitors(p => p.map((v,x)=>x===i?{...v,name:e.target.value}:v))} />
                </div>
                <div className="wpr-fg">
                  <label className="wpr-lbl">Instruction / Remark</label>
                  <input className="finput" value={row.instruction||""} placeholder="Instructions given"
                    onChange={e => setVisitors(p => p.map((v,x)=>x===i?{...v,instruction:e.target.value}:v))} />
                </div>
              </div>
            </div>
          ))}
          <BtnAdd label="Add Visitor" onClick={() => setVisitors(p => [...p, { type:VISITOR_TYPES[0], name:"", instruction:"" }])} />
        </Acc>

        {/* ⑧ DRAWING & DECISION PENDING */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} title="Drawing & Decision Pending" sub={drawDecision.filter(r=>r.drawingName).length ? `${drawDecision.filter(r=>r.drawingName).length} items` : "Pending drawings"} open={openSec.drawdec} onToggle={() => toggle("drawdec")}>
          {drawDecision.length > 0 && (
            <div className="wpr-tbl-hdr">
              <div style={{flex:2}}>Drawing / Decision Name</div>
              <div style={{flex:1}}>Required Date</div>
              <div style={{width:28}}></div>
            </div>
          )}
          {drawDecision.map((row, i) => (
            <div key={i} className="wpr-tbl-row" style={{gridTemplateColumns:"28px 1fr 160px 28px"}}>
              <div style={{width:24,height:24,background:"var(--blue)",color:"#fff",borderRadius:6,fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{i+1}</div>
              <input className="finput" value={row.drawingName||""} placeholder="Drawing or decision name…"
                onChange={e => setDrawDecision(p => p.map((r,x)=>x===i?{...r,drawingName:e.target.value}:r))} />
              <input className="finput" type="date" value={row.requiredDate||""}
                onChange={e => setDrawDecision(p => p.map((r,x)=>x===i?{...r,requiredDate:e.target.value}:r))} />
              <button onClick={() => setDrawDecision(p => p.filter((_,x)=>x!==i))}
                style={{background:"none",border:"none",color:"var(--ink3)",fontSize:18,cursor:"pointer"}}>✕</button>
            </div>
          ))}
          <BtnAdd label="Add Pending Item" onClick={() => setDrawDecision(p => [...p, { drawingName:"", requiredDate:"" }])} />
        </Acc>

        {/* ⑨ WEEKLY CHECKLIST */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>} title="Weekly Site Checklist" sub={checklistPhotos.filter(p=>p.dataUrl).length ? `${checklistPhotos.filter(p=>p.dataUrl).length} photos` : "Checklist photos"} open={openSec.checklist} onToggle={() => toggle("checklist")}>
          <PhotoGrid
            photos={checklistPhotos}
            onRemove={i => setChecklistPhotos(p => p.filter((_,x)=>x!==i))}
            onCaption={(i,v) => setChecklistPhotos(p => p.map((ph,x)=>x===i?{...ph,label:v}:ph))}
            onAdd={async e => {
              const files = Array.from(e.target.files||[]);
              const imgs = await Promise.all(files.map(f => readFileAsDataUrl(f).then(d=>({dataUrl:d,label:""}))));
              setChecklistPhotos(p => [...p,...imgs]);
              e.target.value="";
            }}
            label="Upload Checklist Photos"
          />
        </Acc>

        {/* ⑩ DELAY POINTS */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} title="Delay Points / Highlights / Red Flag" sub={delayPoints.filter(Boolean).length ? `${delayPoints.filter(Boolean).length} points` : "Issues and flags"} open={openSec.delay} onToggle={() => toggle("delay")}>
          {delayPoints.map((pt, i) => (
            <div key={i} className="wpr-plan-item" style={{borderColor:"rgba(220,38,38,.25)"}}>
              <div className="wpr-plan-num" style={{background:"rgba(220,38,38,.1)",color:"#dc2626"}}>{i+1}</div>
              <input value={pt} placeholder="Delay point or red flag…"
                onChange={e => setDelayPoints(p => p.map((v,x)=>x===i?e.target.value:v))} />
              <button onClick={() => setDelayPoints(p => p.filter((_,x)=>x!==i))}
                style={{background:"none",border:"none",color:"var(--ink3)",fontSize:20,cursor:"pointer"}}>✕</button>
            </div>
          ))}
          <BtnAdd label="Add Delay Point" onClick={() => setDelayPoints(p => [...p,""])} />
        </Acc>

        {/* ⑪ NEXT WEEK PLANNING */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} title="Next Week Planning" sub={plans.filter(Boolean).length ? `${plans.filter(Boolean).length} plans` : "Planned activities"} open={openSec.plan} onToggle={() => toggle("plan")}>
          {plans.map((pl, i) => (
            <div key={i} className="wpr-plan-item">
              <div className="wpr-plan-num">{i+1}</div>
              <input value={pl} placeholder="Planned activity for next week…"
                onChange={e => setPlans(p => p.map((v,x)=>x===i?e.target.value:v))} />
              <button onClick={() => setPlans(p => p.filter((_,x)=>x!==i))}
                style={{background:"none",border:"none",color:"var(--ink3)",fontSize:20,cursor:"pointer"}}>✕</button>
            </div>
          ))}
          <BtnAdd label="Add Planned Item" onClick={() => setPlans(p => [...p,""])} />
        </Acc>

        {/* ⑫ REPORT CONTENTS */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>} title="Report Sections" sub="Reorder, hide or add custom sections" open={openSec.rc} onToggle={() => toggle("rc")}>
          <div className="wpr-hint">ℹ Standard sections are always included. Use Hide to exclude from PPT. Use 🚫 to omit from report entirely.</div>
          {sections.map((sec, si) => (
            <div key={si} className="wpr-rc-item">
              <div className="wpr-rc-hdr">
                <div className="wpr-rc-badge">{sec.isStandard ? "📋" : "✨"}</div>
                <input className="wpr-rc-title" value={sec.title}
                  onChange={e => setSections(p => p.map((s,x)=>x===si?{...s,title:e.target.value}:s))} />
                <div className="wpr-rc-actions">
                  <button className="wpr-rc-btn" title="Move up" onClick={() => {
                    if (si===0) return;
                    setSections(p => { const n=[...p]; [n[si-1],n[si]]=[n[si],n[si-1]]; return n; });
                  }}>↑</button>
                  <button className="wpr-rc-btn" title="Move down" onClick={() => {
                    if (si===sections.length-1) return;
                    setSections(p => { const n=[...p]; [n[si],n[si+1]]=[n[si+1],n[si]]; return n; });
                  }}>↓</button>
                  <button
                    className={`wpr-rc-btn${sec.slideHidden?" hide-active":""}`}
                    onClick={() => setSections(p => p.map((s,x)=>x===si?{...s,slideHidden:!s.slideHidden}:s))}
                  >{sec.slideHidden ? "👁" : "Hide"}</button>
                  {sec.isStandard ? (
                    <button
                      className={`wpr-rc-btn${sec.hidden?" hide-active":""}`}
                      onClick={() => setSections(p => p.map((s,x)=>x===si?{...s,hidden:!s.hidden}:s))}
                    >🚫</button>
                  ) : (
                    <button className="wpr-rc-btn del"
                      onClick={() => setSections(p => p.filter((_,x)=>x!==si))}>🗑</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Acc>

        {/* FAB */}
        <div className="wpr-fab-wrap">
         <button onClick={() => saveDraft(false)} disabled={autoSavePending} style={{width:"100%",height:40,marginBottom:8,fontSize:13,fontFamily:"var(--font)",fontWeight:700,background:"linear-gradient(135deg,#3d1200,#7a2e00,#c96a10)", color:"#fff", border:"1.5px solid #c96a10",borderRadius:10,cursor:"pointer",pointerEvents:"all",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
  {autoSavePending ? (
    <><div className="wpr-spinner" style={{width:14,height:14,borderWidth:2}}/> Saving…</>
  ) : (
    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save Draft</>
  )}
</button>

<button className="wpr-fab" onClick={generate} disabled={generating} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:9}}>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>
  Generate Report + PPT
</button>
        </div>

        {/* Generation Overlay */}
        {generating && (
          <div className="wpr-overlay">
            {!successUrls ? (
              <div className="wpr-overlay-card">
                <div className="wpr-spinner" />
                <div style={{fontSize:18,fontWeight:800,color:"var(--ink)"}}>Generating Report…</div>
                <div style={{fontSize:13,color:"var(--ink2)"}}>{genStep}</div>
                <div className="wpr-progress-bar">
                  <div className="wpr-progress-fill" style={{width:`${genProgress}%`}} />
                </div>
                <div style={{fontSize:12,color:"var(--ink3)",fontFamily:"var(--mono)"}}>{genProgress}%</div>
              </div>
            ) : (
              <div className="wpr-overlay-card">
                <div style={{width:64,height:64,borderRadius:"50%",background:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <div className="wpr-success-title">Report Generated!</div>
                <div className="wpr-success-sub">
                  WPR — {zp(reportNum)} for <strong>{site}</strong> has been saved with all images uploaded and a PowerPoint presentation created.
                </div>

                <div className="wpr-success-links">
                  {/* PPT download */}
                  {/* PPT download — already auto-downloaded above */}
<div className="wpr-link-row" style={{background:"linear-gradient(135deg,#3d1200,#7a2e00,#c96a10)", border:"1.5px solid #c96a10", color:"#fff"}}>
  <span className="wpr-link-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 12h2l2-4 2 8 2-4h2"/></svg></span>
  <div className="wpr-link-label">
        <div style={{fontWeight:800, color:"#ffcfa0"}}>PowerPoint Downloaded!</div>
        <div style={{fontSize:11, color:"rgba(255,255,255,0.7)", marginTop:2}}>
      WPR_{zp(reportNum)}_{site}.pptx — check your Downloads folder
    </div>
  </div>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
</div>

                  {/* View report */}
<a 
  href={`https://docs.google.com/viewer?url=${encodeURIComponent(successUrls.pptUrl)}`} 
  target="_blank" 
  rel="noreferrer" 
  className="wpr-link-row"
>
  <span className="wpr-link-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></span>    
  <div className="wpr-link-label">
    <div style={{fontWeight:800}}>View Report</div>
    <div style={{fontSize:11,color:"var(--ink3)",marginTop:2}}>Preview in browser</div>
  </div>
  <span className="wpr-link-arrow">→</span>
</a>

                  {/* Graphical images link */}
                  {graphicalImages.filter(i=>i.dataUrl).length > 0 && (
                    <div className="wpr-link-row" style={{cursor:"default"}}>
                      <span className="wpr-link-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></span>
                      <div className="wpr-link-label">
                        <div style={{fontWeight:800}}>Graphical Images Uploaded</div>
                        <div style={{fontSize:11,color:"var(--ink3)",marginTop:2}}>
                          {graphicalImages.filter(i=>i.dataUrl).length} images stored in Supabase Storage
                        </div>
                      </div>
                      <span style={{fontSize:11,color:"#15803d",fontWeight:700}}>✓</span>
                    </div>
                  )}

                  {/* Site photos link */}
                  {sitePhotos.filter(i=>i.dataUrl).length > 0 && (
                    <div className="wpr-link-row" style={{cursor:"default"}}>
                      <span className="wpr-link-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
                      <div className="wpr-link-label">
                        <div style={{fontWeight:800}}>Site Photos Uploaded</div>
                        <div style={{fontSize:11,color:"var(--ink3)",marginTop:2}}>
                          {sitePhotos.filter(i=>i.dataUrl).length} photos stored in Supabase Storage
                        </div>
                      </div>
                      <span style={{fontSize:11,color:"#15803d",fontWeight:700}}>✓</span>
                    </div>
                  )}
                </div>

                <button className="btn btn-amber" style={{width:"100%",height:44,marginTop:4}} onClick={closeOverlay}>
                  ✓ Done
                </button>
              </div>
            )}
          </div>
        )}

        {/* Toast */}
        {toast && <div className={`wpr-toast ${toast.type}`}>{toast.msg}</div>}
      </div>
    </>
  );
}