import mongoose from "mongoose";

const SchedulingSchema = new mongoose.Schema({

  services_entrepreneur_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "servicesEntreprenuer",
    required: true
  },

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: {
    type: String,
    required: true
  },

  age: {
    type: Number,
    required: true
  },

  description: {
    type: String
  },

  date: {
    type: String, // ex: 2025-12-05
    required: true
  },

  time: {
    type: String, // ex: "08:00"
    required: true
  },
  }, { timestamps: true });


 export const scheduling = mongoose.model('scheduling', SchedulingSchema)
