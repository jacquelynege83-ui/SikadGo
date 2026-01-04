import mongoose from 'mongoose';

const types = ['Irrigation Activation', 'Data Submission', 'Seedling Sow', 'Seedling Ready'];
const reservoirLevels = ['OK', 'LOW', 'FULL'];
const waterLevels = ['OK', 'LOW', 'FULL']

const EventSchema = new mongoose.Schema({
    device:{
        type: mongoose.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    eventDate:{
        type: Number,
        required: true,
        default: Date.now()
    },
    eventType:{
        type: String,
        enum: types,
        required: true,
        default: 'Data Submission'
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
      { timestamps: true 
});

const Event=mongoose.model('Event', EventSchema);

export default Event;