import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://efqfjfthsleymhljswcq.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmcWZqZnRoc2xleW1obGpzd2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNDY0MjMsImV4cCI6MjA5NTkyMjQyM30.PYMRiKdnhzb6pkvhDB4M4Qdp3nSGhsZpHGuclVqYNMs";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

const fmtD  = (d)  => d  ? new Date(d+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—";
const fmtDT = (dt) => dt ? new Date(dt).toLocaleString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}) : "—";

// ── Icons ──────────────────────────────────────────────────────────────────
const IcoDpr    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IcoWpr    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 12h2l2-4 2 8 2-4h2"/></svg>;
const IcoSvr    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcoEye    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoDl     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoPdf    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IcoChev   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoCal    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoUser   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoEmpty  = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>;
const IcoSoon   = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>;
const IcoWarn   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoInfo   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

// ── CSS ────────────────────────────────────────────────────────────────────
const CSS = `
.mr-tabs{display:flex;gap:0;border-bottom:2px solid var(--line);margin-bottom:22px;}
.mr-tab{display:flex;align-items:center;gap:6px;padding:9px 18px;font-family:var(--font);font-size:12px;font-weight:700;color:var(--ink3);background:transparent;border:none;cursor:pointer;border-bottom:2.5px solid transparent;margin-bottom:-2px;transition:color .15s,border-color .15s;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;}
.mr-tab:hover{color:var(--ink2);}
.mr-tab.act{color:var(--amber2);border-bottom-color:var(--amber2);}
.mr-tab.dis{opacity:.4;cursor:not-allowed;}
.mr-soon-pill{font-size:8.5px;font-weight:700;background:var(--paper);color:var(--ink3);border-radius:4px;padding:1px 5px;border:1px solid var(--line2);letter-spacing:.04em;}

.mr-filters{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:18px;}
.mr-filter-lbl{font-size:10.5px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.07em;}

.mr-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
.mr-stat{background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:12px 14px;}
.mr-stat-v{font-size:18px;font-weight:800;font-family:var(--mono);}
.mr-stat-l{font-size:10px;color:var(--ink2);font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-top:2px;}


.mr-list{display:flex;flex-direction:column;gap:10px;}
.mr-card{background:var(--surface);border:1.5px solid var(--line);border-radius:12px;overflow:hidden;transition:border-color .15s,box-shadow .15s;}
.mr-card:hover{border-color:var(--line2);box-shadow:0 2px 14px rgba(15,13,10,.07);}
.mr-head{display:flex;align-items:flex-start;gap:10px;padding:13px 14px;cursor:pointer;user-select:none;}
.mr-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;font-size:10px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;flex-shrink:0;margin-top:1px;}
.mr-pill-dpr{background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;}
.mr-pill-svr{background:#fdf4ff;color:#9333ea;border:1px solid #e9d5ff;}
.mr-info{flex:1;display:flex;flex-direction:column;gap:4px;min-width:0;}
.mr-title{font-size:13px;font-weight:700;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.mr-meta{display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px;font-size:11px;color:var(--ink3);font-weight:500;}
.mr-meta-i{display:inline-flex;align-items:center;gap:3px;}
.mr-actions{display:flex;align-items:center;gap:6px;flex-shrink:0;margin-top:1px;}
.mr-btn{display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border-radius:7px;font-family:var(--font);font-size:11px;font-weight:700;border:1.5px solid var(--line2);background:var(--surface);color:var(--ink2);cursor:pointer;transition:all .15s;text-decoration:none;white-space:nowrap;}
.mr-btn:hover{background:var(--amber-bg);color:var(--amber2);border-color:var(--amber);}
.mr-btn-dl{background:var(--ink);color:#fff;border-color:var(--ink);}
.mr-btn-dl:hover{background:#2a2520;border-color:#2a2520;}
.mr-chev{color:var(--ink3);transition:transform .2s;flex-shrink:0;}
.mr-chev.op{transform:rotate(90deg);}

.mr-body{border-top:1.5px solid var(--line);padding:14px 16px;background:#fafaf8;display:flex;flex-direction:column;gap:12px;}
.mr-dg{display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;}
@media(max-width:520px){
  .mr-dg{grid-template-columns:1fr;}
  .mr-stats{grid-template-columns:repeat(3,1fr);}
  .mr-head{gap:8px;padding:11px 12px;}
  .mr-title{font-size:12.5px;}
  .mr-btn{font-size:10.5px;padding:4px 8px;}
  .mr-pill{font-size:9px;padding:2px 6px;}
}
.mr-di{display:flex;flex-direction:column;gap:2px;}
.mr-dl{font-size:10px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.06em;}
.mr-dv{font-size:12.5px;color:var(--ink);font-weight:500;line-height:1.55;}

.mr-pdf-row{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:10px;background:var(--surface);border:1.5px solid var(--line);}
.mr-pdf-ico{color:#dc2626;flex-shrink:0;}
.mr-pdf-name{font-size:13px;font-weight:600;color:var(--ink);}
.mr-pdf-sub{font-size:11px;color:var(--ink3);margin-top:1px;}
.mr-pdf-btns{display:flex;gap:7px;margin-left:auto;}
.mr-no-pdf{display:flex;align-items:center;gap:8px;padding:10px 13px;border-radius:9px;background:var(--paper);border:1px solid var(--line);font-size:12px;color:var(--ink3);}

.mr-empty{display:flex;flex-direction:column;align-items:center;padding:54px 24px;text-align:center;gap:10px;}
.mr-empty-ico{color:var(--ink3);}
.mr-empty-t{font-size:13.5px;font-weight:700;color:var(--ink2);}
.mr-empty-s{font-size:12px;color:var(--ink3);max-width:300px;line-height:1.65;}

.mr-err{display:flex;align-items:flex-start;gap:8px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:12px 14px;font-size:12.5px;color:var(--red);margin-bottom:16px;line-height:1.5;}

.mr-load{display:flex;align-items:center;justify-content:center;padding:48px;gap:10px;color:var(--ink2);font-size:13px;}
.mr-spin{width:18px;height:18px;border:2.5px solid var(--line2);border-top-color:var(--amber);border-radius:50%;animation:mr-s .7s linear infinite;}
@keyframes mr-s{to{transform:rotate(360deg);}}
`;

