// routes/manager.js
const express = require('express');
const router = express.Router();
const Shift = require('../models/shift'); // adjust path as needed
const {authenticateToken,authorizeManager} = require('../middlewares/auth')
// GET all currently clocked-in staff
router.get('/current-clock-ins', async (req, res) => {
  try {
    const currentShifts = await Shift.find({ status: 'clock_in' })
      .populate('careWorker', 'name email role'); // adjust fields based on User model

    res.json({ success: true, data: currentShifts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching clocked-in staff' });
  }
});
router.get('/staff-shifts', async (req, res) => {
  try {
    const shifts = await Shift.find()
      .populate('careWorker', 'name email role')
      .sort({ careWorker: 1, clockInTime: 1 });

    // Group shifts by careWorker._id
    const grouped = shifts.reduce((acc, shift) => {
      const id = shift.careWorker._id.toString();
      if (!acc[id]) acc[id] = { worker: shift.careWorker, shifts: [] };
      acc[id].shifts.push(shift);
      return acc;
    }, {});

    // Convert grouped object to array
    const result = Object.values(grouped);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Find shifts with clockInTime >= oneWeekAgo AND clockOutTime exists (completed shifts)
    const shifts = await Shift.find({
      clockInTime: { $gte: oneWeekAgo },
      clockOutTime: { $ne: null }
    })
      .populate('careWorker', 'name email') // populate careWorker details (only name & email)
      .lean();

    // Prepare aggregations
    const avgHoursPerDay = {};
    const countClockInsPerDay = {};
    const totalHoursPerStaff = {};

    function formatDateKey(date) {
      return date.toISOString().split('T')[0]; // yyyy-mm-dd
    }

    shifts.forEach(shift => {
      const clockInDate = new Date(shift.clockInTime);
      const dateKey = formatDateKey(clockInDate);
      const durationMs = new Date(shift.clockOutTime) - clockInDate;
      const durationHours = durationMs / (1000 * 60 * 60);

      // 1) Average hours per day (sum and count)
      if (!avgHoursPerDay[dateKey]) avgHoursPerDay[dateKey] = { totalHours: 0, count: 0 };
      avgHoursPerDay[dateKey].totalHours += durationHours;
      avgHoursPerDay[dateKey].count += 1;

      // 2) Count of unique people clocking in per day
      if (!countClockInsPerDay[dateKey]) countClockInsPerDay[dateKey] = new Set();
      countClockInsPerDay[dateKey].add(String(shift.careWorker._id));

      // 3) Total hours per staff in last week
      const staffId = String(shift.careWorker._id);
      if (!totalHoursPerStaff[staffId]) totalHoursPerStaff[staffId] = { staff: shift.careWorker, totalHours: 0 };
      totalHoursPerStaff[staffId].totalHours += durationHours;
    });

    // Compute averages and convert sets to counts
    const avgHoursPerDayFinal = {};
    Object.entries(avgHoursPerDay).forEach(([day, { totalHours, count }]) => {
      avgHoursPerDayFinal[day] = totalHours / count;
    });

    const countClockInsPerDayFinal = {};
    Object.entries(countClockInsPerDay).forEach(([day, workerSet]) => {
      countClockInsPerDayFinal[day] = workerSet.size;
    });

    const totalHoursPerStaffLastWeek = Object.values(totalHoursPerStaff);

    res.json({
      success: true,
      data: {
        avgHoursPerDay: avgHoursPerDayFinal,
        countClockInsPerDay: countClockInsPerDayFinal,
        totalHoursPerStaffLastWeek,
      },
    });
  } catch (error) {
    console.error('Error generating shift summary:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
module.exports = router;
