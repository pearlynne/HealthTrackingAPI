function createBarChart(reports) {
  // Define dimensions and margins
  const width = 600;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const svgWidth = width - margin.left - margin.right;
  const svgHeight = height - margin.top - margin.bottom;

  // Create SVG element
  const svg = d3
    .select(".container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Create scales
  const x = d3
    .scaleBand()
    .domain(reports.map((d) => new Date(d.date)))
    .range([0, svgWidth])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(reports, (d) => d.mood)]) // Adjust domain based on the data you want to visualize
    .range([svgHeight, 0]);

  // Create and append x-axis
  svg
    .append("g")
    .attr("transform", `translate(0, ${svgHeight})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %d %y")));

  // Create and append y-axis
  svg.append("g").call(d3.axisLeft(y));

  // Create bars
  svg
    .selectAll(".bar")
    .data(reports)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(new Date(d.date)))
    .attr("y", (d) => y(d.mood))
    .attr("width", x.bandwidth())
    .attr("height", (d) => svgHeight - y(d.mood))
    .attr("fill", "steelblue");
}

export default createBarChart