function Spinner() {
  return <div className="mr-load"><div className="mr-spin"/><span>Loading…</span></div>;
}

function PdfRow({ url, name }) {
  if (!url) return (
    <div className="mr-no-pdf"><IcoPdf/><span>No PDF attached to this report.</span></div>
  );
  return (
    <div className="mr-pdf-row">
      <span className="mr-pdf-ico"><IcoPdf/></span>
      <div>
        <div className="mr-pdf-name">{name || "Report Document"}</div>
        <div className="mr-pdf-sub">PDF · tap to open or download</div>
      </div>
      <div className="mr-pdf-btns">
        <a href={url} target="_blank" rel="noopener noreferrer" className="mr-btn" style={{textDecoration:"none"}}>
          <IcoEye/> View
        </a>
        <a href={url} download className="mr-btn mr-btn-dl" style={{textDecoration:"none"}}>
          <IcoDl/> Download
        </a>
      </div>
    </div>
  );
}

// ── DPR Card ───────────────────────────────────────────────────────────────
function DprCard({ r }) {
  const [open, setOpen] = useState(false);
  const p = r.payload || {};
  return (
    <div className="mr-card">
      <div className="mr-head" onClick={() => setOpen(v => !v)}>
        <span className="mr-pill mr-pill-dpr"><IcoDpr/> DPR</span>
        <div className="mr-info">
          <div className="mr-title">{r.site || "—"}</div>
          <div className="mr-meta">
            <span className="mr-meta-i"><IcoCal/>{fmtD(r.date)}</span>
            {r.engineer && <span className="mr-meta-i"><IcoUser/>{r.engineer}</span>}
            {r.report_type && <span style={{color:"var(--amber2)",fontWeight:700}}>{r.report_type}</span>}
          </div>
        </div>
        <div className="mr-actions">
          {r.pdf_url && (
            <a href={r.pdf_url} target="_blank" rel="noopener noreferrer"
               className="mr-btn" style={{textDecoration:"none"}} onClick={e=>e.stopPropagation()}>
              <IcoEye/> View PDF
            </a>
          )}
          <span className={`mr-chev${open?" op":""}`}><IcoChev/></span>
        </div>
      </div>
      {open && (
        <div className="mr-body">
          <div className="mr-sec-lbl">Report Details</div>
          <div className="mr-dg">
            {p.weather       && <div className="mr-di"><div className="mr-dl">Weather</div><div className="mr-dv">{p.weather}</div></div>}
            {p.workers_count !== undefined && p.workers_count !== "" && <div className="mr-di"><div className="mr-dl">Workers on Site</div><div className="mr-dv">{p.workers_count}</div></div>}
            {p.work_done     && <div className="mr-di" style={{gridColumn:"span 2"}}><div className="mr-dl">Work Done</div><div className="mr-dv">{p.work_done}</div></div>}
            {p.materials_used&& <div className="mr-di"><div className="mr-dl">Materials Used</div><div className="mr-dv">{p.materials_used}</div></div>}
            {p.equipment_used&& <div className="mr-di"><div className="mr-dl">Equipment Used</div><div className="mr-dv">{p.equipment_used}</div></div>}
            {p.issues        && <div className="mr-di" style={{gridColumn:"span 2"}}><div className="mr-dl">Issues / Delays</div><div className="mr-dv" style={{color:"var(--red)"}}>{p.issues}</div></div>}
            {p.next_day_plan && <div className="mr-di" style={{gridColumn:"span 2"}}><div className="mr-dl">Next Day Plan</div><div className="mr-dv">{p.next_day_plan}</div></div>}
            {p.remarks       && <div className="mr-di" style={{gridColumn:"span 2"}}><div className="mr-dl">Remarks</div><div className="mr-dv">{p.remarks}</div></div>}
            <div className="mr-di"><div className="mr-dl">Submitted</div><div className="mr-dv">{fmtDT(r.created_at)}</div></div>
          </div>
          <div className="mr-sec-lbl">Document</div>
          <PdfRow url={r.pdf_url} name={`DPR — ${r.site||"Site"} — ${fmtD(r.date)}`}/>
        </div>
      )}
    </div>
  );
}

