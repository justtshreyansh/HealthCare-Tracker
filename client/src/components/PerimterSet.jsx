import React, { useState, useEffect } from "react";
import "./perimeter.css";
import { FaMapMarkerAlt, FaCrosshairs, FaSave } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PerimeterSet = () => {
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState(2000);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [savedPerimeter, setSavedPerimeter] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:3000/getPerimeter", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          setSavedPerimeter(data.perimeter);
          setLat(data.perimeter.center.lat);
          setLng(data.perimeter.center.lng);
          setRadius(data.perimeter.radiusInMeter);
          setAddress(data.perimeter.address || "");
        }
      })
      .catch((err) => {
        toast.error("Failed to load saved perimeter");
        console.error(err);
      });
  }, [token]);

  const getLatLngFromAddress = async () => {
    if (!address.trim()) {
      toast.warning("Please enter an address");
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );
      const data = await res.json();
      if (data.length > 0) {
        setLat(parseFloat(data[0].lat));
        setLng(parseFloat(data[0].lon));
      } else {
        toast.error("Address not found");
      }
    } catch (error) {
      toast.error("Failed to fetch location from address");
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const currentLat = pos.coords.latitude;
        const currentLng = pos.coords.longitude;
        setLat(currentLat);
        setLng(currentLng);

        // Reverse geocode to get the address string
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLat}&lon=${currentLng}`
          );
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress("Current Location");
          }
        } catch (error) {
          setAddress("Current Location");
          toast.error("Failed to fetch address for current location");
        }
      },
      (err) => toast.error("Unable to fetch current location"),
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lat || !lng) {
      toast.warning("Please set a location first");
      return;
    }
    setLoading(true);

    const payload = { lat, lng, radiusInMeter: radius, address };

    try {
      const res = await fetch("http://localhost:3000/setPerimeter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLoading(false);

      if (data.status) {
        setSavedPerimeter(data.perimeter);
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to save perimeter");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Server error. Please try again.");
    }
  };

  return (
    <div className="perimeter-container">
      <h2>📍 Set Your Work Perimeter</h2>
      <form onSubmit={handleSubmit} className="perimeter-form">
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button
            type="button"
            className="secondary-btn"
            onClick={getLatLngFromAddress}
          >
            <FaMapMarkerAlt /> Get Coords
          </button>
        </div>

        <button
          type="button"
          className="secondary-btn"
          onClick={getCurrentLocation}
        >
          <FaCrosshairs /> Use Current Location
        </button>

        <input
          type="number"
          placeholder="Radius in meters"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
        />

        <div className="coords-display">
          <strong>Lat:</strong> {lat || "-"} | <strong>Lng:</strong> {lng || "-"}
        </div>

        <button type="submit" className="primary-btn" disabled={loading}>
          <FaSave /> {loading ? "Saving..." : "Save Perimeter"}
        </button>
      </form>

      {savedPerimeter && (
        <div className="perimeter-saved">
          <h3>Saved Perimeter</h3>
          <p>
            <strong>Address:</strong> {savedPerimeter.address}
          </p>
          <p>
            <strong>Lat:</strong> {savedPerimeter.center.lat}
          </p>
          <p>
            <strong>Lng:</strong> {savedPerimeter.center.lng}
          </p>
          <p>
            <strong>Radius:</strong> {savedPerimeter.radiusInMeter} meters
          </p>
        </div>
      )}

      {/* Toast Container for notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default PerimeterSet;
