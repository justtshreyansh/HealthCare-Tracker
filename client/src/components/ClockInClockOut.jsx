import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

export default function ClockInClockOut({ token }) {
  const [perimeter, setPerimeter] = useState(null);
  const [error, setError] = useState("");
  const [clockedInShift, setClockedInShift] = useState(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [geoLoading, setGeoLoading] = useState(true);

  // Fetch perimeter on mount
  useEffect(() => {
    async function fetchPerimeter() {
      try {
        const res = await fetch(`${API_BASE}/getPerimeterByWorker`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch perimeter");
        const data = await res.json();
        setPerimeter(data.perimeter);
      } catch (e) {
        setError(e.message);
      }
    }
    if (token) fetchPerimeter();
  }, [token]);

  // Get user geolocation once
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setGeoLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLoading(false);
      },
      (err) => {
        setError("Failed to get location: " + err.message);
        setGeoLoading(false);
      }
    );
  }, []);

  // Fetch active shift on mount
  useEffect(() => {
    async function fetchActiveShift() {
      try {
        const res = await fetch(`${API_BASE}/active-shift`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch active shift");
        const data = await res.json();
        setClockedInShift(data.shift);
      } catch (e) {
        setError(e.message);
      }
    }
    if (token) fetchActiveShift();
  }, [token]);

  function getDistanceMeters(lat1, lng1, lat2, lng2) {
    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function isInsidePerimeter() {
    if (!userLocation || !perimeter) return false;
    const dist = getDistanceMeters(
      userLocation.lat,
      userLocation.lng,
      perimeter.center.lat,
      perimeter.center.lng
    );
    return dist <= perimeter.radiusInMeter;
  }

  async function handleClockIn() {
    setError("");
    if (!isInsidePerimeter()) {
      setError("You must be inside the perimeter to clock in.");
      return;
    }
    if (!userLocation) {
      setError("User location not available.");
      return;
    }
    setLoading(true);
    try {
      const body = {
        clockInTime: new Date().toISOString(),
        clockInLocation: { lat: userLocation.lat, lng: userLocation.lng },
        clockInNotes: note || "Clocked In",
      };
      const res = await fetch(`${API_BASE}/clockIn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Clock in failed");
      }
      const data = await res.json();
      setClockedInShift(data.newShift);
      setNote("");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function handleClockOut() {
    if (!clockedInShift) {
      setError("You are not clocked in.");
      return;
    }
    if (!userLocation) {
      setError("User location not available.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const body = {
        clockOutTime: new Date().toISOString(),
        clockOutLocation: { lat: userLocation.lat, lng: userLocation.lng },
        clockOutNotes: note || "Clocked Out",
      };
      const res = await fetch(`${API_BASE}/clockOut/${clockedInShift._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Clock out failed");
      }
      await res.json();
      setClockedInShift(null);
      setNote("");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20, fontFamily: "Arial" }}>
      <h2>Worker Clock In / Clock Out</h2>

      {perimeter ? (
        <p>
          Perimeter: Center ({perimeter.center.lat.toFixed(5)}, {perimeter.center.lng.toFixed(5)}), Radius{" "}
          {perimeter.radiusInMeter} meters
        </p>
      ) : (
        <p>Loading perimeter...</p>
      )}

      {geoLoading ? (
        <p>Getting your location...</p>
      ) : userLocation ? (
        <p>Your Location: ({userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)})</p>
      ) : null}

      <textarea
        placeholder="Add note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        style={{ width: "100%", marginBottom: 10, padding: 5 }}
      />

      {error && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          {error}
        </p>
      )}

      {!clockedInShift ? (
        <button
          onClick={handleClockIn}
          disabled={loading || geoLoading || !perimeter || !userLocation}
          style={{ padding: "10px 20px", fontSize: 16 }}
        >
          {loading ? "Clocking In..." : "Clock In"}
        </button>
      ) : (
        <>
          <p>Clocked in since: {new Date(clockedInShift.clockInTime).toLocaleString()}</p>
          <button
            onClick={handleClockOut}
            disabled={loading}
            style={{ padding: "10px 20px", fontSize: 16 }}
          >
            {loading ? "Clocking Out..." : "Clock Out"}
          </button>
        </>
      )}
    </div>
  );
}
