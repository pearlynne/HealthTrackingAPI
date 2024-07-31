const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  firstName: { type: String }, //cannot require true?
  lastName: { type: String }, //cannot require true?
  email: { type: String },
  date: { type: Date, required: true },
  mood: { type: Number, required: true },
  inattentiveness: { type: Number, required: true },
  hyperactivity: { type: Number, required: true },
  impulsivity: { type: Number, required: true },
  journalEntry: { type: String },
  medRxn: { type: String },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    // required: true,
  },
});

reportSchema.index({ journalEntry: "text", medRxn: "text" });

reportSchema.index({ providerId: 1 });

module.exports = mongoose.model("reports", reportSchema);
