const Appointment = require("../models/appointment");

module.exports = {};

// Create new appointments
module.exports.createAppointment = async (patientId, apptDate, providerId) => { 
  return await Appointment.create({
    userId: ObjectId(patientId),
    date: new Date(apptDate), //To Confirm
    providerId: ObjectId(providerId),
  });
};

// Get appointments and details such as date, time, location.
module.exports.getAppointments = async (userId, isProvider) => {
  return isProvider
    ? await Appointment.find({ providerId: ObjectId(userId) })
    : await Appointment.find({ userId: ObjectId(userId) });
};

module.exports.getAppointmentById = async (
  appointmentId,
  userId,
  isProvider
) => {
  return isProvider
    ? await Appointment.findOne({ _id: ObjectId(appointmentId), providerId: ObjectId(userId) })
    : await Appointment.findOne({ _id: ObjectId(appointmentId), userId: ObjectId(userId) });
};

module.exports.updateAppointment = async (apptId, providerId, apptObj) => {
  // How to update individual appointment variables (for now it's only the date)
  return Appointment.findOneAndUpdate(
    {
      _id: ObjectId(apptId),
      providerId: ObjectId(providerId),
    },
    apptObj
  );
};

module.exports.cancelAppointment = async (apptId, providerId) => {
  return await Appointment.deleteOne({
    _id: ObjectId(apptId),
    providerId: ObjectId(providerId),
  });
};
