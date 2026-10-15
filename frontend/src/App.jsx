
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Clock3,
  Search,
  Bell,
  Truck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Menu,
  X,
  Plus,
} from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function getCompliance(driver) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!driver.licenseExpiry) {
    return { label: "Unknown", type: "unknown", daysLeft: null };
  }

  const expiry = new Date(`${driver.licenseExpiry}T00:00:00`);

  if (Number.isNaN(expiry.getTime())) {
    return { label: "Unknown", type: "unknown", daysLeft: null };
  }

  const daysLeft = Math.ceil((expiry - today) / 86400000);

  if (daysLeft < 0) {
    return { label: "Expired", type: "danger", daysLeft };
  }

  if (daysLeft <= 30) {
    return { label: "Expiring soon", type: "warning", daysLeft };
  }

  return { label: "Compliant", type: "success", daysLeft };
}

function App() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    licenseNumber: "",
    licenseExpiry: "",
    status: "Active",
  });

  async function loadDrivers() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/drivers`);

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The drivers API returned unexpected data.");
      }

      setDrivers(data);
    } catch {
      setError(
        "Could not load drivers. Make sure your backend is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDrivers();
  }, []);

  async function handleAddDriver(event) {
    event.preventDefault();

    setSaving(true);
    setFormError("");
    setFormSuccess("");

    try {
      const response = await fetch(`${API_URL}/drivers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not add driver.");
      }

      setFormSuccess("Driver added successfully.");

      setFormData({
        name: "",
        licenseNumber: "",
        licenseExpiry: "",
        status: "Active",
      });

      setShowAddForm(false);

      await loadDrivers();
    } catch (err) {
      setFormError(
        err.message || "Unable to connect to the backend."
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredDrivers = drivers.filter((driver) => {
    const query = search.toLowerCase();

    return (
      String(driver.name || "").toLowerCase().includes(query) ||
      String(driver.licenseNumber || "").toLowerCase().includes(query) ||
      String(driver.status || "").toLowerCase().includes(query)
    );
  });

  const expiredCount = drivers.filter(
    (driver) => getCompliance(driver).type === "danger"
  ).length;

  const expiringCount = drivers.filter(
    (driver) => getCompliance(driver).type === "warning"
  ).length;

  const activeCount = drivers.filter(
    (driver) => driver.status === "Active"
  ).length;

  const navigation = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Drivers", icon: Users },
    { label: "Inspections", icon: ClipboardCheck },
    { label: "HOS Logs", icon: Clock3 },
  ];

  return (
    <div className="app-shell">
      {mobileMenuOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <Truck size={23} />
          </div>

          <div>
            <strong>FleetGuard</strong>
            <span>COMPLIANCE HUB</span>
          </div>

          <button
            className="mobile-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="nav-caption">WORKSPACE</div>

        <nav className="navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${
                activePage === label ? "active" : ""
              }`}
              onClick={() => {
                setActivePage(label);
                setMobileMenuOpen(false);
              }}
            >
              <Icon size={19} />
              <span>{label}</span>

              {label === "Drivers" && (
                <span className="nav-count">{drivers.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <span className="status-dot" />
            <div>
              <strong>System status</strong>
              <span>Local development</span>
            </div>
          </div>

          <div className="version-label">
            FLEETGUARD · DEVELOPMENT
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>

          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{activePage}</strong>
          </div>

          <div className="topbar-right">
            <span className="environment-tag">
              <span className="status-dot" />
              DEVELOPMENT
            </span>

            <button className="icon-button" aria-label="Notifications">
              <Bell size={19} />
              {(expiredCount > 0 || expiringCount > 0) && (
                <span className="notification-dot" />
              )}
            </button>

            <div className="avatar">FG</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow">FLEET OPERATIONS</div>

              <h1>
                {activePage === "Dashboard"
                  ? "Compliance overview"
                  : activePage}
              </h1>

              <p className="page-subtitle">
                Monitor your fleet, driver credentials and compliance status.
              </p>
            </div>

            <div className="header-actions">
              <button
                className="add-driver-button"
                onClick={() => {
                  setFormError("");
                  setFormSuccess("");
                  setShowAddForm(true);
                }}
              >
                <Plus size={16} />
                Add driver
              </button>

              <button
                className="refresh-button"
                onClick={loadDrivers}
                disabled={loading}
              >
                <RefreshCw
                  size={16}
                  className={loading ? "spin" : ""}
                />
                Refresh data
              </button>
            </div>
          </section>

          {formSuccess && (
            <div className="success-banner" role="status">
              {formSuccess}
            </div>
          )}

          {showAddForm && (
            <section className="add-driver-card">
              <div className="form-heading">
                <div>
                  <h2>Add new driver</h2>
                  <p>Enter the driver's license details.</p>
                </div>

                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setShowAddForm(false)}
                  aria-label="Close form"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={handleAddDriver}>
                <div className="form-grid">
                  <label>
                    Driver name *
                    <input
                      required
                      value={formData.name}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          name: event.target.value,
                        })
                      }
                      placeholder="e.g. John Smith"
                    />
                  </label>

                  <label>
                    License number *
                    <input
                      required
                      value={formData.licenseNumber}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          licenseNumber: event.target.value,
                        })
                      }
                      placeholder="e.g. CDL-1003"
                    />
                  </label>

                  <label>
                    License expiry date *
                    <input
                      required
                      type="date"
                      value={formData.licenseExpiry}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          licenseExpiry: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Driver status
                    <select
                      value={formData.status}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          status: event.target.value,
                        })
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </label>
                </div>

                {formError && (
                  <div className="error-banner" role="alert">
                    <AlertTriangle size={18} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="refresh-button"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="add-driver-button"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save driver"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {error && (
            <div className="error-banner" role="alert">
              <AlertTriangle size={19} />
              <span>{error}</span>
              <button onClick={loadDrivers}>Retry</button>
            </div>
          )}

          <section className="metrics-grid">
            <article className="metric-card">
              <div className="metric-top">
                <span>Total drivers</span>
                <div className="metric-icon blue">
                  <Users size={20} />
                </div>
              </div>
              <div className="metric-value">
                {loading ? "—" : drivers.length}
              </div>
              <div className="metric-note">Driver records in the API</div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>Active drivers</span>
                <div className="metric-icon green">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="metric-value">
                {loading ? "—" : activeCount}
              </div>
              <div className="metric-note">
                Marked active in the records
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>Expiring soon</span>
                <div className="metric-icon amber">
                  <Clock3 size={20} />
                </div>
              </div>
              <div className="metric-value">
                {loading ? "—" : expiringCount}
              </div>
              <div className="metric-note">
                License expires within 30 days
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>Expired licenses</span>
                <div className="metric-icon red">
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="metric-value">
                {loading ? "—" : expiredCount}
              </div>
              <div className="metric-note">
                Require review and follow-up
              </div>
            </article>
          </section>

          <section className="table-card">
            <div className="table-heading">
              <div>
                <h2>Driver directory</h2>
                <p>Review driver credentials and license expiry dates.</p>
              </div>
              <div className="record-count">
                {drivers.length} records
              </div>
            </div>

            <div className="table-toolbar">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Search name, license or status..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>DRIVER</th>
                    <th>LICENSE NUMBER</th>
                    <th>EXPIRY DATE</th>
                    <th>DRIVER STATUS</th>
                    <th>COMPLIANCE</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="empty-state">
                        Loading driver records...
                      </td>
                    </tr>
                  ) : filteredDrivers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty-state">
                        {error
                          ? "Driver data is unavailable."
                          : "No matching drivers found."}
                      </td>
                    </tr>
                  ) : (
                    filteredDrivers.map((driver) => {
                      const compliance = getCompliance(driver);

                      return (
                        <tr key={driver.id}>
                          <td>
                            <div className="driver-cell">
                              <div className="driver-avatar">
                                {String(driver.name || "?")
                                  .split(" ")
                                  .map((part) => part[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()}
                              </div>
                              <strong>{driver.name}</strong>
                            </div>
                          </td>

                          <td className="license-number">
                            {driver.licenseNumber}
                          </td>

                          <td>
                            {driver.licenseExpiry
                              ? new Date(
                                  `${driver.licenseExpiry}T00:00:00`
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Not provided"}
                          </td>

                          <td>
                            <span
                              className={`status-pill ${
                                driver.status === "Active"
                                  ? "success"
                                  : "neutral"
                              }`}
                            >
                              {driver.status || "Unknown"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`status-pill ${compliance.type}`}
                            >
                              {compliance.type === "danger" && (
                                <AlertTriangle size={13} />
                              )}
                              {compliance.type === "success" && (
                                <CheckCircle2 size={13} />
                              )}
                              {compliance.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>
                Showing {filteredDrivers.length} of {drivers.length} drivers
              </span>
              <span>Data source: Express API</span>
            </div>
          </section>

          <footer className="page-footer">
            <span>FleetGuard Compliance Hub</span>
            <span>Internship project · Development build</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;




