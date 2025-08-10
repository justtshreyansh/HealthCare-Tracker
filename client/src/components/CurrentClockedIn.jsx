import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function ManagerCurrentStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [addresses, setAddresses] = useState({}); // To store addresses keyed by staff id

  useEffect(() => {
    fetchCurrentStaff();
  }, []);

  useEffect(() => {
    // When staff data updates, fetch addresses for expanded items
    expandedIds.forEach((id) => {
      const shift = staff.find((s) => s.careWorker._id === id);
      if (shift && shift.clockInLocation && !addresses[id]) {
        fetchAddress(id, shift.clockInLocation.lat, shift.clockInLocation.lng);
      }
    });
  }, [expandedIds, staff]);

  const fetchCurrentStaff = async () => {
    try {
      const res = await fetch(`${API_BASE}/current-clock-ins`);
      const json = await res.json();
      if (json.success) {
        setStaff(json.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchAddress = async (id, lat, lng) => {
    try {
      // OpenStreetMap Nominatim Reverse Geocoding API
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.display_name) {
        setAddresses((prev) => ({ ...prev, [id]: data.display_name }));
      } else {
        setAddresses((prev) => ({ ...prev, [id]: "Address not found" }));
      }
    } catch (err) {
      setAddresses((prev) => ({ ...prev, [id]: "Error fetching address" }));
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  if (loading) return <p>Loading...</p>;

  if (staff.length === 0)
    return (
      <div
        style={{
          textAlign: "center",
          padding: 40,
          color: "#555",
          fontSize: 18,
          fontWeight: "500",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          userSelect: "none",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="#bbb"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="48"
          height="48"
          style={{ marginBottom: 16, opacity: 0.6 }}
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" />
        </svg>
        <div>No staff currently clocked in</div>
      </div>
    );

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Currently Clocked-In Staff</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {staff.map((shift, idx) => {
          const worker = shift.careWorker;
          const isExpanded = expandedIds.has(worker._id);
          const bgColor = idx % 2 === 0 ? "#ffffff" : "#f9f9f9";
          const nameColor = idx % 2 === 0 ? "#222" : "#666";

          return (
            <li
              key={worker._id}
              style={{
                backgroundColor: bgColor,
                marginBottom: 12,
                borderRadius: 10,
                padding: 16,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                transition: "background-color 0.3s ease",
                userSelect: "none",
              }}
              onClick={() => toggleExpand(worker._id)}
            >
              <div
                style={{
                  fontWeight: "700",
                  color: nameColor,
                  fontSize: 18,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>{worker.name}</span>
                <span
                  style={{
                    fontWeight: "400",
                    fontSize: 14,
                    color: "#888",
                    fontStyle: "italic",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "60%",
                    textAlign: "right",
                  }}
                  title={worker.email}
                >
                  {worker.email}
                </span>
              </div>

              <div
                style={{
                  maxHeight: isExpanded ? "500px" : 0,
                  opacity: isExpanded ? 1 : 0,
                  overflow: "hidden",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  marginTop: isExpanded ? 16 : 0,
                  color: "#444",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                <p style={{ margin: "4px 0" }}>
                  <strong>Clocked in since:</strong>{" "}
                  {new Date(shift.clockInTime).toLocaleString()}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Location:</strong> {addresses[worker._id] || "Loading address..."}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Notes:</strong> {shift.clockInNotes || "No notes"}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
