function createCorrelationHeatmapWithHistograms(reports) {
  const variables = ["hyperactivity", "impulsivity", "inattentiveness", "mood"];
  const margin = { top: 50, right: 100, bottom: 50, left: 100 }; // Increased right margin
  const sizeWhole = 500 - margin.left - margin.right;
  const size = sizeWhole / variables.length;

  const svg = d3
    .select(".container")
    .append("svg")
    .attr("width", sizeWhole + margin.left + margin.right + 120) // Increased width for the legend
    .attr("height", sizeWhole + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const data = reports.map((d) => ({
    hyperactivity: d.hyperactivity,
    impulsivity: d.impulsivity,
    inattentiveness: d.inattentiveness,
    mood: d.mood,
  }));

  function calculateCorrelationMatrix(data, variables) {
    const matrix = [];
    for (let i = 0; i < variables.length; i++) {
      for (let j = 0; j < variables.length; j++) {
        const varX = variables[i];
        const varY = variables[j];
        const correlation =
          varX === varY
            ? 1
            : computeCorrelation(
                data.map((d) => d[varX]),
                data.map((d) => d[varY])
              );
        matrix.push({ variableX: varX, variableY: varY, correlation });
      }
    }
    return matrix;
  }

  function computeCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);
    const sumY2 = y.reduce((a, b) => a + b * b, 0);
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
    );
    return denominator === 0 ? 0 : numerator / denominator;
  }

  function createBins(data, domain, numBins) {
    const binSize = (domain[1] - domain[0]) / numBins;
    const bins = Array.from({ length: numBins }, () => ({ count: 0 }));

    data.forEach((d) => {
      const index = Math.min(
        numBins - 1,
        Math.floor((d - domain[0]) / binSize)
      );
      bins[index].count += 1;
    });

    return bins.map((bin, i) => ({
      x0: domain[0] + i * binSize,
      x1: domain[0] + (i + 1) * binSize,
      length: bin.count,
    }));
  }

  const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([-1, 1]);
  const xBandScale = d3
    .scaleBand()
    .domain(variables)
    .range([0, sizeWhole])
    .padding(0.05);
  const yBandScale = d3
    .scaleBand()
    .domain(variables)
    .range([0, sizeWhole])
    .padding(0.05);

  const correlationMatrix = calculateCorrelationMatrix(data, variables);

  svg
    .selectAll(".cell")
    .data(correlationMatrix)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", (d) => xBandScale(d.variableX))
    .attr("y", (d) => yBandScale(d.variableY))
    .attr("width", xBandScale.bandwidth())
    .attr("height", yBandScale.bandwidth())
    .style("fill", (d) =>
      d.variableX === d.variableY ? "none" : colorScale(d.correlation)
    )
    .style("stroke", "white");
  svg
    .selectAll(".cell-label")
    .data(correlationMatrix)
    .enter()
    .append("text")
    .attr("class", "cell-label")
    .attr("x", (d) => xBandScale(d.variableX) + xBandScale.bandwidth() / 2)
    .attr("y", (d) => yBandScale(d.variableY) + yBandScale.bandwidth() / 2)
    .attr("dy", ".35em") // Vertically center the text
    .attr("text-anchor", "middle") // Center text horizontally
    .style("fill", "black") // Color of the text
    .style("font-size", "10px") // Font size of the text
    .text((d) => (d.variableX === d.variableY ? "" : d.correlation.toFixed(2)));
		
  for (let i = 0; i < variables.length; i++) {
    for (let j = 0; j < variables.length; j++) {
      const var1 = variables[i];
      const var2 = variables[j];
      const g = svg
        .append("g")
        .attr(
          "transform",
          `translate(${xBandScale(var1)},${yBandScale(var2)})`
        );

      if (var1 === var2) {
        const xExtent = var1 === "mood" ? [1, 5] : [0, 3];
        const bins = createBins(
          data.map((d) => d[var1]),
          xExtent,
          20
        );

        const y = d3
          .scaleLinear()
          .domain([0, d3.max(bins, (d) => d.length)])
          .range([size - 20, 0]);

        const xScale = d3
          .scaleLinear()
          .domain(xExtent)
          .range([0, size - 20]);

        g.selectAll(".histogram")
          .data(bins)
          .enter()
          .append("rect")
          .attr("class", "histogram")
          .attr("x", (d) => xScale(d.x0))
          .attr("width", (d) => xScale(d.x1) - xScale(d.x0) + 5)
          .attr("y", (d) => y(d.length))
          .attr("height", (d) => size - 20 - y(d.length))
          .attr("fill", "steelblue")
          .attr("opacity", 0.6);

        g.append("g")
          .attr("transform", `translate(0,${size - 20})`)
          .call(d3.axisBottom(xScale).ticks(4))
					.selectAll("text")
					.style("font-size", "8px");
      }
    }
  }

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${sizeWhole})`)
    .call(d3.axisBottom(xBandScale));

  svg.append("g").attr("class", "y-axis").call(d3.axisLeft(yBandScale));

  // Create the gradient for the color legend
  const defs = svg.append("defs");
  const linearGradient = defs
    .append("linearGradient")
    .attr("id", "linear-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  linearGradient
    .selectAll("stop")
    .data([
      { offset: "0%", color: d3.interpolateRdBu(1) },
      { offset: "50%", color: d3.interpolateRdBu(0) },
      { offset: "100%", color: d3.interpolateRdBu(-1) },
    ])
    .enter()
    .append("stop")
    .attr("offset", (d) => d.offset)
    .attr("stop-color", (d) => d.color);

  // Add the color legend rectangle
  svg
    .append("rect")
    .attr("x", sizeWhole + 20)
    .attr("y", 0)
    .attr("width", 20)
    .attr("height", sizeWhole)
    .style("fill", "url(#linear-gradient)");

  // Define the scale and axis for the legend
  const legendScale = d3.scaleLinear().domain([-1, 1]).range([sizeWhole, 0]);

  const legendAxis = d3.axisRight(legendScale).ticks(5);

  // Add the legend axis
  svg
    .append("g")
    .attr("class", "legend axis")
    .attr("transform", `translate(${sizeWhole + 40}, 0)`)
    .call(legendAxis);
}

export default createCorrelationHeatmapWithHistograms;
