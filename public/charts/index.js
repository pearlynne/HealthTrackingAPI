import createBarChart from "./d3Charts.js";
import createCorrelationHeatmapWithHistograms from "./d3Heatmap.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/reports/data");
    
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    const reports = data[0]?.reports || [];

    if (reports.length > 0) {
      createBarChart(reports); 
      createCorrelationHeatmapWithHistograms(reports);
    } else {
      console.error("No reports data found.");
    }
  } catch (error) {
    console.error("Error fetching or processing data:", error);
  }
});
