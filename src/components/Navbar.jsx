import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {

  const navigate = useNavigate();
  const user =
  JSON.parse(
    localStorage.getItem("user")
  );
  const canApplyLeave =
  user?.role === "Site Engineer" ||
  user?.role === "Jr Engineer" ||
  user?.role === "Coordinator";

const canApproveLeave =
  user?.role === "Project Head" ||
  user?.role === "Admin" ||
  user?.role === "HR";

const portalName =
  user?.role
    ? `${user.role} Portal`
: "Employee Portal";

  const logout = () => {

    localStorage.removeItem("user");
    localStorage.removeItem("portalName");

    navigate("/");
  };

  return (
    <nav className="app-navbar">
      <div className="navbar-brand">
        <div className="navbar-title">{portalName}</div>
      </div>

      <div className="navbar-links">
        <Link className="navbar-link" to="/employees">
          Add Employee
        </Link>

        {canApplyLeave && (
          <Link className="navbar-link" to="/apply-leave">
            Apply Leave
          </Link>
        )}

        {canApplyLeave && (
          <Link className="navbar-link" to="/my-leaves">
            My Leaves
          </Link>
        )}

        {canApproveLeave && (
          <Link className="navbar-link" to="/leave-approvals">
            Leave Approvals
          </Link>
        )}
        <button className="navbar-button" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}