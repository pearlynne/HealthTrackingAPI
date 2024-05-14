const Report = require("../models/report");

module.exports = {};

// Create a behavioral report for the given user
module.exports.createReport = async (userId, reportObj) => {
  // To confirm if spread operator is allowed
  return await Report.create({ userId: userId, ...reportObj });
};

// Get specific behavioral report for the given user (providers can retrieve)
module.exports.getReportById = async (userId, reportId) => {
  return userId
    ? // To confirm others cannot get reports that aren't their own
      await Report.findOne({ _id: reportId, userId: userId }).lean()
    : // To confirm this covers providers
      await Report.findOne({ _id: reportId }).lean();
};

// Get all reports for given user (providers can retrieve all)
module.exports.getReports = async (userId, isProvider) => {
  return isProvider
    ? await Report.find({ providerId: userId }).lean()
    : await Report.find({ userId: userId }).lean();
};

// Get all reports for given user based on search terms
module.exports.getReportsBySearchTerm = async (userId, searchTerms) => {
  // To confirm this covers providers
	return await User.find(
    { userId: userId, $text: { $search: searchTerms } },
    { score: { $meta: "textScore" } }
  );
};

// Get stats for mood and symptom from all reports for given user
module.exports.getReportStats = async (userId) => {
  return await User.aggregate([
    { $match: { _id: userId } },
    {
      $group: {
        _id: "$username",
        averageMood: { $avg: "$mood" },
        Inattentiveness: { $avg: "$inattentiveness" },
        Hyperactivity: { $avg: "$hyperactivity" },
        Impulsitivity: { $avg: "$impulsitivity" },
      },
    },
  ]);
};
