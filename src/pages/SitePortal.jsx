import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";
 import SiteReport from "./Sitereport";
 import { ClockInOut, CalendarView, CLOCK_CSS } from "./Clockinout.jsx";
 import MyReports from "./MyReports";
import DPR from "./Dpr.jsx";
import ManpowerReport from "./Manpowerreport.jsx";
import Profile from "./Profile";
// ─── Supabase ────────────────────────────────────────────────────────────────
// TODO: Replace with your project URL & anon key
const SUPABASE_URL  = "https://efqfjfthsleymhljswcq.supabase.co";
const SUPABASE_ANON =   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmcWZqZnRoc2xleW1obGpzd2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNDY0MjMsImV4cCI6MjA5NTkyMjQyM30.PYMRiKdnhzb6pkvhDB4M4Qdp3nSGhsZpHGuclVqYNMs";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const today  = () => new Date().toISOString().split("T")[0];
const fmtD   = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—";
const fmtDT  = (dt) => dt ? new Date(dt).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}) : "—";
const pad    = (n)  => String(n).padStart(2,"0");

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WDAYS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const LEAVE_TYPES = ["Casual Leave","Sick Leave","Earned Leave","Maternity Leave","Paternity Leave","Compensatory Leave","Unpaid Leave"];
const DARK_CSS = `
[data-theme="dark"] {
  --ink:#f0ede8;
  --ink2:#c4bdb4;
  --ink3:#7a7368;
  --paper:#1e1c19;
  --surface:#252320;
  --line:#2e2b27;
  --line2:#3a3733;
  --amber:#f59e0b;
  --amber2:#fbbf24;
  --amber-bg:#2a1f08;
  --amber-line:#4a3210;
  --red:#f87171;
  --green:#4ade80;
  --blue:#60a5fa;
  --shadow:0 2px 16px rgba(0,0,0,.3);
}

[data-theme="dark"] {.card-title{font-size:15px;font-weight:800;color:white;}}

[data-theme="dark"] body,
[data-theme="dark"] #root {
  background:#141210;
  color:#f0ede8;
}

[data-theme="dark"] .tb {
  background:#0f0e0c;
  box-shadow:0 2px 0 rgba(255,255,255,.04);
}

[data-theme="dark"] .sidebar {
  background:#1a1815;
  border-color:#2e2b27;
}

[data-theme="dark"] .card {
  background:#1e1c19;
  border-color:#2e2b27;
}

[data-theme="dark"] .card-hdr {
  border-color:#2e2b27;
}

[data-theme="dark"] .card-ico {
  background:#2a1f08;
  color:#fbbf24;
}

[data-theme="dark"] .finput {
  background:#252320;
  border-color:#3a3733;
  color:#f0ede8;
}

[data-theme="dark"] .finput:focus {
  background:#2e2b27;
  border-color:#f59e0b;
}

[data-theme="dark"] .sni {
  color:#c4bdb4;
}

[data-theme="dark"] .sni:hover {
  background:#252320;
  color:#f0ede8;
}

[data-theme="dark"] .sni.act {
  background:#2a1f08;
  color:#fbbf24;
}

[data-theme="dark"] .sni.act svg {
  stroke:#fbbf24;
}

[data-theme="dark"] .stat-card {
  background:#252320;
  border-color:#2e2b27;
}

[data-theme="dark"] .stat-lbl {
  color:#7a7368;
}

[data-theme="dark"] .tbl th {
  background:#1a1815;
  color:#c4bdb4;
  border-color:#2e2b27;
}

[data-theme="dark"] .tbl td {
  border-color:#2e2b27;
  color:#c4bdb4;
}

[data-theme="dark"] .tbl tr:hover td {
  background:#252320;
}

[data-theme="dark"] .tbl-wrap {
  border-color:#2e2b27;
}

[data-theme="dark"] .badge-green {
  background:#052e16;
  color:#4ade80;
  border-color:#166534;
}

[data-theme="dark"] .badge-amber {
  background:#2a1f08;
  color:#fbbf24;
  border-color:#4a3210;
}

[data-theme="dark"] .badge-red {
  background:#2d0a0a;
  color:#f87171;
  border-color:#7f1d1d;
}

[data-theme="dark"] .badge-blue {
  background:#0c1d38;
  color:#60a5fa;
  border-color:#1e3a5f;
}

[data-theme="dark"] .badge-gray {
  background:#252320;
  color:#c4bdb4;
  border-color:#3a3733;
}

[data-theme="dark"] .info-banner {
  background:#0c1d38;
  border-color:#1e3a5f;
  color:#60a5fa;
}

[data-theme="dark"] .warn-banner {
  background:#2a1f08;
  border-color:#4a3210;
  color:#fbbf24;
}

[data-theme="dark"] .btn-out {
  background:#252320;
  color:#c4bdb4;
  border-color:#3a3733;
}

[data-theme="dark"] .btn-out:hover {
  background:#2e2b27;
}

[data-theme="dark"] .btn-red {
  background:#2d0a0a;
  color:#f87171;
  border-color:#7f1d1d;
}

[data-theme="dark"] .btn-green {
  background:#052e16;
  color:#4ade80;
  border-color:#166534;
}

[data-theme="dark"] .lv-item {
  background:#252320;
  border-color:#2e2b27;
}

[data-theme="dark"] .lv-type {
  color:#f0ede8;
}

[data-theme="dark"] .lv-dates,
[data-theme="dark"] .lv-reason {
  color:#7a7368;
}

[data-theme="dark"] .clock-status {
  background:#252320;
  border-color:#2e2b27;
  color:#c4bdb4;
}

[data-theme="dark"] .clock-status strong {
  color:#f0ede8;
}

[data-theme="dark"] .clock-row {
  background:#252320;
  border-color:#2e2b27;
}

[data-theme="dark"] .clock-row-date,
[data-theme="dark"] .clock-row-times {
  color:#c4bdb4;
}

[data-theme="dark"] .att-summary {
  background:#252320;
  border-color:#2e2b27;
}

[data-theme="dark"] .att-sum-title {
  color:#f0ede8;
}

[data-theme="dark"] .cal-cell:not(.emp):hover {
  background:#252320;
  border-color:#3a3733;
}

[data-theme="dark"] .cal-cell.today {
  background:#2a1f08;
  border-color:#f59e0b;
}

[data-theme="dark"] .cal-cell.sel {
  background:#3a3733;
  border-color:#c4bdb4;
}

[data-theme="dark"] .cal-cell.sel .cal-dn {
  color:#f0ede8;
}

[data-theme="dark"] .cal-dh {
  color:#7a7368;
}

[data-theme="dark"] .cal-dn {
  color:#c4bdb4;
}

[data-theme="dark"] .cal-cell.today .cal-dn {
  color:#fbbf24;
}

[data-theme="dark"] .cal-leg-item {
  color:#c4bdb4;
}

[data-theme="dark"] .rpt-item {
  background:#252320;
  border-color:#2e2b27;
}

[data-theme="dark"] .rpt-item-title {
  color:#f0ede8;
}

[data-theme="dark"] .rpt-item-meta {
  color:#7a7368;
}

[data-theme="dark"] .rpt-dl-btn {
  background:#1e1c19;
  border-color:#3a3733;
  color:#c4bdb4;
}

[data-theme="dark"] .rpt-dl-btn:hover {
  background:#2a1f08;
  color:#fbbf24;
  border-color:#f59e0b;
}

[data-theme="dark"] .empty-state .empty-ico {
  background:#252320;
  color:#7a7368;
}

[data-theme="dark"] .empty-title {
  color:#c4bdb4;
}

[data-theme="dark"] .empty-sub {
  color:#7a7368;
}

[data-theme="dark"] .sgroup-lbl {
  color:#7a7368;
}

[data-theme="dark"] .sgroup-chev {
  color:#7a7368;
}

[data-theme="dark"] .sgroup-hdr:hover .sgroup-lbl {
  color:#c4bdb4;
}

[data-theme="dark"] .success-state .success-ico {
  background:#052e16;
}

[data-theme="dark"] .success-title {
  color:#f0ede8;
}

[data-theme="dark"] .success-sub {
  color:#c4bdb4;
}

[data-theme="dark"] .act-row {
  border-color:#2e2b27;
}

[data-theme="dark"] .tb-ham {
  border-color:rgba(255,255,255,.1);
  background:rgba(255,255,255,.05);
}

[data-theme="dark"] .sb-bottom {
  border-color: #2e2b27;
  background: #1a1815;
}

[data-theme="dark"] select.finput option {
  background:#252320;
  color:#f0ede8;
}

[data-theme="dark"] .cal-nav-btn {
  background:#1e1c19;
  border-color:#3a3733;
  color:#c4bdb4;
}

[data-theme="dark"] .cal-nav-btn:hover {
  background:#252320;
}

[data-theme="dark"] .cal-nav-title {
  color:#f0ede8;
}
`;
// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --ink:#0f0d0a;--ink2:#4a4540;--ink3:#9a9289;
  --paper:#f5f2ee;--surface:#fffefb;
  --line:#e8e2d8;--line2:#d4ccc0;
  --amber:#d97706;--amber2:#b45309;--amber-bg:#fffbeb;--amber-line:#fde68a;
  --red:#dc2626;--green:#16a34a;--blue:#2563eb;
  --radius:14px;--font:'Sora',sans-serif;--mono:'JetBrains Mono',monospace;
  --shadow:0 2px 16px rgba(15,13,10,.07);
}

