import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import QRCode from "qrcode";
import Navbar from "../components/Navbar";
import { supabase } from "../supabase";
import "./QrAttendance.css";

const POPUP_MS = 2600;
export const DESK_QR_TOKEN = "DIP-DESK-ATTENDANCE";

function deskQrValue() {
  return `${window.location.origin}/site/qr-scan?code=${DESK_QR_TOKEN}`;
}

function todayIST() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function currentWeekBounds() {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: isoDate(monday), end: isoDate(sunday) };
}

function isCoordinatorRole(role) {
  const r = String(role || "")
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/\s+/g, " ");
  return r.includes("coordinator") || r.includes("co ordinator");
}

function isDeskAttendanceQr(raw) {
  const text = String(raw || "").trim();
  if (!text) return false;
  if (text === DESK_QR_TOKEN) return true;
  try {
    const obj = JSON.parse(text);
    if (obj && (obj.code === DESK_QR_TOKEN || obj.type === "desk_attendance")) return true;
  } catch {
    /* not json */
  }
  try {
    const url = new URL(text);
    const code = url.searchParams.get("code") || url.searchParams.get("desk");
    if (code === DESK_QR_TOKEN) return true;
    if (url.pathname.replace(/\/+$/, "") === "/site/qr-scan" && url.searchParams.has("code")) {
      return url.searchParams.get("code") === DESK_QR_TOKEN;
    }
  } catch {
    /* not a url */
  }
  return text.includes(DESK_QR_TOKEN);
}

function hasDeskCodeInUrl() {
  try {
    return new URLSearchParams(window.location.search).get("code") === DESK_QR_TOKEN;
  } catch {
    return false;
  }
}

async function fetchLoggedInEmployee(user) {
  const select =
    "id, username, name, role, department, site_name, site_names, status";
  if (user?.user_name) {
    const { data } = await supabase
      .from("user_details")
      .select(select)
      .eq("username", user.user_name)
      .maybeSingle();
    if (data) return data;
  }
  if (user?.user_name || user?.name) {
    return {
      id: user.id || null,
      username: user.user_name,
      name: user.name,
      role: user.role,
      department: user.department,
      site_name: user.site_name,
      site_names: user.site_names,
      status: user.status,
    };
  }
  return null;
}

async function uploadPlanFile(file, username, slot) {
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `qr-weekly-plans/${username}/${todayIST()}/${slot}_${Date.now()}_${safeName}`;
  const { error } = await supabase.storage
    .from("documents")
    .upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("documents").getPublicUrl(path);
  return { url: data?.publicUrl || null, name: file.name };
}

