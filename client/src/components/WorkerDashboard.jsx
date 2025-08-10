import React, { useEffect, useState } from "react";
import './workerDashboard.css';

const API_BASE = "http://localhost:3000";

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString();
}

function formatDuration(ms) {
  if (ms < 0) return "N/A";
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

// Reverse geocode function
async function getAddressFromCoords(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return data.display_name || `Lat: ${lat}, Lng: ${lng}`;
  } catch (err) {
    console.error("Reverse geocode failed:", err);
    return `Lat: ${lat}, Lng: ${lng}`;
  }
}

export default function UserDashboard({ token }) {
  const [shifts, setShifts] = useState([]);
  const [addresses, setAddresses] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function getDailyTotals(shifts) {
    const dailyTotals = {};
    shifts.forEach((shift) => {
      const dateKey = new Date(shift.clockInTime).toDateString();
      const clockIn = new Date(shift.clockInTime);
      const clockOut = shift.clockOutTime ? new Date(shift.clockOutTime) : new Date();
      const duration = clockOut - clockIn;

      if (!dailyTotals[dateKey]) {
        dailyTotals[dateKey] = 0;
      }
      dailyTotals[dateKey] += duration;
    });
    return dailyTotals;
  }

  useEffect(() => {
    async function fetchShifts() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/myShifts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to fetch shifts");
        }
        const data = await res.json();
        setShifts(data.shifts || []);

        // Fetch addresses for each location
        const addrMap = {};
        for (const shift of data.shifts) {
          if (shift.clockInLocation) {
            const { lat, lng } = shift.clockInLocation;
            addrMap[`in-${shift._id}`] = await getAddressFromCoords(lat, lng);
          }
          if (shift.clockOutLocation) {
            const { lat, lng } = shift.clockOutLocation;
            addrMap[`out-${shift._id}`] = await getAddressFromCoords(lat, lng);
          }
        }
        setAddresses(addrMap);
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    }
    if (token) {
      fetchShifts();
    }
  }, [token]);

  const dailyTotals = getDailyTotals(shifts);

  return (
    <div className="dashboard-container">
      <h2>Your Clock-In / Clock-Out History</h2>
      {loading && <p>Loading shifts...</p>}
      {error && <p className="error-msg">{error}</p>}

      {shifts.length === 0 && !loading && <p>No shifts found.</p>}

      {shifts.length > 0 && (
        <>
          <h3>Total Time Worked Per Day</h3>
          <ul className="daily-totals-list">
            {Object.entries(dailyTotals).map(([date, ms]) => (
              <li key={date}>
                <strong>{date}:</strong> {formatDuration(ms)}
              </li>
            ))}
          </ul>

          <h3>Shift Details</h3>
          <table className="shift-table">
            <thead>
              <tr>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Clock In Location</th>
                <th>Clock Out Location</th>
                <th>Duration</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => {
                const clockInTime = formatDateTime(shift.clockInTime);
                const clockOutTime = shift.clockOutTime ? formatDateTime(shift.clockOutTime) : "Still clocked in";
                const clockInLoc = shift.clockInLocation
                  ? addresses[`in-${shift._id}`] || "Loading address..."
                  : "N/A";
                const clockOutLoc = shift.clockOutLocation
                  ? addresses[`out-${shift._id}`] || "Loading address..."
                  : "N/A";

                const durationMs = shift.clockOutTime
                  ? new Date(shift.clockOutTime) - new Date(shift.clockInTime)
                  : null;

                return (
                  <tr key={shift._id}>
                    <td data-label="Clock In">{clockInTime}</td>
                    <td data-label="Clock Out">{clockOutTime}</td>
                    <td data-label="Clock In Location">{clockInLoc}</td>
                    <td data-label="Clock Out Location">{clockOutLoc}</td>
                    <td data-label="Duration">{durationMs !== null ? formatDuration(durationMs) : "N/A"}</td>
                    <td data-label="Notes">
                      {shift.clockInNotes || ""}
                      {shift.clockOutNotes ? " / " + shift.clockOutNotes : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
