import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
// import bcrypt from "bcryptjs";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetPanel, setShowResetPanel] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const user = JSON.parse(storedUser);
    redirectUser(user.role);
  }, [navigate]);

  const redirectUser = (role) => {
    const normalizedRole = role?.trim()?.toLowerCase();
    switch (normalizedRole) {
      case "hr":           navigate("/hr");     break;
      case "client":       navigate("/client"); break;
      case "admin":        navigate("/admin");  break;
      case "project head": navigate("/head");   break;
      case "engineer office": navigate("/office"); break;
      case "site engineer":   navigate("/site");   break;
      case "mdo office":      navigate("/mdo");    break;
      default:
        alert(`No portal assigned for role: ${role}`);
    }
  };

  const clearAlerts = () => {
    setError("");
    setMessage("");
  };

  // ─── Password Reset (Supabase Auth built-in) ────────────────────────────────
  const handlePasswordReset = async () => {
    clearAlerts();

    if (!resetEmail.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setResetLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      resetEmail.trim(),
      {
        // Supabase will append ?type=recovery&access_token=... to this URL
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    setResetLoading(false);

    if (resetError) {
      // Don't reveal whether the email exists or not
      console.error("Reset error:", resetError.message);
    }

    // Always show the same message for security (no email enumeration)
    setMessage("If that email is registered, a reset link has been sent. Check your inbox.");
    setResetEmail("");
    setResetSent(true);
  };

  // ─── Login (bcrypt compare) ──────────────────────────────────────────────────
  const login = async () => {
    clearAlerts();

    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);

    // Fetch the user row (including the hashed password)
    const { data: userDetail, error: detailError } = await supabase
      .from("user_details")
      .select("*")
      .eq("user_name", username.trim())
      .single();

    if (detailError || !userDetail) {
      setLoading(false);
      setError("Invalid username or password. Please try again.");
      return;
    }

    // Compare entered password against stored hash
    // Falls back to plain-text comparison for accounts not yet migrated
    let passwordMatch = false;
    const storedPassword = userDetail.password || "";

    //==========FOR HASHED PASSWORD============================
    // if (storedPassword.startsWith("$2")) {
    //   // bcrypt hash — do a proper compare
    //   passwordMatch = await bcrypt.compare(password, storedPassword);
    // } else {
    //   // Plain-text (legacy) — compare directly, then migrate to hash
    //   passwordMatch = storedPassword === password;

    //   if (passwordMatch) {
    //     // Silently upgrade to hashed password on first login
    //     const hash = await bcrypt.hash(password, 12);
    //     await supabase
    //       .from("user_details")
    //       .update({ password: hash })
    //       .eq("id", userDetail.id);
    //   }
    // }
    passwordMatch = storedPassword === password;

    if (!passwordMatch) {
      setLoading(false);
      setError("Invalid username or password. Please try again.");
      return;
    }

    // Load portal details from users table
    const { data: userPortal, error: portalError } = await supabase
      .from("users")
      .select("site_name, role")
      .eq("user_name", userDetail.user_name)
      .single();

    setLoading(false);

    if (portalError) {
      setError("Could not load portal details. Please contact support.");
      return;
    }

    // const userData = {
    //   ...userDetail,
    //   password: undefined, // never store the hash in localStorage
    //   site_name: userPortal?.site_name || "",
    //   role: userPortal?.role || "",
    // };
    const userData = {
      ...userDetail,
      password: undefined,
      site_name: userPortal?.site_name || "",
      role: userPortal?.role || userDetail.role || "",
      designation: userDetail.designation || "",
    };
    // Verify id exists
    console.log("Stored user id:", userDetail.id);

    localStorage.setItem("user", JSON.stringify(userData));
    redirectUser(userData.role);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="login-page">
      <div className="login-background" />
      <div className="login-card">
        <div className="login-branding">
          <div className="logo-badge">EMP</div>
          <div>
            <h1>Employee Portal</h1>
            <p>Secure sign in for the team.</p>
          </div>
        </div>

        {message && <div className="login-alert success">{message}</div>}
        {error   && <div className="login-alert error">{error}</div>}

        <div className="login-field">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
        </div>

        <div className="login-field">
          <label>Password</label>
          <div className="password-input-group">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              onKeyDown={(e) => e.key === "Enter" && login()}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="login-actions">
          <button className="primary-button" onClick={login} disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
          <button
            type="button"
            className="link-button"
            onClick={() => {
              clearAlerts();
              setShowResetPanel((prev) => !prev);
              setResetSent(false);
            }}
          >
            Forgot password?
          </button>
        </div>

        {showResetPanel && (
          <div className="forgot-panel">
            {!resetSent ? (
              <>
                <p>Enter your email to receive a password reset link.</p>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="your@email.com"
                  onKeyDown={(e) => e.key === "Enter" && handlePasswordReset()}
                />
                <button
                  className="secondary-button"
                  onClick={handlePasswordReset}
                  disabled={resetLoading}
                >
                  {resetLoading ? "Sending…" : "Send reset link"}
                </button>
              </>
            ) : (
              <p>
                Check your email for the reset link. It expires in 1 hour.
                <br />
                <button
                  type="button"
                  className="link-button"
                  onClick={() => { setResetSent(false); setMessage(""); }}
                >
                  Try a different email
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}