const mongoose = require('mongoose');

const perimeterSchema = mongoose.Schema({
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    center: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    radiusInMeter: {
        type: Number,
        default: 2000
    },
    address: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.models.Perimeter || mongoose.model('Perimeter', perimeterSchema);
