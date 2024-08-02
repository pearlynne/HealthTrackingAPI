const { Router } = require("express");
const router = Router({ mergeParams: true });

const appointmentDAO = require("../daos/appointment");
const userDAO = require("../daos/user");
const { isAuthenticated, isProvider } = require("../middleware/middleware");

// POST /appointments
// Healthcare provider can create appointments

router.get("/create", isAuthenticated, isProvider, async (req, res, next) => {
  res.render("appointments_post", {}, (err, html) => {
    if (err) return next(err);

    res.render("partials/layout", {
      title: "Create appointments",
      content: html,
    });
  });
});

router.get("/modify", isAuthenticated, isProvider, async (req, res, next) => {
  res.redirect(`/appointments/${req.query.query}`);
});

router.post("/create", isAuthenticated, isProvider, async (req, res, next) => {
  const user = req.user;
  const patientId = req.body.userId;
  const apptDate = req.body.date;
  const providerId = req.body.providerId;
  if (
    !patientId ||
    !apptDate ||
    !providerId ||
    !req.body ||
    JSON.stringify(req.body) === "{}"
  ) {
    res
      .status(404)
      .render(
        "message",
        { title: "Error", message: "Missing appointment information" },
        (err, html) => {
          if (err) return next(err);
          res.render("partials/layout", {
            title: "Appointment",
            content: html,
          });
        }
      );
  } else if (providerId !== user._id) {
    res.status(404).render(
      "message",
      {
        title: "Error",
        message: "You cannot create appointments for other providers",
      },
      (err, html) => {
        if (err) return next(err);
        res.render("partials/layout", {
          title: "Appointment",
          content: html,
        });
      }
    );
  } else {
    try {
      const isPatient = await userDAO.getUsersOfProvider(providerId, patientId);
      if (isPatient.length === 0) {
        res.status(404).render(
          "message",
          {
            title: "Error",
            message: "You can only create appointments for your patients",
          },
          (err, html) => {
            if (err) return next(err);
            res.render("partials/layout", {
              title: "Appointment",
              content: html,
            });
          }
        );
      } else {
        const newAppointment = await appointmentDAO.createAppointment(
          patientId,
          apptDate,
          providerId
        );
        res
          .status(200)
          .render(
            "appointments_post",
            { message: "Appointment created", newAppointment: newAppointment },
            (err, html) => {
              if (err) return next(err);
              res.render("partials/layout", {
                title: "Appointment",
                content: html,
              });
            }
          );
      }
    } catch (e) {
      next(e);
    }
  }
});

// GET /appointments
// Provider users should get array of appointments from all patients/users
// Patient users should get array of own appointments
router.get("/", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const isProvider = user.roles.includes("provider");

  try {
    const newAppointment = await appointmentDAO.getAppointments(
      user._id,
      isProvider
    );
    if (newAppointment.length === 0) {
      res
        .status(404)
        .render(
          "appointments_get",
          { message: "You do not have any appointments" },
          (err, html) => {
            if (err) return next(err);
            res.render("partials/layout", {
              title: "Appointment",
              content: html,
            });
          }
        );
    } else {
      res
        .status(200)
        .render(
          "appointments_get",
          { newAppointment: newAppointment },
          (err, html) => {
            if (err) return next(err);
            res.render("partials/layout", {
              title: "Appointment",
              content: html,
            });
          }
        );
    }
  } catch (e) {
    next(e);
  }
});

// GET /appointments/:id
// Provider users should get information from appointment id
// Patient users should get information from appointment id
router.get("/:id", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const appointmentId = req.params.id;
  const isProvider = user.roles.includes("provider");

  try {
    const newAppointment = await appointmentDAO.getAppointmentById(
      appointmentId,
      user._id,
      isProvider
    );

    if (newAppointment.length === 0) {
      res
        .status(404)
        .render(
          "message",
          { title: "Error", message: "You do not have this appointment" },
          (err, html) => {
            if (err) return next(err);
            res.render("partials/layout", {
              title: "Appointment",
              content: html,
            });
          }
        );
    } else {
      res
        .status(200)
        .render(
          "appointments_put",
          { id: appointmentId, newAppointment: newAppointment },
          (err, html) => {
            if (err) return next(err);
            res.render("partials/layout", {
              title: "Appointment",
              content: html,
            });
          }
        );
    }
  } catch (e) {
    next(e);
  }
});

// PUT /appointments/:id
//  Provider users can update the appointment with the appointment id
router.put("/:id", isAuthenticated, isProvider, async (req, res, next) => {
  const user = req.user;
  const appointmentId = req.params.id;
  const { date } = req.body; //should just be the date
  if (!date) {
    res
          .status(404)
          .render(
            "message",
            { title: "Error", message: "Appointment date needed" },
            (err, html) => {
              if (err) return next(err);
              res.render("partials/layout", {
                title: "Appointment",
                content: html,
              });
            }
          );
  } else {
    try {
      const updatedAppointment = await appointmentDAO.updateAppointment(
        appointmentId,
        user._id,
        date
      );
      if (updatedAppointment === null) {
        res
          .status(404)
          .render(
            "message",
            { title: "Error", message: "You do not have this appointment" },
            (err, html) => {
              if (err) return next(err);
              res.render("partials/layout", {
                title: "Appointment",
                content: html,
              });
            }
          );
      } else {
        const returnAppointment = await appointmentDAO.getAppointmentById(
          appointmentId,
          user._id,
          true
        );
        res
          .status(200)
          .render(
            "appointments_post",
            {
              message: "Appointment modified",
              newAppointment: returnAppointment,
            },
            (err, html) => {
              if (err) return next(err);
              res.render("partials/layout", {
                title: "Appointment",
                content: html,
              });
            }
          );
      }
    } catch (e) {
      next(e);
    }
  }
});

// DELETE /appointments/:id
// Provider users can delete appointment with appointment id
router.delete("/:id", isAuthenticated, isProvider, async (req, res, next) => {
  const user = req.user;
  const appointmentId = req.params.id;
  try {
    const deletedAppointment = await appointmentDAO.cancelAppointment(
      appointmentId,
      user._id
    );
    if (deletedAppointment === null) {
      res
        .status(404)
        .render(
          "message",
          { title: "Error", message: "You do not have this appointment" },
          (err, html) => {
            if (err) return next(err);
            res.render("partials/layout", {
              title: "Appointment",
              content: html,
            });
          }
        );
    } else {
      res
        .status(200)
        .render(
          "message",
          { title: "Success", message: "Appointment deleted" },
          (err, html) => {
            if (err) return next(err);
            res.render("partials/layout", {
              title: "Appointment",
              content: html,
            });
          }
        );
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;