body,#root{background:#c9d0d4d0;font-family:var(--font);color:var(--ink);}

/* ── Topbar ── */
.tb{height:58px;background:var(--ink);display:flex;align-items:center;gap:12px;padding:0 22px;position:sticky;top:0;z-index:100;box-shadow:0 2px 0 rgba(255,255,255,.06);}
.tb-logo{display:flex;align-items:center;gap:10px;flex:1;}
.tb-ico{width:32px;height:32px;background:var(--amber);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;}
.tb-name{font-size:15px;font-weight:800;color:#fff;letter-spacing:-.3px;}
.tb-sub{font-size:10.5px;color:rgba(255,255,255,.45);font-weight:500;letter-spacing:.04em;text-transform:uppercase;}
.tb-ham{width:36px;height:36px;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;}
.tb-ham:hover{background:rgba(255,255,255,.14);}
.tb-user{display:flex;align-items:center;gap:9px;}
.tb-av{width:33px;height:33px;border-radius:50%;background:var(--amber);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;}
.tb-uinfo{display:flex;flex-direction:column;}
.tb-uname{font-size:12px;font-weight:700;color:#fff;}
.tb-urole{font-size:10px;color:rgba(255,255,255,.45);}

/* ── Layout ── */
.body{display:flex;min-height:calc(100vh - 58px);}
/* FIND and REPLACE the existing .sidebar rule */
.sidebar {
  width: 248px;
  min-width: 248px;
  background: var(--surface);
  border-right: 1px solid var(--line);
  position: sticky;
  top: 58px;
  height: calc(100vh - 58px);
  overflow-y: auto;
  transition: width .22s, min-width .22s, opacity .18s;
  display: flex;
  flex-direction: column;
  z-index: 999;
}

/* ADD this — makes snav take all available space */
.snav {
  flex: 1;
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 20px;
}

/* ADD this for the bottom settings button container */
.sb-bottom {
  padding: 10px;
  border-top: 1px solid var(--line);
  flex-shrink: 0;
}
.sidebar.closed{width:0;min-width:0;opacity:0;pointer-events:none;overflow:hidden;}
.sidebar::-webkit-scrollbar{width:3px;}
.sidebar::-webkit-scrollbar-thumb{background:var(--line2);border-radius:2px;}
.main{flex:1;padding:28px 32px;overflow:auto;min-width:0;}

/* ── Sidebar nav ── */
.snav{padding:14px 10px;display:flex;flex-direction:column;gap:2px;margin-top:20px;}
.sgroup-hdr{display:flex;align-items:center;justify-content:space-between;padding:12px 10px 4px;cursor:pointer;user-select:none;}
.sgroup-lbl{font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);}
.sgroup-chev{color:var(--ink3);transition:transform .2s;}
.sgroup-chev.open{transform:rotate(180deg);}
.sgroup-kids{overflow:hidden;max-height:600px;transition:max-height .25s ease,opacity .18s;display:flex;flex-direction:column;gap:1px;padding-left:4px;}
.sgroup-kids.shut{max-height:0;opacity:0;pointer-events:none;}
.sni{display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:9px;cursor:pointer;color:var(--ink2);font-size:13px;font-weight:500;border:none;background:transparent;width:100%;text-align:left;transition:background .15s,color .15s;}
.sni:hover{background:var(--paper);color:var(--ink);}
.sni.act{background:var(--amber-bg);color:var(--amber2);font-weight:700;}
.sni.act svg{stroke:var(--amber2);}
 
/* ── Card ── */
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:20px;box-shadow:var(--shadow);}
.card-hdr{display:flex;align-items:center;gap:10px;margin-bottom:22px;padding-bottom:16px;border-bottom:1px solid var(--line);}
.card-ico{width:36px;height:36px;border-radius:9px;background:var(--amber-bg);display:flex;align-items:center;justify-content:center;color:var(--amber2);flex-shrink:0;}
.card-title{font-size:15px;font-weight:800;color:var(--ink);}

