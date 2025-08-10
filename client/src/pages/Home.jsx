import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.textSection}>
          <h1 style={styles.title}>CareShift Tracker</h1>
          <p style={styles.subtitle}>
            Empowering healthcare workers and managers to track shifts effortlessly.
          </p>

          <div style={styles.useCases}>
            <h2 style={styles.useCaseTitle}>Why Choose CareShift Tracker?</h2>
            <ul style={styles.useCaseList}>
              <li>
                <strong>For Care Workers:</strong> Clock in/out automatically within your work perimeter, add notes, and view your shift history.
              </li>
              <li>
                <strong>For Managers:</strong> Set location perimeters, monitor active staff, and get detailed analytics on shift hours and attendance.
              </li>
              <li>
                <strong>Seamless Authentication:</strong> Login via email or Google using secure Auth0 integration.
              </li>
            </ul>
          </div>

          <div style={styles.buttonGroup}>
            <Link to="/signup" style={{ ...styles.button, ...styles.signup }}>
              Get Started
            </Link>
            <Link to="/login" style={{ ...styles.button, ...styles.login }}>
              Login
            </Link>
          </div>
        </div>

        <div style={styles.imageSection}>
          <img
            src="https://plus.unsplash.com/premium_photo-1661768688743-cb95ec8e9ebd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGhlYWx0aCUyMHdvcmtlciUyMHdpdGglMjB0YWJsZXR8ZW58MHx8MHx8fDA%3Dhttps://www.shutterstock.com/image-photo/portrait-beautiful-mature-woman-doctor-holding-1680655153"
            alt="Healthcare worker with tablet"
            style={styles.heroImage}
          />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    padding: "40px 20px",
    boxSizing: "border-box",
  },
  hero: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "40px",
    flexWrap: "wrap",
  },
  textSection: {
    flex: "1 1 400px",
  },
  title: {
    fontSize: "3rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "12px",
  },
  subtitle: {
    fontSize: "1.25rem",
    color: "#475569",
    marginBottom: "28px",
    lineHeight: 1.5,
  },
  useCases: {
    marginBottom: "32px",
  },
  useCaseTitle: {
    fontSize: "1.5rem",
    color: "#334155",
    marginBottom: "16px",
  },
  useCaseList: {
    listStyle: "disc",
    paddingLeft: "20px",
    fontSize: "1.05rem",
    color: "#475569",
    lineHeight: 1.6,
  },
  buttonGroup: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  button: {
    textDecoration: "none",
    padding: "14px 32px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "1.1rem",
    cursor: "pointer",
    userSelect: "none",
    transition: "all 0.3s ease",
    minWidth: "140px",
    textAlign: "center",
  },
  signup: {
    backgroundColor: "#2563eb", // blue-600
    color: "white",
    border: "none",
  },
  login: {
    backgroundColor: "white",
    color: "#2563eb",
    border: "2px solid #2563eb",
  },
  imageSection: {
    flex: "1 1 400px",
    display: "flex",
    justifyContent: "center",
  },
  heroImage: {
    width: "100%",
    maxWidth: "400px",
    borderRadius: "20px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
  },

  // Responsive adjustments
  '@media(max-width: 768px)': {
    hero: {
      flexDirection: "column",
      textAlign: "center",
    },
    imageSection: {
      marginTop: "30px",
    },
  },
};

export default Home;
