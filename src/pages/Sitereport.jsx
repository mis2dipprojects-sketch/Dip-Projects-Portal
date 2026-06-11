import { useState, useRef } from "react";
import { supabase } from "../supabase";
import { generateSiteReportPDF } from "./generateSiteReportPDF"; // adjust path
import logoAsset from "../assets/logo.png";
import { processImage } from "../utils/imageUtils.js";

function Section({ num, title, children, openSections, toggleSection }) {
  const open = !!openSections[num];
  return (
    <div className="svr-section">

      <button
        className={`svr-sec-header${open ? " open" : ""}`}
        onClick={() => toggleSection(num)}
      >
        <span className="svr-sec-num">{num}</span>
        <span className="svr-sec-title">{title}</span>
        <svg
          className={`svr-chevron${open ? " open" : ""}`}
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="svr-sec-body">{children}</div>}
    </div>
  );
}

function Field({ label, required, children, hint, col2 }) {
  return (
    <div className={`svr-field${col2 ? " svr-col2" : ""}`}>
      <label className="svr-label">
        {label}
        {required && <span className="svr-req"> *</span>}
      </label>
      {children}
      {hint && <span className="svr-hint">{hint}</span>}
    </div>
  );
}

function TextArea({ value, onChange, placeholder }) {
  return (
    <textarea
      className="svr-textarea"
      placeholder={placeholder}
      value={value}
      rows={4}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const s = e.target.selectionStart;
          const t = e.target.value;
          const newVal = t.slice(0, s) + "\n• " + t.slice(e.target.selectionEnd);
          onChange(newVal);
          setTimeout(() => {
            e.target.selectionStart = e.target.selectionEnd = s + 3;
          }, 0);
        }
      }}
    />
  );
}

export default function SiteReport({ user }) {
  const [form, setForm] = useState({
    visit_date: new Date().toISOString().split("T")[0],
    visit_time: "",
    site_name: "",
    reporter_name: user?.name || "",
    designation: "",
    designation_other: "",
    progress_of_work: "",
    quality_observations: "",
    safety_concerns: "",
    issues_concerns: "",
    site_visit_instructions: "",
    key_instructions: "",
  });
  const [photosProcessing, setPhotosProcessing] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState(""); // progress label
  const [toast, setToast] = useState(null);
  const [openSections, setOpenSections] = useState({ 1: true });
  const fileRef = useRef();

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  };

  const toggleSection = (n) =>
    setOpenSections((p) => ({ ...p, [n]: !p[n] }));

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // ── Image handling ──
  const handleFiles = async (files) => {
  const fileArr = Array.from(files);
  setPhotosProcessing(true);
  for (const file of fileArr) {
    try {
      const processed = await processImage(file);
      setPhotos((p) => [...p, { dataUrl: processed.dataUrl, caption: "", file }]);
    } catch (err) {
      showToast("error", `Could not load ${file.name}: ${err.message}`);
    }
  }
  setPhotosProcessing(false);
};

  const compressImage = (dataUrl, cb) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 1200;
      const scale = Math.min(1, MAX / img.width, MAX / img.height);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      cb(canvas.toDataURL("image/jpeg", 0.78));
    };
    img.onerror = () => cb(dataUrl);
    img.src = dataUrl;
  };

  const removePhoto = (i) =>
    setPhotos((p) => p.filter((_, idx) => idx !== i));

  const updateCaption = (i, v) =>
    setPhotos((p) => p.map((ph, idx) => (idx === i ? { ...ph, caption: v } : ph)));

  // ── Submit ──
