const Report = require("../models/report");

module.exports = {};

// Create a behavioral report for the given user
module.exports.createReport = async (userId, reportObj) => {
  // To confirm if spread operator is allowed 
  return await Report.create({ userId: userId, ...reportObj });
};

// Get specific behavioral report for the given user (providers can retrieve)
module.exports.getReportById = async (userId, reportId, isProvider) => {
  return isProvider
    ? await Report.findOne({ _id: reportId}).lean()
    : await Report.findOne({ _id: reportId, userId: userId}).lean();
};

// Get all reports for given user (providers can retrieve all)
module.exports.getReports = async (userId, isProvider) => {
  return isProvider 
    ? await Report.find({ providerId: userId }).lean()
    : await Report.find({ userId: userId }).lean();
};

// Get all reports for given user based on search terms
module.exports.getReportsBySearchTerm = async (userId, searchTerms,isProvider) => {
  return isProvider
    ? await Report.find( 
    { providerId: userId, $text: { $search: searchTerms } },
    { score: { $meta: "textScore" } }
  )
	: await Report.find(
    { userId: userId, $text: { $search: searchTerms } },
    { score: { $meta: "textScore" } }
  )
};

// Get stats for mood and symptom from all reports for given user
module.exports.getReportStats = async (userId, isProvider) => {
	return isProvider
	? await Report.aggregate([ 
    { $match: { providerId: userId } },
    {
      $group: {
        _id: "$username",
        averageMood: { $avg: "$mood" },
        Inattentiveness: { $avg: "$inattentiveness" },
        Hyperactivity: { $avg: "$hyperactivity" },
        Impulsitivity: { $avg: "$impulsitivity" },
      },
    },
  ])
	:await Report.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: "$username",
        averageMood: { $avg: "$mood" },
        Inattentiveness: { $avg: "$inattentiveness" },
        Hyperactivity: { $avg: "$hyperactivity" },
        Impulsitivity: { $avg: "$impulsitivity" },
      },
    },
  ])
};

module.exports.getReportStatsByUserId = async (userId) => { 	
		return await Report.aggregate([
			{ $match: { userId: userId } },
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

module.exports.updateReportById = async (userId, reportId, updatedObj) => {
	// To fix the object to modify
  return await Report.findOneAndUpdate({_id: reportId, userId: userId}, ...updatedObj)
};

module.exports.deleteReportById = async (userId, reportId) => {
	// To fix the object to modify
  return await Report.findOneAndDelete({_id: reportId, userId: userId})
};