import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // adjust path to where you place logo.jpeg

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const portalName = user?.role ? `${user.role} Portal` : "Employee Portal";

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("portalName");
    navigate("/");
  };

  return (
    <>
      <style>{`
        .app-navbar {
          height: 60px;
          overflow: visible;
          background: linear-gradient(135deg, #3d1200 0%, #7a2e00 50%, #c96a10 100%);
          border-bottom: none;
          box-shadow: 0 2px 16px rgba(61,18,0,.35);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 9999;
          gap: 16px;
          flex-wrap: nowrap;
          overflow: hidden;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .navbar-logo {
          height: 48px;
          width: 48px;
          object-fit: contain;
          flex-shrink: 0;
          background: white;
          padding: 4px;
          border-radius: 30px;
        }

        .navbar-brand-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }

        .navbar-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
          letter-spacing: .01em;
        }

        .navbar-tagline {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 500;
          color: #ffc97a; letter-spacing: .07em;
          text-transform: uppercase;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .navbar-divider {
          width: 1px;
          height: 28px;
          background: rgba(255,255,255,.2); 
          flex-shrink: 0;
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .navbar-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,.2);
          border: 1.5px solid rgba(255,255,255,.4);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .navbar-user-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .navbar-user-name {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
        }

        .navbar-user-role {
          font-family: 'DM Sans', sans-serif;
          font-size: 10.5px;
          color: ffc97a;  
          font-weight: 500;
          white-space: nowrap;
        }
          .navbar-right {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-shrink: 0;
            margin-left: auto;
          }

        .navbar-logout {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
           color: #3d1200;
          background: #fff;
          border: none;
          border-radius: 8px;
          padding: 7px 16px;
          cursor: pointer;
          transition: opacity .15s, transform .1s;
          white-space: nowrap;
        }

        .navbar-logout:hover  { opacity: .9; background: #ffe8cc; }
        .navbar-logout:active { transform: scale(.97); }

@media (max-width: 600px) {
  .app-navbar {
    padding: 0 12px;
    height: 56px;
    gap: 8px;
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
  }
  .navbar-tagline { display: none; }
  .navbar-user-info { display: none; }
  .navbar-divider { display: none; }
  .navbar-logo { height: 40px; width: 40px; }
  .navbar-title { font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .navbar-left { flex: 1; min-width: 0; overflow: hidden; display: flex; align-items: center; gap: 8px; }
  .navbar-right { flex-shrink: 0; display: flex; align-items: center; gap: 6px; }
  .navbar-right {position: absolute; right: 20px; top: 10px;}
  .navbar-left {position: absolute; left: 20px; top: 10px;}
  .navbar-avatar {
    width: 30px; height: 30px; font-size: 12px;
    background: rgba(255,255,255,.25);
    border: 1.5px solid rgba(255,255,255,.5);
    color: #fff;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; flex-shrink: 0;
  }
  .navbar-logout {
    width: 34px; height: 34px;
    padding: 0;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    background: #fff;
    color: #3d1200;
    border: none;
    cursor: pointer;
  }
  .navbar-logout span { display: none; }
  .navbar-logout svg { stroke: #3d1200; }
}


      `}</style>

      <nav className="app-navbar">
        <div className="navbar-left">
          <img src={logo} alt="Logo" className="navbar-logo" />
          <div className="navbar-brand-text">
            <div className="navbar-title">{portalName}</div>
            <div className="navbar-tagline">Quality + Quantity · On Time · Every Time</div>
          </div>
        </div>

        <div className="navbar-right">
          {user && (
            <>
              <div className="navbar-divider"/>
              <div className="navbar-user">
                <div className="navbar-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="navbar-user-info">
                  <div className="navbar-user-name">{user.name}</div>
                  <div className="navbar-user-role">{user.role || user.designation || ""}</div>
                </div>
              </div>
              <div className="navbar-divider"/>
            </>
          )}
          <button className="navbar-logout" onClick={logout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}