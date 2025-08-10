import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_BASE = import.meta.env.VITE_API_BASE; // Your backend URL

export default function ShiftSummaryDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch(`${API_BASE}/analytics`);
        const json = await res.json();
        if (json.success) {
          setSummary(json.data);
        } else {
          setError("Failed to load summary");
        }
      } catch (e) {
        setError("Failed to load summary");
      }
      setLoading(false);
    }
    fetchSummary();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!summary) return null;

  // Prepare data for charts
  const days = Object.keys(summary.avgHoursPerDay).sort();
  const avgHours = days.map((day) => summary.avgHoursPerDay[day].toFixed(2));
  const uniqueClockIns = days.map((day) => summary.countClockInsPerDay[day]);

  // Staff total hours sorted desc
  const staffSorted = [...summary.totalHoursPerStaffLastWeek].sort(
    (a, b) => b.totalHours - a.totalHours
  );

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>Shift Summary Dashboard</h1>

      <section style={{ marginBottom: 40 }}>
        <h2>Average Hours Spent Clocked In Each Day</h2>
        <Bar
          data={{
            labels: days,
            datasets: [
              {
                label: "Avg Hours",
                data: avgHours,
                backgroundColor: "rgba(75, 192, 192, 0.7)",
                borderRadius: 4,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false }, title: { display: false } },
            scales: {
              y: {
                beginAtZero: true,
                max: Math.max(...avgHours, 8),
              },
            },
          }}
          height={200}
        />
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2>Number of People Clocking In Each Day</h2>
        <Bar
          data={{
            labels: days,
            datasets: [
              {
                label: "Unique Clock-Ins",
                data: uniqueClockIns,
                backgroundColor: "rgba(153, 102, 255, 0.7)",
                borderRadius: 4,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false }, title: { display: false } },
            scales: { y: { beginAtZero: true, precision: 0 } },
          }}
          height={200}
        />
      </section>

      <section>
        <h2>Total Hours Clocked In Per Staff (Last Week)</h2>
        {staffSorted.length === 0 ? (
          <p>No data available</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#007BFF", color: "white" }}>
                <th style={{ padding: "10px" }}>Name</th>
                <th style={{ padding: "10px" }}>Email</th>
                <th style={{ padding: "10px" }}>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {staffSorted.map(({ staff, totalHours }) => (
                <tr key={staff._id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "10px" }}>{staff.name}</td>
                  <td style={{ padding: "10px" }}>{staff.email}</td>
                  <td style={{ padding: "10px" }}>{totalHours.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
