import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema(
  {
    deviceID: {
      type: String,
      required: true,
      unique: true,
    },
    owner:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // RFID UID of the driver
    rfidUID: {
      type: String,
      default:"",
    },

    // Assigned driver (owner of RFID)
    driver: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    // Distance traveled in kilometers
    distanceKm: {
      type: Number,
      default: 0,
    },

    // Odometer start (when trip begins)
    tripStartDistance: {
      type: Number,
      default: 0,
    },

    // Odometer end (when trip ends)
    tripEndDistance: {
      type: Number,
      default: 0,
    },

    // Trip status
    tripStatus: {
      type: String,
      enum: ["idle", "ongoing", "completed"],
      default: "idle",
    },

    lastUpdate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Device = mongoose.model("Device", DeviceSchema);

export default Device;