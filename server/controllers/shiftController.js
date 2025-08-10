const Shift = require('../models/shift');
const Perimeter = require('../models/perimeter');

function getDistanceInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // meters
    const toRad = x => (x * Math.PI) / 180;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a = Math.sin(Δφ / 2) ** 2 +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const clockIn = async (req, res) => {
    try {
        const id = req.user?.userId;
        const { clockInTime, clockInLocation, clockInNotes } = req.body;

        if (!clockInTime || !clockInLocation?.lat || !clockInLocation?.lng) {
            return res.status(400).json({ status: false, message: "All input fields are required" });
        }

        const perimeter = await Perimeter.findOne();
        if (!perimeter) {
            return res.status(400).json({ status: false, message: "No perimeter set" });
        }

        const distance = getDistanceInMeters(
            clockInLocation.lat,
            clockInLocation.lng,
            perimeter.center.lat,
            perimeter.center.lng
        );

        if (distance > perimeter.radiusInMeter) {
            return res.status(403).json({ status: false, message: "You are outside the allowed perimeter" });
        }

        const newShift = await Shift.create({
            careWorker: id,
            clockInTime,
            clockInLocation,
            clockInNotes: clockInNotes || "Clock In",
            status: "clock_in",
        });

        res.status(201).json({ status: true, message: "You are clocked in", newShift });
    } catch (e) {
        res.status(500).json({ status: false, message: "Server error occurred", error: e.message });
    }
};

const clockOut = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const { clockOutTime, clockOutLocation, clockOutNotes } = req.body;

    if (!clockOutTime || !clockOutLocation?.lat || !clockOutLocation?.lng) {
      return res.status(400).json({ status: false, message: "All input fields are required" });
    }

    const shift = await Shift.findOne({ _id: shiftId, status: "clock_in" });
    if (!shift) {
      return res.status(400).json({ status: false, message: "You are not clocked in" });
    }

    // Remove or comment out this block to allow clock-out from anywhere
    /*
    const perimeter = await Perimeter.findOne();
    if (perimeter) {
      const distance = getDistanceInMeters(
          clockOutLocation.lat,
          clockOutLocation.lng,
          perimeter.center.lat,
          perimeter.center.lng
      );

      if (distance > perimeter.radiusInMeter) {
          return res.status(403).json({ status: false, message: "You are outside the allowed perimeter for clock out" });
      }
    }
    */

    shift.clockOutTime = clockOutTime;
    shift.clockOutLocation = clockOutLocation;
    shift.clockOutNotes = clockOutNotes || "Clock Out";
    shift.status = "clock_out";

    await shift.save();

    res.status(200).json({ status: true, message: "Clocked out successfully", shift });
  } catch (e) {
    res.status(500).json({ status: false, message: "Server error occurred", error: e.message });
  }
};
async function getUserShifts(req, res) {
  try {
    const userId = req.user.userId;
    const shifts = await Shift.find({ careWorker: userId }).sort({ clockInTime: -1 });
    res.status(200).json({ status: true, shifts });
  } catch (e) {
    res.status(500).json({ status: false, message: "Server error", error: e.message });
  }
}


async function getActiveShift(req, res) {
  try {
    const userId = req.user.userId;
    // Find the shift where status is 'clock_in' (means clocked in but not clocked out yet)
    const activeShift = await Shift.findOne({ careWorker: userId, status: "clock_in" }).sort({ clockInTime: -1 });
    res.status(200).json({ status: true, shift: activeShift || null });
  } catch (e) {
    res.status(500).json({ status: false, message: "Server error", error: e.message });
  }
}
module.exports = { clockIn, clockOut,getUserShifts,getActiveShift };
