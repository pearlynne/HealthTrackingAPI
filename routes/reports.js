const { Router } = require("express");
const router = Router({ mergeParams: true });

const reportDAO = require("../daos/report");
const { isAuthenticated } = require("../middleware/middleware");

// Mustache: Comment out for tests
router.get("/", (req, res, next) => {
  res.render("reports_post");
});

// POST /reports - store report along with their userId.
router.post("/", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const reportInfo = req.body;
  if (
    Object.values(reportInfo).some((x) => x === "") ||
    JSON.stringify(req.body) === "{}"
  ) {
    res.status(404).send("Missing report information");
  } else {
    try {
      const newReport = await reportDAO.createReport(user._id, reportInfo);
      if (newReport) {
				console.log(newReport.length)
        res.render("report_post", {
          report: newReport,
          message: `New report created`,
        });
      }
    } catch (e) {
      next(e);
    }
  }
});

// For d3 charts only
router.get("/data", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const isProvider = user.roles.includes("provider");
  try {
    const reports = await reportDAO.getReports(user._id, isProvider);
		
    if (reports.length === 0) {
      return res.status(404).json({ message: "There are no reports" });
    } else {
      return res.json(reports);
    }
  } catch (e) {
    next(e);
  }
});

// GET /reports - returns all reports for their userId. If Healthcare Provider, should get array of logs from all patients/users
router.get("/all", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const isProvider = user.roles.includes("provider");
  try {
    const reports = await reportDAO.getReports(user._id, isProvider);
    if (reports.length === 0) {
      res
        .status(404)
        .render("reports_error", { message: "There are no reports" });
    } else {
      res.render("reports", { report: reports, message: `Reports` });
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
        res
          .status(404)
          .render("reports_error", { message: "No stats available" });
      } else {
        res.json(stats);
      }
    } else {
      res.status(403).send("Forbidden");
    }
  } else {
    try {
      const stats = await reportDAO.getReportStats(user._id, isProvider);
      if (stats.length === 0) {
        res.status(404).send("No stats/reports");
      } else {
        res.render("report_stats", { report: stats });
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
    res.status(404).render("reports_search");
  } else {
    try {
      const results = await reportDAO.getReportsBySearchTerm(
        user._id,
        searchTerm,
        isProvider
      );
      if (results.length === 0) {
        res
          .status(404)
          .render("reports_error", { message: "No reports with such terms" });
      } else {
        res.render("reports", {
          report: results,
          message: `Reports by search terms: ${req.query.query}`,
        });
      }
    } catch (e) {
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
    if (report === null) {
      res.status(404).render("reports_error", {
        message: "There is no such report. You may not have access",
      });
    } else {
      // mustache - comment out for tests

      res
        .status(200)
        .render("reports_id", { id: req.params.id, report: report });
      // res.json(report)
    }
  } catch (e) {
    //Add error handling for ID
    next(e);
  }
});

// PUT /reports/:id - updates the report with the provided id and that has their userId
router.put("/:id", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const reportId = req.params.id;

  const reportInfo = Object.fromEntries(
    Object.entries(req.body).filter(([key, value]) => value !== "")
  );

  if (!req.body || JSON.stringify(reportInfo) === "{}") {
    res
      .status(404)
      .render("reports_error", { message: "Missing report information" });
  } else {
    try {
      const updatedReport = await reportDAO.updateReportById(
        user._id,
        reportId,
        reportInfo
      );
      if (updatedReport === null) {
        res.status(404).render("reports_error", {
          message: "There is no such report. You may not have access",
        });
      } else {
        res
          .status(200)
          .render("reports_id", { id: req.params.id, report: updatedReport });
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
    const deletedReport = await reportDAO.deleteReportById(user._id, reportId);
    if (deletedReport === null) {
      res.status(404).render("reports_error", {
        message: "There is no such report. You may not have access",
      });
    } else {
      res.status(200).render("reports_error", { message: "Report deleted" });
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;
