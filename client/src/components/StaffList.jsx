import React, { useEffect, useState, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_BASE;

function formatDateTime(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleString();
}

export default function StaffList({ token }) {
  const [staffData, setStaffData] = useState([]);
  const [expandedWorkerIds, setExpandedWorkerIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Ref for dynamic maxHeight animation on each expanded block
  const contentRefs = useRef({});

  // Function to get maxHeight style dynamically
  const getMaxHeight = (workerId) => {
    const el = contentRefs.current[workerId];
    if (!el) return "0px";
    return expandedWorkerIds.includes(workerId) ? `${el.scrollHeight}px` : "0px";
  };

  useEffect(() => {
    async function fetchShifts() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/staff-shifts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to fetch shifts");
        }
        const json = await res.json();
        setStaffData(json.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchShifts();
  }, [token]);

  const toggleExpand = (workerId) => {
    setExpandedWorkerIds((prevExpanded) => {
      if (prevExpanded.includes(workerId)) {
        return prevExpanded.filter((id) => id !== workerId);
      } else {
        return [...prevExpanded, workerId];
      }
    });
  };

  if (loading)
    return (
      <div className="loading">
        <p>Loading staff list...</p>
      </div>
    );
  if (error)
    return (
      <div className="error">
        <p>{error}</p>
      </div>
    );
  if (staffData.length === 0) return <p>No staff data available.</p>;

  return (
    <>
      <style>{`
        .staff-list {
          max-width: 900px;
          margin: 1.5rem auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #222;
        }
        .staff-item {
          border-radius: 8px;
          box-shadow: 0 3px 10px rgb(0 0 0 / 0.1);
          margin-bottom: 1.5rem;
          background: #fff;
          overflow: hidden;
          transition: box-shadow 0.3s ease;
        }
        .staff-header {
          padding: 1rem 1.5rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f5f7fa;
          font-weight: 600;
          font-size: 1.1rem;
          user-select: none;
          transition: background-color 0.3s ease;
        }
        .staff-header:hover {
          background: #e3e9f3;
        }
        .staff-header.expanded {
          background: #d0d9ff;
          color: #1a44db;
          font-weight: 700;
          box-shadow: inset 4px 0 0 0 #1a44db;
        }
        .arrow {
          transition: transform 0.3s ease;
          font-size: 1.3rem;
          user-select: none;
          color: #1a44db;
        }
        .arrow.expanded {
          transform: rotate(90deg);
        }
        .staff-content-wrapper {
          overflow: hidden;
          transition: max-height 0.4s ease;
          max-height: 0;
          background: #fff;
        }
        .staff-content {
          padding: 1rem 1.5rem;
          font-size: 0.95rem;
          color: #444;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
          min-width: 400px;
        }
        th, td {
          padding: 0.6rem 0.8rem;
          border: 1px solid #ddd;
          text-align: left;
        }
        th {
          background: #f0f3fa;
          color: #333;
          font-weight: 600;
        }
        tr:nth-child(even) {
          background: #f9fafc;
        }
        @media (max-width: 600px) {
          .staff-header {
            flex-direction: column;
            align-items: flex-start;
            font-size: 1rem;
          }
          table {
            font-size: 0.85rem;
            min-width: unset;
          }
          th, td {
            padding: 0.5rem 0.6rem;
          }
        }
      `}</style>

      <div className="staff-list" role="list" aria-label="Staff clock in and out history">
        <h2 style={{textAlign: "center", marginBottom: "1rem", color: "#1a44db"}}>
          Staff Clock-In / Clock-Out History
        </h2>
        {staffData.map(({ worker, shifts }) => (
          <div key={worker._id} className="staff-item">
            <div
              role="button"
              tabIndex={0}
              className={`staff-header ${
                expandedWorkerIds.includes(worker._id) ? "expanded" : ""
              }`}
              onClick={() => toggleExpand(worker._id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleExpand(worker._id);
                }
              }}
              aria-expanded={expandedWorkerIds.includes(worker._id)}
              aria-controls={`content-${worker._id}`}
            >
              <span>
                {worker.name} ({worker.email})
              </span>
              <span
                className={`arrow ${
                  expandedWorkerIds.includes(worker._id) ? "expanded" : ""
                }`}
                aria-hidden="true"
              >
                ▶
              </span>
            </div>

            <div
              id={`content-${worker._id}`}
              ref={(el) => (contentRefs.current[worker._id] = el)}
              className="staff-content-wrapper"
              style={{ maxHeight: getMaxHeight(worker._id) }}
            >
              <div className="staff-content">
                {shifts.length === 0 ? (
                  <p>No shifts recorded for this staff member.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Clock In Time</th>
                        <th>Clock In Location</th>
                        <th>Clock Out Time</th>
                        <th>Clock Out Location</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shifts.map((shift) => (
                        <tr key={shift._id}>
                          <td>{formatDateTime(shift.clockInTime)}</td>
                          <td>
                            {shift.clockInLocation
                              ? `Lat: ${shift.clockInLocation.lat.toFixed(
                                  5
                                )}, Lng: ${shift.clockInLocation.lng.toFixed(5)}`
                              : "N/A"}
                          </td>
                          <td>
                            {shift.clockOutTime
                              ? formatDateTime(shift.clockOutTime)
                              : "Still clocked in"}
                          </td>
                          <td>
                            {shift.clockOutLocation
                              ? `Lat: ${shift.clockOutLocation.lat.toFixed(
                                  5
                                )}, Lng: ${shift.clockOutLocation.lng.toFixed(5)}`
                              : "N/A"}
                          </td>
                          <td>
                            {(shift.clockInNotes || "") +
                              (shift.clockOutNotes
                                ? ` / ${shift.clockOutNotes}`
                                : "")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
