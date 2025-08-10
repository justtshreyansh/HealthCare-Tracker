import React, { useState, useEffect } from "react";
import LogoutButton from "./LogOutButton";
import "./profile.css";

const Profile = ({role}) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
let dashboard = role==='worker'?'workerDashboard':'managerDashboard';
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://localhost:3000/${dashboard}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user data");
        return res.json();
      })
      .then((data) => {
        if (data.status) {
          setUser(data.user);
        } else {
          setError(data.message || "Failed to load profile");
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar__logo">CareShift Tracker</div>
      
      {user && (
        <div className="navbar__user-info">
          <span className="navbar__user-name">{user.name}</span>
          <span className="navbar__user-email">{user.email}</span>
        </div>
      )}
      
      <div className="navbar__logout">
        <LogoutButton />
      </div>

      {error && <div className="navbar__error">Error loading profile: {error}</div>}
    </nav>
  );
};

export default Profile;
