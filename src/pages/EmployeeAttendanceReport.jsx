import { useEffect, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const pad = (n) => String(n).padStart(2, "0");
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function fmtDate_(iso) {
  const d = new Date(iso + "T00:00:00");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
}

function fmtTimeIST_(ts) {
  if (!ts) return "-";
  try {
    return new Date(ts).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "-";
  }
}

function calculateLateMinutes_(clockIn) {
  if (!clockIn) return 0;
  const date = new Date(clockIn);
  if (Number.isNaN(date.getTime())) return 0;

  const clockInMinutes = date.getHours() * 60 + date.getMinutes();
  return Math.max(0, clockInMinutes - (9 * 60));
}

// Inclusive ISO date list between from and to
function dateRange_(from, to) {
  const out = [];
  if (!from || !to) return out;
  let cur = new Date(from + "T00:00:00");
  const end = new Date(to + "T00:00:00");
  while (cur <= end) {
    out.push(`${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function buildMapUrl_(lat, lng) {
  if (lat == null || lng == null) return "";
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function parseCoordinates_(location) {
  const match = String(location || "").trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  return { lat: Number(match[1]), lng: Number(match[2]) };
}

async function reverseGeocode_(coordinates) {
  if (!coordinates) return "";
  if (sessionStorage.getItem("attendance-geocoder-disabled-v3")) return "";
  const cacheKey = `attendance-location-v2-${coordinates.lat},${coordinates.lng}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coordinates.lat}&longitude=${coordinates.lng}&localityLanguage=en`,
    );
    if (response.status === 429) {
      sessionStorage.setItem("attendance-geocoder-disabled-v3", "1");
      return "";
    }
    if (!response.ok) return "";
    const result = await response.json();
    const landmarkDescriptions = new Set([
      "road", "street", "suburb", "neighbourhood", "neighborhood",
      "village", "town", "hamlet", "building", "park", "landmark",
      "shopping centre", "point of interest", "locality",
    ]);
    const landmark = (result.localityInfo?.informative || [])
      .filter((place) => place.name && landmarkDescriptions.has(String(place.description || "").toLowerCase()))
      .map((place) => place.name)
      .find((place) => place !== result.locality && place !== result.city);
    const name = [...new Set([
      landmark,
      result.locality,
      result.city,
      result.principalSubdivision,
      result.countryName,
    ].filter(Boolean))].join(", ");
    if (name) sessionStorage.setItem(cacheKey, name);
    return name;
  } catch {
    sessionStorage.setItem("attendance-geocoder-disabled-v3", "1");
    return "";
  }
}

async function enrichLocationNames_(rows) {
  const locations = [...new Set(
    rows.flatMap((row) => [row.checkInLoc, row.checkOutLoc])
      .filter((location) => parseCoordinates_(location)),
  )];
  const locationNames = new Map();

  for (const location of locations) {
    const coordinates = parseCoordinates_(location);
    const name = await reverseGeocode_(coordinates);
    if (!name) break;
    locationNames.set(location, name);
  }

  return rows.map((row) => ({
    ...row,
    checkInLoc: locationNames.get(row.checkInLoc) || row.checkInLoc,
    checkOutLoc: locationNames.get(row.checkOutLoc) || row.checkOutLoc,
  }));
}

// ═══════════════════════════════════════════════════════════════
// DATA FETCH — full date range, gaps filled as Absent
// ═══════════════════════════════════════════════════════════════
async function fetchEmployeeDetailReport(supabase, employee, sites, from, to) {
  if (!employee || !from || !to) return [];

  const { data: attData, error: attErr } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_name", employee.username)
    .gte("date", from)
    .lte("date", to);
  if (attErr) throw attErr;

  const { data: dprData, error: dprErr } = await supabase
    .from("dpr_reports")
    .select("site, engineer, report_type, date, pdf_url")
    .in("site", sites.length ? sites : ["__none__"])
    .gte("date", from)
    .lte("date", to)
    .neq("report_type", "morning");
  if (dprErr) throw dprErr;

  const attByDate = {};
  (attData || []).forEach((r) => {
    // Prefer explicit address/text fields if your schema has them; fall back to lat/lng.
    const checkInLoc =
      r.clock_in_location || r.clock_in_address ||
      (r.clock_in_lat != null ? `${r.clock_in_lat}, ${r.clock_in_lng}` : "");
    const checkOutLoc =
      r.clock_out_location || r.clock_out_address ||
      (r.clock_out_lat != null ? `${r.clock_out_lat}, ${r.clock_out_lng}` : "");
    const checkInCoordinates = parseCoordinates_(checkInLoc);
    const checkOutCoordinates = parseCoordinates_(checkOutLoc);
    const checkInMapUrl = r.clock_in_map_url || buildMapUrl_(
      checkInCoordinates?.lat ?? r.clock_in_lat,
      checkInCoordinates?.lng ?? r.clock_in_lng,
    );
    const checkOutMapUrl = r.clock_out_map_url || buildMapUrl_(
      checkOutCoordinates?.lat ?? r.clock_out_lat,
      checkOutCoordinates?.lng ?? r.clock_out_lng,
    );

    attByDate[r.date] = {
      checkIn: fmtTimeIST_(r.clock_in),
      checkOut: fmtTimeIST_(r.clock_out),
      checkInLoc,
      checkOutLoc,
      checkInMapUrl,
      checkOutMapUrl,
      status: r.clock_in_status === "late" ? "Late" : (r.clock_in ? "On Time" : "Absent"),
      lateMin: r.late_minutes != null && r.late_minutes !== ""
        ? Number(r.late_minutes)
        : calculateLateMinutes_(r.clock_in),
    };
  });

  const dprByDate = {};
  (dprData || []).forEach((r) => {
    if ((r.engineer || "").trim().toLowerCase() !== (employee.name || "").trim().toLowerCase()) return;
    dprByDate[r.date] = r.pdf_url || "";
  });

  const rows = dateRange_(from, to).map((dStr) => {
    const att = attByDate[dStr];
    const dprLink = dprByDate[dStr];
    const submitted = dprLink !== undefined;

    if (att) {
      return {
        date: fmtDate_(dStr),
        sortDate: dStr,
        empName: employee.name,
        checkIn: att.checkIn,
        checkOut: att.checkOut,
        checkInLoc: att.checkInLoc,
        checkOutLoc: att.checkOutLoc,
        checkInMapUrl: att.checkInMapUrl,
        checkOutMapUrl: att.checkOutMapUrl,
        morningSubmitted: submitted,
        eveningSubmitted: submitted,
        dprLink: dprLink || "",
        status: att.status,
        lateMin: att.lateMin,
      };
    }
    return {
      date: fmtDate_(dStr),
      sortDate: dStr,
      empName: employee.name,
      checkIn: "-",
      checkOut: "-",
      checkInLoc: "",
      checkOutLoc: "",
      checkInMapUrl: "",
      checkOutMapUrl: "",
      morningSubmitted: submitted,
      eveningSubmitted: submitted,
      dprLink: dprLink || "",
      status: "Absent",
      lateMin: 0,
    };
  });

  return rows;
}

// ═══════════════════════════════════════════════════════════════
// PDF EXPORT
// ═══════════════════════════════════════════════════════════════
function statusColor_(status) {
  const s = String(status).toLowerCase();
  if (s === "absent") return { bg: [241, 245, 249], text: [100, 116, 139] };
  if (s === "late") return { bg: [254, 226, 226], text: [153, 27, 27] };
  return { bg: [220, 252, 231], text: [22, 101, 52] }; // On Time / Submitted
}

function downloadEmployeeReportPdf(rows, empName, from, to) {
  const doc = new jsPDF({ orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;

  // Title bar
  doc.setFillColor(30, 58, 95);
  doc.rect(margin, 10, pageWidth - margin * 2, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text(empName, pageWidth / 2, 18, { align: "center" });

  doc.setFillColor(69, 102, 143);
  doc.rect(margin, 22, pageWidth - margin * 2, 8, "F");
  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.text(`Attendance Report | Period: ${fmtDate_(from)} to ${fmtDate_(to)}`, pageWidth / 2, 27.5, { align: "center" });
  doc.setTextColor(0, 0, 0);

  const linkMap = []; // collect [pageNumber not needed since autoTable draws once] {x,y,w,h,url}

  autoTable(doc, {
    startY: 34,
    theme: "grid",
    head: [[
      "Date", "Check In", "Check In Loc", "Check Out", "Check Out Loc",
      "Late Min", "Status", "Morning", "Evening",
    ]],
    body: rows.map((r) => [
      r.date, r.checkIn, r.checkInLoc || "-", r.checkOut,
      r.checkOutLoc || "-", r.lateMin || 0, r.status,
      r.morningSubmitted ? "Submitted" : "Pending",
      r.eveningSubmitted ? "Submitted" : "Pending",
    ]),
    styles: { fontSize: 8, halign: "center", valign: "middle", cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.1 },
    headStyles: { fillColor: [30, 58, 95], textColor: [255, 255, 255], fontStyle: "bold", lineColor: [0, 0, 0], lineWidth: 0.1 },
    bodyStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      2: { fontSize: 7 },
      4: { fontSize: 7 },
    },
    didParseCell: (data) => {
      if (data.section !== "body") return;
      const row = rows[data.row.index];
      if ([7, 8].includes(data.column.index)) {
        const submitted = data.column.index === 7 ? row.morningSubmitted : row.eveningSubmitted;
        const c = submitted ? statusColor_("submitted") : statusColor_("pending");
        data.cell.styles.fillColor = c.bg;
        data.cell.styles.textColor = c.text;
        data.cell.styles.fontStyle = "bold";
      }
      if (data.column.index === 6) {
        const c = statusColor_(row.status);
        data.cell.styles.fillColor = c.bg;
        data.cell.styles.textColor = c.text;
        data.cell.styles.fontStyle = "bold";
      }
    },
    didDrawCell: (data) => {
      if (data.section !== "body") return;
      const row = rows[data.row.index];
      // Check In Location (col 3) / Check Out Location (col 5) clickable
      if (data.column.index === 2 && row.checkInMapUrl) {
        doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: row.checkInMapUrl });
      }
      if (data.column.index === 4 && row.checkOutMapUrl) {
        doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: row.checkOutMapUrl });
      }
      // Morning/Evening report cells link to DPR report if submitted
      if ((data.column.index === 7 || data.column.index === 8) && row.morningSubmitted && row.dprLink) {
        doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: row.dprLink });
      }
    },
  });

  doc.save(`Attendance_${empName.replace(/\s+/g, "_")}_${from}_to_${to}.pdf`);
}

// ═══════════════════════════════════════════════════════════════
// EXCEL EXPORT — exceljs for real cell colors + clickable hyperlinks
// ═══════════════════════════════════════════════════════════════
async function downloadEmployeeReportExcel(rows, empName, from, to) {
  const wb = new ExcelJS.Workbook();
  const sh = wb.addWorksheet("Attendance");

  const headers = [
    "Date", "Check In", "Check In Loc", "Check Out", "Check Out Loc",
    "Late Min", "Status", "Morning", "Evening",
  ];
  sh.columns = [
    { width: 13 }, { width: 13 }, { width: 34 }, { width: 13 },
    { width: 34 }, { width: 12 }, { width: 12 }, { width: 15 },
    { width: 15 },
  ];

  const headerRow = sh.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A5F" } };
    cell.font = { color: { argb: "FFFFFFFF" }, bold: true, size: 11 };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });
  headerRow.height = 22;

  const GREEN_BG = "FFDCFCE7", GREEN_TXT = "FF166534";
  const RED_BG = "FFFEE2E2", RED_TXT = "FF991B1B";
  const GREY_BG = "FFF1F5F9", GREY_TXT = "FF64748B";
  const BLUE_TXT = "FF1E40AF";

  rows.forEach((r, idx) => {
    const row = sh.addRow([
      r.date, r.checkIn, r.checkInLoc || "-", r.checkOut,
      r.checkOutLoc || "-", r.lateMin || 0, r.status,
      r.morningSubmitted ? "Submitted" : "Pending",
      r.eveningSubmitted ? "Submitted" : "Pending",
    ]);

    row.eachCell((cell) => {
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    });

    const rowNum = row.number;

    // Check In Location (col 3) — hyperlink, no underline
    if (r.checkInMapUrl) {
      const c = sh.getCell(rowNum, 3);
      c.value = { text: r.checkInLoc || "View Map", hyperlink: r.checkInMapUrl };
      c.font = { color: { argb: BLUE_TXT }, underline: false };
    }
    // Check Out Location (col 5)
    if (r.checkOutMapUrl) {
      const c = sh.getCell(rowNum, 5);
      c.value = { text: r.checkOutLoc || "View Map", hyperlink: r.checkOutMapUrl };
      c.font = { color: { argb: BLUE_TXT }, underline: false };
    }

    // Morning Report (col 8)
    const morningCell = sh.getCell(rowNum, 8);
    morningCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: r.morningSubmitted ? GREEN_BG : RED_BG } };
    if (r.morningSubmitted && r.dprLink) {
      morningCell.value = { text: "Submitted", hyperlink: r.dprLink };
      morningCell.font = { color: { argb: GREEN_TXT }, bold: true, underline: false };
    } else {
      morningCell.font = { color: { argb: r.morningSubmitted ? GREEN_TXT : RED_TXT }, bold: true };
    }

    // Evening DPR (col 9)
    const eveningCell = sh.getCell(rowNum, 9);
    eveningCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: r.eveningSubmitted ? GREEN_BG : RED_BG } };
    if (r.eveningSubmitted && r.dprLink) {
      eveningCell.value = { text: "Submitted", hyperlink: r.dprLink };
      eveningCell.font = { color: { argb: GREEN_TXT }, bold: true, underline: false };
    } else {
      eveningCell.font = { color: { argb: r.eveningSubmitted ? GREEN_TXT : RED_TXT }, bold: true };
    }

    // Status (col 7)
    const statusLower = String(r.status).toLowerCase();
    const statusCell = sh.getCell(rowNum, 7);
    if (statusLower === "absent") {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREY_BG } };
      statusCell.font = { color: { argb: GREY_TXT }, bold: true };
    } else if (statusLower === "late") {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: RED_BG } };
      statusCell.font = { color: { argb: RED_TXT }, bold: true };
    } else {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN_BG } };
      statusCell.font = { color: { argb: GREEN_TXT }, bold: true };
    }

    // Alternate row shading on plain columns
    if (idx % 2 === 1) {
      [1, 2, 4, 6].forEach((col) => {
        const c = sh.getCell(rowNum, col);
        if (!c.fill) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      });
    }
  });

  sh.views = [{ state: "frozen", ySplit: 1 }];

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/octet-stream" });
  saveAs(blob, `Attendance_${empName.replace(/\s+/g, "_")}_${from}_to_${to}.xlsx`);
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function EmployeeAttendanceReport({ supabase, sites }) {
  const [employees, setEmployees] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState(todayISO());
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(null); // 'pdf' | 'excel' | null
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!sites.length) return;
    supabase
      .from("user_details")
      .select("username, name")
      .overlaps("site_names", sites)
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (!error) setEmployees(data || []);
      });
  }, [sites, supabase]);

  const generate = async () => {
    if (!selectedUsername || !from || !to) return;
    setBusy(true);
    setErr("");
    try {
      const emp = employees.find((e) => e.username === selectedUsername);
      const data = await fetchEmployeeDetailReport(supabase, emp, sites, from, to);
      setRows(data);
      enrichLocationNames_(data).then(setRows);
    } catch (e) {
      setErr(e.message || "Failed to load attendance.");
      setRows(null);
    } finally {
      setBusy(false);
    }
  };

  const emp = employees.find((e) => e.username === selectedUsername);

  const handleDownload = async (fmt) => {
    if (!rows || !emp) return;
    setExporting(fmt);
    try {
      if (fmt === "pdf") downloadEmployeeReportPdf(rows, emp.name, from, to);
      else await downloadEmployeeReportExcel(rows, emp.name, from, to);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div>
      <div className="grid2" style={{ marginBottom: 20 }}>
        <div className="fgroup col2">
          <label className="flabel">Employee <span className="req">*</span></label>
          <select className="finput" value={selectedUsername} onChange={(e) => setSelectedUsername(e.target.value)}>
            <option value="">Select employee…</option>
            {employees.map((u) => (
              <option key={u.username} value={u.username}>{u.name}</option>
            ))}
          </select>
        </div>
        <div className="fgroup">
          <label className="flabel">From Date <span className="req">*</span></label>
          <input type="date" className="finput" value={from} max={to || todayISO()} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="fgroup">
          <label className="flabel">To Date <span className="req">*</span></label>
          <input type="date" className="finput" value={to} min={from} max={todayISO()} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="col2 act-row" style={{ marginTop: 0 }}>
          <button className="btn btn-pri" disabled={!selectedUsername || !from || !to || busy} onClick={generate}>
            {busy ? "Generating…" : "Generate Report"}
          </button>
        </div>
      </div>

      {err && <div className="info-banner warn-banner" style={{ marginBottom: 16 }}>{err}</div>}

      {rows && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 13, color: "var(--ink2)" }}>
              {emp?.name} · {rows.length} day{rows.length !== 1 ? "s" : ""} · {fmtDate_(from)} to {fmtDate_(to)}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-out" disabled={exporting} onClick={() => handleDownload("pdf")}>
                {exporting === "pdf" ? "Building…" : "Download PDF"}
              </button>
              <button className="btn btn-out" disabled={exporting} onClick={() => handleDownload("excel")}>
                {exporting === "excel" ? "Building…" : "Download Excel"}
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--line)" }}>
                  {["Date", "Check In", "Check In Loc", "Check Out", "Check Out Loc", "Late Min", "Status", "Morning", "Evening"].map((h) => (
                    <th key={h} style={{ padding: "8px 6px", textAlign: "center" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const statusColorMap = {
                    absent: "#64748b",
                    late: "#dc2626",
                  };
                  const sColor = statusColorMap[String(r.status).toLowerCase()] || "#16a34a";
                  return (
                    <tr key={r.sortDate} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "7px 6px", textAlign: "center" }}>{r.date}</td>
                      <td style={{ padding: "7px 6px", textAlign: "center" }}>{r.checkIn}</td>
                      <td style={{ padding: "7px 6px", textAlign: "center", fontSize: 11 }}>
                        {r.checkInMapUrl ? <a href={r.checkInMapUrl} target="_blank" rel="noreferrer">{r.checkInLoc || "View Map"}</a> : (r.checkInLoc || "-")}
                      </td>
                      <td style={{ padding: "7px 6px", textAlign: "center" }}>{r.checkOut}</td>
                      <td style={{ padding: "7px 6px", textAlign: "center", fontSize: 11 }}>
                        {r.checkOutMapUrl ? <a href={r.checkOutMapUrl} target="_blank" rel="noreferrer">{r.checkOutLoc || "View Map"}</a> : (r.checkOutLoc || "-")}
                      </td>
                      <td style={{ padding: "7px 6px", textAlign: "center" }}>{r.lateMin || 0}</td>
                      <td style={{ padding: "7px 6px", textAlign: "center", fontWeight: 700, color: sColor }}>{r.status}</td>
                      <td style={{ padding: "7px 6px", textAlign: "center", fontWeight: 700, color: r.morningSubmitted ? "#16a34a" : "#dc2626" }}>
                        {r.morningSubmitted ? "Submitted" : "Pending"}
                      </td>
                      <td style={{ padding: "7px 6px", textAlign: "center", fontWeight: 700, color: r.eveningSubmitted ? "#16a34a" : "#dc2626" }}>
                        {r.eveningSubmitted ? "Submitted" : "Pending"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}