// ── SVR Card ───────────────────────────────────────────────────────────────
function SvrCard({ r }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mr-card">
      <div className="mr-head" onClick={() => setOpen(v => !v)}>
        <span className="mr-pill mr-pill-svr"><IcoSvr/> SVR</span>
        <div className="mr-info">
          <div className="mr-title">{r.site_name || "—"}</div>
          <div className="mr-meta">
            <span className="mr-meta-i"><IcoCal/>{fmtD(r.visit_date)}</span>
            {r.reporter_name  && <span className="mr-meta-i"><IcoUser/>{r.reporter_name}</span>}
            {r.designation    && <span style={{color:"var(--ink2)"}}>{r.designation}</span>}
          </div>
        </div>
        <div className="mr-actions">
          {r.pdf_url && (
            <a href={r.pdf_url} target="_blank" rel="noopener noreferrer"
               className="mr-btn" style={{textDecoration:"none"}} onClick={e=>e.stopPropagation()}>
              <IcoEye/> View PDF
            </a>
          )}
          <span className={`mr-chev${open?" op":""}`}><IcoChev/></span>
        </div>
      </div>
      {open && (
        <div className="mr-body">
          <div className="mr-sec-lbl">Visit Details</div>
          <div className="mr-dg">
            {r.progress_of_work      && <div className="mr-di" style={{gridColumn:"span 2"}}><div className="mr-dl">Progress of Work</div><div className="mr-dv">{r.progress_of_work}</div></div>}
            {r.quality_observations  && <div className="mr-di" style={{gridColumn:"span 2"}}><div className="mr-dl">Quality Observations</div><div className="mr-dv">{r.quality_observations}</div></div>}
            {r.safety_concerns       && <div className="mr-di" style={{gridColumn:"span 2"}}><div className="mr-dl">Safety Concerns</div><div className="mr-dv" style={{color:"var(--red)"}}>{r.safety_concerns}</div></div>}
            {r.issues_concerns       && <div className="mr-di" style={{gridColumn:"span 2"}}><div className="mr-dl">Issues / Concerns</div><div className="mr-dv">{r.issues_concerns}</div></div>}
            {r.site_visit_instructions&& <div className="mr-di" style={{gridColumn:"span 2"}}><div className="mr-dl">Site Visit Instructions</div><div className="mr-dv">{r.site_visit_instructions}</div></div>}
            {r.key_instructions      && <div className="mr-di" style={{gridColumn:"span 2"}}><div className="mr-dl">Key Instructions</div><div className="mr-dv">{r.key_instructions}</div></div>}
            {r.submitted_by_name     && <div className="mr-di"><div className="mr-dl">Submitted By</div><div className="mr-dv">{r.submitted_by_name}</div></div>}
            <div className="mr-di"><div className="mr-dl">Submitted At</div><div className="mr-dv">{fmtDT(r.created_at)}</div></div>
          </div>
          <div className="mr-sec-lbl">Document</div>
          <PdfRow url={r.pdf_url} name={`SVR — ${r.site_name||"Site"} — ${fmtD(r.visit_date)}`}/>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function MyReports({ user }) {
  const [tab,   setTab]   = useState("dpr");
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7));
  const [data,  setData]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [err,   setErr]   = useState("");
  // Debug info to help identify the right column
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    if (tab === "wpr") return;
    setData([]); setErr(""); setDebugInfo(null);
    setLoading(true);

    (async () => {
      try {
        if (tab === "dpr") {
          // ── Step 1: fetch ALL records for this month (no user filter yet)
          // so we can inspect what the engineer column actually contains
          const [my, mm] = month.split("-").map(Number);
          const lastDay = new Date(my, mm, 0).getDate();
          const monthEnd = `${month}-${String(lastDay).padStart(2,"0")}`;

          const { data: sample, error: sampleErr } = await supabase
            .from("dpr_reports")
            .select("id, site, engineer, report_type, date, pdf_url, payload, photo_folder, created_at")
            .gte("date", month + "-01")
            .lte("date", monthEnd)
            .order("date", { ascending: false })
            .limit(50);

          if (sampleErr) { setErr(sampleErr.message); setLoading(false); return; }

          // Debug: show what engineer values exist
          const engineerVals = [...new Set((sample||[]).map(r => r.engineer).filter(Boolean))];
          setDebugInfo({
            table: "dpr_reports",
            totalInMonth: (sample||[]).length,
            engineerVals,
            user_user_name: user.user_name,
            user_name: user.name,
            user_id: user.id,
          });

          // ── Step 2: try matching by user_name first, then name
          let filtered = (sample||[]).filter(r =>
            r.engineer === user.user_name ||
            r.engineer === user.name
          );
          setData(filtered);

        } else if (tab === "svr") {
          const [sy, sm] = month.split("-").map(Number);
          const sLastDay = new Date(sy, sm, 0).getDate();
          const sMonthEnd = `${month}-${String(sLastDay).padStart(2,"0")}`;

          const { data: sample, error: sampleErr } = await supabase
            .from("site_reports")
            .select("*")
            .gte("visit_date", month + "-01")
            .lte("visit_date", sMonthEnd)
            .order("visit_date", { ascending: false })
            .limit(50);

          if (sampleErr) { setErr(sampleErr.message); setLoading(false); return; }

          const submittedVals = [...new Set((sample||[]).map(r => r.submitted_by).filter(Boolean))];
          setDebugInfo({
            table: "site_reports",
            totalInMonth: (sample||[]).length,
            submitted_by_vals: submittedVals,
            user_user_name: user.user_name,
            user_name: user.name,
            user_id: user.id,
          });

          let filtered = (sample||[]).filter(r =>
            r.submitted_by === user.user_name ||
            r.submitted_by === user.name ||
            r.submitted_by_name === user.name
          );
          setData(filtered);
        }
      } catch(e) {
        setErr(e.message);
      }
      setLoading(false);
    })();
  }, [tab, month, user.user_name, user.name]);

  const total   = data.length;
  const withPdf = data.filter(r => r.pdf_url).length;

  return (
    <>
      <style>{CSS}</style>

      {/* ── Tab bar ── */}
      <div className="mr-tabs">
        {[
          { key:"dpr", label:"DPR", Ico:IcoDpr },
          { key:"wpr", label:"WPR", Ico:IcoWpr, soon:true },
          { key:"svr", label:"SVR", Ico:IcoSvr },
        ].map(t => (
          <button key={t.key}
            className={`mr-tab${tab===t.key?" act":""}${t.soon?" dis":""}`}
            onClick={() => !t.soon && setTab(t.key)}>
            <t.Ico/> {t.label}
            {t.soon && <span className="mr-soon-pill">SOON</span>}
          </button>
        ))}
      </div>

      {tab === "wpr" ? (
        <div className="mr-empty">
          <div className="mr-empty-ico"><IcoSoon/></div>
          <div className="mr-empty-t">Weekly Progress Reports</div>
          <div className="mr-empty-s">Weekly report history is coming soon. All WPRs you submit will appear here once the feature is live.</div>
        </div>
      ) : (
        <>
          {/* ── Filters ── */}
          <div className="mr-filters">
            <span className="mr-filter-lbl">Month</span>
            <input className="finput" type="month" style={{width:160}}
              value={month} onChange={e=>setMonth(e.target.value)}/>
          </div>

          {/* ── Error ── */}
          {err && (
            <div className="mr-err"><IcoWarn/><div><strong>Supabase error:</strong> {err}</div></div>
          )}


          {loading ? <Spinner/> : (
            <>
              {/* ── Stats ── */}
              {total > 0 && (
                <div className="mr-stats">
                  <div className="mr-stat"><div className="mr-stat-v">{total}</div><div className="mr-stat-l">Total</div></div>
                  <div className="mr-stat"><div className="mr-stat-v" style={{color:"var(--green)"}}>{withPdf}</div><div className="mr-stat-l">With PDF</div></div>
                  <div className="mr-stat"><div className="mr-stat-v" style={{color:"var(--amber2)"}}>{total-withPdf}</div><div className="mr-stat-l">No PDF</div></div>
                </div>
              )}

              {/* ── List ── */}
              {data.length === 0 ? (
                <div className="mr-empty">
                  <div className="mr-empty-ico"><IcoEmpty/></div>
                  <div className="mr-empty-t">No {tab.toUpperCase()} reports found</div>
                  <div className="mr-empty-s">
                    {debugInfo?.totalInMonth > 0
                      ? `${debugInfo.totalInMonth} record(s) exist in this month but none matched your user. Check the debug panel above.`
                      : "No records found for this month. Try selecting a different month."}
                  </div>
                </div>
              ) : (
                <div className="mr-list">
                  {tab === "dpr" && data.map(r => <DprCard key={r.id} r={r}/>)}
                  {tab === "svr" && data.map(r => <SvrCard key={r.id} r={r}/>)}
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}