const Perimeter = require('../models/perimeter');

async function setPerimeter(req, res) {
    try {
        const managerId = req.user?.userId;
        const { lat, lng, radiusInMeter, address } = req.body;

        if (lat == null || lng == null) {
            return res.status(400).json({
                status: false,
                message: "Latitude and longitude are required"
            });
        }

        let perimeter = await Perimeter.findOne({ manager: managerId });

        if (perimeter) {
            // Update existing perimeter
            perimeter.center = { lat, lng };
            perimeter.radiusInMeter = radiusInMeter || 2000;
            perimeter.address = address || perimeter.address;
            await perimeter.save();

            return res.status(200).json({
                status: true,
                message: "Perimeter updated successfully",
                perimeter
            });
        } else {
            // Create new perimeter
            perimeter = await Perimeter.create({
                manager: managerId,
                center: { lat, lng },
                radiusInMeter: radiusInMeter || 2000,
                address
            });

            return res.status(201).json({
                status: true,
                message: "Perimeter created successfully",
                perimeter
            });
        }
    } catch (e) {
        return res.status(500).json({
            status: false,
            message: "Server error occurred",
            error: e.message
        });
    }
}

async function getPerimeter(req, res) {
    try {
        const managerId = req.user?.userId;
        const perimeter = await Perimeter.findOne({ manager: managerId });

        if (!perimeter) {
            return res.status(404).json({
                status: false,
                message: "No perimeter found"
            });
        }

        return res.status(200).json({
            status: true,
            perimeter
        });
    } catch (e) {
        return res.status(500).json({
            status: false,
            message: "Server error occurred",
            error: e.message
        });
    }
}

async function getPerimeterByWorker(req, res) {
  try {
    // Just fetch the first (or only) perimeter document available
    const perimeter = await Perimeter.findOne();

    if (!perimeter) {
      return res.status(404).json({ status: false, message: "No perimeter found" });
    }

    return res.status(200).json({ status: true, perimeter });

  } catch (e) {
    return res.status(500).json({
      status: false,
      message: "Server error occurred",
      error: e.message
    });
  }
}


module.exports = { setPerimeter, getPerimeter,getPerimeterByWorker };
