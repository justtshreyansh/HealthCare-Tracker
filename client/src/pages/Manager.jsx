import React from 'react'
import Profile from "../components/Profile";
import PerimeterSet from '../components/PerimterSet';
import CurrentClockedIn from "../components/CurrentClockedIn";
import StaffList from "../components/StaffList";
import Analytics from "../components/Analytics"
const Manager = () => {
  let token = localStorage.getItem('token');
  return (
    <div><Profile role="manager"/>
    <PerimeterSet/>
    <CurrentClockedIn/>
    <StaffList token={token}/>
    <Analytics/>
    </div>
  )
}

export default Manager