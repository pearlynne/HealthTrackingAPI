const appointment = require("../models/appointment")

// - **createAppt(userId, apptObj):** Users/Healthcare Providers can create new appointments. 

// - **getAppt(userId, apptObj):** Users/Healthcare Providers can view their appointments and details such as date, time, location.

// - **updateAppt(userId, apptObj):** Only Healthcare Providers can update appointments.

// - **deleteAppt(userId, apptObj):** Only Healthcare Providers can delete appointments.