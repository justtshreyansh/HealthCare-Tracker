const mongoose = require('mongoose');

const shiftSchema = mongoose.Schema({
    careWorker:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    clockInTime:{
        type:Date,
    },
    clockInLocation:{
        lat:Number,
        lng:Number
    },
    clockInNotes:{
        type:String,
        default:"Clock In"
    },
    clockOutTime:{
        type:Date,
    },
    clockOutLocation:{
        lat:Number,
        lng:Number
    },
    clockOutNotes:{
        type:String,
        default:"Clock Out"
    },
    status:{
        type:String,
        enum:["clock_in","clock_out"],
        default:"clock_in"
    }
},{timestamps:true});

module.exports = mongoose.models.Shift || mongoose.model('Shift', shiftSchema);
