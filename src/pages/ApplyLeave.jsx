import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import Navbar from "../components/Navbar";

export default function ApplyLeave() {

  const user = JSON.parse(localStorage.getItem("user"));

  const [siteHeads, setSiteHeads] = useState([]); // [{site, username, name}]
  const [selectedSite, setSelectedSite] = useState("");
  const [proxyUserName, setProxyUserName] = useState("");
  const [headLoading, setHeadLoading] = useState(false);

  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  // Fetch one head per site the user is assigned to (not just a single site_name)
  useEffect(() => {
    const sites = user?.site_names?.length
      ? user.site_names
      : user?.site_name ? [user.site_name] : [];
    if (!sites.length) { setSiteHeads([]); return; }

    setHeadLoading(true);
    (async () => {
      const results = await Promise.all(
        sites.map(async (site) => {
          const { data } = await supabase
            .from("user_details")
            .select("username, name")
            .eq("site_name", site)
            .in("role", ["Project Head", "Site Incharge"])
            .limit(1)
            .maybeSingle();
          return data
            ? { site, username: data.username, name: data.name }
            : { site, username: "", name: "" };
        })
      );
      setSiteHeads(results);

      if (sites.length === 1) {
        setSelectedSite(sites[0]);
        setProxyUserName(results[0]?.username || "");
      }
      setHeadLoading(false);
    })();
  }, [user?.site_names, user?.site_name]);

  const submitLeave = async () => {
    if (!leaveType || !fromDate || !toDate) {
      alert("Please fill leave type, from date and to date.");
      return;
    }
    if (siteHeads.length > 1 && !selectedSite) {
      alert("Please select which site this leave applies to.");
      return;
    }

    const siteName = selectedSite || user?.site_names?.[0] || user?.site_name || null;

    const { error } = await supabase.from("leaves").insert([{
      user_name: user.user_name,
      name: user.name,
      site_name: siteName,
      leave_type: leaveType,
      from_date: fromDate,
      to_date: toDate,
      reason,
      proxy_user_name: proxyUserName || null,
      status: "Pending",
    }]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Leave Applied Successfully");
    setLeaveType("");
    setFromDate("");
    setToDate("");
    setReason("");
    if (siteHeads.length > 1) {
      setSelectedSite("");
      setProxyUserName("");
    }
  };

  return (
    <div>
      <Navbar />
      <h1>Apply Leave</h1>

      <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
        <option value="">Select Leave Type</option>
        <option>Casual Leave</option>
        <option>Sick Leave</option>
        <option>Emergency Leave</option>
      </select>

      <br /><br />

      <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />

      <br /><br />

      <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />

      <br /><br />

      <textarea placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />

      <br /><br />

      {/* Site head selection — dropdown if multiple sites, plain text if one */}
      {siteHeads.length > 1 ? (
        <select
          value={selectedSite}
          disabled={headLoading}
          onChange={(e) => {
            const chosen = siteHeads.find(h => h.site === e.target.value);
            setSelectedSite(e.target.value);
            setProxyUserName(chosen?.username || "");
          }}
        >
          <option value="">{headLoading ? "Loading heads..." : "-- Select site --"}</option>
          {siteHeads.map(h => (
            <option key={h.site} value={h.site}>
              {h.site} — {h.name ? `${h.name}${h.username ? ` (${h.username})` : ""}` : "No head assigned"}
            </option>
          ))}
        </select>
      ) : (
        <div>
          Site Head: {headLoading ? "Loading..." : (proxyUserName || "No head found")}
        </div>
      )}

      <br /><br />

      <button onClick={submitLeave}>Apply</button>

    </div>
  );
}