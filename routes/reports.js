const { Router } = require("express");
const router = Router({ mergeParams: true });

const reportDAO = require("../daos/report");
const { isAuthenticated } = require("../middleware/middleware");

// POST /reports - store report along with their userId.
router.post("/", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const reportInfo = req.body;
  // console.log(reportInfo);
  if (!req.body || JSON.stringify(req.body) === "{}") {
    res.status(404).send("Missing report information");
  } else if (user._id !== reportInfo.userId) {
    res.status(404).send("No access");
  } else {
    try {
      const newReport = await reportDAO.createReport(user._id, reportInfo);
      // console.log(newReport);
      if (newReport) {
        res.json(newReport);
      }
    } catch (e) {
      next(e);
    }
  }
});

// GET /reports - returns all reports for their userId. If Healthcare Provider, should get array of logs from all patients/users
router.get("/", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const isProvider = user.roles.includes("provider");
  try {
    const reports = await reportDAO.getReports(user._id, isProvider);
    if (reports.length === 0) {
      res.status(404).send("There are no reports");
    } else {
      res.json(reports);
    }
  } catch (e) {
    next(e);
  }
});

// GET /reports/stats - returns an aggregated stats of mood rating and symptom tracking. If Healthcare Provider, should get array of reports of aggregated stats from specific users

router.get("/stats", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const isProvider = user.roles.includes("provider");

  if (req.query.patientId) {
    if (isProvider) {
      const stats = await reportDAO.getReportStatsByUserId(
        user._id,
        req.query.patientId
      );
      if (stats.length === 0) {
        res.status(404).send("No stats available");
      } else {
        res.json(stats);
      }
    } else {
      res.status(403).send("forbidden");
    }
  } else {
    try {
      const stats = await reportDAO.getReportStats(user._id, isProvider);
      if (stats.length === 0) {
        res.status(404).send("No stats/reports");
      } else {
        res.json(stats);
      }
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
});

// GET /reports/search - returns reports with that search term. If Healthcare Provider, should get array of reports with that search term from all patients/users
router.get("/search", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const searchTerm = req.query.query;
  const isProvider = user.roles.includes("provider");

  if (!req.query.query) {
    res.status(404).send("Insert search terms");
  } else {
    try {
      const results = await reportDAO.getReportsBySearchTerm(
        user._id,
        searchTerm,
        isProvider
      );
      if (results.length === 0) {
        res.status(404).send("No reports with such terms");
      } else {
        res.json(results);
      }
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
});

// GET /reports/:id - returns the report with the provided id and that has their userId. If Healthcare Provider, should get specified report.
router.get("/:id", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const reportId = req.params.id;
  const isProvider = user.roles.includes("provider");
  try {
    const report = await reportDAO.getReportById(
      user._id,
      reportId,
      isProvider
    );
    if (report.length === 0) {
      res.status(404).send("There is no such report. You may not have access");
    } else {
      res.json(report);
    }
  } catch (e) {
    //Add error handling for ID
    next(e);
  }
});

// PUT /reports/:id - updates the report with the provided id and that has their userId
router.put("/:id", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const reportInfo = req.body;
  const reportId = req.params.id;

  if (!req.body || JSON.stringify(req.body) === "{}") {
    res.status(404).send("Missing report information");
  } else {
    try {
      const updatedReport = await reportDAO.updateReportById(
        user._id,
        reportId,
        reportInfo
      );
      if (updatedReport === null) {
        res
          .status(404)
          .send("There is no such report. You may not have access");
      } else {
        res.json(updatedReport);
      }
    } catch (e) {
      //Add error handling for ID
      next(e);
    }
  }
});

// DELETE /reports/:id - deletes report with provided id from specified user.
router.delete("/:id", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const reportId = req.params.id;

     try {
      // Covers cases where user logged in doesnt match userId of reportId
      const deletedReport = await reportDAO.deleteReportById(
        user._id,
        reportId
      );
      if (deletedReport === null) {
				res.status(404).send("There is no such report. You may not have access")
			} else {
				res.status(200).send("Appointment deleted");

			}
      //Insert error handlign for ID issues?
    } catch (e) {
      next(e);
    }
 
});

module.exports = router;
