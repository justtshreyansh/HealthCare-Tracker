import React from "react";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove JWT token and any user info from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Optionally, clear everything (if you want)
    // localStorage.clear();

    // Redirect to login page
    navigate("/login");
  };

  return (
    <button onClick={handleLogout} style={{
      padding: "8px 16px",
      backgroundColor: "#e74c3c",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "bold",
      margin: "10px"
    }}>
      Logout
    </button>
  );
};

export default LogoutButton;
