import React from 'react'
import Profile from "../components/Profile";
import ClockInClockOut from '../components/ClockInClockOut';
import WorkerDashboard from "../components/WorkerDashboard";
const Worker = () => {
  // Example: get token from localStorage (or your auth state management)
  const token = localStorage.getItem("token");

  return (
    <div>
      <Profile role="worker" />
      <ClockInClockOut token={token} />
      <WorkerDashboard token={token}/>
    </div>
  )
}

export default Worker;
