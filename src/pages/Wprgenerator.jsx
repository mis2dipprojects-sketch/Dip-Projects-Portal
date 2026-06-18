import { useState, useEffect, useCallback, useRef } from "react";
import * as XLSX from 'xlsx';
import generatePPT from './pptGenerator';
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
#wpr-tbl-hdr-draw{background:#fff;}
.wpr-tbl-row { display:grid; gap:8px; align-items:center; padding:8px 12px; background:var(--surface); border:1.5px solid #c96a10; border-top:none; }
.wpr-tbl-row:last-of-type { border-radius:0 0 8px 8px; }
.wpr-tbl-row input { border:1.5px solid transparent!important; background:transparent!important; padding:6px 8px!important; font-size:13px!important; box-shadow:none!important; }
.wpr-tbl-row input:focus { border-color:#c96a10!important; background:var(--paper)!important; border-radius:6px!important; }
.wpr-rc-item { background:var(--surface); border:1.5px solid #c96a10; border-radius:10px; margin-bottom:10px; overflow:hidden; touch-action:none; }
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

/* ── Excel range capture UI ── */
.wpr-xl-section { background:var(--paper); border:1.5px solid #c96a10; border-radius:11px; padding:16px; margin-bottom:14px; }
.wpr-xl-title { font-size:12px; font-weight:800; color:#7a2e00; text-transform:uppercase; letter-spacing:.06em; margin-bottom:12px; display:flex; align-items:center; gap:7px; }
.wpr-xl-tabs { display:flex; gap:6px; margin-bottom:14px; }
.wpr-xl-tab { flex:1; height:38px; border:1.5px solid #c96a10; border-radius:9px; background:transparent; font-family:var(--font); font-size:12.5px; font-weight:700; color:#c96a10; cursor:pointer; transition:all .15s; display:flex; align-items:center; justify-content:center; gap:6px; }
.wpr-xl-tab.active { background:linear-gradient(135deg,#3d1200,#7a2e00,#c96a10); color:#fff; border-color:#c96a10; }
.wpr-xl-workbook { background:var(--surface); border:1.5px solid var(--line2); border-radius:9px; overflow:hidden; }
.wpr-xl-workbook-hdr { padding:9px 13px; background:linear-gradient(135deg,#3d1200,#7a2e00,#c96a10); font-size:11.5px; font-weight:700; color:#fff; display:flex; align-items:center; gap:8px; }
.wpr-xl-sheet-tabs { display:flex; gap:4px; padding:8px 10px 0; border-bottom:1.5px solid #c96a10; overflow-x:auto; }
.wpr-xl-sheet-tab { padding:5px 14px 6px; border:1.5px solid #c96a10; border-bottom:none; border-radius:7px 7px 0 0; font-size:12px; font-weight:700; color:#c96a10; cursor:pointer; background:transparent; white-space:nowrap; }
.wpr-xl-sheet-tab.active { background:linear-gradient(135deg,#3d1200,#7a2e00,#c96a10); color:#fff; }
.wpr-xl-table-wrap { overflow:auto; max-height:320px; touch-action:none; }
.wpr-xl-table { border-collapse:collapse; font-size:11.5px; font-family:var(--mono); min-width:100%; }
.wpr-xl-table th { background:linear-gradient(135deg,#3d1200,#7a2e00); color:#ffcfa0; padding:5px 10px; border:1px solid rgba(201,106,16,0.3); font-weight:800; text-align:center; white-space:nowrap; position:sticky; top:0; z-index:1; }
.wpr-xl-table td { padding:4px 10px; border:1px solid var(--line); color:var(--ink); white-space:nowrap; cursor:pointer; transition:background .1s; user-select:none; }
.wpr-xl-table tr:hover td { background:rgba(201,106,16,0.07); }
.wpr-xl-table td.sel { background:rgba(201,106,16,0.2)!important; outline:1.5px solid #c96a10; outline-offset:-1px; }
.wpr-xl-table td.sel-start { background:rgba(201,106,16,0.35)!important; }
.wpr-xl-table tr.wpr-hdr-row td { background:rgba(201,106,16,0.14)!important; font-weight:700; }
.wpr-xl-table tr.wpr-hdr-row td:first-child { background:linear-gradient(135deg,#3d1200,#7a2e00)!important; color:#ffcfa0!important; }
.wpr-range-bar { display:flex; align-items:center; gap:8px; padding:9px 12px; background:var(--surface); border:1.5px solid #c96a10; border-radius:9px; margin:10px 0; flex-wrap:wrap; }
.wpr-range-label { font-size:11.5px; font-weight:700; color:#7a2e00; white-space:nowrap; }
.wpr-range-val { font-family:var(--mono); font-size:12px; color:#c96a10; font-weight:700; flex:1; min-width:80px; }
.wpr-range-input { font-family:var(--mono)!important; font-size:12px!important; flex:1; min-width:80px; }
.wpr-xl-hdr-field { display:flex; flex-direction:column; gap:4px; margin-bottom:12px; }
.wpr-xl-hdr-preview { border:1.5px solid #c96a10; border-radius:8px; overflow:hidden; margin-top:10px; }
.wpr-xl-hdr-preview-bar { background:linear-gradient(135deg,#3d1200,#7a2e00,#c96a10); padding:7px 12px; font-size:11.5px; font-weight:700; color:#fff; }
.wpr-xl-captured-grid { display:flex; flex-wrap:wrap; gap:10px; margin-top:12px; }
.wpr-xl-captured-card { position:relative; border:1.5px solid #c96a10; border-radius:9px; overflow:hidden; background:var(--paper); width:180px; }
.wpr-xl-captured-card img { width:100%; display:block; }
.wpr-xl-captured-card-hdr { background:linear-gradient(135deg,#3d1200,#7a2e00,#c96a10); padding:4px 8px; font-size:10px; font-weight:800; color:#ffcfa0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.wpr-xl-captured-del { position:absolute; top:28px; right:5px; width:22px; height:22px; background:rgba(220,38,38,.88); color:#fff; border:none; border-radius:50%; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-weight:700; }
.wpr-xl-captured-cap input { width:100%; border:none!important; border-top:1px solid var(--line)!important; border-radius:0!important; font-size:11px!important; padding:5px 7px!important; background:var(--surface)!important; box-shadow:none!important; }
.wpr-xl-hdr-info { display:flex; align-items:center; gap:8px; padding:9px 12px; background:rgba(201,106,16,0.1); border:1.5px solid #c96a10; border-radius:9px; margin-bottom:10px; flex-wrap:wrap; }
.wpr-xl-hdr-stepper { display:flex; gap:4px; }
.wpr-xl-hdr-stepper button { width:26px; height:26px; border-radius:6px; border:1.5px solid #c96a10; background:var(--surface); color:#c96a10; font-size:14px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.wpr-xl-hdr-stepper button:hover { background:#c96a10; color:#fff; }
.wpr-xl-rows-field { display:flex; align-items:center; gap:8px; }
.wpr-xl-rows-field input { width:56px!important; text-align:center; }
.wpr-touch-toggle { height:32px; padding:0 12px; font-size:11.5px; font-weight:700; border-radius:7px; border:1.5px solid #c96a10; background:var(--surface); color:#c96a10; cursor:pointer; display:flex; align-items:center; gap:6px; white-space:nowrap; }
.wpr-touch-toggle.on { background:linear-gradient(135deg,#3d1200,#7a2e00,#c96a10); color:#fff; }
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

function dataUrlToBase64(dataUrl) { return dataUrl.split(",")[1] || ""; }
function getMime(dataUrl) { return dataUrl.split(";")[0].split(":")[1] || "image/jpeg"; }
function toPptxData(dataUrl) {
  const mime = getMime(dataUrl);
  const b64 = dataUrlToBase64(dataUrl);
  return `${mime};base64,${b64}`;
}

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

async function uploadBlob(supabase, blob, path, contentType) {
  const { data, error } = await supabase.storage
    .from("wpr-images")
    .upload(path, blob, { contentType, upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from("wpr-images").getPublicUrl(path);
  return urlData.publicUrl;
}

// ─── Excel parsing via SheetJS ───────────────────────────────────────────────
let _xlsxPromise = null;
function loadXlsx() {
  if (_xlsxPromise) return _xlsxPromise;

  const sources = [
    "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
    "https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js",
    "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
  ];

  const isReady = () => window.XLSX && typeof window.XLSX.read === "function";

  const tryLoad = (i) => new Promise((resolve, reject) => {
    if (isReady()) { resolve(window.XLSX); return; }
    if (i >= sources.length) {
      reject(new Error("Could not load the Excel library (XLSX). Check your internet connection or try again."));
      return;
    }
    const existing = document.querySelector(`script[src="${sources[i]}"]`);
    const s = existing || document.createElement("script");
    s.src = sources[i];
    s.onload = () => {
      if (isReady()) resolve(window.XLSX);
      else tryLoad(i + 1).then(resolve, reject);
    };
    s.onerror = () => tryLoad(i + 1).then(resolve, reject);
    if (!existing) document.head.appendChild(s);
    else if (isReady()) resolve(window.XLSX); // script tag already present & loaded
  });

  _xlsxPromise = tryLoad(0).catch((err) => {
    _xlsxPromise = null; // allow retry on next upload attempt
    throw err;
  });
  return _xlsxPromise;
}

// Parse an Excel file → { sheetNames, sheets: { [name]: { raw, merges } } }
async function parseExcel(file) {
  const XLSX = await loadXlsx();
  const ab = await file.arrayBuffer();
  const wb = XLSX.read(ab, { type: "array" });
  const sheets = {};
  wb.SheetNames.forEach((name) => {
    const ws = wb.Sheets[name];
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    const merges = (ws["!merges"] || []).map((m) => ({
      s: { r: m.s.r, c: m.s.c }, e: { r: m.e.r, c: m.e.c },
    }));
    sheets[name] = { raw, merges };
  });
  return { sheetNames: wb.SheetNames, sheets };
}

// Convert col index (0-based) → letter (A, B, …, Z, AA, …)
function colLetter(n) {
  let s = "";
  n++;
  while (n > 0) { s = String.fromCharCode(((n - 1) % 26) + 65) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

// ─── Auto-detect header rows from a sheet ──────────────────────────────────
function detectHeaderInfo(raw, merges) {
  if (!raw || !raw.length) return { titleRows: [], labelRows: [], headerEnd: -1 };

  const wideMergeRows = new Set();
  (merges || []).forEach((m) => {
    if (m.s.r === m.e.r && (m.e.c - m.s.c) >= 2) wideMergeRows.add(m.s.r);
  });

  const SCAN_LIMIT = Math.min(raw.length, 10);
  const titleRows = [];
  let r = 0;

  while (r < SCAN_LIMIT) {
    const row = raw[r] || [];
    const filled = row.filter((c) => c !== "" && c != null);
    if (!filled.length) { r++; continue; }
    const isWideMerge = wideMergeRows.has(r);
    const isSingleCellRow = filled.length === 1 && row.length > 1;
    if (isWideMerge || isSingleCellRow) { titleRows.push(r); r++; continue; }
    break;
  }

  const labelRows = [];
  while (r < SCAN_LIMIT) {
    const row = raw[r] || [];
    const filled = row.filter((c) => c !== "" && c != null);
    if (!filled.length) break;
    const numericCount = filled.filter((c) => !isNaN(parseFloat(c)) && isFinite(c)).length;
    const mostlyText = numericCount / filled.length < 0.4;
    if (mostlyText && filled.length >= 2) { labelRows.push(r); r++; }
    else break;
  }

  const headerEnd = labelRows.length
    ? labelRows[labelRows.length - 1]
    : (titleRows.length ? titleRows[titleRows.length - 1] : -1);

  return { titleRows, labelRows, headerEnd };
}
// ADD this helper function right above renderTableImage
const yieldToMain = () => new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
// Render a branded band + auto-detected header rows + a chunk of data rows to a canvas image
async function renderTableImageAsync({ raw, headerInfo, dataR1, dataR2, c1, c2, bandText, sectionLabel }) {
  const MAX_COLS_PER_IMAGE = 15;
  const allSelectedCols = Array.from({ length: c2 - c1 + 1 }, (_, i) => i + c1);
  const cols = allSelectedCols.slice(0, MAX_COLS_PER_IMAGE);
  if (!cols.length || dataR2 < dataR1) return null;

  const titleRows = headerInfo?.titleRows || [];
  const labelRows = headerInfo?.labelRows || [];
  const useFallbackColHeader = labelRows.length === 0;

  const MAX_CANVAS_W = 900;
  const idealCellW = Math.floor((MAX_CANVAS_W - 24) / cols.length);
  const CELL_W = Math.max(40, Math.min(90, idealCellW));
  const CELL_H = 26, BAND_H = 38, TITLE_H = 22, LABEL_H = 24, PAD = 12;

  const dataRows = [];
  for (let r = dataR1; r <= dataR2; r++) dataRows.push(raw[r] || []);

  const titleBlockH = titleRows.length * TITLE_H;
  const labelBlockH = useFallbackColHeader ? LABEL_H : labelRows.length * LABEL_H;
  const W = PAD * 2 + cols.length * CELL_W;
  const H = BAND_H + titleBlockH + labelBlockH + dataRows.length * CELL_H + PAD;

  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);

  let y = 0;

  // Branded band
  const grad = ctx.createLinearGradient(0, 0, W, BAND_H);
  grad.addColorStop(0, "#3d1200");
  grad.addColorStop(0.5, "#7a2e00");
  grad.addColorStop(1, "#c96a10");
  ctx.fillStyle = grad;
  ctx.fillRect(0, y, W, BAND_H);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px Arial, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(bandText || sectionLabel, PAD, y + BAND_H / 2);
  if (bandText && sectionLabel && bandText !== sectionLabel) {
    ctx.fillStyle = "rgba(255,207,160,0.85)";
    ctx.font = "11px Arial, sans-serif";
    const tw = ctx.measureText(sectionLabel).width;
    ctx.fillText(sectionLabel, W - PAD - tw, y + BAND_H / 2);
  }
  y += BAND_H;

  // Title rows
  titleRows.forEach((rIdx) => {
    const row = raw[rIdx] || [];
    const text = row.find((c) => c !== "" && c != null) ?? "";
    ctx.fillStyle = "#fdf3e7";
    ctx.fillRect(0, y, W, TITLE_H);
    ctx.strokeStyle = "rgba(201,106,16,0.3)";
    ctx.lineWidth = 0.75;
    ctx.strokeRect(0, y, W, TITLE_H);
    ctx.fillStyle = "#7a2e00";
    ctx.font = "bold 12px Arial, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText(String(text), PAD, y + TITLE_H / 2);
    y += TITLE_H;
  });

  // Label rows
  if (!useFallbackColHeader) {
    labelRows.forEach((rIdx) => {
      const row = raw[rIdx] || [];
      ctx.fillStyle = "#f0e4d4";
      ctx.fillRect(0, y, W, LABEL_H);
      cols.forEach((ci, xi) => {
        const x = PAD + xi * CELL_W;
        const val = String(row[ci] ?? "");
        ctx.fillStyle = "#3d1200";
        ctx.font = "bold 11.5px Arial, sans-serif";
        ctx.textBaseline = "middle";
        let text = val;
        const maxTW = CELL_W - 10;
        while (ctx.measureText(text).width > maxTW && text.length > 1) text = text.slice(0, -1) + "…";
        ctx.fillText(text, x + 5, y + LABEL_H / 2);
        if (xi > 0) {
          ctx.strokeStyle = "rgba(201,106,16,0.3)";
          ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + LABEL_H); ctx.stroke();
        }
      });
      ctx.strokeStyle = "#c96a10"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, y + LABEL_H); ctx.lineTo(W, y + LABEL_H); ctx.stroke();
      y += LABEL_H;
    });
  } else {
    ctx.fillStyle = "#f5f0e8";
    ctx.fillRect(0, y, W, LABEL_H);
    cols.forEach((ci, xi) => {
      const x = PAD + xi * CELL_W;
      const label = colLetter(ci);
      ctx.fillStyle = "#7a2e00";
      ctx.font = "bold 10px Arial, sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(label, x + CELL_W / 2 - ctx.measureText(label).width / 2, y + LABEL_H / 2);
      if (xi > 0) {
        ctx.strokeStyle = "rgba(201,106,16,0.25)";
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + LABEL_H); ctx.stroke();
      }
    });
    y += LABEL_H;
  }

  // ── DATA ROWS: draw in chunks of 30, yielding between each chunk ──
  const CHUNK = 30;
  for (let start = 0; start < dataRows.length; start += CHUNK) {
    // Yield to browser between chunks — this is what prevents freezing
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const end = Math.min(start + CHUNK, dataRows.length);
    for (let ri = start; ri < end; ri++) {
      const row = dataRows[ri];
      const ry = y + ri * CELL_H;
      ctx.fillStyle = ri % 2 === 0 ? "#ffffff" : "#fdf9f4";
      ctx.fillRect(0, ry, W, CELL_H);
      ctx.strokeStyle = "rgba(201,106,16,0.18)";
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, ry + CELL_H); ctx.lineTo(W, ry + CELL_H); ctx.stroke();
      cols.forEach((ci, xi) => {
        const x = PAD + xi * CELL_W;
        const val = String(row[ci] ?? "");
        ctx.fillStyle = "#1c1917";
        ctx.font = "12px Arial, sans-serif";
        ctx.textBaseline = "middle";
        const maxTW = CELL_W - 8;
        let text = val;
        while (ctx.measureText(text).width > maxTW && text.length > 1) text = text.slice(0, -1) + "…";
        ctx.fillText(text, x + 4, ry + CELL_H / 2);
        if (xi > 0) {
          ctx.strokeStyle = "rgba(201,106,16,0.15)";
          ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(x, ry); ctx.lineTo(x, ry + CELL_H); ctx.stroke();
        }
      });
    }
  }

  ctx.strokeStyle = "#c96a10";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, 0, W, H);

  return await new Promise((resolve) => {
  canvas.toBlob(
    (blob) => {
      if (!blob) { resolve(canvas.toDataURL("image/jpeg", 0.85)); return; }
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve(canvas.toDataURL("image/jpeg", 0.85));
      reader.readAsDataURL(blob);
    },
    "image/jpeg",
    0.85
  );
}); 
}

// ─── Load pptxgenjs ──────────────────────────────────────────────────────────
let _pptxPromise = null;
function loadPptxGen() {
  if (_pptxPromise) return _pptxPromise;
  _pptxPromise = new Promise((resolve, reject) => {
    if (window.PptxGenJS) { resolve(window.PptxGenJS); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.bundle.js";
    script.onload = () => resolve(window.PptxGenJS);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return _pptxPromise;
}


function ExcelRangeCapture({ items, setItems, sectionLabel, headerText, setHeaderText }) {
  const [capturing, setCapturing] = useState(false);
  const [mode, setMode] = useState("images");
  const [workbook, setWorkbook] = useState(null);
  const [activeSheet, setActiveSheet] = useState("");
  const [xlLoading, setXlLoading] = useState(false);
  const [xlFileName, setXlFileName] = useState("");
  const [xlError, setXlError] = useState("");
  const [headerInfo, setHeaderInfo] = useState({ titleRows: [], labelRows: [], headerEnd: -1 });
  const [rowsPerImage, setRowsPerImage] = useState(8);
  const [touchMode, setTouchMode] = useState("select");
  const [rangeLabel, setRangeLabel] = useState("No range selected");
  const [hasSelection, setHasSelection] = useState(false);

  // ── Selection stored in REF — never causes re-render ──
  const sel = useRef({ start: null, end: null, dragging: false });

  const photoRef = useRef();
  const xlRef = useRef();
  const tableWrapRef = useRef(null);
  const tableRef = useRef(null);

  const isTouchDevice = typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  const sheetData = workbook?.sheets?.[activeSheet]?.raw || [];
  const sheetMerges = workbook?.sheets?.[activeSheet]?.merges || [];

  useEffect(() => {
    if (!workbook || !activeSheet) {
      setHeaderInfo({ titleRows: [], labelRows: [], headerEnd: -1 });
      return;
    }
    setHeaderInfo(detectHeaderInfo(sheetData, sheetMerges));
  }, [workbook, activeSheet]);

  // ── Direct DOM highlight — zero React renders during drag ──
  const highlightDOM = useCallback(() => {
    const { start, end } = sel.current;
    const table = tableRef.current;
    if (!table) return;

    // Clear all highlights
    table.querySelectorAll("td.sel, td.sel-start").forEach(td => {
      td.classList.remove("sel", "sel-start");
    });

    if (!start || !end) {
      setRangeLabel("No range selected");
      setHasSelection(false);
      return;
    }

    const r1 = Math.min(start.r, end.r), r2 = Math.max(start.r, end.r);
    const c1 = Math.min(start.c, end.c), c2 = Math.max(start.c, end.c);

    // Highlight selected cells via DOM
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        const td = table.querySelector(`td[data-r="${r}"][data-c="${c}"]`);
        if (td) {
          td.classList.add("sel");
          if (r === start.r && c === start.c) td.classList.add("sel-start");
        }
      }
    }

    setRangeLabel(
      `${colLetter(c1)}${r1 + 1} : ${colLetter(c2)}${r2 + 1}  (${r2 - r1 + 1} rows × ${c2 - c1 + 1} cols)`
    );
    setHasSelection(true);
  }, []);

  const getNorm = () => {
    const { start, end } = sel.current;
    if (!start || !end) return null;
    return {
      r1: Math.min(start.r, end.r), r2: Math.max(start.r, end.r),
      c1: Math.min(start.c, end.c), c2: Math.max(start.c, end.c),
    };
  };

  // ── Mouse events on TABLE (event delegation — one handler, not 4000) ──
  const onTableMouseDown = useCallback((e) => {
    const td = e.target.closest("td[data-r]");
    if (!td) return;
    e.preventDefault();
    const r = +td.dataset.r, c = +td.dataset.c;
    sel.current = { start: { r, c }, end: { r, c }, dragging: true };
    highlightDOM();
  }, [highlightDOM]);

  const onTableMouseOver = useCallback((e) => {
    if (!sel.current.dragging) return;
    const td = e.target.closest("td[data-r]");
    if (!td) return;
    sel.current.end = { r: +td.dataset.r, c: +td.dataset.c };
    highlightDOM();
  }, [highlightDOM]);

  const onTableMouseUp = useCallback(() => {
    sel.current.dragging = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mouseup", onTableMouseUp);
    return () => window.removeEventListener("mouseup", onTableMouseUp);
  }, [onTableMouseUp]);

  // ── Touch events ──
  useEffect(() => {
    const el = tableWrapRef.current;
    if (!el) return;

    const cellFromPoint = (x, y) => {
      const target = document.elementFromPoint(x, y);
      const td = target?.closest?.("td[data-r]");
      if (!td) return null;
      return { r: +td.getAttribute("data-r"), c: +td.getAttribute("data-c") };
    };

    const onTouchStart = (e) => {
      if (touchMode !== "select" || !e.touches.length) return;
      const t = e.touches[0];
      const cell = cellFromPoint(t.clientX, t.clientY);
      if (!cell) return;
      e.preventDefault();
      sel.current = { start: cell, end: cell, dragging: true };
      highlightDOM();
    };

    const onTouchMove = (e) => {
      if (touchMode !== "select" || !e.touches.length || !sel.current.dragging) return;
      const t = e.touches[0];
      const cell = cellFromPoint(t.clientX, t.clientY);
      if (cell) { e.preventDefault(); sel.current.end = cell; highlightDOM(); }
    };

    const onTouchEnd = () => { sel.current.dragging = false; };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: false });
    el.addEventListener("touchcancel", onTouchEnd, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [touchMode, highlightDOM]);

  const isHeaderRow = (r) => headerInfo.headerEnd >= 0 && r <= headerInfo.headerEnd;

  const headerLabel = () => {
    if (headerInfo.headerEnd < 0) return "No header detected — using column letters as fallback";
    return `Rows 1–${headerInfo.headerEnd + 1} (${headerInfo.titleRows.length ? `${headerInfo.titleRows.length} title row(s)` : ""}${headerInfo.titleRows.length && headerInfo.labelRows.length ? " + " : ""}${headerInfo.labelRows.length ? `${headerInfo.labelRows.length} label row(s)` : ""})`;
  };

  const adjustHeader = (delta) => {
    setHeaderInfo((h) => {
      if (delta > 0) {
        const next = h.headerEnd + 1;
        if (next >= sheetData.length) return h;
        return { ...h, labelRows: [...h.labelRows, next], headerEnd: next };
      }
      if (h.labelRows.length) {
        const labelRows = h.labelRows.slice(0, -1);
        const headerEnd = labelRows.length ? labelRows[labelRows.length - 1]
          : (h.titleRows.length ? h.titleRows[h.titleRows.length - 1] : -1);
        return { ...h, labelRows, headerEnd };
      }
      if (h.titleRows.length) {
        const titleRows = h.titleRows.slice(0, -1);
        return { ...h, titleRows, headerEnd: titleRows.length ? titleRows[titleRows.length - 1] : -1 };
      }
      return h;
    });
  };

  const handleXlFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setXlLoading(true); setXlError(""); setXlFileName(file.name);
    try {
      const wb = await parseExcel(file);
      setWorkbook(wb);
      setActiveSheet(wb.sheetNames[0] || "");
      sel.current = { start: null, end: null, dragging: false };
      setHasSelection(false);
      setRangeLabel("No range selected");
    } catch (err) {
      setXlError(err.message || "Failed to parse Excel file.");
      setWorkbook(null);
    }
    setXlLoading(false);
    e.target.value = "";
  };

  // ── Canvas render — pure Canvas 2D, async toBlob ──
  // const renderToCanvas = async (r1, r2, c1, c2) => {
  //   const cols = Array.from({ length: c2 - c1 + 1 }, (_, i) => i + c1);
  //   const titleRows = headerInfo?.titleRows || [];
  //   const labelRows = headerInfo?.labelRows || [];
  //   const useFallbackColHeader = labelRows.length === 0;

  //   const MAX_CANVAS_W = 1400;
  //   const idealCellW = Math.floor((MAX_CANVAS_W - 24) / cols.length);
  //   const CELL_W = Math.max(60, Math.min(120, idealCellW));
  //   const CELL_H = 26, BAND_H = 38, TITLE_H = 22, LABEL_H = 24, PAD = 12;

  //   const dataRows = [];
  //   for (let r = r1; r <= r2; r++) dataRows.push(sheetData[r] || []);

  //   const titleBlockH = titleRows.length * TITLE_H;
  //   const labelBlockH = useFallbackColHeader ? LABEL_H : labelRows.length * LABEL_H;
  //   const W = PAD * 2 + cols.length * CELL_W;
  //   const H = BAND_H + titleBlockH + labelBlockH + dataRows.length * CELL_H + PAD;

  //   const canvas = document.createElement("canvas");
  //   canvas.width = W; canvas.height = H;
  //   const ctx = canvas.getContext("2d");

  //   ctx.fillStyle = "#fff";
  //   ctx.fillRect(0, 0, W, H);

  //   let y = 0;

  //   // Band
  //   const grad = ctx.createLinearGradient(0, 0, W, BAND_H);
  //   grad.addColorStop(0, "#3d1200"); grad.addColorStop(0.5, "#7a2e00"); grad.addColorStop(1, "#c96a10");
  //   ctx.fillStyle = grad;
  //   ctx.fillRect(0, y, W, BAND_H);
  //   ctx.fillStyle = "#fff";
  //   ctx.font = "bold 14px Arial,sans-serif";
  //   ctx.textBaseline = "middle";
  //   ctx.fillText(headerText || sectionLabel, PAD, y + BAND_H / 2);
  //   y += BAND_H;

  //   // Title rows
  //   titleRows.forEach((rIdx) => {
  //     const text = (sheetData[rIdx] || []).find((c) => c !== "" && c != null) ?? "";
  //     ctx.fillStyle = "#fdf3e7"; ctx.fillRect(0, y, W, TITLE_H);
  //     ctx.strokeStyle = "rgba(201,106,16,0.3)"; ctx.lineWidth = 0.75; ctx.strokeRect(0, y, W, TITLE_H);
  //     ctx.fillStyle = "#7a2e00"; ctx.font = "bold 12px Arial,sans-serif";
  //     ctx.textBaseline = "middle"; ctx.fillText(String(text), PAD, y + TITLE_H / 2);
  //     y += TITLE_H;
  //   });

  //   // Label rows
  //   if (!useFallbackColHeader) {
  //     labelRows.forEach((rIdx) => {
  //       const row = sheetData[rIdx] || [];
  //       ctx.fillStyle = "#f0e4d4"; ctx.fillRect(0, y, W, LABEL_H);
  //       cols.forEach((ci, xi) => {
  //         const x = PAD + xi * CELL_W;
  //         ctx.fillStyle = "#3d1200"; ctx.font = "bold 11.5px Arial,sans-serif";
  //         ctx.textBaseline = "middle";
  //         let text = String(row[ci] ?? "");
  //         const maxTW = CELL_W - 10;
  //         while (ctx.measureText(text).width > maxTW && text.length > 1) text = text.slice(0, -1) + "…";
  //         ctx.fillText(text, x + 5, y + LABEL_H / 2);
  //         if (xi > 0) { ctx.strokeStyle = "rgba(201,106,16,0.3)"; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + LABEL_H); ctx.stroke(); }
  //       });
  //       ctx.strokeStyle = "#c96a10"; ctx.lineWidth = 1;
  //       ctx.beginPath(); ctx.moveTo(0, y + LABEL_H); ctx.lineTo(W, y + LABEL_H); ctx.stroke();
  //       y += LABEL_H;
  //     });
  //   } else {
  //     ctx.fillStyle = "#f5f0e8"; ctx.fillRect(0, y, W, LABEL_H);
  //     cols.forEach((ci, xi) => {
  //       const x = PAD + xi * CELL_W;
  //       const label = colLetter(ci);
  //       ctx.fillStyle = "#7a2e00"; ctx.font = "bold 10px Arial,sans-serif";
  //       ctx.textBaseline = "middle";
  //       ctx.fillText(label, x + CELL_W / 2 - ctx.measureText(label).width / 2, y + LABEL_H / 2);
  //       if (xi > 0) { ctx.strokeStyle = "rgba(201,106,16,0.25)"; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + LABEL_H); ctx.stroke(); }
  //     });
  //     y += LABEL_H;
  //   }

  //   // Data rows — yield every 30 rows
  //   const CHUNK = 30;
  //   for (let start = 0; start < dataRows.length; start += CHUNK) {
  //     await new Promise(resolve => setTimeout(resolve, 0));
  //     const end = Math.min(start + CHUNK, dataRows.length);
  //     for (let ri = start; ri < end; ri++) {
  //       const row = dataRows[ri];
  //       const ry = y + ri * CELL_H;
  //       ctx.fillStyle = ri % 2 === 0 ? "#ffffff" : "#fdf9f4";
  //       ctx.fillRect(0, ry, W, CELL_H);
  //       ctx.strokeStyle = "rgba(201,106,16,0.18)"; ctx.lineWidth = 0.5;
  //       ctx.beginPath(); ctx.moveTo(0, ry + CELL_H); ctx.lineTo(W, ry + CELL_H); ctx.stroke();
  //       cols.forEach((ci, xi) => {
  //         const x = PAD + xi * CELL_W;
  //         let text = String(row[ci] ?? "");
  //         ctx.fillStyle = "#1c1917"; ctx.font = "12px Arial,sans-serif"; ctx.textBaseline = "middle";
  //         const maxTW = CELL_W - 8;
  //         while (ctx.measureText(text).width > maxTW && text.length > 1) text = text.slice(0, -1) + "…";
  //         ctx.fillText(text, x + 4, ry + CELL_H / 2);
  //         if (xi > 0) { ctx.strokeStyle = "rgba(201,106,16,0.15)"; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(x, ry); ctx.lineTo(x, ry + CELL_H); ctx.stroke(); }
  //       });
  //     }
  //   }

  //   ctx.strokeStyle = "#c96a10"; ctx.lineWidth = 1.5; ctx.strokeRect(0, 0, W, H);

  //   // ── Async encode — toBlob is non-blocking unlike toDataURL ──
  //   return new Promise((resolve) => {
  //     canvas.toBlob(
  //       (blob) => {
  //         if (!blob) { resolve(canvas.toDataURL("image/jpeg", 0.85)); return; }
  //         const reader = new FileReader();
  //         reader.onload = (e) => resolve(e.target.result);
  //         reader.onerror = () => resolve(canvas.toDataURL("image/jpeg", 0.85));
  //         reader.readAsDataURL(blob);
  //       },
  //       "image/jpeg",
  //       0.85
  //     );
  //   });
  // };

  // const handleCaptureRange = async () => {
  //   const n = getNorm();
  //   if (!n) return;
  //   setCapturing(true);
  //   await new Promise(r => setTimeout(r, 80));
  //   try {
  //     const dataUrl = await renderToCanvas(n.r1, n.r2, n.c1, n.c2);
  //     if (dataUrl) {
  //       setItems(prev => [...prev, {
  //         dataUrl, caption: `${activeSheet} — ${colLetter(n.c1)}${n.r1 + 1}:${colLetter(n.c2)}${n.r2 + 1}`,
  //         kind: "table-image", sheet: activeSheet,
  //       }]);
  //       sel.current = { start: null, end: null, dragging: false };
  //       highlightDOM();
  //     }
  //   } catch (err) { console.error("Capture error:", err); }
  //   finally { setCapturing(false); }
  // };

  // const handleAutoSplitCapture = async () => {
  //   const n = getNorm();
  //   if (!n) return;
  //   const chunkSize = Math.max(1, parseInt(rowsPerImage, 10) || 8);
  //   const newItems = [];
  //   setCapturing(true);
  //   await new Promise(r => setTimeout(r, 80));
  //   try {
  //     for (let start = n.r1; start <= n.r2; start += chunkSize) {
  //       const end = Math.min(start + chunkSize - 1, n.r2);
  //       await new Promise(r => setTimeout(r, 0));
  //       const dataUrl = await renderToCanvas(start, end, n.c1, n.c2);
  //       if (dataUrl) {
  //         newItems.push({
  //           dataUrl, caption: `${activeSheet} — rows ${start + 1}–${end + 1}`,
  //           kind: "table-image", sheet: activeSheet,
  //         });
  //       }
  //     }
  //     if (newItems.length) {
  //       setItems(prev => [...prev, ...newItems]);
  //       sel.current = { start: null, end: null, dragging: false };
  //       highlightDOM();
  //     }
  //   } catch (err) { console.error("Auto-split error:", err); }
  //   finally { setCapturing(false); }
  // };
  
function renderInWorker(params) {
  return new Promise((resolve, reject) => {
    let worker;
    try {
      worker = new Worker("/tableWorker.js");
    } catch (e) {
      reject(new Error("Worker unavailable: " + e.message));
      return;
    }
    // 10s timeout — if OffscreenCanvas unsupported it fails fast
    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error("Worker timeout"));
    }, 10000);
    worker.onmessage = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      if (e.data.error) { reject(new Error(e.data.error)); return; }
      if (e.data.arrayBuffer) {
        const blob = new Blob([e.data.arrayBuffer], { type: "image/jpeg" });
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.onerror = () => reject(new Error("FileReader failed"));
        reader.readAsDataURL(blob);
      } else { resolve(null); }
    };
    worker.onerror = (err) => {
      clearTimeout(timeout);
      worker.terminate();
      reject(new Error(err.message || "Worker error"));
    };
    worker.postMessage(params);
  });
}


const renderCanvas = useCallback(async (r1, r2, c1, c2) => {
  const cols = Array.from({ length: c2 - c1 + 1 }, (_, i) => i + c1).slice(0, 15);
  if (!cols.length || r2 < r1) return null;

  const titleRows = headerInfo?.titleRows || [];
  const labelRows = headerInfo?.labelRows || [];
  const useFallback = labelRows.length === 0;
  const MAX_W = 1400;
  const idealCW = Math.floor((MAX_W - 24) / cols.length);
  const CW = Math.max(60, Math.min(120, idealCW));
  const CH=26, BH=38, TH=22, LH=24, PAD=12;
  const dataRows = [];
  for (let r = r1; r <= r2; r++) dataRows.push(sheetData[r] || []);
  const W = PAD*2 + cols.length*CW;
  const H = BH + titleRows.length*TH + (useFallback ? LH : labelRows.length*LH) + dataRows.length*CH + PAD;

  // ── Split into vertical strips of MAX_H pixels each ──────────────────────
  // Canvas has a max height limit (~32767px in Chrome). Large sheets hit this.
  // We render in strips and stitch them into one final canvas.
  const MAX_STRIP_ROWS = 200; // rows per strip — well under any canvas limit

  // Draw a single strip to a canvas, returns ImageData
  const drawStrip = async (startRow, endRow, isFirst) => {
    const stripDataRows = dataRows.slice(startRow, endRow);
    const stripH = (isFirst ? BH + titleRows.length*TH + (useFallback ? LH : labelRows.length*LH) : 0) + stripDataRows.length*CH + (endRow >= dataRows.length ? PAD : 0);
    if (stripH <= 0) return null;

    const c = document.createElement("canvas");
    c.width = W; c.height = stripH;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, stripH);
    let y = 0;

    if (isFirst) {
      // Band
      const grad = ctx.createLinearGradient(0,0,W,BH);
      grad.addColorStop(0,"#3d1200"); grad.addColorStop(0.5,"#7a2e00"); grad.addColorStop(1,"#c96a10");
      ctx.fillStyle=grad; ctx.fillRect(0,y,W,BH);
      ctx.fillStyle="#fff"; ctx.font="bold 14px Arial,sans-serif"; ctx.textBaseline="middle";
      ctx.fillText(headerText||sectionLabel,PAD,y+BH/2); y+=BH;

      // Title rows
      titleRows.forEach(ri => {
        const text=(sheetData[ri]||[]).find(c=>c!==""&&c!=null)??"";
        ctx.fillStyle="#fdf3e7"; ctx.fillRect(0,y,W,TH);
        ctx.strokeStyle="rgba(201,106,16,0.3)"; ctx.lineWidth=0.75; ctx.strokeRect(0,y,W,TH);
        ctx.fillStyle="#7a2e00"; ctx.font="bold 12px Arial,sans-serif"; ctx.textBaseline="middle";
        ctx.fillText(String(text),PAD,y+TH/2); y+=TH;
      });

      // Label / fallback header
      if (!useFallback) {
        labelRows.forEach(ri => {
          const row=sheetData[ri]||[];
          ctx.fillStyle="#f0e4d4"; ctx.fillRect(0,y,W,LH);
          cols.forEach((ci,xi) => {
            const x=PAD+xi*CW; ctx.fillStyle="#3d1200"; ctx.font="bold 11.5px Arial,sans-serif"; ctx.textBaseline="middle";
            let t=String(row[ci]??"");
            while(ctx.measureText(t).width>CW-10&&t.length>1) t=t.slice(0,-1)+"…";
            ctx.fillText(t,x+5,y+LH/2);
            if(xi>0){ctx.strokeStyle="rgba(201,106,16,0.3)";ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+LH);ctx.stroke();}
          });
          ctx.strokeStyle="#c96a10";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,y+LH);ctx.lineTo(W,y+LH);ctx.stroke();
          y+=LH;
        });
      } else {
        ctx.fillStyle="#f5f0e8"; ctx.fillRect(0,y,W,LH);
        cols.forEach((ci,xi) => {
          const x=PAD+xi*CW; const label=colLetter(ci);
          ctx.fillStyle="#7a2e00"; ctx.font="bold 10px Arial,sans-serif"; ctx.textBaseline="middle";
          ctx.fillText(label,x+CW/2-ctx.measureText(label).width/2,y+LH/2);
          if(xi>0){ctx.strokeStyle="rgba(201,106,16,0.25)";ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+LH);ctx.stroke();}
        });
        y+=LH;
      }
    }

    // Data rows — synchronous, but strip is small enough to not freeze
    stripDataRows.forEach((row, ri) => {
      const globalRi = startRow + ri;
      const ry = y + ri*CH;
      ctx.fillStyle=globalRi%2===0?"#ffffff":"#fdf9f4"; ctx.fillRect(0,ry,W,CH);
      ctx.strokeStyle="rgba(201,106,16,0.18)";ctx.lineWidth=0.5;
      ctx.beginPath();ctx.moveTo(0,ry+CH);ctx.lineTo(W,ry+CH);ctx.stroke();
      cols.forEach((ci,xi) => {
        const x=PAD+xi*CW;
        let t=String(row[ci]??"");
        ctx.fillStyle="#1c1917";ctx.font="12px Arial,sans-serif";ctx.textBaseline="middle";
        while(ctx.measureText(t).width>CW-8&&t.length>1) t=t.slice(0,-1)+"…";
        ctx.fillText(t,x+4,ry+CH/2);
        if(xi>0){ctx.strokeStyle="rgba(201,106,16,0.15)";ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(x,ry);ctx.lineTo(x,ry+CH);ctx.stroke();}
      });
    });

    if (endRow >= dataRows.length) {
      ctx.strokeStyle="#c96a10";ctx.lineWidth=1.5;ctx.strokeRect(0,0,W,stripH);
    }
    return c;
  };

  // ── Build strips with a yield between each ────────────────────────────────
  const strips = [];
  for (let start = 0; start < Math.max(dataRows.length, 1); start += MAX_STRIP_ROWS) {
    // Yield to browser — lets spinner animate and prevents "page unresponsive"
    await new Promise(res => setTimeout(res, 0));
    await new Promise(res => requestAnimationFrame(res));

    const end = Math.min(start + MAX_STRIP_ROWS, dataRows.length);
    const strip = await drawStrip(start, end, start === 0);
    if (strip) strips.push(strip);
  }

  if (!strips.length) return null;
  // ── Stitch strips into final canvas ──────────────────────────────────────
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = W;
  finalCanvas.height = H;
  const finalCtx = finalCanvas.getContext("2d");

  let stitchY = 0;
  for (const strip of strips) {
    finalCtx.drawImage(strip, 0, stitchY);
    stitchY += strip.height;
    // Free memory
    strip.width = 0;
    strip.height = 0;
  }

  // Final border over the stitched canvas
  finalCtx.strokeStyle="#c96a10";
  finalCtx.lineWidth=1.5;
  finalCtx.strokeRect(0,0,W,H);

  return new Promise(resolve => {
    finalCanvas.toBlob(blob => {
      if (!blob) { resolve(finalCanvas.toDataURL("image/jpeg", 0.85)); return; }
      const reader = new FileReader();
      reader.onload = ev => resolve(ev.target.result);
      reader.onerror = () => resolve(finalCanvas.toDataURL("image/jpeg", 0.85));
      reader.readAsDataURL(blob);
    }, "image/jpeg", 0.85);
  });
}, [sheetData, headerInfo, headerText, sectionLabel]);

const handleCaptureRange = async () => {
  const n = getNorm();
  if (!n) return;
  setCapturing(true);
  try {
    const dataUrl = await renderCanvas(n.r1, n.r2, n.c1, n.c2);
    if (dataUrl) {
      setItems(prev => [...prev, {
        dataUrl,
        caption: `${activeSheet} — ${colLetter(n.c1)}${n.r1+1}:${colLetter(n.c2)}${n.r2+1}`,
        kind: "table-image", sheet: activeSheet,
      }]);
      sel.current = { start: null, end: null, dragging: false };
      highlightDOM();
    }
  } catch (err) {
    console.error("Capture error:", err);
  } finally {
    setCapturing(false);
  }
};
const handleAutoSplitCapture = async () => {
  const n = getNorm();
  if (!n) return;
  const chunkSize = Math.max(1, parseInt(rowsPerImage, 10) || 8);
  const newItems = [];
  setCapturing(true);
  try {
    for (let start = n.r1; start <= n.r2; start += chunkSize) {
      const end = Math.min(start + chunkSize - 1, n.r2);
      const dataUrl = await renderCanvas(start, end, n.c1, n.c2);
      if (dataUrl) {
        newItems.push({
          dataUrl,
          caption: `${activeSheet} — rows ${start+1}–${end+1}`,
          kind: "table-image", sheet: activeSheet,
        });
      }
    }
    if (newItems.length) {
      setItems(prev => [...prev, ...newItems]);
      sel.current = { start: null, end: null, dragging: false };
      highlightDOM();
    }
  } catch (err) {
    console.error("Auto-split error:", err);
  } finally {
    setCapturing(false);
  }
};

  const maxCols = sheetData.reduce((m, row) => Math.max(m, Array.isArray(row) ? row.length : 0), 0);
  const colCount = Math.min(maxCols, 20);

  return (
    <div>
      {capturing && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(15,13,10,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <div style={{ width: 40, height: 40, border: "4px solid rgba(201,106,16,0.2)", borderTop: "4px solid #c96a10", borderRadius: "50%", animation: "wprSpin .7s linear infinite" }} />
          <div style={{ color: "#ffcfa0", fontWeight: 700, fontSize: 15 }}>Generating image…</div>
        </div>
      )}

      {/* Mode tabs */}
      <div className="wpr-xl-tabs">
        <button className={`wpr-xl-tab${mode === "images" ? " active" : ""}`} onClick={() => setMode("images")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Upload Photos
        </button>
        <button className={`wpr-xl-tab${mode === "excel" ? " active" : ""}`} onClick={() => setMode("excel")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="8 13 10.5 16 14 11"/></svg>
          Capture from Excel
        </button>
      </div>

      {/* IMAGE UPLOAD MODE */}
      {mode === "images" && (
        <div>
          <button className="btn btn-out" style={{ height: 42, fontSize: 13 }} onClick={() => photoRef.current?.click()}>
            📁 Upload Images
          </button>
          <input type="file" ref={photoRef} accept="image/*" multiple style={{ display: "none" }}
            onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              const imgs = await Promise.all(files.map(f => readFileAsDataUrl(f).then(d => ({ dataUrl: d, caption: "", kind: "image" }))));
              setItems(p => [...p, ...imgs]);
              e.target.value = "";
            }} />
        </div>
      )}

      {/* EXCEL RANGE CAPTURE MODE */}
      {mode === "excel" && (
        <div className="wpr-xl-section">
          <div className="wpr-xl-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Excel Range → Image
          </div>

          <div className="wpr-xl-hdr-field">
            <label className="wpr-lbl">Report Header Text</label>
            <input className="finput" value={headerText} onChange={(e) => setHeaderText(e.target.value)} placeholder={`e.g. ${sectionLabel} — Week 24`} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <button className="btn btn-amber" style={{ height: 38, fontSize: 12.5, padding: "0 14px", display: "flex", alignItems: "center", gap: 7 }}
              onClick={() => xlRef.current?.click()} disabled={xlLoading}>
              {xlLoading
                ? <><div className="wpr-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Parsing…</>
                : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Upload Excel (.xlsx / .xls)</>}
            </button>
            <input type="file" ref={xlRef} accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={handleXlFile} />
            {xlFileName && !xlError && <span style={{ fontSize: 12, color: "#c96a10", fontWeight: 700 }}>📊 {xlFileName}</span>}
          </div>

          {xlError && (
            <div className="wpr-hint" style={{ background: "#fef2f2", borderColor: "#fecaca", color: "#dc2626", marginBottom: 12 }}>
              {xlError}
            </div>
          )}

          {workbook && (
            <div className="wpr-xl-workbook">
              <div className="wpr-xl-workbook-hdr">
                {xlFileName} — Click &amp; drag to select a range
              </div>

              {workbook.sheetNames.length > 1 && (
                <div className="wpr-xl-sheet-tabs">
                  {workbook.sheetNames.map(name => (
                    <button key={name} className={`wpr-xl-sheet-tab${name === activeSheet ? " active" : ""}`}
                      onClick={() => { setActiveSheet(name); sel.current = { start: null, end: null, dragging: false }; setHasSelection(false); setRangeLabel("No range selected"); }}>
                      {name}
                    </button>
                  ))}
                </div>
              )}

              <div className="wpr-xl-hdr-info" style={{ margin: "10px 10px 0" }}>
                <span className="wpr-range-label" style={{ color: "#7a2e00" }}>Auto header:</span>
                <span className="wpr-range-val" style={{ color: "#7a2e00" }}>{headerLabel()}</span>
                <div className="wpr-xl-hdr-stepper">
                  <button title="Shrink header" onClick={() => adjustHeader(-1)}>−</button>
                  <button title="Extend header" onClick={() => adjustHeader(1)}>+</button>
                </div>
              </div>  

              <div className="wpr-range-bar">
                <span className="wpr-range-label">Selected:</span>
                <span className="wpr-range-val">{rangeLabel}</span>
                <button onClick={handleCaptureRange} disabled={!hasSelection || capturing}
                  style={{ height: 32, padding: "0 14px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font)", background: (!hasSelection || capturing) ? "var(--surface)" : "linear-gradient(135deg,#3d1200,#7a2e00,#c96a10)", color: (!hasSelection || capturing) ? "var(--ink3)" : "#fff", border: "1.5px solid #c96a10", borderRadius: 7, cursor: (!hasSelection || capturing) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                  {capturing ? "Processing…" : "📷 Capture as 1 Image"}
                </button>
              </div>

              <div className="wpr-range-bar" style={{ marginTop: -4 }}>
                <span className="wpr-range-label">Or split into images of</span>
                <div className="wpr-xl-rows-field">
                  <input className="finput" type="number" min="1" max="40" value={rowsPerImage} onChange={(e) => setRowsPerImage(e.target.value)} />
                  <span className="wpr-range-label" style={{ fontWeight: 600 }}>rows each</span>
                </div>
                <button onClick={handleAutoSplitCapture} disabled={!hasSelection || capturing}
                  style={{ height: 32, padding: "0 14px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font)", background: (!hasSelection || capturing) ? "var(--surface)" : "linear-gradient(135deg,#3d1200,#7a2e00,#c96a10)", color: (!hasSelection || capturing) ? "var(--ink3)" : "#fff", border: "1.5px solid #c96a10", borderRadius: 7, cursor: (!hasSelection || capturing) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                  {capturing ? "Processing…" : "🔲 Auto-Split & Capture"}
                </button>
                {isTouchDevice && (
                  <button className={`wpr-touch-toggle${touchMode === "select" ? " on" : ""}`}
                    onClick={() => setTouchMode(m => m === "select" ? "scroll" : "select")}>
                    {touchMode === "select" ? "👆 Selecting" : "↕ Scrolling"}
                  </button>
                )}
              </div>

              {/* ── THE TABLE — event delegation, no per-cell handlers ── */}
              <div className="wpr-xl-table-wrap" ref={tableWrapRef}>
                <table
                  className="wpr-xl-table"
                  ref={tableRef}
                  onMouseDown={onTableMouseDown}
                  onMouseOver={onTableMouseOver}
                  onMouseUp={onTableMouseUp}
                >
                  <thead>
                    <tr>
                      <th style={{ width: 32, minWidth: 32 }}>#</th>
                      {Array.from({ length: colCount }, (_, ci) => (
                        <th key={ci}>{colLetter(ci)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sheetData.slice(0, 200).map((row, ri) => (
                      <tr key={ri} className={isHeaderRow(ri) ? "wpr-hdr-row" : ""}>
                        <td style={{ background: isHeaderRow(ri) ? undefined : "linear-gradient(135deg,#3d1200,#7a2e00)", color: isHeaderRow(ri) ? undefined : "#ffcfa0", fontWeight: 800, textAlign: "center", fontSize: 10, userSelect: "none", pointerEvents: "none" }}>
                          {ri + 1}
                        </td>
                        {Array.from({ length: colCount }, (_, ci) => (
                          <td key={ci} data-r={ri} data-c={ci}>
                            {String(Array.isArray(row) ? (row[ci] ?? "") : "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sheetData.length > 200 && (
                  <div style={{ padding: "8px 12px", fontSize: 11.5, color: "#c96a10", fontWeight: 700, background: "rgba(201,106,16,0.08)" }}>
                    Showing first 200 rows. All {sheetData.length} rows captured on export.
                  </div>
                )}
              </div>

              {headerText && (
                <div className="wpr-xl-hdr-preview" style={{ margin: "10px 10px 10px" }}>
                  <div className="wpr-xl-hdr-preview-bar">Preview: {headerText}</div>
                </div>
              )}
            </div>
          )}

          {!workbook && !xlLoading && !xlError && (
            <div className="wpr-hint" style={{ marginTop: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c96a10" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Upload an Excel file, then click &amp; drag over the data range and capture.
            </div>
          )}
        </div>
      )}

      {/* Captured items grid */}
      {items.length > 0 && (
        <div className="wpr-xl-captured-grid">
          {items.map((item, i) => item.dataUrl ? (
            <div key={i} className="wpr-xl-captured-card">
              <div className="wpr-xl-captured-card-hdr">
                {item.kind === "table-image" ? "📊" : "🖼"} {item.caption || `Item ${i + 1}`}
              </div>
              <img src={item.dataUrl} alt="" />
              <button className="wpr-xl-captured-del" onClick={() => setItems(p => p.filter((_, x) => x !== i))}>✕</button>
              <div className="wpr-xl-captured-cap">
                <input value={item.caption || ""} placeholder="Caption…"
                  onChange={(e) => setItems(p => p.map((it, x) => x === i ? { ...it, caption: e.target.value } : it))} />
              </div>
            </div>
          ) : null)}
        </div>
      )}
    </div>
  );
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
      width: "100%", height: 46, background: "transparent",
      border: "2px dashed var(--line2)", borderRadius: 9, color: "var(--ink2)",
      fontSize: 13.5, fontWeight: 700, cursor: "pointer", display: "flex",
      alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10,
      fontFamily: "var(--font)", transition: "all .15s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c96a10"; e.currentTarget.style.color = "#c96a10"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line2)"; e.currentTarget.style.color = "var(--ink2)"; }}
    >
      + {label}
    </button>
  );
}

function PhotoGrid({ photos, onRemove, onCaption, onAdd, accept, multiple = true, label = "Upload Photos" }) {
  const fileRef = useRef();
  return (
    <div>
      <button className="btn btn-out" style={{ height: 42, fontSize: 13 }} onClick={() => fileRef.current?.click()}>
        📁 {label}
      </button>
      <input type="file" ref={fileRef} accept={accept || "image/*"} multiple={multiple} style={{ display: "none" }} onChange={onAdd} />
      <div className="wpr-photo-grid">
        {photos.map((ph, i) => ph.dataUrl ? (
          <div key={i} className="wpr-photo-card">
            <img src={ph.dataUrl} alt="" />
            <button className="wpr-photo-del" onClick={() => onRemove(i)}>✕</button>
            <div className="wpr-photo-cap">
              <input value={ph.label || ph.caption || ""} placeholder="Caption…" onChange={(e) => onCaption(i, e.target.value)} />
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
  const toggle = (k) => setOpenSec((p) => ({ ...p, [k]: !p[k] }));
const [logoDataUrl, setLogoDataUrl] = useState(null); 
  const [site, setSite] = useState(user?.site_names?.[0] || user?.site_name || "");
  const [engineer, setEngineer] = useState(user?.name || "");
  const [reportDate, setReportDate] = useState(today());
  const [location, setLocation] = useState("");
  const [reportNum, setReportNum] = useState(1);
  const [siteImage, setSiteImage] = useState(null);
  const [activities, setActivities] = useState([]);
  const [graphicalImages, setGraphicalImages] = useState([]);
  const [sitePhotos, setSitePhotos] = useState([]);
  const [drawingHeaders, setDrawingHeaders] = useState(["Architect GFC Drawing", "Structure GFC Drawing", "MEPF GFC Drawing"]);
  const [drawingData, setDrawingData] = useState([]);
  const [officeItems, setOfficeItems] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [drawDecision, setDrawDecision] = useState([]);
  const [checklistPhotos, setChecklistPhotos] = useState([]);
  const [delayPoints, setDelayPoints] = useState([]);
  const [plans, setPlans] = useState([]);
const [sections, setSections] = useState(() =>
  STANDARD_SECTIONS.map((title) => ({ key: title, title, isStandard: true, hidden: false, slideHidden: false, type: "text", textItems: [], images: [] }))
);

  // ── The three new sections ──────────────────────────────────────────────
  const [barchartItems, setBarchartItems] = useState([]);
  const [barchartHeader, setBarchartHeader] = useState("");
  const [cubeItems, setCubeItems] = useState([]);
  const [cubeHeader, setCubeHeader] = useState("");
  const [momItems, setMomItems] = useState([]);
  const [momHeader, setMomHeader] = useState("");

  const [draftExists, setDraftExists] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState("");
  const [autoSavePending, setAutoSavePending] = useState(false);
  const [toast, setToast] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState("");
  const [genProgress, setGenProgress] = useState(0);
  const [successUrls, setSuccessUrls] = useState(null);
const uploadWprRef = useRef();
  const showToast = (msg, type = "info", ms = 3000) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), ms);
  };

  const fetchReportNum = useCallback(async (siteName, date) => {
    if (!siteName || !date || !supabase) return;
    const { data } = await supabase.from("wpr_reports").select("report_number")
      .eq("site_name", siteName).order("report_number", { ascending: false }).limit(1);
    setReportNum(data?.[0]?.report_number ? data[0].report_number + 1 : 1);
  }, [supabase]);

  useEffect(() => { fetchReportNum(site, reportDate); }, [site, reportDate, fetchReportNum]);

  const checkDraft = useCallback(async () => {
    if (!site || !engineer || !supabase) return;
    const { data } = await supabase.from("wpr_drafts").select("updated_at")
      .eq("site_name", site).eq("engineer_name", engineer).maybeSingle();
    if (data) {
      setDraftExists(true);
      setDraftSavedAt(new Date(data.updated_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true }));
    } else { setDraftExists(false); setDraftSavedAt(""); }
  }, [site, engineer, supabase]);

  useEffect(() => { if (site && engineer) checkDraft(); }, [site, engineer, checkDraft]);

  const hasAnyData = useCallback(() => {
    if (activities.filter((a) => a.name).length > 0) return true;
    if (plans.filter(Boolean).length > 0) return true;
    if (officeItems.filter(Boolean).length > 0) return true;
    if (delayPoints.filter(Boolean).length > 0) return true;
    if (drawingData.length > 0) return true;
    if (visitors.filter((v) => v.name).length > 0) return true;
    if (drawDecision.filter((d) => d.drawingName).length > 0) return true;
    if (location.trim()) return true;
    return false;
  }, [activities, plans, officeItems, delayPoints, drawingData, visitors, drawDecision, location]);

  const [isDirty, setIsDirty] = useState(false);
  useEffect(() => { if (hasAnyData()) setIsDirty(true); }, [activities, plans, officeItems, delayPoints, drawingData, visitors, drawDecision, location]);
  useEffect(() => {
    if (!site || !engineer || !supabase) return;
    const t = setInterval(() => { if (isDirty && hasAnyData()) { saveDraft(true); setIsDirty(false); } }, 20000);
    return () => clearInterval(t);
  }, [site, engineer, supabase, isDirty, hasAnyData]);

  const totalImages = () => {
    let n = 0;
    activities.forEach((a) => { n += (a.progressImages || []).filter((i) => i.dataUrl).length; });
    n += graphicalImages.filter((i) => i.dataUrl).length;
    n += sitePhotos.filter((i) => i.dataUrl).length;
    n += checklistPhotos.filter((i) => i.dataUrl).length;
    n += barchartItems.filter((i) => i.dataUrl).length;
    n += cubeItems.filter((i) => i.dataUrl).length;
    n += momItems.filter((i) => i.dataUrl).length;
    return n;
  };

  const saveDraft = async (silent = false) => {
    if (!supabase) { if (!silent) showToast("Database not ready", "error"); return; }
    if (!site || !engineer) { if (!silent) showToast("Site and engineer required", "error"); return; }
    setAutoSavePending(true);
    const payload = {
      site_name: site, engineer_name: engineer, report_date: reportDate,
      report_number: reportNum, location,
      activities: activities.map((a) => ({ name: a.name || "", status: a.status || "", progressImages: a.progressImages || [] })),
      next_week_plans: plans,
      drawing_register_headers: drawingHeaders,
      drawing_register_data: drawingData,
      office_activity_items: officeItems,
      visitor_register_data: visitors,
      drawing_decision_data: drawDecision,
      delay_points: delayPoints,
      report_sections: sections.map((s) => ({ title: s.title, isStandard: s.isStandard, hidden: s.hidden, slideHidden: s.slideHidden, type: s.type, textItems: s.textItems || [] })),
      barchart_header: barchartHeader,
      cube_header: cubeHeader,
      mom_header: momHeader,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("wpr_drafts").upsert(payload, { onConflict: "site_name,engineer_name" }).select();
    setAutoSavePending(false);
    if (error) { if (!silent) showToast("❌ Save failed: " + error.message, "error"); return; }
    const ts = new Date().toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true });
    setDraftExists(true); setDraftSavedAt(ts);
    if (!silent) showToast("✅ Draft saved — " + ts, "success");
  };

  const loadDraft = async () => {
    const { data, error } = await supabase.from("wpr_drafts").select("*").eq("site_name", site).eq("engineer_name", engineer).maybeSingle();
    if (error || !data) { showToast("No draft found", "error"); return; }
    if (data.report_date) setReportDate(data.report_date);
    if (data.location !== undefined) setLocation(data.location ?? "");
    if (data.report_number) setReportNum(data.report_number);
    if (Array.isArray(data.activities)) setActivities(data.activities.map((a) => ({ ...a, progressImages: a.progressImages || [] })));
    if (Array.isArray(data.next_week_plans)) setPlans(data.next_week_plans);
    if (Array.isArray(data.drawing_register_headers)) setDrawingHeaders(data.drawing_register_headers);
    if (Array.isArray(data.drawing_register_data)) setDrawingData(data.drawing_register_data);
    if (Array.isArray(data.office_activity_items)) setOfficeItems(data.office_activity_items);
    if (Array.isArray(data.visitor_register_data)) setVisitors(data.visitor_register_data);
    if (Array.isArray(data.drawing_decision_data)) setDrawDecision(data.drawing_decision_data);
    if (Array.isArray(data.delay_points)) setDelayPoints(data.delay_points);
    if (Array.isArray(data.report_sections)) setSections(data.report_sections.map((s) => ({ key: s.key || s.title, ...s, textItems: s.textItems || [], images: s.images || [] })));
    if (data.barchart_header) setBarchartHeader(data.barchart_header);
    if (data.cube_header) setCubeHeader(data.cube_header);
    if (data.mom_header) setMomHeader(data.mom_header);
    showToast("✅ Draft restored! (Re-upload images/Excel files)", "success");
  };

  const deleteDraft = async () => {
    await supabase.from("wpr_drafts").delete().eq("site_name", site).eq("engineer_name", engineer);
    setDraftExists(false); setDraftSavedAt("");
    showToast("🗑 Draft deleted", "info");
  };

  const generate = async () => {
    if (!site) { showToast("Select a site", "error"); return; }
    if (!engineer) { showToast("Enter engineer name", "error"); return; }
    if (!reportDate) { showToast("Select report date", "error"); return; }
    setGenerating(true); setGenProgress(5); setGenStep("Saving report data…"); setSuccessUrls(null);
    try {
      await loadPptxGen();
      const dateFormatted = new Date(reportDate + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
      const dateStr = reportDate.replace(/-/g, "");
      const safeEng = engineer.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
      const folder = `${dateStr}_${safeEng}`;
      const safeSite = site.replace(/\s+/g, "_");

      const { data: reportData, error: reportError } = await supabase.from("wpr_reports").insert({
        site_name: site, engineer_name: engineer, report_date: dateFormatted,
        report_number: reportNum, location, status: "submitted",
        activities: activities.map((a) => ({ name: a.name, status: a.status })),
        next_week_plans: plans.filter(Boolean),
        drawing_register_headers: drawingHeaders, drawing_register_data: drawingData,
        office_activity_items: officeItems.filter(Boolean),
        visitor_register_data: visitors, drawing_decision_data: drawDecision,
        delay_points: delayPoints.filter(Boolean),
        report_sections: sections.map((s) => ({ title: s.title, isStandard: s.isStandard, hidden: s.hidden, slideHidden: s.slideHidden, type: s.type, textItems: s.textItems || [] })),
        submitted_by: user?.user_name || engineer,
      }).select("id").single();

      if (reportError) throw reportError;
      const reportId = reportData.id;

      setGenProgress(15); setGenStep("Generating PowerPoint presentation…");

      const sectionVisibility = {};
      sections.forEach((s) => { sectionVisibility[s.key || s.title] = !s.slideHidden; });

      const pptBlob = await generatePPT({
        site, engineer, reportDate: dateFormatted, reportNum, location,
        activities, graphicalImages, sitePhotos, siteImage,
        plans, drawingHeaders, drawingData, officeItems, visitors,
        drawDecision, delayPoints, checklistPhotos, sections, sectionVisibility,
        barchartItems, cubeItems, momItems,
      });

      const dlUrl = URL.createObjectURL(pptBlob);
      const dlA = document.createElement("a");
      dlA.href = dlUrl; dlA.download = `WPR_${zp(reportNum)}_${site.replace(/\s+/g, "_")}.pptx`;
      dlA.style.display = "none"; document.body.appendChild(dlA); dlA.click();
      document.body.removeChild(dlA); setTimeout(() => URL.revokeObjectURL(dlUrl), 10000);

      setGenProgress(55); setGenStep("Uploading presentation…");
      const pptPath = `${safeSite}/${folder}/WPR_${zp(reportNum)}_${safeSite}.pptx`;
      const pptUrl = await uploadBlob(supabase, pptBlob, pptPath, "application/vnd.openxmlformats-officedocument.presentationml.presentation");
      await supabase.from("wpr_reports").update({ presentation_url: pptUrl }).eq("id", reportId);

      setGenProgress(65); setGenStep("Uploading images…");
      let uploadedCount = 0;
      const allImgCounts = [
        graphicalImages.filter((i) => i.dataUrl).length, sitePhotos.filter((i) => i.dataUrl).length,
        checklistPhotos.filter((i) => i.dataUrl).length, barchartItems.filter((i) => i.dataUrl).length,
        cubeItems.filter((i) => i.dataUrl).length, momItems.filter((i) => i.dataUrl).length,
        ...activities.map((a) => (a.progressImages || []).filter((i) => i.dataUrl).length),
      ];
      const totalUp = allImgCounts.reduce((a, b) => a + b, 0);

      const uploadBatch = async (images, imageType, prefix, activityIndex = null) => {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          if (!img.dataUrl) continue;
          const ext = img.dataUrl.split(";")[0].split("/")[1] || "jpg";
          const cap = (img.label || img.caption || "").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 25);
          const fname = `${prefix}_${i + 1}${cap ? "_" + cap : ""}.${ext}`;
          const path = `${safeSite}/${folder}/${imageType}/${fname}`;
          const publicUrl = await uploadImage(supabase, img.dataUrl, path);
          await supabase.from("wpr_images").insert({ wpr_report_id: reportId, image_type: imageType, activity_index: activityIndex, storage_path: path, public_url: publicUrl, caption: img.label || img.caption || "", sort_order: i });
          uploadedCount++;
          setGenProgress(65 + Math.round((uploadedCount / Math.max(totalUp, 1)) * 28));
          setGenStep(`Uploading images… (${uploadedCount}/${totalUp})`);
        }
      };

      if (siteImage) {
        const path = `${safeSite}/${folder}/site_image/title.jpg`;
        const url = await uploadImage(supabase, siteImage, path);
        await supabase.from("wpr_images").insert({ wpr_report_id: reportId, image_type: "site_image", storage_path: path, public_url: url, caption: "Site Title Image", sort_order: 0 });
        await supabase.from("wpr_reports").update({ site_image_url: url }).eq("id", reportId);
      }

      await uploadBatch(graphicalImages, "graphical", "graphical");
      await uploadBatch(sitePhotos, "site_photo", "site");
      await uploadBatch(checklistPhotos, "checklist", "checklist");
      await uploadBatch(barchartItems, "barchart", "barchart");
      await uploadBatch(cubeItems, "cube_testing", "cube");
      await uploadBatch(momItems, "mom_review", "mom");
      for (let ai = 0; ai < activities.length; ai++) {
        const imgs = activities[ai].progressImages || [];
        if (imgs.length) await uploadBatch(imgs, "progress", `act${ai + 1}`, ai);
      }

      setGenProgress(100); setGenStep("Done!");
      if (draftExists) await supabase.from("wpr_drafts").delete().eq("site_name", site).eq("engineer_name", engineer);
      setDraftExists(false); setDraftSavedAt("");
      await fetchReportNum(site, reportDate);
      setSuccessUrls({ reportId, pptUrl, viewUrl: `/wpr/${reportId}` });
    } catch (err) {
      setGenerating(false);
      showToast("❌ " + (err.message || "Generation failed"), "error", 6000);
    }
  };
const uploadExistingWpr = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!site) { showToast("Select a site first", "error"); return; }
  if (!engineer) { showToast("Enter engineer name first", "error"); return; }
  if (!reportDate) { showToast("Select report date first", "error"); return; }

  setGenerating(true);
  setGenProgress(10);
  setGenStep("Reading file…");
  setSuccessUrls(null);

  try {
    const dateFormatted = new Date(reportDate + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    const dateStr = reportDate.replace(/-/g, "");
    const safeEng = engineer.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
    const safeSite = site.replace(/\s+/g, "_");
    const folder = `${dateStr}_${safeEng}`;

    setGenProgress(25); setGenStep("Saving report record…");

    const { data: reportData, error: reportError } = await supabase.from("wpr_reports").insert({
      site_name: site,
      engineer_name: engineer,
      report_date: dateFormatted,
      report_number: reportNum,
      location,
      status: "uploaded",
      activities: [],
      next_week_plans: [],
      drawing_register_headers: drawingHeaders,
      drawing_register_data: [],
      office_activity_items: [],
      visitor_register_data: [],
      drawing_decision_data: [],
      delay_points: [],
      report_sections: sections.map((s) => ({ title: s.title, isStandard: s.isStandard, hidden: s.hidden, slideHidden: s.slideHidden, type: s.type, textItems: s.textItems || [] })),
      submitted_by: user?.user_name || engineer,
    }).select("id").single();

    if (reportError) throw reportError;
    const reportId = reportData.id;

    setGenProgress(55); setGenStep("Uploading file…");

    const ext = file.name.split(".").pop() || "pptx";
    const pptPath = `${safeSite}/${folder}/WPR_${zp(reportNum)}_${safeSite}_uploaded.${ext}`;
    const contentType = file.type || "application/vnd.openxmlformats-officedocument.presentationml.presentation";

    const { error: upErr } = await supabase.storage
      .from("wpr-images")
      .upload(pptPath, file, { contentType, upsert: true });
    if (upErr) throw upErr;

    const { data: urlData } = supabase.storage.from("wpr-images").getPublicUrl(pptPath);
    const pptUrl = urlData.publicUrl;

    await supabase.from("wpr_reports").update({ presentation_url: pptUrl }).eq("id", reportId);

    setGenProgress(100); setGenStep("Done!");
    await fetchReportNum(site, reportDate);
    setSuccessUrls({ reportId, pptUrl, viewUrl: `/wpr/${reportId}` });
  } catch (err) {
    setGenerating(false);
    showToast("❌ " + (err.message || "Upload failed"), "error", 6000);
  }

  e.target.value = "";
};
  const closeOverlay = () => { setGenerating(false); setSuccessUrls(null); setGenProgress(0); };
  const imgCount = totalImages();
  const actsCount = activities.filter((a) => a.name).length;
  const photosCount = sitePhotos.filter((p) => p.dataUrl).length;
  const barchartCount = barchartItems.filter((i) => i.dataUrl).length;
  const cubeCount = cubeItems.filter((i) => i.dataUrl).length;
  const momCount = momItems.filter((i) => i.dataUrl).length;

  return (
    <>
      <style>{WPR_CSS}</style>
      <div className="wpr-wrap">
        {/* Upload Existing WPR */}
{/* Upload Existing WPR */}
<button
  onClick={() => {
    if (!site) { showToast("Select a site first", "error"); return; }
    if (!engineer) { showToast("Enter engineer name first", "error"); return; }
    if (!reportDate) { showToast("Select report date first", "error"); return; }
    uploadWprRef.current?.click();
  }}
  style={{
    width: "100%", marginBottom: 14,
    display: "flex", alignItems: "center", gap: 10,
    padding: "11px 16px",
    background: "var(--paper)",
    border: "1.5px solid #c96a10",
    borderRadius: 10,
    cursor: "pointer",
    fontFamily: "var(--font)",
    textAlign: "left",
  }}
>
  <div style={{
    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
    background: "linear-gradient(135deg,#3d1200,#7a2e00,#c96a10)",
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  </div>
  <div style={{ flex: 1, minWidth: 0 }}>
    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>Upload Existing WPR</div>
    <div style={{ fontSize: 11.5, color: "var(--ink3)", marginTop: 1 }}>Previously made PPT · stored for selected date</div>
  </div>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c96a10" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
</button>
<input
  type="file"
  ref={uploadWprRef}
 accept="*/*" 
  style={{ display: "none" }}
  onChange={uploadExistingWpr}
/>

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
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink2)", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Image Budget
            </span>
            <div className="wpr-budget-track">
              <div className="wpr-budget-fill" style={{ width: `${Math.min(100, (imgCount / 25) * 100)}%`, background: imgCount <= 15 ? "var(--green)" : imgCount <= 22 ? "var(--amber)" : "#dc2626" }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)", whiteSpace: "nowrap", color: imgCount <= 15 ? "var(--green)" : "var(--amber)" }}>{imgCount} / 25</span>
          </div>
        )}

        {/* Draft banner */}
        {draftExists && (
          <div className="wpr-draft-banner">
            <div>
              <div className="wpr-draft-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Draft found
              </div>
              <div className="wpr-draft-sub">Saved on {draftSavedAt}</div>
            </div>
            <button className="btn btn-amber" style={{ height: 36, fontSize: 12, padding: "0 13px", display: "flex", alignItems: "center", gap: 6 }} onClick={loadDraft}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              Open
            </button>
            <button className="btn btn-red" style={{ height: 36, fontSize: 12, padding: "0 11px", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={deleteDraft}>
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
                <select className="finput" value={site} onChange={(e) => setSite(e.target.value)}>
                  {user.site_names.map((s) => <option key={s}>{s}</option>)}
                </select>
              ) : (
                <input className="finput" value={site} onChange={(e) => setSite(e.target.value)} placeholder="Site name…" />
              )}
            </div>
            <div className="wpr-fg">
              <label className="wpr-lbl">Engineer *</label>
              <input className="finput" value={engineer} onChange={(e) => setEngineer(e.target.value)} placeholder="Engineer name…" />
            </div>
            <div className="wpr-fg">
              <label className="wpr-lbl">Location</label>
              <input className="finput" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Surat" />
            </div>
            <div className="wpr-fg">
              <label className="wpr-lbl">Report Date *</label>
              <input className="finput" type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "linear-gradient(135deg,#3d1200,#7a2e00,#c96a10)", border: "1.5px solid #c96a10", borderRadius: 10, marginBottom: 16 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#ffcfa0", textTransform: "uppercase", letterSpacing: ".06em" }}>Report Number</div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--mono)", color: "#fff" }}>WPR — {zp(reportNum)}</div>
            </div>
          </div>
          <div className="wpr-fg">
            <label className="wpr-lbl">Title Slide Image (optional)</label>
            {siteImage ? (
              <div style={{ position: "relative", display: "inline-block" }}>
                <img src={siteImage} alt="site" style={{ height: 110, borderRadius: 10, border: "1.5px solid var(--line2)" }} />
                <button className="wpr-photo-del" style={{ position: "absolute", top: 6, right: 6 }} onClick={() => setSiteImage(null)}>✕</button>
              </div>
            ) : (
              <label className="wpr-drop-zone" style={{ display: "block", textAlign: "center", cursor: "pointer", padding: "20px" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 8 }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <div style={{ fontSize: 13, color: "var(--ink2)", fontWeight: 600 }}>Upload site overview photo</div>
                <input type="file" accept="image/*" style={{ display: "none" }}
                  onChange={async (e) => { if (e.target.files[0]) setSiteImage(await readFileAsDataUrl(e.target.files[0])); }} />
              </label>
            )}
          </div>
        </Acc>

        {/* ② ACTIVITIES */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-4"/></svg>} title="Activities" sub={actsCount ? `${actsCount} activities` : "Add construction activities"} open={openSec.acts} onToggle={() => toggle("acts")}>
          {activities.map((act, i) => (
            <div key={i} className="wpr-act-card">
              <button className="wpr-act-del" onClick={() => setActivities((p) => p.filter((_, x) => x !== i))}>✕</button>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div className="wpr-act-num">{i + 1}</div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{act.name || `Activity ${i + 1}`}</span>
              </div>
              <div className="wpr-g2">
                <div className="wpr-fg">
                  <label className="wpr-lbl">Activity Name</label>
                  <input className="finput" value={act.name} placeholder="e.g. EXCAVATION WORK" onChange={(e) => setActivities((p) => p.map((a, x) => x === i ? { ...a, name: e.target.value } : a))} />
                </div>
                <div className="wpr-fg">
                  <label className="wpr-lbl">Status / Note</label>
                  <input className="finput" value={act.status} placeholder="e.g. 75% completed" onChange={(e) => setActivities((p) => p.map((a, x) => x === i ? { ...a, status: e.target.value } : a))} />
                </div>
              </div>
              <div className="wpr-fg">
                <label className="wpr-lbl">Progress Images</label>
                <PhotoGrid
                  photos={act.progressImages || []}
                  onRemove={(j) => setActivities((p) => p.map((a, x) => x === i ? { ...a, progressImages: a.progressImages.filter((_, jj) => jj !== j) } : a))}
                  onCaption={(j, v) => setActivities((p) => p.map((a, x) => x === i ? { ...a, progressImages: a.progressImages.map((im, jj) => jj === j ? { ...im, label: v } : im) } : a))}
                  onAdd={async (e) => {
                    const files = Array.from(e.target.files || []);
                    const imgs = await Promise.all(files.map((f) => readFileAsDataUrl(f).then((d) => ({ dataUrl: d, label: "" }))));
                    setActivities((p) => p.map((a, x) => x === i ? { ...a, progressImages: [...(a.progressImages || []), ...imgs] } : a));
                    e.target.value = "";
                  }}
                  label="Add Progress Images"
                />
              </div>
            </div>
          ))}
          <BtnAdd label="Add Activity" onClick={() => setActivities((p) => [...p, { name: "", status: "", progressImages: [] }])} />
        </Acc>

        {/* ③ GRAPHICAL REPORT */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>} title="Graphical Report of Work" sub={graphicalImages.filter((i) => i.dataUrl).length ? `${graphicalImages.filter((i) => i.dataUrl).length} images` : "Upload progress images"} open={openSec.graph} onToggle={() => toggle("graph")}>
          <PhotoGrid
            photos={graphicalImages}
            onRemove={(i) => setGraphicalImages((p) => p.filter((_, x) => x !== i))}
            onCaption={(i, v) => setGraphicalImages((p) => p.map((im, x) => x === i ? { ...im, caption: v } : im))}
            onAdd={async (e) => {
              const files = Array.from(e.target.files || []);
              const imgs = await Promise.all(files.map((f) => readFileAsDataUrl(f).then((d) => ({ dataUrl: d, caption: "" }))));
              setGraphicalImages((p) => [...p, ...imgs]);
              e.target.value = "";
            }}
            label="Upload Graphical Images"
          />
        </Acc>

        {/* ④ SITE PHOTOGRAPHS */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>} title="Site Photographs" sub={photosCount ? `${photosCount} photos` : "General site photos"} open={openSec.photos} onToggle={() => toggle("photos")}>
          <PhotoGrid
            photos={sitePhotos}
            onRemove={(i) => setSitePhotos((p) => p.filter((_, x) => x !== i))}
            onCaption={(i, v) => setSitePhotos((p) => p.map((ph, x) => x === i ? { ...ph, label: v } : ph))}
            onAdd={async (e) => {
              const files = Array.from(e.target.files || []);
              const imgs = await Promise.all(files.map((f) => readFileAsDataUrl(f).then((d) => ({ dataUrl: d, label: "" }))));
              setSitePhotos((p) => [...p, ...imgs]);
              e.target.value = "";
            }}
            label="Upload Site Photos"
          />
        </Acc>

        {/* ⑤ CUBE TESTING REGISTER */}
        <Acc
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
          title="Cube Testing Register"
          sub={cubeCount ? `${cubeCount} items` : "Upload photos or capture from Excel"}
          open={openSec.cube} onToggle={() => toggle("cube")}
        >
          <div className="wpr-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c96a10" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Upload photos of cube test results, or load an Excel file, select the data range, and capture it as an image with a branded header.
          </div>
          <ExcelRangeCapture
            items={cubeItems}
            setItems={setCubeItems}
            sectionLabel="Cube Testing Register"
            headerText={cubeHeader}
            setHeaderText={setCubeHeader}
          />
        </Acc>

        {/* ⑥ DRAWING REGISTER */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>} title="Drawing Register" sub={drawingData.length ? `${drawingData.length} rows` : "GFC Drawing entries"} open={openSec.drawing} onToggle={() => toggle("drawing")}>
          <div className="wpr-hint">ℹ Column headers become table headers in the report. Add/remove columns as needed.</div>
          <div className="wpr-tbl-hdr" id="wpr-tbl-hdr-draw">
            <div style={{ width: 32, flexShrink: 0, textAlign: "center" }}>#</div>
            {drawingHeaders.map((h, hi) => (
              <div key={hi} style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}>
                <input value={h} onChange={(e) => setDrawingHeaders((p) => p.map((v, x) => x === hi ? e.target.value : v))}
                  style={{ flex: 1, background: "transparent", border: "1.5px dashed rgba(201,106,16,0.4)", borderRadius: 6, padding: "4px 8px", fontSize: 11.5, fontWeight: 800, color: "#7a2e00", fontFamily: "var(--font)", outline: "none", textTransform: "uppercase", letterSpacing: ".05em" }} />
                {drawingHeaders.length > 1 && (
                  <button onClick={() => setDrawingHeaders((p) => p.filter((_, x) => x !== hi))}
                    style={{ width: 18, height: 18, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 4, color: "#dc2626", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
                )}
              </div>
            ))}
            <button onClick={() => setDrawingHeaders((p) => [...p, "New Column"])}
              style={{ width: 26, height: 26, background: "#f0fdf4 !important", border: "1.5px solid #bbf7d0", borderRadius: 6, color: "#15803d", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>+</button>
          </div>
          {drawingData.map((row, ri) => (
            <div key={ri} className="wpr-tbl-row" style={{ gridTemplateColumns: `32px ${drawingHeaders.map(() => "1fr").join(" ")} 28px` }}>
              <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#3d1200,#7a2e00,#c96a10)", color: "#fff", borderRadius: 7, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{ri + 1}</div>
              {drawingHeaders.map((h, hi) => (
                <input key={hi} className="finput" value={row[`col${hi}`] || ""} placeholder={h}
                  onChange={(e) => setDrawingData((p) => p.map((r, x) => x === ri ? { ...r, [`col${hi}`]: e.target.value } : r))} />
              ))}
              <button onClick={() => setDrawingData((p) => p.filter((_, x) => x !== ri))}
                style={{ background: "none", border: "none", color: "var(--ink3)", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
          ))}
          <BtnAdd label="Add Drawing Row" onClick={() => {
            const newRow = {}; drawingHeaders.forEach((_, hi) => { newRow[`col${hi}`] = ""; });
            setDrawingData((p) => [...p, newRow]);
          }} />
        </Acc>

        {/* ⑦ OFFICE ACTIVITY */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>} title="Office Activity" sub={officeItems.filter(Boolean).length ? `${officeItems.filter(Boolean).length} items` : "Back office work"} open={openSec.office} onToggle={() => toggle("office")}>
          {officeItems.map((item, i) => (
            <div key={i} className="wpr-plan-item">
              <div className="wpr-plan-num">{i + 1}</div>
              <input value={item} placeholder="e.g. Lift work order prepared" onChange={(e) => setOfficeItems((p) => p.map((v, x) => x === i ? e.target.value : v))} />
              <button onClick={() => setOfficeItems((p) => p.filter((_, x) => x !== i))} style={{ background: "none", border: "none", color: "var(--ink3)", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
          ))}
          <BtnAdd label="Add Item" onClick={() => setOfficeItems((p) => [...p, ""])} />
        </Acc>

        {/* ⑧ VISITOR REGISTER */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} title="Visitor Register" sub={visitors.filter((v) => v.name).length ? `${visitors.filter((v) => v.name).length} visitors` : "Record site visitors"} open={openSec.visitor} onToggle={() => toggle("visitor")}>
          {visitors.map((row, i) => (
            <div key={i} className="wpr-vis-card">
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                <div className="wpr-act-num" style={{ width: 28, height: 28, fontSize: 12 }}>{i + 1}</div>
                <select className="finput" style={{ flex: 1 }} value={row.type || VISITOR_TYPES[0]} onChange={(e) => setVisitors((p) => p.map((v, x) => x === i ? { ...v, type: e.target.value } : v))}>
                  {VISITOR_TYPES.map((t) => <option key={t}>{t}</option>)}
                  <option value="__other__">+ Other…</option>
                </select>
                <button onClick={() => setVisitors((p) => p.filter((_, x) => x !== i))} style={{ background: "none", border: "none", color: "var(--ink3)", fontSize: 20, cursor: "pointer", flexShrink: 0 }}>✕</button>
              </div>
              <div className="wpr-g2">
                <div className="wpr-fg">
                  <label className="wpr-lbl">Name / Company</label>
                  <input className="finput" value={row.name || ""} placeholder="Visitor name" onChange={(e) => setVisitors((p) => p.map((v, x) => x === i ? { ...v, name: e.target.value } : v))} />
                </div>
                <div className="wpr-fg">
                  <label className="wpr-lbl">Instruction / Remark</label>
                  <input className="finput" value={row.instruction || ""} placeholder="Instructions given" onChange={(e) => setVisitors((p) => p.map((v, x) => x === i ? { ...v, instruction: e.target.value } : v))} />
                </div>
              </div>
            </div>
          ))}
          <BtnAdd label="Add Visitor" onClick={() => setVisitors((p) => [...p, { type: VISITOR_TYPES[0], name: "", instruction: "" }])} />
        </Acc>

        {/* ⑨ DRAWING & DECISION PENDING */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} title="Drawing & Decision Pending" sub={drawDecision.filter((r) => r.drawingName).length ? `${drawDecision.filter((r) => r.drawingName).length} items` : "Pending drawings"} open={openSec.drawdec} onToggle={() => toggle("drawdec")}>
          {drawDecision.length > 0 && (
            <div className="wpr-tbl-hdr">
              <div style={{ flex: 2 }}>Drawing / Decision Name</div>
              <div style={{ flex: 1 }}>Required Date</div>
              <div style={{ width: 28 }}></div>
            </div>
          )}
          {drawDecision.map((row, i) => (
            <div key={i} className="wpr-tbl-row" style={{ gridTemplateColumns: "28px 1fr 160px 28px" }}>
              <div style={{ width: 24, height: 24, background: "var(--blue)", color: "#fff", borderRadius: 6, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
              <input className="finput" value={row.drawingName || ""} placeholder="Drawing or decision name…" onChange={(e) => setDrawDecision((p) => p.map((r, x) => x === i ? { ...r, drawingName: e.target.value } : r))} />
              <input className="finput" type="date" value={row.requiredDate || ""} onChange={(e) => setDrawDecision((p) => p.map((r, x) => x === i ? { ...r, requiredDate: e.target.value } : r))} />
              <button onClick={() => setDrawDecision((p) => p.filter((_, x) => x !== i))} style={{ background: "none", border: "none", color: "var(--ink3)", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
          ))}
          <BtnAdd label="Add Pending Item" onClick={() => setDrawDecision((p) => [...p, { drawingName: "", requiredDate: "" }])} />
        </Acc>

        {/* ⑩ WEEKLY CHECKLIST */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>} title="Weekly Site Checklist" sub={checklistPhotos.filter((p) => p.dataUrl).length ? `${checklistPhotos.filter((p) => p.dataUrl).length} photos` : "Checklist photos"} open={openSec.checklist} onToggle={() => toggle("checklist")}>
          <PhotoGrid
            photos={checklistPhotos}
            onRemove={(i) => setChecklistPhotos((p) => p.filter((_, x) => x !== i))}
            onCaption={(i, v) => setChecklistPhotos((p) => p.map((ph, x) => x === i ? { ...ph, label: v } : ph))}
            onAdd={async (e) => {
              const files = Array.from(e.target.files || []);
              const imgs = await Promise.all(files.map((f) => readFileAsDataUrl(f).then((d) => ({ dataUrl: d, label: "" }))));
              setChecklistPhotos((p) => [...p, ...imgs]);
              e.target.value = "";
            }}
            label="Upload Checklist Photos"
          />
        </Acc>

        {/* ⑪ DELAY POINTS */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} title="Delay Points / Highlights / Red Flag" sub={delayPoints.filter(Boolean).length ? `${delayPoints.filter(Boolean).length} points` : "Issues and flags"} open={openSec.delay} onToggle={() => toggle("delay")}>
          {delayPoints.map((pt, i) => (
            <div key={i} className="wpr-plan-item" style={{ borderColor: "rgba(220,38,38,.25)" }}>
              <div className="wpr-plan-num" style={{ background: "rgba(220,38,38,.1)", color: "#dc2626" }}>{i + 1}</div>
              <input value={pt} placeholder="Delay point or red flag…" onChange={(e) => setDelayPoints((p) => p.map((v, x) => x === i ? e.target.value : v))} />
              <button onClick={() => setDelayPoints((p) => p.filter((_, x) => x !== i))} style={{ background: "none", border: "none", color: "var(--ink3)", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
          ))}
          <BtnAdd label="Add Delay Point" onClick={() => setDelayPoints((p) => [...p, ""])} />
        </Acc>

        {/* ⑫ NEXT WEEK PLANNING */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} title="Next Week Planning" sub={plans.filter(Boolean).length ? `${plans.filter(Boolean).length} plans` : "Planned activities"} open={openSec.plan} onToggle={() => toggle("plan")}>
          {plans.map((pl, i) => (
            <div key={i} className="wpr-plan-item">
              <div className="wpr-plan-num">{i + 1}</div>
              <input value={pl} placeholder="Planned activity for next week…" onChange={(e) => setPlans((p) => p.map((v, x) => x === i ? e.target.value : v))} />
              <button onClick={() => setPlans((p) => p.filter((_, x) => x !== i))} style={{ background: "none", border: "none", color: "var(--ink3)", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
          ))}
          <BtnAdd label="Add Planned Item" onClick={() => setPlans((p) => [...p, ""])} />
        </Acc>

        {/* ⑬ MOM REVIEW */}
        <Acc
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
          title="MOM Review"
          sub={momCount ? `${momCount} items` : "Minutes of Meeting — photos or Excel capture"}
          open={openSec.mom} onToggle={() => toggle("mom")}
        >
          <div className="wpr-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c96a10" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Upload MOM photos or select a range from your MOM Excel sheet to capture it as a branded table image.
          </div>
          <ExcelRangeCapture
            items={momItems}
            setItems={setMomItems}
            sectionLabel="MOM Review"
            headerText={momHeader}
            setHeaderText={setMomHeader}
          />
        </Acc>

        {/* ⑭ BARCHART & WORKSHEET */}
        <Acc
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
          title="Barchart & Worksheet"
          sub={barchartCount ? `${barchartCount} items` : "Programme / schedule — photos or Excel capture"}
          open={openSec.barchart} onToggle={() => toggle("barchart")}
        >
          <div className="wpr-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c96a10" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Upload bar chart / programme photos, or open your schedule Excel file, select the barchart range, and capture it with a header banner.
          </div>
          <ExcelRangeCapture
            items={barchartItems}
            setItems={setBarchartItems}
            sectionLabel="Barchart & Worksheet"
            headerText={barchartHeader}
            setHeaderText={setBarchartHeader}
          />
        </Acc>

        {/* ⑮ REPORT SECTIONS */}
        <Acc icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>} title="Report Sections" sub="Reorder, hide or add custom sections" open={openSec.rc} onToggle={() => toggle("rc")}>
          <div className="wpr-hint">ℹ Standard sections are always included. Drag the ⠿ handle to reorder, use Hide to exclude from PPT, or 🚫 to omit entirely.</div>
          {sections.map((sec, si) => (
            <div
  key={si}
  className="wpr-rc-item"
  draggable
  onDragStart={(e) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(si));
    e.currentTarget.style.opacity = "0.45";
  }}
  onDragEnd={(e) => {
    e.currentTarget.style.opacity = "1";
    document.querySelectorAll(".wpr-rc-item").forEach(el => {
      el.style.borderTop = ""; el.style.borderBottom = "";
    });
  }}
  onDragOver={(e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const midY = e.currentTarget.getBoundingClientRect().top + e.currentTarget.getBoundingClientRect().height / 2;
    document.querySelectorAll(".wpr-rc-item").forEach(el => { el.style.borderTop = ""; el.style.borderBottom = ""; });
    if (e.clientY < midY) e.currentTarget.style.borderTop = "2.5px solid #c96a10";
    else e.currentTarget.style.borderBottom = "2.5px solid #c96a10";
  }}
  onDragLeave={(e) => { e.currentTarget.style.borderTop = ""; e.currentTarget.style.borderBottom = ""; }}
  onDrop={(e) => {
    e.preventDefault();
    e.currentTarget.style.borderTop = ""; e.currentTarget.style.borderBottom = "";
    const fromIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (isNaN(fromIdx) || fromIdx === si) return;
    const midY = e.currentTarget.getBoundingClientRect().top + e.currentTarget.getBoundingClientRect().height / 2;
    const insertAfter = e.clientY >= midY;
    setSections((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      let toIdx = fromIdx < si ? si - 1 : si;
      if (insertAfter) toIdx += 1;
      next.splice(toIdx, 0, moved);
      return next;
    });
  }}
  onTouchStart={(e) => {
    const touch = e.touches[0];
    e.currentTarget._touchStartY = touch.clientY;
    e.currentTarget._touchIdx = si;
    e.currentTarget.style.opacity = "0.55";
    e.currentTarget.style.transform = "scale(1.02)";
    e.currentTarget.style.zIndex = "100";
    e.currentTarget.style.boxShadow = "0 8px 24px rgba(201,106,16,0.35)";
  }}
  onTouchMove={(e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const allItems = Array.from(document.querySelectorAll(".wpr-rc-item"));
    allItems.forEach(el => { el.style.borderTop = ""; el.style.borderBottom = ""; });
    const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest(".wpr-rc-item");
    if (target && target !== e.currentTarget) {
      const rect = target.getBoundingClientRect();
      if (touch.clientY < rect.top + rect.height / 2) target.style.borderTop = "2.5px solid #c96a10";
      else target.style.borderBottom = "2.5px solid #c96a10";
    }
  }}
  onTouchEnd={(e) => {
    e.currentTarget.style.opacity = "1";
    e.currentTarget.style.transform = "";
    e.currentTarget.style.zIndex = "";
    e.currentTarget.style.boxShadow = "";
    document.querySelectorAll(".wpr-rc-item").forEach(el => { el.style.borderTop = ""; el.style.borderBottom = ""; });
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest(".wpr-rc-item");
    if (!target || target === e.currentTarget) return;
    const allItems = Array.from(document.querySelectorAll(".wpr-rc-item"));
    const fromIdx = si;
    const toIdx = allItems.indexOf(target);
    if (toIdx === -1 || fromIdx === toIdx) return;
    const rect = target.getBoundingClientRect();
    const insertAfter = touch.clientY >= rect.top + rect.height / 2;
    setSections((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      let finalIdx = fromIdx < toIdx ? toIdx - 1 : toIdx;
      if (insertAfter) finalIdx += 1;
      next.splice(finalIdx, 0, moved);
      return next;
    });
  }}
>
              <div className="wpr-rc-hdr">
                {/* Drag handle */}
                <div
                  title="Drag to reorder"
                  style={{
                    cursor: "grab",
                    color: "var(--ink3)",
                    fontSize: 18,
                    lineHeight: 1,
                    padding: "0 4px",
                    userSelect: "none",
                    flexShrink: 0,
                  }}
                >
                  ⠿
                </div>
                <div className="wpr-rc-badge">{sec.isStandard ? "::" : "✨"}</div>
                <input
                  className="wpr-rc-title"
                  value={sec.title}
                  onChange={(e) => setSections((p) => p.map((s, x) => x === si ? { ...s, title: e.target.value } : s))}
                />
                <div className="wpr-rc-actions">
                  <button className="wpr-rc-btn" title="Move up" onClick={() => {
                    if (si === 0) return;
                    setSections((p) => { const n = [...p]; [n[si - 1], n[si]] = [n[si], n[si - 1]]; return n; });
                  }}>↑</button>
                  <button className="wpr-rc-btn" title="Move down" onClick={() => {
                    if (si === sections.length - 1) return;
                    setSections((p) => { const n = [...p]; [n[si], n[si + 1]] = [n[si + 1], n[si]]; return n; });
                  }}>↓</button>
                  <button
                    className={`wpr-rc-btn${sec.slideHidden ? " hide-active" : ""}`}
                    onClick={() => setSections((p) => p.map((s, x) => x === si ? { ...s, slideHidden: !s.slideHidden } : s))}
                  >{sec.slideHidden ? "👁" : "Hide"}</button>
                  {sec.isStandard ? (
                    <button
                      className={`wpr-rc-btn${sec.hidden ? " hide-active" : ""}`}
                      onClick={() => setSections((p) => p.map((s, x) => x === si ? { ...s, hidden: !s.hidden } : s))}
                    >🚫</button>
                  ) : (
                    <button className="wpr-rc-btn del" onClick={() => setSections((p) => p.filter((_, x) => x !== si))}>🗑</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Acc>
        {/* FAB */}
        <div className="wpr-fab-wrap">
          <button onClick={() => saveDraft(false)} disabled={autoSavePending}
            style={{ width: "100%", height: 40, marginBottom: 8, fontSize: 13, fontFamily: "var(--font)", fontWeight: 700, background: "linear-gradient(135deg,var(--amber),#7a2e00,#c96a10)", color: "#fff", border: "1.5px solid #c96a10", borderRadius: 10, cursor: "pointer", pointerEvents: "all", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            {autoSavePending ? (
              <><div className="wpr-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save Draft</>
            )}
          </button>
          <button className="wpr-fab" onClick={generate} disabled={generating} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
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
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>Generating Report…</div>
                <div style={{ fontSize: 13, color: "var(--ink2)" }}>{genStep}</div>
                <div className="wpr-progress-bar">
                  <div className="wpr-progress-fill" style={{ width: `${genProgress}%` }} />
                </div>
                <div style={{ fontSize: 12, color: "var(--ink3)", fontFamily: "var(--mono)" }}>{genProgress}%</div>
              </div>
            ) : (
              <div className="wpr-overlay-card">
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <div className="wpr-success-title">Report Generated!</div>
                <div className="wpr-success-sub">WPR — {zp(reportNum)} for <strong>{site}</strong> has been saved with all images uploaded and a PowerPoint presentation created.</div>
                <div className="wpr-success-links">
                  <div className="wpr-link-row" style={{ background: "linear-gradient(135deg,#3d1200,#7a2e00,#c96a10)", border: "1.5px solid #c96a10", color: "#fff" }}>
                    <span className="wpr-link-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 12h2l2-4 2 8 2-4h2"/></svg></span>
                    <div className="wpr-link-label">
                      <div style={{ fontWeight: 800, color: "#ffcfa0" }}>PowerPoint Downloaded!</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>WPR_{zp(reportNum)}_{site}.pptx — check your Downloads folder</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <a href={`https://docs.google.com/viewer?url=${encodeURIComponent(successUrls.pptUrl)}`} target="_blank" rel="noreferrer" className="wpr-link-row">
                    <span className="wpr-link-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></span>
                    <div className="wpr-link-label">
                      <div style={{ fontWeight: 800 }}>View Report</div>
                      <div style={{ fontSize: 11, color: "var(--ink3)", marginTop: 2 }}>Preview in browser</div>
                    </div>
                    <span className="wpr-link-arrow">→</span>
                  </a>
                </div>
                <button className="btn btn-amber" style={{ width: "100%", height: 44, marginTop: 4 }} onClick={closeOverlay}>✓ Done</button>
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