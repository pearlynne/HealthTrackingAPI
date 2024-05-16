const { Router } = require("express");
const router = Router({ mergeParams: true });

const appointmentDAO = require("../daos/appointment");
const { isAuthenticated, isProvider } = require("../middleware/middleware");

// POST /appointments - stores the appointment information
router.post("/", isAuthenticated, async (req, res, next) => {
  const { user } = req.user;
  const { apptDate, providerId } = req.body;
  if (!req.body || JSON.stringify(req.body) === "{}") {
    res.status(404).send("Missing appointment information");
  } else {
    try {
      const newAppointment = await appointmentDAO.createAppointment(
        user._id,
        apptDate,
        providerId
      );
      res.json(newAppointment);
    } catch (e) {
      next(e);
    }
  }
});

// GET /appointments - returns all appointments for their userId. If Healthcare Provider, should get array of appointments from all patients/users

router.get("/", isAuthenticated, async (req, res, next) => {
  const { user } = req.user;
  const isProvider = user.roles.includes("provider");
  try {
    const newAppointment = await appointmentDAO.getAppointments(
      user._id,
      isProvider
    );
    res.json(newAppointment);
  } catch (e) {
    next(e);
  }
});

// GET /appointments/:id - returns the appointment with the provided id and that has their userId. If Healthcare Provider, should get specified appointment.

router.get("/:id", isAuthenticated, async (req, res, next) => {
  const { user } = req.user;
  const appointmentId = req.params.id;
  const isProvider = user.roles.includes("provider");
  try {
    const newAppointment = await appointmentDAO.getAppointmentById(
      appointmentId,
      user._id,
      isProvider
    );
    res.json(newAppointment);
  } catch (e) {
    next(e);
  }
});

// PUT /appointments/:id(requires authorization) -  Healthcare Providers can update the appointment with the provided id and that has their userId

router.put("/:id", isAuthenticated, isProvider, async (req, res, next) => {
  const { user } = req.user;
  const appointmentId = req.params.id; 
  const appointmentObj = req.body; //should just be the date
  try {
    const updatedAppointment = await appointmentDAO.updateAppointment(
      appointmentId,
      user._id, 
			appointmentObj
    );
    res.json(updatedAppointment);
  } catch (e) {
    next(e);
  }
});

// DELETE /appointments/:id (requires authorization)  - Healthcare Providers can delete appointment with provided id from specified use
router.delete("/:id", isAuthenticated, isProvider, async (req, res, next) => {
  const { user } = req.user;
  const appointmentId = req.params.id;  
  try {
    const deletedAppointment = await appointmentDAO.cancelAppointment(
      appointmentId,
      user._id  );
    res.json(deletedAppointment);
  } catch (e) {
    next(e);
  }
});