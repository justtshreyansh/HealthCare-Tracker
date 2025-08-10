import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

const API_BASE = import.meta.env.VITE_API_BASE;

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("All input fields are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const val = await res.json();

      if (val.status === false) {
        setError(val.message);
      } else {
        localStorage.setItem("token", val.token);

        if (val.user.role === "manager") {
          navigate("/manager");
        } else {
          console.log("worker");
          navigate("/worker");
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="login-wrapper">
      <section className="login-box" role="main" aria-labelledby="login-heading">
        <h1 id="login-heading" className="login-heading">
          Sign In
        </h1>

        {error && <div role="alert" className="error-msg">{error}</div>}

        <form onSubmit={submitHandler} className="login-form" noValidate>
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            required
            autoComplete="email"
          />

          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
            autoComplete="current-password"
          />

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="signup-link">
          Don't have an account?{" "}
          <Link to="/signup" className="signup-anchor">
            Sign up here
          </Link>
        </p>
      </section>
    </div>
  );
};

export default Login;