/* ── Buttons ── */
.btn{display:inline-flex;align-items:center;gap:7px;font-family:var(--font);font-size:13px;font-weight:700;padding:10px 20px;border-radius:9px;border:none;cursor:pointer;transition:all .15s;}
.btn-pri{background:var(--ink);color:black;box-shadow:0 3px 10px rgba(15,13,10,.2);}
.btn-pri:hover{background:#2a2520;transform:translateY(-1px);color:#fff;}
.btn-pri:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.btn-out{background:var(--surface);color:var(--ink2);border:1.5px solid var(--line2);}
.btn-out:hover{background:var(--paper);}
.btn-amber{background:var(--amber);color:#fff;box-shadow:0 3px 10px rgba(217,119,6,.3);}
.btn-amber:hover{background:var(--amber2);transform:translateY(-1px);}
.btn-red{background:#fef2f2;color:var(--red);border:1.5px solid #fecaca;}
.btn-red:hover{background:#fee2e2;}
.btn-green{background:#f0fdf4;color:var(--green);border:1.5px solid #bbf7d0;}
.btn-green:hover{background:#dcfce7;}

/* ── Form ── */
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:15px;}
.col2{grid-column:span 2;}
@media(max-width:580px){.grid2{grid-template-columns:1fr;}.col2{grid-column:span 1;}}
.flabel{font-size:11.5px;font-weight:700;color:var(--ink2);margin-bottom:5px;display:flex;align-items:center;gap:5px;}
.req{color:var(--red);}
.opt{font-size:10.5px;font-weight:500;color:var(--ink3);background:var(--paper);border-radius:4px;padding:1px 6px;}
.finput{font-family:var(--font);font-size:13.5px;color:var(--ink);background:var(--paper);border:1.5px solid var(--line2);border-radius:9px;padding:9px 13px;outline:none;width:100%;transition:border .15s,box-shadow .15s;}
.finput:focus{border-color:var(--amber);box-shadow:0 0 0 3px rgba(217,119,6,.12);background:#fff;}
textarea.finput{resize:vertical;min-height:85px;}
select.finput{cursor:pointer;}
.fgroup{display:flex;flex-direction:column;}

/* ── Status badges ── */
.badge{font-size:10.5px;font-weight:700;padding:4px 10px;border-radius:20px;white-space:nowrap;}
.badge-green{background:#f0fdf4;color:var(--green);border:1px solid #bbf7d0;}
.badge-amber{background:var(--amber-bg);color:var(--amber2);border:1px solid var(--amber-line);}
.badge-red{background:#fef2f2;color:var(--red);border:1px solid #fecaca;}
.badge-gray{background:var(--paper);color:var(--ink2);border:1px solid var(--line2);}
.badge-blue{background:#eff6ff;color:var(--blue);border:1px solid #bfdbfe;}

/* ── Info banner ── */
.info-banner{display:flex;align-items:flex-start;gap:9px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 15px;font-size:13px;color:var(--blue);line-height:1.5;}
.info-banner svg{flex-shrink:0;margin-top:1px;}
.warn-banner{background:var(--amber-bg);border-color:var(--amber-line);color:var(--amber2);}

/* ── Success state ── */
.success-state{display:flex;flex-direction:column;align-items:center;padding:60px 24px;text-align:center;gap:14px;}
.success-ico{width:64px;height:64px;border-radius:50%;background:#f0fdf4;display:flex;align-items:center;justify-content:center;color:var(--green);}
.success-title{font-size:17px;font-weight:800;}
.success-sub{font-size:13px;color:var(--ink2);max-width:340px;line-height:1.6;}

/* ── Stat cards ── */
.stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}
.stat-card{background:#e0e5e7;border:1px solid var(--line);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:4px;}
.stat-val{font-size:22px;font-weight:800;font-family:var(--mono);}
.stat-lbl{font-size:11px;color:var(--ink2);font-weight:600;}

/* ── Clock in/out ── */
.clock-panel{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:40px 20px;}
.clock-time{font-size:52px;font-weight:800;font-family:var(--mono);color:var(--ink);letter-spacing:-2px;line-height:1;}
.clock-date{font-size:14px;color:var(--ink2);font-weight:500;}
.clock-btns{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;}
.clock-status{padding:12px 20px;background:#c9d0d4d0;border:1px solid var(--line);border-radius:12px;font-size:13px;color:var(--ink2);text-align:center;max-width:380px;width:100%;}
.clock-status strong{color:var(--ink);}
.clock-log{width:100%;max-width:480px;}
.clock-log-title{font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;}
.clock-row{display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--paper);border:1px solid var(--line);border-radius:10px;margin-bottom:8px;}
.clock-row-date{font-size:12px;color:var(--ink2);font-weight:600;min-width:90px;}
.clock-row-times{flex:1;display:flex;gap:16px;font-size:12px;color:var(--ink2);}
.clock-row-times span{display:flex;align-items:center;gap:5px;}

/* ── Calendar ── */
.cal-nav{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
.cal-nav-title{font-size:16px;font-weight:800;flex:1;text-align:center;}
.cal-nav-btn{width:32px;height:32px;border-radius:8px;border:1.5px solid var(--line2);background:var(--surface);color:var(--ink2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;}
.cal-nav-btn:hover{background:var(--paper);}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;}
.cal-dh{text-align:center;font-size:10.5px;font-weight:800;color:var(--ink3);padding:4px 0 8px;letter-spacing:.05em;}
.cal-cell{min-height:54px;border-radius:9px;border:1.5px solid transparent;padding:6px 4px 4px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;transition:all .15s;position:relative;}
.cal-cell:not(.emp):hover{background:var(--paper);border-color:var(--line2);}
.cal-cell.emp{pointer-events:none;}
.cal-cell.today{background:var(--amber-bg);border-color:var(--amber);}
.cal-cell.sel{background:var(--ink);border-color:var(--ink);}
.cal-cell.sel .cal-dn{color:#fff;}
.cal-dn{font-size:12.5px;font-weight:700;color:var(--ink);}
.cal-cell.today .cal-dn{color:var(--amber2);}
.att-dot{width:7px;height:7px;border-radius:50%;margin-top:2px;}
.cal-legend{display:flex;flex-wrap:wrap;gap:12px;padding:14px 0 6px;}
.cal-leg-item{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--ink2);font-weight:500;}
.cal-leg-dot{width:8px;height:8px;border-radius:50%;}
.att-summary{background:#e0e5e7;border-radius:11px;padding:16px;margin-top:4px;}
.att-sum-title{font-size:12.5px;font-weight:700;margin-bottom:8px;}
.att-sum-info{font-size:13px;color:var(--ink2);display:flex;flex-direction:column;gap:4px;}

/* ── Leave list ── */
.lv-list{display:flex;flex-direction:column;gap:10px;}
.lv-item{display:flex;align-items:center;gap:14px;
background:#cfcece94  ;
border:1px solid var(--line);border-radius:11px;padding:14px 16px;}
.lv-left{flex:1;display:flex;flex-direction:column;gap:3px;}
.lv-type{font-size:13.5px;font-weight:700;}
.lv-dates{font-size:12px;color:var(--ink2);}
.lv-reason{font-size:11.5px;color:var(--ink3);font-style:italic;}

/* ── Report list ── */
.rpt-list{display:flex;flex-direction:column;gap:8px;}
.rpt-item{display:flex;align-items:center;gap:12px;background:var(--paper);border:1px solid var(--line);border-radius:11px;padding:13px 16px;}
.rpt-item-info{flex:1;display:flex;flex-direction:column;gap:2px;}
.rpt-item-title{font-size:13px;font-weight:700;}
.rpt-item-meta{font-size:11.5px;color:var(--ink3);}
.rpt-dl-btn{width:32px;height:32px;border-radius:8px;border:1.5px solid var(--line2);background:var(--surface);color:var(--ink2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.rpt-dl-btn:hover{background:var(--amber-bg);color:var(--amber2);border-color:var(--amber);}

/* ── Table ── */
.tbl-wrap{overflow-x:auto;border-radius:10px;border:1px solid var(--line);}
.tbl{width:100%;border-collapse:collapse;min-width:500px;}
.tbl th{font-size:11px;font-weight:800;color:var(--ink2);background:var(--paper);padding:10px 14px;text-align:left;border-bottom:1px solid var(--line);letter-spacing:.05em;text-transform:uppercase;}
.tbl td{padding:10px 14px;font-size:13px;border-bottom:1px solid var(--line);}
.tbl tr:last-child td{border-bottom:none;}
.tbl tr:hover td{background:#faf9f7;}
.tbl .day-lbl{font-weight:700;color:var(--amber2);font-size:12px;}

/* ── Empty state ── */
.empty-state{display:flex;flex-direction:column;align-items:center;padding:48px 24px;text-align:center;gap:10px;}
.empty-ico{width:52px;height:52px;border-radius:50%;background:var(--paper);display:flex;align-items:center;justify-content:center;color:var(--ink3);}
.empty-title{font-size:14px;font-weight:700;color:var(--ink2);}
.empty-sub{font-size:12.5px;color:var(--ink3);}

/* ── Filter row ── */
.filter-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px;}

/* ── Actions row ── */
.act-row{display:flex;gap:10px;justify-content:flex-end;margin-top:20px;padding-top:20px;border-top:1px solid var(--line);}

/* ── Mobile ── */
.sb-backdrop{display:none;}
@media(max-width:768px) {
  .sidebar {
    position: fixed;
    top: 58px;
    left: 0;
    z-index: 200;
    height: calc(100vh - 58px);
    width: min(85vw, 270px);
    min-width: 0;
    transform: translateX(0);
    box-shadow: 12px 0 32px rgba(0,0,0,.18);
    display: flex;          /* ensure flex on mobile too */
    flex-direction: column;
  }
  .sidebar.closed {
    width: min(85vw, 270px);
    min-width: 0;
    transform: translateX(-110%);
    opacity: 0;
  }
  .sb-bottom {
    padding-bottom: 20px; /* extra space for mobile home bar */
  }

  .sb-backdrop{display:block;position:fixed;inset:0;top:58px;z-index:190;background:rgba(15,13,10,.4);border:none;padding:0;}
  .main{padding:16px 14px 32px;}
  .stat-row{grid-template-columns:1fr 1fr;}
  .act-row{flex-direction:column-reverse;}
  .btn{width:100%;justify-content:center;}
  .tb-uinfo{display:none;}
}
  .sb-backdrop {
  display: none;
}

@media(max-width:768px) {
  .sb-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    top: 58px;
    z-index: 190;
    background: rgba(15,13,10,.4);
    border: none;
    padding: 0;
    /* Don't capture touch events that start inside sidebar */
    pointer-events: auto;
  }
}
  /* REPLACE your existing .sidebar rule */
.sidebar {
  width: 248px;
  min-width: 248px;
  background: var(--surface);
  border-right: 1px solid var(--line);
  position: sticky;
  top: 58px;
  height: calc(100vh - 58px);
  overflow-y: auto;
  overflow-x: hidden;
  transition: width .22s, min-width .22s, opacity .18s;
  display: flex;
  flex-direction: column;
  z-index: 999;
  overscroll-behavior: contain;
}

/* REPLACE your mobile sidebar rules */
@media(max-width:768px) {
  .sidebar {
    position: fixed;
    top: 58px;
    left: 0;
    z-index: 200;
    height: calc(100vh - 58px);
    width: min(85vw, 270px);
    min-width: 0;
    transform: translateX(0);
    box-shadow: 12px 0 32px rgba(0,0,0,.18);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }
  .sidebar.closed {
    width: min(85vw, 270px);
    min-width: 0;
    transform: translateX(-110%);
    opacity: 0;
  }
  .sb-bottom {
    padding-bottom: 24px;
  }
}
@media(max-width:440px){
  .cal-cell{min-height:42px;padding:4px 2px;}
  .cal-dn{font-size:11px;}
}
.loading{display:flex;align-items:center;justify-content:center;padding:40px;color:var(--ink2);font-size:14px;gap:10px;}
.spinner{width:20px;height:20px;border:2.5px solid var(--line2);border-top-color:var(--amber);border-radius:50%;animation:spin .7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
${CLOCK_CSS}
`;

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Ico = {
  clock:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  cal:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  leave:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>,
  apply:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>,
  report:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-4"/></svg>,
  weekly:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 12h2l2-4 2 8 2-4h2"/></svg>,
  monthly: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>,
  site:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  myRpt:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  manRpt:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  send:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>,
  plus:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  dl:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  info:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  menu:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  chev:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  home:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  in:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>,
  out:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  profile: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  check:   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>,
};

// ─── Nav structure ────────────────────────────────────────────────────────────
const NAV = [
  { key:"clock-in",   label:"Clock In / Out",    icon:Ico.clock  },
  { key:"calendar",   label:"Attendance",         icon:Ico.cal    },
  { section:"leave",  label:"Leave",
    children:[
      { key:"my-leave",    label:"My Leave",    icon:Ico.leave  },
      { key:"apply-leave", label:"Apply Leave", icon:Ico.apply  },
    ]},
  { section:"reports", label:"Reports",
    children:[
      { key:"daily-report",   label:"Daily Report",   icon:Ico.report  },
      { key:"weekly-report",  label:"Weekly Report",  icon:Ico.weekly  },
      { key:"monthly-report", label:"Monthly Report", icon:Ico.monthly },
      { key:"site-report", label:"Site Visit Report", icon:Ico.site },
      { key:"my-reports",     label:"My Reports",     icon:Ico.myRpt   },
      { key:"manpower-reports",     label:"Manpower Report",     icon:Ico.manRpt   },
    ]},
];

const ALL_ITEMS = [
  ...NAV.flatMap(n => n.children ? n.children : [n]),
  { key: "profile", label: "Profile & Settings", icon: Ico.profile },
];

// ─── Loading ──────────────────────────────────────────────────────────────────
function Loading() {
  return <div className="loading"><div className="spinner"/><span>Loading…</span></div>;
}

function MyLeave({ user, onApply }) {
  const [leaves,  setLeaves]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null); // id of expanded card

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("leaves")
        .select("*")
        .eq("user_name", user.user_name)   // match by user_name column
        .order("created_at", { ascending: false });
      setLeaves(data || []);
      setLoading(false);
    })();
  }, [user.user_name]);

  // Your DB uses "Reject", "Approved", "Rejected", "Pending" — normalise display
  // REPLACE the normStatus function:
  const normStatus = (l) => {
    if (l.proxy_approved === false) return "rejected";
    if (l.proxy_approved === true)  return "approved";
    const s = (l.status || "").toLowerCase();
    if (s === "reject" || s === "rejected") return "rejected";
    if (s === "approved") return "approved";
    return "pending";
  };

  const badgeCls = { approved:"badge-green", pending:"badge-amber", rejected:"badge-red" };

  const counts = { total: leaves.length, approved:0, pending:0, rejected:0 };
  leaves.forEach(l => {
    const s = normStatus(l);
    if (counts[s] !== undefined) counts[s]++;
  });

  // Days between two date strings
  const dayCount = (from, to) => {
    if (!from || !to) return null;
    return Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1;
  };

  if (loading) return <Loading/>;

  return (
    <div>
      {/* Summary stats */}
      <div className="stat-row" >
        {[["Total",counts.total,"var(--ink)"],["Approved",counts.approved,"var(--green)"],["Pending",counts.pending,"var(--amber)"],["Rejected",counts.rejected,"var(--red)"]].map(([l,v,c])=>(
          <div key={l} className="stat-card">
            <div className="stat-val" style={{color:c}}>{v}</div>
            <div className="stat-lbl">{l}</div>
          </div>
        ))}
      </div>

      {/* Leave cards */}
      <div className="lv-list">
        {leaves.length === 0 ? (
          <div className="empty-state">
            <div className="empty-ico">{Ico.leave}</div>
            <div className="empty-title">No leave applications yet</div>
            <div className="empty-sub">Apply for your first leave below.</div>
          </div>
        ) : leaves.map(l => {
          const status = normStatus(l);
          const days   = dayCount(l.from_date, l.to_date);
          const isOpen = expanded === l.id;
          return (
            <div key={l.id} className="lv-item" style={{flexDirection:"column",alignItems:"stretch",cursor:"pointer",gap:0}}
              onClick={()=>setExpanded(isOpen ? null : l.id)}>
              {/* Main row */}
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div className="lv-left">
                  <div className="lv-type">{l.leave_type}</div>
                  <div className="lv-dates">
                    {fmtD(l.from_date)} → {fmtD(l.to_date)}
                    {days && <> · <strong>{days} day{days>1?"s":""}</strong></>}
                  </div>
                  {l.reason && <div className="lv-reason">"{l.reason}"</div>}
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
                  {/* head indicator */}
                  {l.proxy_user_name && (
                    <span className={`badge ${l.proxy_approved===true?"badge-green":l.proxy_approved===false?"badge-red":"badge-amber"}`} style={{fontSize:10}}>
                      Head: {l.proxy_approved===true?"✓ Approved":l.proxy_approved===false?"✗ Rejected":"Pending"}
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--line)",display:"flex",flexDirection:"column",gap:6,fontSize:12.5,color:"var(--ink2)"}}>

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 16px"}}>
                    <span>Site: <strong>{l.site_name||"—"}</strong></span>
                    <span>Applied from: <strong>{fmtD(l.from_date)}</strong></span>
                    {l.proxy_user_name && (
                      <span>Site Head: <strong>{l.proxy_user_name}</strong></span>
                    )}
                    {l.proxy_approved === true  && <span style={{color:"var(--green)"}}>✓ Head Approved</span>}
                    {l.proxy_approved === false && <span style={{color:"var(--red)"}}>✗ Head Rejected</span>}
                    {l.proxy_approved === null && l.proxy_user_name && <span style={{color:"var(--amber2)"}}>⏳ Head Approval Pending</span>}
                    {l.rejection_reason && (
                      <span style={{gridColumn:"span 2",color:"var(--red)"}}>Reason: {l.rejection_reason}</span>
                    )}
                  </div>
                  {l.rejection_reason && (
                    <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"8px 12px",color:"var(--red)",marginTop:4}}>
                      Rejection reason: {l.rejection_reason}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{marginTop:16,display:"flex"}}>
        <button className="btn btn-pri" onClick={onApply}>{Ico.plus} Apply New Leave</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APPLY LEAVE
// Inserts into your existing leaves table with exact column names:
// user_name, name, leave_type, from_date, to_date, reason,
// site_name, head_user_name, status
// ═══════════════════════════════════════════════════════════════════════════════
function ApplyLeave({ user }) {
  const empty = { leave_type:"", from_date:"", to_date:"", reason:"", proxy_user_name:"" };
  const [form, setForm] = useState(empty);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const days = form.from_date && form.to_date && new Date(form.to_date)>=new Date(form.from_date)
    ? Math.ceil((new Date(form.to_date)-new Date(form.from_date))/86400000)+1 : null;

  const submit = async () => {
    if (!form.leave_type || !form.from_date || !form.to_date) {
      setErr("Please fill all required fields.");
      return;
    }
    setBusy(true); setErr("");
    // REPLACE the insert payload in submit():
    const { error } = await supabase.from("leaves").insert({
      user_name:       user.user_name,
      name:            user.name,
      leave_type:      form.leave_type,
      from_date:       form.from_date,
      to_date:         form.to_date,
      reason:          form.reason || null,
      site_name:       user.site_name || null,
      proxy_user_name: form.proxy_user_name || null,  // head's username goes here
      status:          "Pending",
      admin_approved:  null,
      proxy_approved:  null,
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="success-state">
      <div className="success-ico">{Ico.check}</div>
      <div className="success-title">Leave Application Submitted!</div>
      <div className="success-sub">Your request is pending approval. You'll be notified once reviewed.</div>
      <button className="btn btn-pri" onClick={()=>{setSubmitted(false);setForm(empty);}}>Apply Another</button>
    </div>
  );

  return (
    <div>
      <div className="info-banner" style={{marginBottom:20}}>
        {Ico.info} Your leave application will be reviewed and approved or rejected by your site head.
        {form.proxy_user_name && ` Head assigned: ${form.proxy_user_name}`}
      </div>
      {err && <div className="info-banner warn-banner" style={{marginBottom:16}}>{Ico.info} {err}</div>}

      {/* Read-only user info row */}
      <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        <div style={{background:"var(--paper)",border:"1px solid var(--line2)",borderRadius:9,padding:"8px 14px",fontSize:12.5}}>
          <span style={{color:"var(--ink3)",fontWeight:600}}>Employee: </span><strong>{user.name}</strong>
        </div>
        <div style={{background:"var(--paper)",border:"1px solid var(--line2)",borderRadius:9,padding:"8px 14px",fontSize:12.5}}>
          <span style={{color:"var(--ink3)",fontWeight:600}}>Site: </span><strong>{user.site_name||"Not Assigned"}</strong>
        </div>
      </div>

      <div className="grid2">
        <div className="fgroup col1">
        </div>
        <div className="fgroup col2">
          <label className="flabel">Leave Type <span className="req">*</span></label>
          <select className="finput" value={form.leave_type} onChange={e=>set("leave_type",e.target.value)}>
            <option value="">Select leave type…</option>
            {LEAVE_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="fgroup">
          <label className="flabel">From Date <span className="req">*</span></label>
          <input className="finput" type="date" value={form.from_date} onChange={e=>set("from_date",e.target.value)} min={today()}/>
        </div>
        <div className="fgroup">
          <label className="flabel">To Date <span className="req">*</span></label>
          <input className="finput" type="date" value={form.to_date} onChange={e=>set("to_date",e.target.value)} min={form.from_date||today()}/>
        </div>
        {days && (
          <div className="col2" style={{display:"flex",alignItems:"center",gap:8,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:9,padding:"10px 14px",fontSize:13,fontWeight:700,color:"var(--green)"}}>
            {Ico.clock} {days} day{days>1?"s":""} of leave
          </div>
        )}
        <div className="fgroup col2">
          <label className="flabel">Reason</label>
          <textarea className="finput" rows={3} placeholder="Briefly describe the reason…" value={form.reason} onChange={e=>set("reason",e.target.value)}/>
        </div>
        <div className="fgroup col2">
          <label className="flabel">Site Head Username <span className="opt">optional</span></label>
          <input className="finput" placeholder="e.g. nisarg.p" value={form.proxy_user_name} onChange={e=>set("proxy_user_name",e.target.value)}/>
          {form.proxy_user_name && (
            <div style={{fontSize:11.5,color:"var(--amber2)",marginTop:4}}>
              ⚠ Your site head will need to approve this leave.
            </div>
          )}
        </div>
      </div>
      <div className="act-row">
        <button className="btn btn-out" onClick={()=>setForm(empty)}>Reset</button>
        <button className="btn btn-pri" onClick={submit} disabled={busy}>
          {Ico.send} {busy?"Submitting…":"Submit Application"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEEKLY REPORT
// ═══════════════════════════════════════════════════════════════════════════════
function WeeklyReport({ user }) {
  const DAYS_FULL = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const [weekFrom, setWeekFrom] = useState("");
  const [weekTo,   setWeekTo]   = useState("");
  const [site,     setSite]     = useState(user.site_name||"");
  const [rows,     setRows]     = useState(DAYS_FULL.map(d=>({day:d,activity:"",target:"",manpower:""})));
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState("");

  const upd = (i,k,v) => setRows(p=>p.map((r,idx)=>idx===i?{...r,[k]:v}:r));

  const submit = async () => {
    if (!weekFrom || !site) { setErr("Week starting date and site are required."); return; }
    setBusy(true); setErr("");
    const { error } = await supabase.from("reports").insert({
      user_id: user.id,
      report_type: "weekly",
      date: weekFrom,
      site,
      status: "submitted",
      data: { week_from:weekFrom, week_to:weekTo, site, rows },
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="success-state">
      <div className="success-ico">{Ico.check}</div>
      <div className="success-title">Weekly Report Submitted!</div>
      <div className="success-sub">Report saved for the selected week.</div>
      <button className="btn btn-pri" onClick={()=>setSubmitted(false)}>New Report</button>
    </div>
  );

  return (
    <div>
      {err && <div className="info-banner warn-banner" style={{marginBottom:16}}>{Ico.info} {err}</div>}
      <div className="grid2" style={{marginBottom:20}}>
        <div className="fgroup">
          <label className="flabel">Week From <span className="req">*</span></label>
          <input className="finput" type="date" value={weekFrom} onChange={e=>setWeekFrom(e.target.value)}/>
        </div>
        <div className="fgroup">
          <label className="flabel">Week To</label>
          <input className="finput" type="date" value={weekTo} onChange={e=>setWeekTo(e.target.value)}/>
        </div>
        <div className="fgroup col2">
          <label className="flabel">Site / Project <span className="req">*</span></label>
          <input className="finput" placeholder="Site name…" value={site} onChange={e=>setSite(e.target.value)}/>
        </div>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Day</th><th>Planned Activity</th><th>Target / Qty</th><th>Manpower</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={r.day}>
                <td className="day-lbl">{r.day}</td>
                <td><input className="finput" style={{background:"transparent",border:"1.5px solid transparent",padding:"7px 10px"}} placeholder="Activity…" value={r.activity} onChange={e=>upd(i,"activity",e.target.value)}/></td>
                <td><input className="finput" style={{background:"transparent",border:"1.5px solid transparent",padding:"7px 10px"}} placeholder="Target…" value={r.target} onChange={e=>upd(i,"target",e.target.value)}/></td>
                <td><input className="finput" type="number" style={{background:"transparent",border:"1.5px solid transparent",padding:"7px 10px"}} placeholder="0" value={r.manpower} onChange={e=>upd(i,"manpower",e.target.value)}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="act-row">
        <button className="btn btn-out">Save Draft</button>
        <button className="btn btn-pri" onClick={submit} disabled={busy}>{Ico.send} {busy?"Submitting…":"Submit Report"}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MONTHLY REPORT (placeholder)
// ═══════════════════════════════════════════════════════════════════════════════
function MonthlyReport() {
  return (
    <div className="empty-state" style={{padding:"80px 24px"}}>
      <div className="empty-ico" style={{width:64,height:64}}>{Ico.monthly}</div>
      <div className="empty-title" style={{fontSize:16}}>Monthly Report</div>
      <div className="empty-sub">This feature is coming soon. Monthly consolidated reports will appear here.</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MY REPORTS
// ═══════════════════════════════════════════════════════════════════════════════
// function MyReports({ user }) {
//   const [reports, setReports] = useState([]);
//   const [filter,  setFilter]  = useState("all");
//   const [month,   setMonth]   = useState(new Date().toISOString().slice(0,7));
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       let q = supabase.from("reports").select("*").eq("user_id", user.id).order("created_at",{ascending:false});
//       if (filter !== "all") q = q.eq("report_type", filter);
//       if (month) q = q.gte("date", month+"-01").lte("date", month+"-31");
//       const { data } = await q;
//       setReports(data || []);
//       setLoading(false);
//     })();
//   }, [user.id, filter, month]);

//   const TYPE_BADGE = {
//     daily:   "badge-blue",
//     weekly:  "badge-amber",
//     monthly: "badge-green",
//   };
//   const TYPE_LABEL = { daily:"Daily Report", weekly:"Weekly Report", monthly:"Monthly Report" };

//   return (
//     <div>
//       <div className="filter-row">
//         <select className="finput" style={{width:180}} value={filter} onChange={e=>setFilter(e.target.value)}>
//           <option value="all">All Types</option>
//           <option value="daily">Daily Report</option>
//           <option value="weekly">Weekly Report</option>
//           <option value="monthly">Monthly Report</option>
//         </select>
//         <input className="finput" type="month" style={{width:160}} value={month} onChange={e=>setMonth(e.target.value)}/>
//       </div>
//       {loading ? <Loading/> : reports.length === 0 ? (
//         <div className="empty-state">
//           <div className="empty-ico">{Ico.myRpt}</div>
//           <div className="empty-title">No reports found</div>
//           <div className="empty-sub">Submit a daily or weekly report to see it here.</div>
//         </div>
//       ) : (
//         <div className="rpt-list">
//           {reports.map(r=>(
//             <div key={r.id} className="rpt-item">
//               <span className={`badge ${TYPE_BADGE[r.report_type]||"badge-gray"}`}>{TYPE_LABEL[r.report_type]||r.report_type}</span>
//               <div className="rpt-item-info">
//                 <div className="rpt-item-title">{r.site || "—"}</div>
//                 <div className="rpt-item-meta">{fmtD(r.date)}</div>
//               </div>
//               <span className={`badge ${r.status==="submitted"?"badge-green":"badge-gray"}`}>
//                 {r.status?.charAt(0).toUpperCase()+r.status?.slice(1)}
//               </span>
//               <button className="rpt-dl-btn" title="View/Download">{Ico.dl}</button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function SitePortal() {
  const [user,        setUser]        = useState(null);
  const [activeTab,   setActiveTab]   = useState("clock-in");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expanded,    setExpanded]    = useState({ leave:true, reports:true });
const [isDark, setIsDark] = useState(() => {
  const saved = localStorage.getItem("theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  return saved === "dark";
});
// Add this effect
useEffect(() => {
  if (sidebarOpen && window.innerWidth <= 768) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
  return () => { document.body.style.overflow = ""; };
}, [sidebarOpen]);
const toggleTheme = () => {
  const next = !isDark;
  setIsDark(next);
  const val = next ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", val);
  localStorage.setItem("theme", val);
};

const handleLogout = () => {
  localStorage.removeItem("user");
  window.location.href = "/";
};

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    const onResize = () => { if (window.innerWidth <= 768) setSidebarOpen(false); };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const nav = (key) => { setActiveTab(key); if (window.innerWidth <= 768) setSidebarOpen(false); };
  const activeItem = ALL_ITEMS.find(i=>i.key===activeTab);

  if (!user) return (
    <>
      <style>{CSS}{DARK_CSS}</style>
      <div className="loading" style={{minHeight:"100vh"}}><div className="spinner"/><span>Loading user…</span></div>
    </>
  );

  const renderContent = () => {
    switch(activeTab) {
      case "clock-in":  return <ClockInOut  user={user} supabase={supabase} />;
      case "calendar":  return <CalendarView user={user} supabase={supabase} />;
      case "my-leave":       return <MyLeave user={user} onApply={()=>nav("apply-leave")}/>;
      case "apply-leave":    return <ApplyLeave user={user}/>;
      case "daily-report":   return <DPR user={user}/>;
      case "weekly-report":  return <WeeklyReport user={user}/>;
      case "monthly-report": return <MonthlyReport/>;
      case "site-report":    return <SiteReport user={user} />;
      case "my-reports": return <MyReports user={user} />;
      case "manpower-reports": return <ManpowerReport user={user}/>;
      case "profile":     return <Profile user={user} onLogout={handleLogout} onThemeToggle={toggleTheme} isDark={isDark} />;
      default: return null;
    }
  }; 
  return (
    <>
      <style>{CSS}{DARK_CSS}</style>
      <div>
        {/* Topbar */}
        
      <Navbar onMenuToggle={() => setSidebarOpen(p => !p)} menuOpen={sidebarOpen} />

        <div className="body">
          {sidebarOpen && window.innerWidth <= 768 && (
            <div
              className="sb-backdrop"
              onClick={() => setSidebarOpen(false)}
              onTouchMove={e => e.stopPropagation()}
            />
          )}

          {/* Sidebar */}
          <aside
  className={`sidebar${sidebarOpen ? "" : " closed"}`}
  onTouchMove={e => e.stopPropagation()}
>
  <nav className="snav">
    {NAV.map(n => {
      if (!n.section) return (
        <button key={n.key} className={`sni${activeTab === n.key ? " act" : ""}`} onClick={() => nav(n.key)}>
          {n.icon} {n.label}
        </button>
      );
      return (
        <div key={n.section}>
          <div className="sgroup-hdr" onClick={() => setExpanded(p => ({ ...p, [n.section]: !p[n.section] }))}>
            <span className="sgroup-lbl">{n.label}</span>
            <span className={`sgroup-chev${expanded[n.section] ? " open" : ""}`}>{Ico.chev}</span>
          </div>
          <div className={`sgroup-kids${expanded[n.section] ? "" : " shut"}`}>
            {n.children.map(c => (
              <button key={c.key} className={`sni${activeTab === c.key ? " act" : ""}`} onClick={() => nav(c.key)}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
      );
    })}
  </nav>

  {/* Settings pinned to bottom */}
  <div className="sb-bottom">
    <button
      className={`sni${activeTab === "profile" ? " act" : ""}`}
      onClick={() => nav("profile")}
      style={{ width: "100%", borderRadius: 9 }}
    >
      {Ico.settings}
      Settings &amp; Profile
    </button>
  </div>
</aside>

          {/* Main */}
          <main className="main">
              
            <div className="card">
              <div className="card-hdr">
                <div className="card-ico">{activeItem?.icon}</div>
                <span className="card-title">{activeItem?.label}</span>
              </div>
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}