export default function QrAttendance() {
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const [user] = useState(storedUser);
  const [phase, setPhase] = useState(hasDeskCodeInUrl() ? "loading" : "scan");
  const [camError, setCamError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [scannedEmployee, setScannedEmployee] = useState(null);
  const [attendanceRow, setAttendanceRow] = useState(null);
  const [weeklyPlan, setWeeklyPlan] = useState("");
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deskQrImage, setDeskQrImage] = useState("");

  const scannerRef = useRef(null);
  const handlingRef = useRef(false);
  const fileInputRef = useRef(null);
  const week = currentWeekBounds();
  const coordinator = isCoordinatorRole(scannedEmployee?.role);

  const stopScanner = useCallback(async () => {
    const inst = scannerRef.current;
    scannerRef.current = null;
    if (!inst) return;
    try {
      if (inst.isScanning) await inst.stop();
    } catch {
      /* already stopped */
    }
    try {
      await inst.clear();
    } catch {
      /* ignore */
    }
  }, []);

  const markPresent = useCallback(async (employee) => {
    const payload = {
      scan_date: todayIST(),
      scanned_at: new Date().toISOString(),
      employee_id: employee.id != null ? String(employee.id) : null,
      employee_username: employee.username,
      employee_name: employee.name || null,
      employee_role: employee.role || null,
      employee_department: employee.department || null,
      employee_site_name:
        employee.site_name ||
        (Array.isArray(employee.site_names) ? employee.site_names[0] : null) ||
        null,
      attendance_status: "present",
      scanned_by_username: employee.username || null,
      scanned_by_name: employee.name || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("qr_site_attendance")
      .upsert(payload, { onConflict: "employee_username,scan_date" })
      .select()
      .single();

    if (error) throw error;
    return data;
  }, []);

  const checkInCurrentUser = useCallback(async () => {
    if (handlingRef.current) return;
    handlingRef.current = true;
    setBusy(true);
    setMessage("");
    try {
      if (!user) throw new Error("Please log in first, then scan the desk QR.");
      const employee = await fetchLoggedInEmployee(user);
      if (!employee?.username) throw new Error("Could not load your employee details.");
      await stopScanner();
      const row = await markPresent(employee);
      setScannedEmployee(employee);
      setAttendanceRow(row);
      setWeeklyPlan(row?.weekly_plan || "");
      setPhase("popup");
      const url = new URL(window.location.href);
      if (url.searchParams.has("code")) {
        url.searchParams.delete("code");
        window.history.replaceState({}, "", url.pathname + url.search);
      }
    } catch (err) {
      setMessage(err.message || "Could not mark attendance.");
      handlingRef.current = false;
      setPhase("scan");
    } finally {
      setBusy(false);
    }
  }, [user, markPresent, stopScanner]);

  const handleDecoded = useCallback(
    async (decodedText) => {
      if (!isDeskAttendanceQr(decodedText)) {
        setMessage("Please scan the desk attendance QR only.");
        handlingRef.current = false;
        return;
      }
      await checkInCurrentUser();
    },
    [checkInCurrentUser]
  );

  useEffect(() => {
    if (!user) {
      const next = `${window.location.pathname}${window.location.search || `?code=${DESK_QR_TOKEN}`}`;
      window.location.href = `/?next=${encodeURIComponent(next)}`;
    }
  }, [user]);

  useEffect(() => {
    QRCode.toDataURL(deskQrValue(), {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 560,
      color: { dark: "#3d1200", light: "#ffffff" },
    })
      .then(setDeskQrImage)
      .catch(() => setDeskQrImage(""));
  }, []);

  useEffect(() => {
    if (!user || !hasDeskCodeInUrl()) return;
    checkInCurrentUser();
  }, [user, checkInCurrentUser]);

  useEffect(() => {
    if (phase !== "scan") return undefined;
    handlingRef.current = false;
    setCamError("");
    let cancelled = false;

    (async () => {
      try {
        const html5Qr = new Html5Qrcode("qr-reader", { verbose: false });
        if (cancelled) return;
        scannerRef.current = html5Qr;
        await html5Qr.start(
          { facingMode: "environment" },
          { fps: 12, qrbox: { width: 240, height: 240 } },
          (text) => {
            handleDecoded(text);
          }
        );
      } catch {
        if (!cancelled) {
          setCamError(
            "Camera could not start. Allow camera access, or upload a photo of the desk QR."
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [phase, handleDecoded, stopScanner]);

  useEffect(() => {
    if (phase !== "popup") return undefined;
    const t = setTimeout(() => setPhase("plan"), POPUP_MS);
    return () => clearTimeout(t);
  }, [phase]);

  const onFileQr = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      await stopScanner();
      const inst = new Html5Qrcode("qr-reader", { verbose: false });
      scannerRef.current = inst;
      const text = await inst.scanFile(file, true);
      await handleDecoded(text);
    } catch (err) {
      setMessage(err?.message || "Could not read a QR code from that image.");
      handlingRef.current = false;
    } finally {
      setBusy(false);
    }
  };

  const submitWeeklyPlan = async (e) => {
    e.preventDefault();
    if (!attendanceRow?.id) return;
    if (!weeklyPlan.trim()) {
      setMessage("Please enter the weekly plan.");
      return;
    }
    if (!file1) {
      setMessage("Please attach at least one file.");
      return;
    }
    if (coordinator && !file2) {
      setMessage("Co-ordinators must attach two files.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const a1 = await uploadPlanFile(file1, scannedEmployee.username, "file1");
      let a2 = { url: null, name: null };
      if (coordinator && file2) {
        a2 = await uploadPlanFile(file2, scannedEmployee.username, "file2");
      }
      const { error } = await supabase
        .from("qr_site_attendance")
        .update({
          weekly_plan: weeklyPlan.trim(),
          week_start: week.start,
          week_end: week.end,
          attachment_1_url: a1.url,
          attachment_1_name: a1.name,
          attachment_2_url: a2.url,
          attachment_2_name: a2.name,
          plan_submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", attendanceRow.id);
      if (error) throw error;
      setPhase("done");
    } catch (err) {
      setMessage(err.message || "Could not save weekly plan.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetScan = () => {
    setPhase("scan");
    setScannedEmployee(null);
    setAttendanceRow(null);
    setWeeklyPlan("");
    setFile1(null);
    setFile2(null);
    setMessage("");
    handlingRef.current = false;
  };

  if (!user) return null;

  return (
    <div className="qr-page">
      <Navbar showQrScanner qrActive />

      <div className="qr-wrap">
        <button className="qr-back" type="button" onClick={() => (window.location.href = "/site")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Site Portal
        </button>

        <div className="qr-sticker no-print-hide">
          <div className="qr-sticker-badge">Print & stick on desk</div>
          <h2>Monday check-in</h2>
          <p>Engineers scan this QR after logging in. Attendance is marked for the person who scans, then they submit their weekly plan.</p>
          {deskQrImage ? (
            <img className="qr-sticker-img" src={deskQrImage} alt="Desk attendance QR code" />
          ) : (
            <div className="qr-sticker-wait">Generating QR…</div>
          )}
          <div className="qr-sticker-code">{DESK_QR_TOKEN}</div>
          <button type="button" className="qr-btn-primary qr-print-btn" onClick={() => window.print()}>
            Print desk QR
          </button>
          <p className="qr-sticker-hint">
            Print this from your live website URL so the code points to production, not localhost.
          </p>
        </div>

        <div className="qr-print-only">
          <div className="qr-print-card">
            <div className="qr-print-kicker">DIP Projects · Site Portal</div>
            <h1>Monday check-in</h1>
            <p>Log in to Site Portal, then scan this QR to mark yourself present and submit your weekly plan.</p>
            {deskQrImage && <img src={deskQrImage} alt="Desk attendance QR code" />}
            <div className="qr-sticker-code">{DESK_QR_TOKEN}</div>
          </div>
        </div>

        <div className="qr-card qr-screen-only">
          <div className="qr-card-head">
            <div className="qr-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <path d="M14 14h3v3h-3z" />
                <path d="M20 14v7" />
                <path d="M14 20h7" />
              </svg>
            </div>
            <div>
              <h1>Scan desk QR</h1>
              <p>Open this page on your phone, scan the QR on the desk, and your attendance will be marked present.</p>
            </div>
          </div>

          {(phase === "scan" || phase === "loading") && (
            <div className="qr-scan-body">
              <div id="qr-reader" className="qr-reader" />
              {(busy || phase === "loading") && (
                <div className="qr-busy">Marking you present…</div>
              )}
              {camError && <div className="qr-note">{camError}</div>}
              <div className="qr-actions">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={onFileQr}
                />
                <button type="button" className="qr-btn-secondary" onClick={() => fileInputRef.current?.click()}>
                  Upload photo of desk QR
                </button>
              </div>
              {message && <div className="qr-error">{message}</div>}
            </div>
          )}

          {phase === "plan" && scannedEmployee && (
            <form className="qr-plan" onSubmit={submitWeeklyPlan}>
              <div className="qr-emp-chip">
                <div className="qr-emp-av">{(scannedEmployee.name || "?").charAt(0).toUpperCase()}</div>
                <div>
                  <strong>{scannedEmployee.name}</strong>
                  <span>
                    {scannedEmployee.role || "—"} · Present for {todayIST()}
                  </span>
                </div>
              </div>

              <label className="qr-label">
                Weekly plan
                <span className="qr-week">
                  {week.start} → {week.end}
                </span>
              </label>
              <textarea
                className="qr-textarea"
                rows={6}
                value={weeklyPlan}
                onChange={(e) => setWeeklyPlan(e.target.value)}
                placeholder="Enter this week's plan, tasks, and site notes…"
              />

              <label className="qr-label">
                {coordinator ? "Report attachments (2 required for Co-ordinator)" : "Report attachment"}
              </label>
              <label className="qr-file">
                <input type="file" onChange={(e) => setFile1(e.target.files?.[0] || null)} />
                <span>{file1 ? file1.name : coordinator ? "Choose file 1" : "Choose file"}</span>
              </label>
              {coordinator && (
                <label className="qr-file">
                  <input type="file" onChange={(e) => setFile2(e.target.files?.[0] || null)} />
                  <span>{file2 ? file2.name : "Choose file 2"}</span>
                </label>
              )}

              {message && <div className="qr-error">{message}</div>}

              <div className="qr-plan-actions">
                <button type="button" className="qr-btn-secondary" onClick={resetScan} disabled={submitting}>
                  Scan again
                </button>
                <button type="submit" className="qr-btn-primary" disabled={submitting}>
                  {submitting ? "Saving…" : "Submit weekly plan"}
                </button>
              </div>
            </form>
          )}

          {phase === "done" && (
            <div className="qr-done">
              <div className="qr-done-ico">✓</div>
              <h2>Weekly plan submitted</h2>
              <p>
                Attendance and weekly plan for <strong>{scannedEmployee?.name}</strong> are saved in the QR
                attendance table only.
              </p>
              <div className="qr-plan-actions">
                <button type="button" className="qr-btn-primary" onClick={() => (window.location.href = "/site")}>
                  Back to Site Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {phase === "popup" && scannedEmployee && (
        <div className="qr-popup-backdrop">
          <div className="qr-popup">
            <div className="qr-popup-check">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2>Marked present</h2>
            <p className="qr-popup-name">{scannedEmployee.name}</p>
            <p className="qr-popup-meta">
              {scannedEmployee.role || "Employee"}
              {scannedEmployee.department ? ` · ${scannedEmployee.department}` : ""}
            </p>
            <p className="qr-popup-hint">Opening report submission…</p>
          </div>
        </div>
      )}
    </div>
  );
}
