import mongoose from "mongoose";

const schedulingSchema = new mongoose.Schema({
  services_entrepreneur_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "servicesEntreprenuer", // Adicionando a referência que faltava
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  inspirationImage: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export const scheduling = mongoose.model("scheduling", schedulingSchema);