const handleSubmit = async () => {
    if (!form.visit_date) return showToast("error", "Visit Date is required.");
    if (!form.site_name) return showToast("error", "Site Name is required.");
    if (!form.reporter_name.trim()) return showToast("error", "Reporter Name is required.");
    if (!form.designation) return showToast("error", "Designation is required.");
    if (form.designation === "other" && !form.designation_other.trim())
      return showToast("error", "Please specify designation.");

    setSubmitting(true);
    setSubmitStage("Saving report…");

    try {
      // ── 1. Insert report ──
      const designationValue =
        form.designation === "other" ? form.designation_other.trim() : form.designation;

      const { data: inserted, error: insertErr } = await supabase
        .from("site_reports")
        .insert([{
          visit_date: form.visit_date,
          visit_time: form.visit_time || null,
          site_name: form.site_name,
          reporter_name: form.reporter_name.trim(),
          designation: designationValue,
          progress_of_work: form.progress_of_work || null,
          quality_observations: form.quality_observations || null,
          safety_concerns: form.safety_concerns || null,
          issues_concerns: form.issues_concerns || null,
          site_visit_instructions: form.site_visit_instructions || null,
          key_instructions: form.key_instructions || null,
          submitted_by: user?.user_name || null,
          submitted_by_name: user?.name || null,
        }])
        .select()
        .single();

      if (insertErr) throw new Error("Report insert failed: " + insertErr.message);
      const reportId = inserted.id;
      console.log("✅ Report inserted:", reportId);

      // ── 2. Upload photos ──
      if (photos.length > 0) {
        setSubmitStage(`Uploading ${photos.length} photo(s)…`);
        const uploadedPhotos = [];

        for (let i = 0; i < photos.length; i++) {
          const ph = photos[i];
          console.log(`📷 Uploading photo ${i + 1}/${photos.length}…`);

          try {
            const resp = await fetch(ph.dataUrl);
            const blob = await resp.blob();
            const path = `site-reports/${reportId}/photo_${i + 1}.jpg`;

            const { data: storageData, error: upErr } = await supabase.storage
              .from("site-report-photos")
              .upload(path, blob, { contentType: "image/jpeg", upsert: true });

            if (upErr) {
              // Surface the EXACT error
              console.error(`❌ Storage upload failed for photo ${i + 1}:`, upErr);
              showToast("error", `Photo ${i + 1} upload failed: ${upErr.message}`);
              continue;
            }

            console.log(`✅ Photo ${i + 1} uploaded:`, storageData);

            const { data: pub } = supabase.storage
              .from("site-report-photos")
              .getPublicUrl(path);

            uploadedPhotos.push({
              report_id: reportId,
              photo_url: pub.publicUrl,
              caption: ph.caption?.trim() || null,
              sort_order: i,
            });
          } catch (e) {
            console.error(`❌ Photo ${i + 1} exception:`, e);
          }
        }

        console.log(`📋 Inserting ${uploadedPhotos.length} photo rows…`, uploadedPhotos);

        if (uploadedPhotos.length > 0) {
          const { data: photoRows, error: photosInsertErr } = await supabase
            .from("site_report_photos")
            .insert(uploadedPhotos)
            .select();

          if (photosInsertErr) {
            console.error("❌ site_report_photos insert error:", photosInsertErr);
            showToast("error", "Photos uploaded but DB insert failed: " + photosInsertErr.message);
          } else {
            console.log("✅ Photos saved to DB:", photoRows);
          }
        }
      }

      // ── 3. Generate + upload PDF ──
      setSubmitStage("Generating PDF…");
      try {
        const { blob: pdfBlob, fileName } = await generateSiteReportPDF(  
          {
            visit_date: form.visit_date,
            visit_time: form.visit_time,
            site_name: form.site_name,
            reporter_name: form.reporter_name.trim(),
            designation: designationValue,
            progress_of_work: form.progress_of_work,
            quality_observations: form.quality_observations,
            safety_concerns: form.safety_concerns,
            issues_concerns: form.issues_concerns,
            site_visit_instructions: form.site_visit_instructions,
            key_instructions: form.key_instructions,
          },
          photos,
          logoAsset
        );
        setSubmitResult({ type: "success", msg: "Report generated and downloaded successfully!" })
        console.log("✅ PDF generated:", fileName, pdfBlob.size, "bytes");

        setSubmitStage("Uploading PDF…");
        const pdfPath = `site-reports/${reportId}/${fileName}`;
        const { data: pdfStorageData, error: pdfUpErr } = await supabase.storage
          .from("site-report-pdfs")
          .upload(pdfPath, pdfBlob, { contentType: "application/pdf", upsert: true });

        if (pdfUpErr) {
          console.error("❌ PDF storage upload failed:", pdfUpErr);
          showToast("error", "PDF upload failed: " + pdfUpErr.message);
        } else {
          console.log("✅ PDF uploaded:", pdfStorageData);
          const { data: pdfPub } = supabase.storage
            .from("site-report-pdfs")
            .getPublicUrl(pdfPath);

          const { error: pdfUpdateErr } = await supabase
            .from("site_reports")
            .update({ pdf_url: pdfPub.publicUrl })
            .eq("id", reportId);

          if (pdfUpdateErr) {
            console.error("❌ pdf_url update failed:", pdfUpdateErr);
          } else {
            console.log("✅ pdf_url saved:", pdfPub.publicUrl);
          }

          // Trigger download
          const a = document.createElement("a");
          a.href = URL.createObjectURL(pdfBlob);
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(a.href);
        }
      } catch (pdfErr) {
          setSubmitResult({ type: "error", msg: "Failed to generate report. " + pdfErr.message });
        console.error("❌ PDF generation error:", pdfErr);
        showToast("error", "PDF generation failed: " + pdfErr.message);
      }

      showToast("success", "Site Visit Report submitted successfully!");

      setForm({
        visit_date: new Date().toISOString().split("T")[0],
        visit_time: "",
        site_name: "",
        reporter_name: user?.name || "",
        designation: "",
        designation_other: "",
        progress_of_work: "",
        quality_observations: "",
        safety_concerns: "",
        issues_concerns: "",
        site_visit_instructions: "",
        key_instructions: "",
      });
      setPhotos([]);
      setOpenSections({ 1: true });

    } catch (err) {
      console.error("❌ Submit error:", err);
      showToast("error", "Submission failed: " + err.message);
    } finally {
      setSubmitting(false);
      setSubmitStage("");
    }
  };

  return (
    <>
      <style>{`
        .svr-root { display: flex; flex-direction: column; gap: 14px; }
        .svr-section { border: 1px solid #e8edf3; border-radius: 10px; overflow: hidden; }

        .svr-sec-header{ width:100%;display:flex;align-items:center;gap:12px; background:linear-gradient(#fff,#fff) padding-box,linear-gradient(135deg,#6b2d0f,#c8641a) border-box;border:2px solid transparent;border-radius:12px;color:#6b2d0f;padding:13px 16px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;letter-spacing:.2px;text-align:left;transition:.15s;}
        .svr-sec-header:hover { filter: brightness(1.1); }
        .svr-sec-num { background: rgba(255,255,255,.18); width: 24px; height: 24px;
          border-radius: 6px; display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; flex-shrink: 0; }
        .svr-sec-title { flex: 1; }
        .svr-chevron { margin-left: auto; flex-shrink: 0; transition: transform .2s; }
        .svr-chevron.open { transform: rotate(180deg); }
        .svr-sec-body { padding: 20px; background: #fff; display: flex; flex-direction: column; gap: 14px; }
        .svr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .svr-col2 { grid-column: span 2; }
        @media (max-width: 620px) { .svr-grid { grid-template-columns: 1fr; } .svr-col2 { grid-column: span 1; } }
        .svr-field { display: flex; flex-direction: column; gap: 5px; }
        .svr-label { font-size: 12.5px; font-weight: 600; color: #475569; }
        .svr-req { color: #dc2626; }
        .svr-hint { font-size: 11.5px; color: #94a3b8; }
        .svr-input, .svr-select, .svr-textarea {
          font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: #1e293b;
          background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px;
          padding: 9px 12px; outline: none; transition: border .15s, box-shadow .15s; width: 100%; }
        .svr-input:focus, .svr-select:focus, .svr-textarea:focus {
          border-color: #334155; box-shadow: 0 0 0 3px rgba(51,65,85,.1); background: #fff; }
        .svr-select { cursor: pointer; }
        .svr-textarea { resize: vertical; min-height: 100px; }
        .svr-photo-btn { display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 16px; border: 2px dashed #cbd5e1; border-radius: 8px;
          cursor: pointer; font-weight: 600; color: #475569; background: #f8fafc;
          font-size: 13px; transition: .18s ease; font-family: 'DM Sans', sans-serif; }
        .svr-photo-btn:hover { background: #f1f5f9; border-color: #94a3b8; }
        .svr-photo-btn.has-photos { border-style: solid; border-color: #334155; color: #1e293b; background: #f1f5f9; }
        .svr-photo-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px; }
        .svr-photo-item { display: flex; flex-direction: column; width: 120px; }
        .svr-photo-thumb { position: relative; width: 120px; height: 120px; overflow: hidden;
          border: 2px solid #e2e8f0; border-radius: 8px 8px 0 0; }
        .svr-photo-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .svr-photo-remove { position: absolute; top: 4px; right: 4px; width: 22px; height: 22px;
          background: rgba(0,0,0,.6); color: #fff; border: none; border-radius: 4px;
          cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif; padding: 0; }
        .svr-photo-remove:hover { background: #dc2626; }
        .svr-caption-input { width: 120px; border: 2px solid #e2e8f0; border-top: 1px solid #f1f5f9;
          border-radius: 0 0 8px 8px; font-size: 11px; padding: 5px 7px;
          font-family: 'DM Sans', sans-serif; background: #fff; color: #475569; resize: none; outline: none; }
        .svr-caption-input:focus { border-color: #334155; }
        .svr-submit { display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg,#88330f, #581d03, #88330f); color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700;
          padding: 13px 24px; border-radius: 9px; border: none; cursor: pointer;
          transition: filter .15s, transform .1s; width: 100%; margin-top: 4px;
          box-shadow: 0 4px 14px rgba(30,41,59,.25); }
        .svr-submit:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
        .svr-submit:disabled { opacity: .6; cursor: not-allowed; }
        .svr-stage { font-size: 12px; color: #64748b; text-align: center; margin-top: 6px; font-family: 'DM Sans', sans-serif; }
        .svr-toast { display: flex; align-items: center; gap: 9px; padding: 11px 16px;
          border-radius: 9px; font-size: 13px; font-weight: 600; margin-bottom: 14px;
          animation: svr-slideUp .2s ease; }
        .svr-toast-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .svr-toast-error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        @keyframes svr-slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
      `}</style>

      <div className="svr-root">
        {toast && (
          <div className={`svr-toast svr-toast-${toast.type}`}>
            {toast.type === "success"
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            {toast.msg}
          </div>
        )}

        <div style={{ display:"flex", gap:9, alignItems:"flex-start", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, padding:"12px 14px", fontSize:13, color:"#475569" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0, marginTop:1}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Fill in all sections below and attach site photos. On submit, the report is saved to the database, photos are uploaded, and a PDF is generated and stored.
        </div>

        {/* ── 1. Visit Details ── */}
        <Section num={1} title="Visit Details" openSections={openSections} toggleSection={toggleSection}>
          <div className="svr-grid">
            <Field label="Visit Date" required>
              <input className="svr-input" type="date" value={form.visit_date} onChange={e => set("visit_date", e.target.value)} />
            </Field>
            <Field label="Visit Time">
              <input className="svr-input" type="time" value={form.visit_time} onChange={e => set("visit_time", e.target.value)} />
            </Field>
            <Field label="Site / Project Name" required col2>
              <input className="svr-input" placeholder="Enter site or project name…" value={form.site_name} onChange={e => set("site_name", e.target.value)} />
            </Field>
            <Field label="Designation" required>
              <select className="svr-select" value={form.designation} onChange={e => set("designation", e.target.value)}>
                <option value="">— Select —</option>
                <option value="Site Engineer">Site Engineer</option>
                <option value="Head">Head</option>
                <option value="Co-ordinator">Co-ordinator</option>
                <option value="other">Other…</option>
              </select>
            </Field>
            <Field label="Reporter Name" required>
              <input className="svr-input" placeholder="Full name…" value={form.reporter_name} onChange={e => set("reporter_name", e.target.value)} />
            </Field>
            {form.designation === "other" && (
              <Field label="Specify Designation" required col2>
                <input className="svr-input" placeholder="Enter designation…" value={form.designation_other} onChange={e => set("designation_other", e.target.value)} />
              </Field>
            )}
          </div>
        </Section>

        <Section num={2} title="Progress of Work & Ongoing Activities" openSections={openSections} toggleSection={toggleSection}>
          <Field label="Details" hint="Press Enter to add bullet points automatically.">
            <TextArea placeholder={"• List ongoing activities\n• Progress updates\n• Work completed today"} value={form.progress_of_work} onChange={v => set("progress_of_work", v)} />
          </Field>
        </Section>

        <Section num={3} title="Quality Observations" openSections={openSections} toggleSection={toggleSection}>
          <Field label="Observations" hint="Include observations on line, level, material quality, testing etc.">
            <TextArea placeholder={"• Line & level checking\n• Material quality\n• Testing reports\n• Other QC observations"} value={form.quality_observations} onChange={v => set("quality_observations", v)} />
          </Field>
        </Section>

        <Section num={4} title="Safety Concerns" openSections={openSections} toggleSection={toggleSection}>
          <Field label="Concerns">
            <TextArea placeholder={"• PPE compliance\n• Scaffolding safety\n• Hazardous area marking\n• Other safety issues"} value={form.safety_concerns} onChange={v => set("safety_concerns", v)} />
          </Field>
        </Section>

        <Section num={5} title="Issues & Concerns" openSections={openSections} toggleSection={toggleSection}>
          <Field label="Issues" hint="Material / manpower shortage, drawing pending, payment delay, etc.">
            <TextArea placeholder={"• Material shortage\n• Manpower shortage\n• Drawing pending\n• Payment delay\n• Other issues"} value={form.issues_concerns} onChange={v => set("issues_concerns", v)} />
          </Field>
        </Section>

        <Section num={6} title="Site Visit Instructions" openSections={openSections} toggleSection={toggleSection}>
          <Field label="Instructions" hint="Point-wise instructions given during the site visit.">
            <TextArea placeholder={"• Instruction point 1\n• Instruction point 2\n• Instruction point 3"} value={form.site_visit_instructions} onChange={v => set("site_visit_instructions", v)} />
          </Field>
        </Section>

        <Section num={7} title="Key Instructions" openSections={openSections} toggleSection={toggleSection}>
          <Field label="Critical Instructions" hint="High-priority instructions that must be acted upon immediately.">
            <TextArea placeholder={"• Critical instruction 1\n• Critical instruction 2"} value={form.key_instructions} onChange={v => set("key_instructions", v)} />
          </Field>
        </Section>

        <Section num={8} title="Site Photos" openSections={openSections} toggleSection={toggleSection}>
          <div>
            <label className={`svr-photo-btn${photos.length > 0 ? " has-photos" : ""}`} onClick={() => fileRef.current?.click()} style={{ cursor: "pointer" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              {photos.length > 0 ? `${photos.length} photo${photos.length > 1 ? "s" : ""} selected` : "Choose Photos"}
            </label>
            <input ref={fileRef} type="file" accept="image/*,.heic,.heif" multiple hidden onChange={e => { handleFiles(e.target.files); e.target.value = ""; }} />
            {photos.length > 0 && (
              <div className="svr-photo-grid">
                {photos.map((ph, i) => (
                  <div key={i} className="svr-photo-item">
                    <div className="svr-photo-thumb">
                      <img src={ph.dataUrl} alt={`photo ${i + 1}`} />
                      <button className="svr-photo-remove" onClick={() => removePhoto(i)}>×</button>
                    </div>
                    <textarea className="svr-caption-input" rows={2} placeholder="Caption…" value={ph.caption} onChange={e => updateCaption(i, e.target.value)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>
          {/* Inline submit result — shows above submit button */}
{submitResult && (
  <div style={{
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 16px", borderRadius: 10, marginBottom: 12,
    background: submitResult.type === "success" ? "#f0fdf4" : "#fef2f2",
    border: `1px solid ${submitResult.type === "success" ? "#bbf7d0" : "#fecaca"}`,
    color: submitResult.type === "success" ? "#16a34a" : "#dc2626",
    fontSize: 13.5, fontWeight: 500,
  }}>
    {submitResult.type === "success"
      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    }
    {submitResult.msg}
    <button onClick={() => setSubmitResult(null)} style={{
      marginLeft: "auto", background: "none", border: "none",
      cursor: "pointer", color: "inherit", padding: 2, display: "flex",
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
)}

{/* Submit button — disabled while photos loading or submitting */}
<button
  onClick={handleSubmit}
  disabled={photosProcessing || submitting}
  className="svr-submit"
>
  {submitting ? "Generating PDF…" : "Generate Report"}
</button>
        {/* <button className="svr-submit" onClick={handleSubmit} disabled={submitting}>
          {submitting
            ? <><span className="op-mini-spinner" />&nbsp;{submitStage || "Submitting…"}</>
            : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>&nbsp;Submit Site Visit Report</>
          }
        </button> */}
        {submitting && submitStage && <div className="svr-stage">{submitStage}</div>}
      </div>
      {/* Photo processing popup — bottom-left floating */}
{photosProcessing && (
  <div style={{
    position: "fixed", bottom: 28, left: 28, zIndex: 9999,
    display: "flex", alignItems: "center", gap: 12,
    background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: 12, padding: "14px 18px",
    boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
    fontSize: 13.5, fontWeight: 500, color: "#1e293b",
    animation: "slideUp .25s ease",
  }}>
    {/* Spinner */}
    <div style={{
      width: 18, height: 18, borderRadius: "50%",
      border: "2.5px solid #e2e8f0",
      borderTopColor: "#dc2626",
      animation: "spin .7s linear infinite",
      flexShrink: 0,
    }}/>
    <div>
      <div style={{ fontWeight: 600, marginBottom: 2 }}>Processing images…</div>
      <div style={{ fontSize: 12, color: "#64748b" }}>
        Converting &amp; compressing, please wait
      </div>
    </div>
  </div>
)}
    </>
  );
}